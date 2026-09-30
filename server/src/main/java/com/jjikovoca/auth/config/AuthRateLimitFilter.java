package com.jjikovoca.auth.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jjikovoca.common.error.ApiError;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 인증 엔드포인트 rate limit (P1-11 D, 「보안 및 방어로직」 §5). 로그인 무차별 대입·가입 남용·재발급 폭주를 IP당
 * 고정 윈도우 카운터로 막는다. 카운터는 Redis에 둬 인스턴스가 늘어도 한도를 공유한다.
 *
 * <p>클라이언트 IP는 {@code request.getRemoteAddr()}만 본다. 프록시 뒤(prod nginx)에서는
 * {@code server.forward-headers-strategy=native}가 신뢰 프록시의 X-Forwarded-For만 반영해 주므로,
 * 여기서 헤더를 직접 읽지 않는다 — 클라이언트가 헤더를 바꿔 한도를 피할 수 없다.
 *
 * <p>대상 판별은 인가 규칙과 같은 방식(디코딩·정규화된 경로)으로 한다. 원시 {@code getRequestURI()}로 세면
 * {@code /api/auth/%6Cogin}처럼 글자를 퍼센트 인코딩한 요청이 컨트롤러에는 닿으면서 카운터만 피해 간다.
 * 카운터 키도 요청 URI가 아니라 설정의 고정 경로로 만든다.
 *
 * <p>Redis 장애 시 fail-open: 요청을 통과시키고 경고만 남긴다. Redis는 원장이 아니라(요구사항 13 §9-1)
 * 캐시 장애가 로그인 불능으로 번지면 안 된다.
 */
class AuthRateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(AuthRateLimitFilter.class);

    /**
     * 카운터를 올리고 만료가 없으면 윈도우 만료를 건다 — 한 스크립트라 EXPIRE가 빠진 채 키가 영구히 남는 일이 없다.
     * 반환: {현재 횟수, 남은 초}.
     */
    @SuppressWarnings("rawtypes")
    private static final RedisScript<List> INCR_WINDOW = new DefaultRedisScript<>("""
            local n = redis.call('INCR', KEYS[1])
            local ttl = redis.call('TTL', KEYS[1])
            if ttl < 0 then
              redis.call('EXPIRE', KEYS[1], ARGV[1])
              ttl = tonumber(ARGV[1])
            end
            return {n, ttl}
            """, List.class);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final Map<String, Integer> limitsByPath;
    private final Map<String, RequestMatcher> matchersByPath;
    private final int windowSeconds;

    AuthRateLimitFilter(StringRedisTemplate redis, ObjectMapper objectMapper,
                        Map<String, Integer> limitsByPath, int windowSeconds) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.limitsByPath = Map.copyOf(limitsByPath);
        this.matchersByPath = limitsByPath.keySet().stream().collect(Collectors.toUnmodifiableMap(
                path -> path, path -> AntPathRequestMatcher.antMatcher(HttpMethod.POST, path)));
        this.windowSeconds = windowSeconds;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return target(request).isEmpty();
    }

    /** 요청이 한도 대상이면 설정상의 경로(카운터 키 기준)를 돌려준다. */
    private Optional<String> target(HttpServletRequest request) {
        return matchersByPath.entrySet().stream()
                .filter(e -> e.getValue().matches(request))
                .map(Map.Entry::getKey)
                .findFirst();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String path = target(request).orElseThrow();
        List<?> result;
        try {
            result = redis.execute(INCR_WINDOW, List.of("rl:" + path + ":" + request.getRemoteAddr()),
                    String.valueOf(windowSeconds));
        } catch (DataAccessException e) {   // Redis 연결·타임아웃·명령 오류만 — 그 밖의 버그는 삼키지 않는다
            log.warn("rate limit 건너뜀 — Redis 장애로 fail-open: path={}, cause={}", path, e.toString());
            chain.doFilter(request, response);
            return;
        }
        if (result == null || result.size() < 2) {   // 파이프라인·트랜잭션 모드 등 결과 없음 — 차단 근거가 없으니 통과
            log.warn("rate limit 건너뜀 — Redis 결과 없음: path={}", path);
            chain.doFilter(request, response);
            return;
        }
        long count = ((Number) result.get(0)).longValue();
        if (count <= limitsByPath.get(path)) {
            chain.doFilter(request, response);
            return;
        }
        long retryAfter = Math.max(1, ((Number) result.get(1)).longValue());
        if (count == limitsByPath.get(path) + 1) {   // 윈도우당 첫 차단만 기록 — 공격 중 로그 폭주 방지
            log.info("rate limit 초과: path={}, ip={}", path, request.getRemoteAddr());
        }
        response.setStatus(429);
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        objectMapper.writeValue(response.getOutputStream(), ApiError.rateLimited());
    }
}
