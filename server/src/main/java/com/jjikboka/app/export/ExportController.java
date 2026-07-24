package com.jjikboka.app.export;

import com.jjikboka.core.export.ExportLogService;
import com.jjikboka.shared.error.BusinessException;
import com.jjikboka.shared.response.ApiResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * 내보내기 API (Notion API-ID 25·26, F-07). 인증 필요 — JwtAuthenticationFilter가 실은 userId를 넣는다.
 * 생성은 프리미엄 전용(app 조립), 다운로드는 소유자 검증 후 바이너리를 내려준다(공통 JSON 응답 예외). app→core 조립(13 §2).
 */
@RestController
class ExportController {

    private final ExportFacade exportFacade;
    private final ExportLogService exportLogService;
    private final ExportStorage exportStorage;

    ExportController(ExportFacade exportFacade, ExportLogService exportLogService, ExportStorage exportStorage) {
        this.exportFacade = exportFacade;
        this.exportLogService = exportLogService;
        this.exportStorage = exportStorage;
    }

    @PostMapping("/api/export/note")
    ResponseEntity<ApiResponse<ExportCreateResponse>> create(
            @AuthenticationPrincipal Long userId,
            @RequestBody ExportRequest request) {
        ExportCreateResponse response = exportFacade.create(userId, request);
        return ResponseEntity.ok(ApiResponse.ok(response, "내보내기 파일이 생성되었습니다."));
    }

    @GetMapping("/api/export/{id}/download")
    ResponseEntity<Resource> download(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id) {
        exportLogService.verifyOwned(userId, id);   // 404 EXPORT_NOT_FOUND(없음/타인)
        Resource file = exportStorage.load(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "EXPORT_NOT_FOUND",
                        "파일이 만료되었거나 존재하지 않습니다."));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + exportStorage.filename(id) + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}
