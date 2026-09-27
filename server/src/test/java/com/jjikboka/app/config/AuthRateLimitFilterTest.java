package com.jjikboka.app.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.RedisConnectionFailureException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Redis 없이 확인해야 하는 분기: 장애 시 fail-open, 대상이 아닌 요청은 카운터를 건드리지 않음. */
class AuthRateLimitFilterTest {

    private final StringRedisTemplate redis = mock(StringRedisTemplate.class);
    private final AuthRateLimitFilter filter =
            new AuthRateLimitFilter(redis, new ObjectMapper(), Map.of("/api/auth/login", 10), 60);

    @Test
    @SuppressWarnings("unchecked")
    void Redis가_죽어도_로그인은_통과한다() throws Exception {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class)))
                .thenThrow(new RedisConnectionFailureException("down"));
        MockFilterChain chain = new MockFilterChain();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("POST", "/api/auth/login"), response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isNotNull();   // 다음 필터로 넘어갔다
    }

    @Test
    @SuppressWarnings("unchecked")
    void Redis_결과가_없으면_막지_않고_통과한다() throws Exception {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenReturn(null);
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request("POST", "/api/auth/login"), new MockHttpServletResponse(), chain);

        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @SuppressWarnings("unchecked")
    void 대상이_아닌_요청은_카운터를_세지_않는다() throws Exception {
        filter.doFilter(request("GET", "/api/auth/login"), new MockHttpServletResponse(), new MockFilterChain());
        filter.doFilter(request("POST", "/api/cards"), new MockHttpServletResponse(), new MockFilterChain());

        verify(redis, never()).execute(any(RedisScript.class), anyList(), any(Object[].class));
    }

    @Test
    @SuppressWarnings("unchecked")
    void 한도를_넘으면_429와_남은_초를_준다() throws Exception {
        when(redis.execute(any(RedisScript.class), anyList(), any(Object[].class))).thenReturn(List.of(11L, 42L));
        MockFilterChain chain = new MockFilterChain();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request("POST", "/api/auth/login"), response, chain);

        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("42");
        assertThat(response.getContentAsString()).contains("\"errorName\":\"RATE_LIMITED\"");
        assertThat(chain.getRequest()).isNull();   // 컨트롤러까지 가지 않았다
    }

    /** 서블릿 컨테이너처럼 servletPath를 채운다 — 대상 판별은 인가 규칙과 같이 디코딩된 경로(servletPath)로 한다. */
    private static MockHttpServletRequest request(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.setServletPath(path);
        return request;
    }
}
