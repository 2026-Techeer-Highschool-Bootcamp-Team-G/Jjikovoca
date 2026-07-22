package com.jjikboka.app.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;
import java.util.Map;

/**
 * Redis 캐시-어사이드 (13 §9). 캐시 인프라(연결·CacheManager)는 조립 모듈(app) 소유(§9-3),
 * "무엇을 캐싱하는가"는 소유 모듈(core.stats·analysis)이 @Cacheable로 결정.
 *
 * 직렬화 = JSON(redis-cli로 눈으로 확인 가능) · DTO만 캐싱, JPA 엔티티 금지(§9-2).
 * 무효화는 §6 이벤트로 evict — 여기선 TTL 정책만 정의.
 */
@Configuration
@EnableCaching
public class RedisCacheConfig {

    @Bean
    RedisCacheManager cacheManager(RedisConnectionFactory cf, ObjectMapper objectMapper) {
        var json = new GenericJackson2JsonRedisSerializer(objectMapper);
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(json))
                .disableCachingNullValues() // null 캐싱은 캐시별로 필요 시 개별 허용(penetration 방어, §9-2)
                .entryTtl(Duration.ofMinutes(5));

        // 캐시별 TTL (13 §9-1 hot data). 키 네임스페이스는 shared 상수와 동기화.
        Map<String, RedisCacheConfiguration> perCache = Map.of(
                "stats:summary",  base.entryTtl(Duration.ofMinutes(5)),   // 무거운 집계 — 주 타깃
                "report:monthly", base.entryTtl(Duration.ofDays(1)),      // 무거운 집계 read
                "analysis",       base.entryTtl(Duration.ofDays(30)),     // Gemini 원가 방어 (콘텐츠 불변)
                "profile",        base.entryTtl(Duration.ofHours(1)),     // 프로필(닉네임·레벨) — 잦은 read
                "feed",           base.entryTtl(Duration.ofMinutes(1))    // 오답노트 피드 페이지
        );

        return RedisCacheManager.builder(cf)
                .cacheDefaults(base)
                .withInitialCacheConfigurations(perCache)
                .build();
    }
}
