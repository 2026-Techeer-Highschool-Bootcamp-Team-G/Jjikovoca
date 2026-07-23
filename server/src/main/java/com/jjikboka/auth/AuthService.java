package com.jjikboka.auth;

import com.jjikboka.auth.dto.AuthResponse;
import com.jjikboka.auth.dto.RefreshRequest;
import com.jjikboka.auth.dto.RegisterRequest;
import com.jjikboka.auth.dto.TokenResponse;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HexFormat;

/**
 * 인증 서비스 (F-01). 회원가입: 이메일 중복 검사 → PBKDF2 해시 저장 → access·refresh 발급.
 * refresh는 평문이 아니라 SHA-256 해시로 저장해 재발급·재사용 탐지에 쓴다.
 */
@Service
class AuthService {

    private final AppUserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    AuthService(AppUserRepository userRepository,
                RefreshTokenRepository refreshTokenRepository,
                JwtProvider jwtProvider,
                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtProvider = jwtProvider;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 가입된 이메일입니다.");
        }
        AppUser user = userRepository.save(AppUser.create(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.nickname()));
        return issueTokens(user);
    }

    @Transactional
    TokenResponse refresh(RefreshRequest request) {
        Long userId;
        try {
            // JWT 서명·만료 검증 (형식·서명·기간이 깨지면 예외)
            userId = jwtProvider.parseUserId(request.refreshToken());
        } catch (RuntimeException e) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "다시 로그인해 주세요.");
        }
        // 저장소에 해시가 있어야 유효 — 없으면 이미 폐기(rotation)됐거나 재사용 탐지
        RefreshToken stored = refreshTokenRepository.findByTokenHash(sha256(request.refreshToken()))
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "다시 로그인해 주세요."));
        refreshTokenRepository.delete(stored); // rotation: 구 refresh 즉시 폐기
        String accessToken = jwtProvider.createAccessToken(userId);
        String refreshToken = jwtProvider.createRefreshToken(userId);
        refreshTokenRepository.save(RefreshToken.issue(
                userId,
                sha256(refreshToken),
                LocalDateTime.now().plus(Duration.ofMillis(jwtProvider.refreshExpMs()))));
        return new TokenResponse(accessToken, refreshToken);
    AuthResponse login(LoginRequest request) {
        // 조회 실패·비밀번호 불일치를 구분하지 않는다 — 계정 존재 여부 노출 방지(Notion API-ID 2)
        AppUser user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다."));
        return issueTokens(user);
    }

    private AuthResponse issueTokens(AppUser user) {
        String accessToken = jwtProvider.createAccessToken(user.getId());
        String refreshToken = jwtProvider.createRefreshToken(user.getId());
        refreshTokenRepository.save(RefreshToken.issue(
                user.getId(),
                sha256(refreshToken),
                LocalDateTime.now().plus(Duration.ofMillis(jwtProvider.refreshExpMs()))));
        // premium은 계산값(subscription 판정) — 신규 가입은 항상 false
        return new AuthResponse(accessToken, refreshToken,
                new AuthResponse.UserSummary(user.getEmail(), user.getNickname(), false));
    }

    private static String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
