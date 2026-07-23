package com.jjikboka.app.health;

import com.jjikboka.shared.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 헬스체크 API (Notion API-ID 27). 인증 불필요(SecurityConfig permitAll).
 * actuator의 /actuator/health와 별개로, 공통 응답 규약(ApiResponse)을 따르고 aiMockMode를 함께 노출한다.
 */
@RestController
@RequestMapping("/api/health")
class HealthController {

    private final boolean aiMockMode;

    HealthController(@Value("${gemini.mock:false}") boolean aiMockMode) {
        this.aiMockMode = aiMockMode;
    }

    @GetMapping
    ResponseEntity<ApiResponse<HealthResponse>> health() {
        return ResponseEntity.ok(ApiResponse.ok(
                new HealthResponse("ok", aiMockMode), "정상 동작 중입니다."));
    }
}
