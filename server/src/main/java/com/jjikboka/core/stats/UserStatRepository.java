package com.jjikboka.core.stats;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * user_stat 저장소. package-private 봉인(13 §2). PK가 user_id라 findById(userId)로 상태를 읽는다.
 * 행이 없으면 서비스가 기본 상태를 만들어 첫 적립 시 저장한다.
 */
interface UserStatRepository extends JpaRepository<UserStat, Long> {
}
