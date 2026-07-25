package com.jjikboka.analysis;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.List;

/**
 * Gemini 분석 결과 캐시 (13 §9, {@code "analysis"} 캐시 = 30일 TTL·원가 방어). 입력이 이미지라
 * "단어" 키는 비전 호출을 못 줄이므로(닭-달걀), 호출 전에 쓸 수 있는 유일한 키인 <b>이미지 내용 해시</b>로
 * 캐시한다 — 같은 크롭+지문이면 {@link GeminiClient#generate}를 건너뛰고 결과를 재사용한다.
 *
 * <p>캐시 어사이드는 analysis 슬라이스가 소유(@Cacheable로 "무엇을 캐싱할지" 결정, {@code RedisCacheConfig} 참조).
 * 예외는 @Cacheable이 캐싱하지 않으므로 실패가 캐시를 오염시키지 않는다.
 */
@Service
public class GeminiAnalysisCache {

    private final GeminiClient geminiClient;

    GeminiAnalysisCache(GeminiClient geminiClient) {
        this.geminiClient = geminiClient;
    }

    /**
     * 이미지 내용 해시(imageHash)를 키로 분석 결과를 캐시한다. 히트면 geminiClient.generate를 스킵한다.
     * 결과는 크롭+지문 모두에 의존하므로(지문이 contextMeaning을 좌우), 키는 둘의 바이트를 함께 해시한 값이다.
     */
    @Cacheable(cacheNames = "analysis", key = "#type + ':' + #imageHash")
    public AnalysisContent generate(String type, String imageHash, List<GeminiImage> images) {
        return geminiClient.generate(type, images);
    }

    /**
     * OCR 단어 힌트 기반 캐시 — "다른 사진(다른 바이트)의 같은 단어"까지 히트한다(이미지 해시보다 앞단).
     * 사전적 필드(뜻·발음·품사·예문)는 단어 고유라 정확하지만, contextMeaning은 지문 의존이라 다른 지문의 뜻이
     * 재사용될 수 있다(교차사진 재사용을 얻는 대가의 트레이드오프). 힌트가 신뢰 가능할 때만 호출부가 진입한다.
     */
    @Cacheable(cacheNames = "analysis", key = "'word:' + #word")
    public AnalysisContent generateByWord(String word, List<GeminiImage> images) {
        return geminiClient.generate("WORD", images);
    }

    /** 단어 힌트 정규화(trim·소문자). 비었으면 null → 호출부가 단어키 캐시를 건너뛰고 이미지 해시 경로로 간다. */
    public static String normalizeWord(String word) {
        if (word == null) {
            return null;
        }
        String normalized = word.strip().toLowerCase();
        return normalized.isEmpty() ? null : normalized;
    }

    /** 비전 입력(크롭+지문) 바이트를 순서대로 이어 SHA-256으로 해시 — 같은 내용이면 같은 키. */
    public static String hash(List<GeminiImage> images) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for (GeminiImage image : images) {
                md.update(image.data());
            }
            return HexFormat.of().formatHex(md.digest());
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 미지원 JVM", e);   // 표준 JVM엔 항상 존재
        }
    }
}
