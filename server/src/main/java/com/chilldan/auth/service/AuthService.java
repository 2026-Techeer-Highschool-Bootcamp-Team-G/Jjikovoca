package com.chilldan.auth.service;

import com.chilldan.auth.entity.AppUser;
import com.chilldan.auth.entity.RefreshToken;
import com.chilldan.auth.repository.AppUserRepository;
import com.chilldan.auth.repository.RefreshTokenRepository;

import com.chilldan.auth.dto.AuthResponse;
import com.chilldan.auth.dto.LoginRequest;
import com.chilldan.auth.dto.RefreshRequest;
import com.chilldan.auth.dto.RegisterRequest;
import com.chilldan.auth.dto.TokenResponse;
import com.chilldan.common.error.BusinessException;
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
public class AuthService {

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
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BusinessException(HttpStatus.CONFLICT, "DUPLICATE_EMAIL", "이미 가입된 이메일입니다.");
        }
        AppUser user = userRepository.save(AppUser.create(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.nickname()));
        return issueTokens(user);
    }

    /**
     * 재발급 + rotation + 재사용 탐지(#472). 서명·만료·typ=refresh가 유효한데 저장소에 없는 토큰은 이미 쓰였거나
     * 폐기된 토큰의 <b>재사용</b>이다 — 탈취자와 정상 사용자 중 누가 먼저 썼는지 알 수 없으므로 그 사용자의 refresh를
     * 전부 폐기해 탈취된 세션을 끊는다. 폐기 뒤 예외를 던지므로, 폐기가 롤백되지 않게 BusinessException은 커밋한다.
     */
    @Transactional(noRollbackFor = BusinessException.class)
    public TokenResponse refresh(RefreshRequest request) {
        Long userId;
        try {
            // JWT 서명·만료·종류(typ=refresh) 검증 — access나 위조 토큰은 여기서 거부
            userId = jwtProvider.parseRefreshUserId(request.refreshToken());
        } catch (RuntimeException e) {
            throw invalidRefreshToken();
        }
        // rotation: 구 refresh를 조회 없이 바로 삭제한다. DELETE가 행 잠금을 잡으므로 같은 토큰으로 동시에 들어온
        // 두 요청 중 하나만 1행을 지우고, 나머지는 0행 = 재사용으로 판정된다(조회 후 삭제면 둘 다 통과할 틈이 생긴다).
        if (refreshTokenRepository.deleteByTokenHash(sha256(request.refreshToken())) == 0) {
            refreshTokenRepository.deleteByUserId(userId);   // 재사용 탐지 → 그 사용자의 모든 refresh 폐기
            throw invalidRefreshToken();
        }
        String accessToken = jwtProvider.createAccessToken(userId);
        String refreshToken = jwtProvider.createRefreshToken(userId);
        refreshTokenRepository.save(RefreshToken.issue(
                userId,
                sha256(refreshToken),
                LocalDateTime.now().plus(Duration.ofMillis(jwtProvider.refreshExpMs()))));
        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // 조회 실패·비밀번호 불일치를 구분하지 않는다 — 계정 존재 여부 노출 방지(Notion API-ID 2)
        AppUser user = userRepository.findByEmail(request.email())
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "이메일 또는 비밀번호가 올바르지 않습니다."));
        return issueTokens(user);
    }

    /**
     * 계정 탈퇴 (DELETE /api/account) — app_user soft delete(deleted_at·이메일 툼스톤) + refresh token 전량 폐기.
     * 정지형 JWT라 기존 access token은 만료까지 유효하나 refresh가 막혀 세션 연장은 불가. 멱등(이미 없으면 no-op).
     */
    @Transactional
    public void deleteAccount(Long userId) {
        userRepository.findById(userId).ifPresent(user -> user.softDelete(LocalDateTime.now()));
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public void logout(Long userId, String refreshToken) {
        // 멱등: 이 userId의 refresh면 폐기, 없거나 이미 폐기됐어도 성공(재요청도 200 — Notion API-ID 38)
        refreshTokenRepository.findByTokenHash(sha256(refreshToken))
                .filter(token -> token.getUserId().equals(userId))
                .ifPresent(refreshTokenRepository::delete);
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

    private static BusinessException invalidRefreshToken() {
        return new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "다시 로그인해 주세요.");
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
