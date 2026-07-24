package com.jjikboka.core.stats;

import com.jjikboka.shared.event.StudyEvents;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * 월간 리포트 캐시 무효화 (13 §6·§9). 학습이 기록되면(study_log INSERT) 그 유저의 현재월 리포트가 낡으므로 evict한다 —
 * 다음 조회에서 최신 집계로 재계산된다. {@link ReportService}의 캐시 키(userId)와 정확히 맞춘다.
 *
 * <p>커밋 이후(AFTER_COMMIT)에만 evict한다: 기록이 롤백되면 캐시를 지우지 않아, 스테일 데이터로 재적재되는 창을 없앤다.
 * evict가 곧 쓰기라 이 리스너는 트랜잭션 밖에서 돈다.
 */
@Component
class ReportCacheEvictor {

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @CacheEvict(cacheNames = "report:monthly", key = "#event.userId()")
    void onStudyRecorded(StudyEvents.StudyRecorded event) {
        // 반환 없음 — @CacheEvict가 report:monthly::{userId} 항목을 지운다.
    }
}
