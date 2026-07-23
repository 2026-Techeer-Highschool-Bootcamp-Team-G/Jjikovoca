package com.jjikboka.app.image;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * 크롭 이미지 서빙 (Notion API-ID 10). 인증 불필요(SecurityConfig permitAll).
 * 공통 응답(JSON)의 예외 — 바이너리를 그대로 내려주고, 없는 파일은 JSON 바디 없이 404다.
 */
@RestController
class ImageController {

    private final ImageStorageService imageStorageService;

    ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @GetMapping("/images/{file}")
    ResponseEntity<Resource> serve(@PathVariable String file) {
        return imageStorageService.load(file)
                .map(resource -> ResponseEntity.ok()
                        .contentType(contentTypeOf(file))
                        .body(resource))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /** 확장자로 Content-Type을 정한다. 미지의 확장자는 바이너리 기본값. */
    private MediaType contentTypeOf(String file) {
        String lower = file.toLowerCase();
        if (lower.endsWith(".png")) {
            return MediaType.IMAGE_PNG;
        }
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return MediaType.IMAGE_JPEG;
        }
        if (lower.endsWith(".gif")) {
            return MediaType.IMAGE_GIF;
        }
        if (lower.endsWith(".webp")) {
            return MediaType.parseMediaType("image/webp");
        }
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}
