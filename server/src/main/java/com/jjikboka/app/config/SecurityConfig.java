package com.jjikboka.app.config;

import com.jjikboka.auth.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * 처음부터 JWT 무상태 (13 §5) — 세션 저장소 없음.
 * JwtAuthenticationFilter가 Bearer access 토큰을 검증해 userId를 SecurityContext에 싣고,
 * 하류(core/analysis)는 "신뢰된 userId를 받는다"는 계약만 안다(10 4단계 게이트웨이 이전 시 코드 불변).
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * 허용 오리진(콤마 목록). 배포 프론트는 Vercel(별도 오리진)이라 교차 오리진 CORS가 필요하다 —
     * 기본값은 우리 커스텀 도메인만 신뢰한다. allowCredentials=true라 넓은 와일드카드(예: {@code *.vercel.app})는
     * 남의 Vercel 배포까지 신뢰하게 되므로 금지. Vercel 프리뷰가 필요하면 env {@code APP_CORS_ALLOWED_ORIGINS}로
     * 프로젝트 스코프 패턴({@code https://jjikovoca-*.vercel.app})만 명시해 추가한다.
     * 로컬은 Vite proxy(same-origin)라 사실상 미사용.
     */
    @Value("${app.cors.allowed-origins:https://jjikovoca.site,https://www.jjikovoca.site}")
    private List<String> allowedOrigins;

    SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))   // 교차 오리진(Vercel 프론트) 허용
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

    /**
     * CORS 정책 (배포 시 Vercel 프론트 ↔ EC2 백엔드). Preflight(OPTIONS)는 Security의 cors 필터가 인증 이전에 처리한다.
     * allowCredentials=true라도 allowedOriginPatterns는 매칭된 정확한 오리진을 반사하므로 안전하다.
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));   // 이 API가 실제로 받는 헤더만(credentials와 * 병용 지양)
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);                          // Preflight 캐시 1시간
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /** 비밀번호 해시 — PBKDF2 승계 (NFR-04, 13 §5). */
    @Bean
    PasswordEncoder passwordEncoder() {
        // 120,000 iterations 급 (03/04 규약과 정합) — 파라미터는 운영 전 확정
        return Pbkdf2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }
}
