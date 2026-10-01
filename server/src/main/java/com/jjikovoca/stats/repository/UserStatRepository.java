package com.jjikovoca.stats.repository;

import com.jjikovoca.stats.entity.UserStat;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * user_stat 저장소. package-private 봉인(13 §2). PK가 user_id라 findById(userId)로 상태를 읽는다.
 * 적립은 {@link #createIfAbsent}로 행을 멱등 생성한 뒤 {@link #findForUpdate}로 잠가 직렬화한다(#475).
 */
public interface UserStatRepository extends JpaRepository<UserStat, Long> {

    /** 레벨 랭킹(API-20) — 누적 경험치가 높은 순 [userId, level]. limit은 Pageable로. */
    @Query("SELECT u.userId, u.level FROM UserStat u ORDER BY u.exp DESC")
    List<Object[]> levelRanking(Pageable pageable);

    /**
     * 행이 없으면 기본값(레벨 1·exp 0)으로 만든다 — 동시에 불려도 PK 충돌 없이 멱등(#475).
     * INSERT IGNORE는 중복 시 공유(S) 잠금을 잡아 뒤이은 FOR UPDATE(X)로 올릴 때 두 트랜잭션이 교착될 수 있어,
     * 처음부터 배타(X) 잠금을 잡는 ON DUPLICATE KEY UPDATE를 쓴다.
     */
    @Modifying
    @Query(value = "INSERT INTO user_stat (user_id) VALUES (:userId) ON DUPLICATE KEY UPDATE user_id = user_id",
            nativeQuery = true)
    void createIfAbsent(@Param("userId") Long userId);

    /** 적립용 행 잠금(SELECT ... FOR UPDATE) — 동시 적립이 exp를 서로 덮어쓰지 않게 직렬화한다. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserStat u WHERE u.userId = :userId")
    Optional<UserStat> findForUpdate(@Param("userId") Long userId);
}
