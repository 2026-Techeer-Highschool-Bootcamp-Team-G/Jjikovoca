package com.jjikboka.app.config;

import com.jjikboka.auth.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * 처음부터 JWT 무상태 (13 §5) — 세션 저장소 없음.
 * JwtAuthenticationFilter가 Bearer access 토큰을 검증해 userId를 SecurityContext에 싣고,
 * 하류(core/analysis)는 "신뢰된 userId를 받는다"는 계약만 안다(10 4단계 게이트웨이 이전 시 코드 불변).
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())                 // 무상태 REST — CSRF 토큰 불필요
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // 인증 불필요: 가입·로그인·재발급(만료된 access로도 호출) + 헬스·이미지·Swagger
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh",
                        "/api/health", "/actuator/health", "/images/**",
                        "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                // 로그아웃 등 나머지는 인증 필요 — JwtAuthenticationFilter가 실은 userId를 확인
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    /** 비밀번호 해시 — PBKDF2 승계 (NFR-04, 13 §5). */
    @Bean
    PasswordEncoder passwordEncoder() {
        // 120,000 iterations 급 (03/04 규약과 정합) — 파라미터는 운영 전 확정
        return Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }
}
