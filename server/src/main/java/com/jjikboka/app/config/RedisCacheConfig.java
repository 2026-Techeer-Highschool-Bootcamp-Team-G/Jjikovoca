package com.jjikboka.app.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.databind.jsontype.PolymorphicTypeValidator;
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
        // 캐시 값은 @class 타입정보(디폴트 타이핑)로 저장해야 역직렬화 시 원래 DTO로 복원된다.
        // 앱 공용 매퍼(MVC용)를 그대로 넘기면 @class가 안 붙어 LinkedHashMap으로 복원→CCE(#213).
        // DTO가 전부 Java record(=final)라 NON_FINAL은 루트에 @class를 안 붙인다 → EVERYTHING으로
        // record까지 타입정보를 강제한다. 공용 매퍼를 오염시키지 않도록 사본에만 적용하고,
        // 역직렬화 가젯 공격을 막기 위해 우리 DTO와 캐시가 담는 표준 타입만 허용한다
        // (java.lang은 String·숫자 등 스칼라 복원용 — EVERYTHING이 스칼라도 태깅하기 때문).
        PolymorphicTypeValidator ptv = BasicPolymorphicTypeValidator.builder()
                .allowIfSubType("com.jjikboka.")
                .allowIfSubType("java.util.")
                .allowIfSubType("java.time.")
                .allowIfSubType("java.lang.")
                .build();
        ObjectMapper cacheMapper = objectMapper.copy()
                .activateDefaultTyping(ptv, ObjectMapper.DefaultTyping.EVERYTHING, JsonTypeInfo.As.PROPERTY);
        var json = new GenericJackson2JsonRedisSerializer(cacheMapper);
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
