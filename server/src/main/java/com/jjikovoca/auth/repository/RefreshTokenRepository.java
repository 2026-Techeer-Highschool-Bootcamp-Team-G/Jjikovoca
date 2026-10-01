package com.jjikovoca.auth.repository;

import com.jjikovoca.auth.entity.RefreshToken;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * refresh_token 저장소. package-private 봉인(13 §2).
 * 재발급 시 token_hash로 조회, 폐기 시 사용자 단위 삭제.
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** 해시가 일치하는 refresh를 지우고 지운 행 수를 돌려준다 — 조회·삭제를 한 문장으로 해 동시 재발급 경합을 닫는다. */
    @Modifying
    @Query("DELETE FROM RefreshToken r WHERE r.tokenHash = :tokenHash")
    int deleteByTokenHash(@Param("tokenHash") String tokenHash);

    void deleteByUserId(Long userId);
}
