package com.jjikboka.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * 처음부터 JWT 무상태 (13 §5) — 세션 저장소 없음.
 * 검증 필터는 app 보안 체인에 배치, 통과 후 userId만 SecurityContext로 하류 전달
 * (auth/core/analysis는 "신뢰된 userId를 받는다"는 계약만 앎 → 10 4단계 게이트웨이 이전 시 코드 불변).
 *
 * TODO(app2 이관 §11): auth 모듈의 JwtAuthenticationFilter를 여기 addFilterBefore로 연결.
 */
@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                 // 무상태 REST — CSRF 토큰 불필요
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 예외 경로 (04 §2-3)
                .requestMatchers("/api/auth/**", "/api/health", "/actuator/health", "/images/**").permitAll()
                .anyRequest().authenticated()
            );
        // TODO: .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        return http.build();
    }

    /** 비밀번호 해시 — PBKDF2 승계 (NFR-04, 13 §5). */
    @Bean
    PasswordEncoder passwordEncoder() {
        // 120,000 iterations 급 (03/04 규약과 정합) — 파라미터는 운영 전 확정
        return Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }
}
