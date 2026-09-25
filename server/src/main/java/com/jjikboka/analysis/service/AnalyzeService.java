package com.jjikboka.analysis.service;

import com.jjikboka.analysis.dto.AnalyzeAcceptedResponse;
import com.jjikboka.analysis.dto.AnalyzePayload;
import com.jjikboka.analysis.dto.AnalyzeRequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jjikboka.common.image.ImageStorageService;
import com.jjikboka.quota.service.QuotaService;
import com.jjikboka.common.event.AnalyzeEvents;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 캡처 분석 접수 조립 (API-6, app 파사드). ArchUnit이 core·analysis 상호참조를 막으므로
 * 두 도메인(quota 차감·job 생성)을 여기서 <b>한 트랜잭션</b>으로 묶어 원자성을 만든다(13 §2).
 *
 * <p>순서: quota 차감(일일 한도 초과면 429로 job 생성 이전에 차단) → 크롭·지문 저장 → 재구성 payload를 job에 영속화.
 * payload를 job에 저장하므로(P1-6) 접수 커밋 후 크래시로 이벤트가 유실돼도 watchdog가 job만으로 재분석할 수 있다.
 * {@code AnalyzeRequested}는 정상 흐름을 앞당기는 빠른 경로 트리거일 뿐이다(AFTER_COMMIT 소비).
 */
@Service
public class AnalyzeService {

    private final QuotaService quotaService;
    private final AnalyzeJobService analyzeJobService;
    private final ImageStorageService imageStorageService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    AnalyzeService(QuotaService quotaService,
                   AnalyzeJobService analyzeJobService,
                   ImageStorageService imageStorageService,
                   ApplicationEventPublisher eventPublisher,
                   ObjectMapper objectMapper) {
        this.quotaService = quotaService;
        this.analyzeJobService = analyzeJobService;
        this.imageStorageService = imageStorageService;
        this.eventPublisher = eventPublisher;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public AnalyzeAcceptedResponse submit(Long userId, AnalyzeRequest request) {
        quotaService.consume(userId);
        List<String> cropImageRefs = saveCrops(request);
        // 단어 힌트를 흘려보낸다(cropImages 순서=cropImageRefs 순서라 인덱스 정렬 유지).
        List<String> words = request.words();
        String fullImageRef = (request.fullImage() == null || request.fullImage().isBlank())
                ? null : imageStorageService.save(request.fullImage());

        // 재구성 payload를 job에 영속화 — 이벤트 유실·크래시에도 watchdog가 job만으로 재분석할 근거가 된다.
        String payloadJson = serialize(new AnalyzePayload(request.type(), cropImageRefs, words, fullImageRef));
        Long jobId = analyzeJobService.create(userId, payloadJson);

        eventPublisher.publishEvent(new AnalyzeEvents.AnalyzeRequested(
                jobId, userId, request.type(), cropImageRefs, words, fullImageRef));
        return AnalyzeAcceptedResponse.pending(jobId);
    }

    /** payload 직렬화 — 접수 트랜잭션 안이라 실패 시 quota 차감까지 함께 롤백된다(부분 접수 방지). */
    private String serialize(AnalyzePayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            throw new IllegalStateException("분석 payload 직렬화 실패", e);
        }
    }

    /** cropImages(다중, 첫 개가 대표)를 저장한다. 검증은 이미 통과한 상태다. */
    private List<String> saveCrops(AnalyzeRequest request) {
        return request.cropImages().stream().map(imageStorageService::save).toList();
    }
}
