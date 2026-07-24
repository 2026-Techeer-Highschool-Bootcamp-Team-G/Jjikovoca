package com.jjikboka.analysis;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Gemini 연동 설정 (API-6·16·41). {@code gemini.*}로 바인딩한다. mock=true(기본)면 모의, false면 실 호출.
 *
 * <p>apiKey는 이미지에 굽지 않고 env(GEMINI_API_KEY)로 주입한다(15 §7). models는 폴백 체인 — 앞에서부터
 * 시도하고 실패하면 다음 모델로 넘어간다. 값이 없을 때를 대비해 필드에 안전한 기본값을 둔다(yml이 덮어씀).
 */
@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {

    /** true면 MockGeminiClient(키·원가 없이 흐름), false면 RealGeminiClient. */
    private boolean mock = true;

    /** Generative Language API 키(env 주입). mock=false인데 비어 있으면 실패한다. */
    private String apiKey = "";

    /** generateContent 베이스 URL(버전 포함). */
    private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";

    /**
     * 폴백 체인 — 앞 모델부터 시도, 실패 시 다음. 폐기되지 않는 {@code -latest} 별칭을 쓴다(구버전 gemini-2.5-flash 등은
     * 신규 사용자에게 폐기돼 404). flash-latest→3.6-flash, flash-lite-latest→3.5-flash-lite로 자동 최신 추적.
     */
    private List<String> models = List.of("gemini-flash-latest", "gemini-flash-lite-latest");

    /** 단일 호출 타임아웃(ms). 워커 전용 풀에서 블로킹 호출하므로 상한을 둔다. */
    private long timeoutMs = 30000;

    public boolean isMock() {
        return mock;
    }

    public void setMock(boolean mock) {
        this.mock = mock;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public List<String> getModels() {
        return models;
    }

    public void setModels(List<String> models) {
        this.models = models;
    }

    public long getTimeoutMs() {
        return timeoutMs;
    }

    public void setTimeoutMs(long timeoutMs) {
        this.timeoutMs = timeoutMs;
    }
}
