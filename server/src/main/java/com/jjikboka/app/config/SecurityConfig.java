package com.jjikboka.app.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jjikboka.common.error.ApiError;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import java.nio.charset.StandardCharsets;

import com.jjikboka.auth.service.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.Pbkdf2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.DelegatingRequestMatcherHeaderWriter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.security.web.util.matcher.NegatedRequestMatcher;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;
import java.util.Map;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

/**
 * 처음부터 JWT 무상태 (13 §5) — 세션 저장소 없음.
 * JwtAuthenticationFilter가 Bearer access 토큰을 검증해 userId를 SecurityContext에 싣고,
 * 하류(core/analysis)는 "신뢰된 userId를 받는다"는 계약만 안다(10 4단계 게이트웨이 이전 시 코드 불변).
 */
@Configuration
public class SecurityConfig {

    /**
     * API 응답 CSP (P1-11 E, 「보안 및 방어로직」 §6). JSON·이미지만 내보내므로 어떤 리소스 로드도, 프레임 삽입도 허용하지 않는다.
     * CSP는 응답 문서 자신에게만 걸려 이미지의 교차 오리진 {@code <img>} 임베드에는 영향이 없다.
     */
    private static final String API_CSP = "default-src 'none'; frame-ancestors 'none'";

    /**
     * Swagger UI 화면만 CSP에서 뺀다(스크립트·스타일 사용). API 문서(/v3/api-docs)는 JSON이라 CSP를 그대로 건다.
     * 운영(prod)에서는 springdoc 자체를 끈다(application-prod.yml).
     */
    private static final RequestMatcher SWAGGER_UI = new OrRequestMatcher(
            antMatcher("/swagger-ui/**"), antMatcher("/swagger-ui.html"));

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ObjectMapper objectMapper;

    /**
     * 허용 오리진(콤마 목록). 배포 프론트는 Vercel(별도 오리진)이라 교차 오리진 CORS가 필요하다 —
     * 기본값은 우리 커스텀 도메인만 신뢰한다. allowCredentials=true라 넓은 와일드카드(예: {@code *.vercel.app})는
     * 남의 Vercel 배포까지 신뢰하게 되므로 금지. Vercel 프리뷰가 필요하면 env {@code APP_CORS_ALLOWED_ORIGINS}로
     * 프로젝트 스코프 패턴({@code https://jjikovoca-*.vercel.app})만 명시해 추가한다.
     * 로컬은 Vite proxy(same-origin)라 사실상 미사용.
     */
    @Value("${app.cors.allowed-origins:https://jjikovoca.site,https://www.jjikovoca.site}")
    private List<String> allowedOrigins;

    /** 인증 엔드포인트 rate limit (P1-11 D). 한도는 초안 — 429 로그를 보고 조정한다. 통합 테스트 베이스는 끈다. */
    @Value("${app.rate-limit.enabled:true}")
    private boolean rateLimitEnabled;
    @Value("${app.rate-limit.window-seconds:60}")
    private int rateLimitWindowSeconds;
    @Value("${app.rate-limit.login:10}")
    private int loginLimit;
    @Value("${app.rate-limit.register:5}")
    private int registerLimit;
    @Value("${app.rate-limit.refresh:30}")
    private int refreshLimit;

    private final StringRedisTemplate redis;

    SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, ObjectMapper objectMapper, StringRedisTemplate redis) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.objectMapper = objectMapper;
        this.redis = redis;
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource))   // 교차 오리진(Vercel 프론트) 허용
            .csrf(csrf -> csrf.disable())                 // 무상태 REST — CSRF 토큰 불필요
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // 보안 응답 헤더. nosniff·X-Frame-Options DENY·HSTS(HTTPS 요청에만)는 Spring Security 기본값을 그대로 쓰고,
            // CSP와 Referrer-Policy를 더한다 — 토큰이 든 URL·경로가 Referer로 새지 않게 no-referrer.
            .headers(h -> h
                .referrerPolicy(r -> r.policy(ReferrerPolicy.NO_REFERRER))
                .addHeaderWriter(new DelegatingRequestMatcherHeaderWriter(
                        new NegatedRequestMatcher(SWAGGER_UI), new StaticHeadersWriter("Content-Security-Policy", API_CSP))))
            .authorizeHttpRequests(auth -> auth
                // 서블릿 오류 포워드(/error)는 인증 컨텍스트 없이 돈다 — 막으면 404·405·500이 전부 401로 둔갑해
                // 웹이 헛된 refresh·재시도를 한다. 원 요청의 인가는 이미 끝났으므로 오류 디스패치는 허용한다.
                .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                // 인증 불필요: 가입·로그인·재발급(만료된 access로도 호출) + 헬스·이미지·Swagger
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh",
                        "/api/health", "/actuator/health", "/images/**",
                        "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                // 로그아웃 등 나머지는 인증 필요 — JwtAuthenticationFilter가 실은 userId를 확인
                .anyRequest().authenticated()
            )
            // 인증이 없거나 무효하면 401 + 공통 봉투(UNAUTHORIZED). 기본값은 봉투 없는 403이라 업무상 권한 거부(403 FORBIDDEN)와
            // HTTP 의미가 겹쳤다. 웹 client.ts는 401을 인증 실패로 보고 refresh 후 재시도한다(「보안 및 방어로직」 §3).
            .exceptionHandling(e -> e.authenticationEntryPoint((request, response, ex) -> {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                objectMapper.writeValue(response.getOutputStream(), ApiError.unauthorized());
            }))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        if (rateLimitEnabled) {
            // CORS 필터 뒤 — 429에도 CORS 헤더가 붙어야 브라우저(Vercel 프론트)가 응답을 읽고 Retry-After를 본다.
            http.addFilterAfter(new AuthRateLimitFilter(redis, objectMapper, Map.of(
                    "/api/auth/login", loginLimit,
                    "/api/auth/register", registerLimit,
                    "/api/auth/refresh", refreshLimit), rateLimitWindowSeconds), CorsFilter.class);
        }
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
        config.setExposedHeaders(List.of("Retry-After"));   // 429 대기 시간을 교차 오리진 JS가 읽게(안전 목록 밖 헤더)
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
