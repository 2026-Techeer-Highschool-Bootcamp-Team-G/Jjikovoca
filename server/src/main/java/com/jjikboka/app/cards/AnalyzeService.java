package com.jjikboka.app.cards;

import com.jjikboka.analysis.AnalyzeJobService;
import com.jjikboka.app.image.ImageStorageService;
import com.jjikboka.auth.UserQueryService;
import com.jjikboka.core.card.QuotaConsumeService;
import com.jjikboka.shared.error.BusinessException;
import com.jjikboka.shared.event.AnalyzeEvents;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 캡처 분석 접수 조립 (API-6, app 파사드). ArchUnit이 core·analysis 상호참조를 막으므로
 * 두 도메인(quota 차감·job 생성)을 여기서 <b>한 트랜잭션</b>으로 묶어 원자성을 만든다(13 §2).
 *
 * <p>순서가 중요하다: 시현용 하드캡 검사 → quota 차감(한도 초과면 429로 job 생성 이전에 차단) → job 생성.
 * 접수가 커밋된 뒤 워커가 실제 분석을 이어가도록 {@code AnalyzeRequested}를 발행한다(AFTER_COMMIT 소비).
 */
@Service
class AnalyzeService {

    private final QuotaConsumeService quotaConsumeService;
    private final AnalyzeJobService analyzeJobService;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final UserQueryService userQueryService;
    private final int extractLimit;
    private final String unlimitedEmail;

    AnalyzeService(QuotaConsumeService quotaConsumeService,
                   AnalyzeJobService analyzeJobService,
                   ImageStorageService imageStorageService,
                   ApplicationEventPublisher eventPublisher,
                   UserQueryService userQueryService,
                   @Value("${app.demo.extract-limit:3}") int extractLimit,
                   @Value("${app.demo.unlimited-email:}") String unlimitedEmail) {
        this.quotaConsumeService = quotaConsumeService;
        this.analyzeJobService = analyzeJobService;
        this.imageStorageService = imageStorageService;
        this.eventPublisher = eventPublisher;
        this.userQueryService = userQueryService;
        this.extractLimit = extractLimit;
        this.unlimitedEmail = unlimitedEmail;
    }

    @Transactional
    AnalyzeAcceptedResponse submit(Long userId, AnalyzeRequest request) {
        enforceDemoExtractCap(userId);
        quotaConsumeService.consume(userId);
        Long jobId = analyzeJobService.create(userId);
        List<String> cropImageRefs = saveCrops(request);
        // WORD만 단어 힌트를 흘려보낸다(cropImages 순서=cropImageRefs 순서라 인덱스 정렬 유지). PROBLEM은 미해당.
        List<String> words = "WORD".equals(request.type()) ? request.words() : null;
        String fullImageRef = (request.fullImage() == null || request.fullImage().isBlank())
                ? null : imageStorageService.save(request.fullImage());
        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeRequested(
                jobId, userId, request.type(), cropImageRefs, words, fullImageRef));
        return AnalyzeAcceptedResponse.pending(jobId);
    }

    /**
     * 시현용 무료 추출 하드캡 — {@code unlimited-email}(시현 계정)을 제외한 모든 사용자는 누적 분석 접수가
     * {@code extract-limit}회에 도달하면 429로 차단한다. <b>프리미엄 여부를 보지 않으므로</b> 프리미엄이어도 초과 불가.
     * limit이 음수면 캡 해제(시현 종료용 스위치). quota 차감 이전에 검사해 초과 시 차감·job 생성이 일어나지 않게 한다.
     */
    private void enforceDemoExtractCap(Long userId) {
        if (extractLimit < 0) {
            return;
        }
        String email = userQueryService.getProfile(userId).email();
        if (unlimitedEmail != null && !unlimitedEmail.isBlank() && unlimitedEmail.equalsIgnoreCase(email)) {
            return;
        }
        if (analyzeJobService.countForUser(userId) >= extractLimit) {
            throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "EXTRACT_LIMIT_REACHED",
                    "무료 단어 추출은 " + extractLimit + "회까지만 이용할 수 있어요.");
        }
    }

    /** WORD는 cropImages(다중, 첫 개가 대표), PROBLEM은 cropImage(단일)를 저장한다. 검증은 이미 통과한 상태다. */
    private List<String> saveCrops(AnalyzeRequest request) {
        if ("PROBLEM".equals(request.type())) {
            return List.of(imageStorageService.save(request.cropImage()));
        }
        return request.cropImages().stream().map(imageStorageService::save).toList();
    }
}
