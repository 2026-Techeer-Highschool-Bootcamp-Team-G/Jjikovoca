package com.jjikboka.core.stats;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * user_stat 저장소. package-private 봉인(13 §2). PK가 user_id라 findById(userId)로 상태를 읽는다.
 * 행이 없으면 서비스가 기본 상태를 만들어 첫 적립 시 저장한다.
 */
interface UserStatRepository extends JpaRepository<UserStat, Long> {

    /** 레벨 랭킹(API-20) — 누적 경험치가 높은 순 [userId, level]. limit은 Pageable로. */
    @Query("SELECT u.userId, u.level FROM UserStat u ORDER BY u.exp DESC")
    List<Object[]> levelRanking(Pageable pageable);
}
