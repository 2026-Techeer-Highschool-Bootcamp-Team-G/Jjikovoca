package com.jjikboka.core.card;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

/**
 * 일일 분석 한도 차감 (core.card 공개 진입점, NFR-02). 조회는 {@link QuotaQueryService}, 차감·환불은 여기.
 * 한도는 프리미엄 여부로 결정(free 5 · premium 100)하고, 초과 시 429 QUOTA_EXCEEDED로 원자적 차단한다.
 * 트랜잭션은 호출자(app 조립)가 소유 — quota 차감과 job 생성이 한 커밋으로 원자화된다.
 */
@Service
public class QuotaConsumeService {

    private static final int FREE_LIMIT = 5;
    private static final int PREMIUM_LIMIT = 100;

    private final UserQuotaDailyRepository quotaRepository;
    private final PremiumQueryService premiumQueryService;

    QuotaConsumeService(UserQuotaDailyRepository quotaRepository, PremiumQueryService premiumQueryService) {
        this.quotaRepository = quotaRepository;
        this.premiumQueryService = premiumQueryService;
    }

    /**
     * 오늘 한도 안에서 1회 차감한다. 크롭이 여러 장이어도 AI 호출 1회이므로 <b>1회만</b> 차감한다(F-02).
     * 한도 초과면 {@link BusinessException}(429)을 던져 job 생성 이전에 차단한다.
     */
    public void consume(Long userId) {
        LocalDate today = LocalDate.now();
        int limit = premiumQueryService.isPremium(userId) ? PREMIUM_LIMIT : FREE_LIMIT;
        quotaRepository.insertIgnore(userId, today);
        int updated = quotaRepository.tryIncrement(userId, today, limit);
        if (updated == 0) {
            throw new BusinessException(HttpStatus.TOO_MANY_REQUESTS, "QUOTA_EXCEEDED",
                    "오늘의 AI 분석 횟수를 모두 사용했습니다.");
        }
    }

    /** 분석 최종 실패 시 차감을 되돌린다(사가 보상, 13 §6). 멱등하게 호출돼도 0 미만으로 내려가지 않는다. */
    public void refund(Long userId) {
        quotaRepository.decrement(userId, LocalDate.now());
    }
}
