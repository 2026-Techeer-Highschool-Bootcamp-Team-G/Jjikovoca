package com.jjikboka.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * JWT 액세스/리프레시 토큰 발급·검증 (13 §5 무상태). subject에 userId를 담는다.
 * 통과 후 SecurityContext로 넘어가는 것은 userId뿐 — 하류 도메인은 출처를 모른다.
 */
@Component
class JwtProvider {

    private final SecretKey key;
    private final long accessExpMs;
    private final long refreshExpMs;

    JwtProvider(@Value("${jwt.secret}") String secret,
                @Value("${jwt.access-exp-ms}") long accessExpMs,
                @Value("${jwt.refresh-exp-ms}") long refreshExpMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpMs = accessExpMs;
        this.refreshExpMs = refreshExpMs;
    }

    String createAccessToken(Long userId) {
        return build(userId, accessExpMs);
    }

    String createRefreshToken(Long userId) {
        return build(userId, refreshExpMs);
    }

    /** 서명·만료 검증 후 userId 추출. 유효하지 않으면 JwtException 계열을 던진다. */
    Long parseUserId(String token) {
        Claims claims = Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
        return Long.valueOf(claims.getSubject());
    }

    long refreshExpMs() {
        return refreshExpMs;
    }

    private String build(Long userId, long expMs) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date(now))
                .expiration(new Date(now + expMs))
                .signWith(key)
                .compact();
    }
}
