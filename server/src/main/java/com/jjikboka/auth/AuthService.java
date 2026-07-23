package com.jjikboka.auth;

import com.jjikboka.auth.dto.AuthResponse;
import com.jjikboka.auth.dto.RegisterRequest;
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
