package com.jjikboka.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * refresh_token 저장소. package-private 봉인(13 §2).
 * 재발급 시 token_hash로 조회, 폐기 시 사용자 단위 삭제.
 */
interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    void deleteByUserId(Long userId);
}
