package com.jjikboka.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

/**
 * JWT 액세스/리프레시 토큰 발급·검증 (13 §5 무상태). subject에 userId를 담는다.
 * 통과 후 SecurityContext로 넘어가는 것은 userId뿐 — 하류 도메인은 출처를 모른다.
 */
@Component
public class JwtProvider {

    private static final String TYP_CLAIM = "typ";
    private static final String TYP_ACCESS = "access";
    private static final String TYP_REFRESH = "refresh";

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

    public String createAccessToken(Long userId) {
        return build(userId, accessExpMs, TYP_ACCESS);
    }

    public String createRefreshToken(Long userId) {
        return build(userId, refreshExpMs, TYP_REFRESH);
    }

    /**
     * 보호 API 인증용 — 서명·만료에 더해 {@code typ=access}인 토큰만 받는다(#472).
     * refresh(14일)를 Bearer로 쓰거나, typ이 없던 배포 전 access는 거부된다(웹은 401을 받아 한 번 재발급한다).
     */
    public Long parseAccessUserId(String token) {
        Claims claims = parse(token);
        if (!TYP_ACCESS.equals(claims.get(TYP_CLAIM))) {
            throw new JwtException("access 토큰이 아닙니다.");
        }
        return Long.valueOf(claims.getSubject());
    }

    /**
     * 재발급용 — {@code typ=refresh}만 받는다. 전환기 예외로 typ이 없는 배포 전 refresh도 허용해
     * 기존 사용자가 한꺼번에 로그아웃되지 않게 한다. 배포 후 refresh 수명(14일)이 지나면 이 예외를 제거한다.
     */
    public Long parseRefreshUserId(String token) {
        Claims claims = parse(token);
        Object typ = claims.get(TYP_CLAIM);
        if (typ != null && !TYP_REFRESH.equals(typ)) {
            throw new JwtException("refresh 토큰이 아닙니다.");
        }
        return Long.valueOf(claims.getSubject());
    }

    /** 서명·만료 검증. 유효하지 않으면 JwtException 계열을 던진다. */
    private Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build()
                .parseSignedClaims(token).getPayload();
    }

    public long refreshExpMs() {
        return refreshExpMs;
    }

    private String build(Long userId, long expMs, String typ) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .id(UUID.randomUUID().toString())   // jti — 같은 초 발급이라도 토큰을 고유하게(refresh_token 해시 충돌 방지)
                .subject(String.valueOf(userId))
                .claim(TYP_CLAIM, typ)   // 토큰 종류 — access와 refresh가 서로를 대신하지 못하게 한다(#472)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expMs))
                .signWith(key)
                .compact();
    }
}
