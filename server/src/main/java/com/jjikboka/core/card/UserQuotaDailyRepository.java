package com.jjikboka.core.card;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

/**
 * user_quota_daily 저장소. package-private 봉인(13 §2).
 * 차감은 DB 행 락에 기대는 조건부 UPDATE로 원자화한다(NFR-02) — 동시 요청도 한도를 넘기지 못한다.
 */
interface UserQuotaDailyRepository extends JpaRepository<UserQuotaDaily, UserQuotaDailyId> {

    Optional<UserQuotaDaily> findByUserIdAndQuotaDate(Long userId, LocalDate quotaDate);

    /** 오늘 행이 없으면 0으로 만들어 둔다(있으면 무시). 이후 조건부 증가가 항상 대상 행을 갖도록 보장. */
    @Modifying
    @Query(value = "INSERT IGNORE INTO user_quota_daily (user_id, quota_date, used_count) "
            + "VALUES (:userId, :quotaDate, 0)", nativeQuery = true)
    void insertIgnore(@Param("userId") Long userId, @Param("quotaDate") LocalDate quotaDate);

    /**
     * used_count &lt; limit 일 때만 1 증가시키고 영향 행 수를 돌려준다. 1이면 차감 성공, 0이면 한도 초과.
     * WHERE의 used_count 비교와 증가가 한 행 락 안에서 일어나 동시 요청에도 초과가 없다.
     */
    @Modifying
    @Query(value = "UPDATE user_quota_daily SET used_count = used_count + 1 "
            + "WHERE user_id = :userId AND quota_date = :quotaDate AND used_count < :limit", nativeQuery = true)
    int tryIncrement(@Param("userId") Long userId, @Param("quotaDate") LocalDate quotaDate, @Param("limit") int limit);

    /** 실패 보상용 환불 — 0 미만으로는 내려가지 않게 방어. */
    @Modifying
    @Query(value = "UPDATE user_quota_daily SET used_count = used_count - 1 "
            + "WHERE user_id = :userId AND quota_date = :quotaDate AND used_count > 0", nativeQuery = true)
    int decrement(@Param("userId") Long userId, @Param("quotaDate") LocalDate quotaDate);
}
