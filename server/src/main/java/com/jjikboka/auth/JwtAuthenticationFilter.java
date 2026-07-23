package com.jjikboka.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JWT 인증 필터 (13 §5). {@code Authorization: Bearer {access}}를 검증해 userId를 SecurityContext에 싣는다.
 * 통과 후 하류(core·analysis)는 "신뢰된 userId를 받는다"는 계약만 안다 — 토큰 출처를 모른다.
 *
 * 토큰이 없거나 유효하지 않으면 인증을 설정하지 않고 그대로 통과시킨다.
 * 보호가 필요한 경로는 SecurityConfig가 인증 없음을 401로 막는다(permitAll 경로는 그대로 통과).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER = "Bearer ";

    private final JwtProvider jwtProvider;

    JwtAuthenticationFilter(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith(BEARER)) {
            try {
                Long userId = jwtProvider.parseUserId(header.substring(BEARER.length()));
                var authentication = new UsernamePasswordAuthenticationToken(userId, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (RuntimeException e) {
                // 서명·만료 등 검증 실패 → 인증 미설정. 보호 경로에서 401 처리된다.
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
