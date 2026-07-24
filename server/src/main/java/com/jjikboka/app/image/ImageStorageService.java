package com.jjikboka.app.image;

import org.springframework.core.io.Resource;

import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * 크롭 이미지 저장소 계약 (API-6·10). 접수(save)·워커 비전 입력(readBytes)·서빙(load)이 공유하는 경계로,
 * 구현은 {@code app.image.storage}로 토글한다 — 로컬 파일({@link LocalImageStorageService}) / S3({@link S3ImageStorageService}).
 *
 * <p>키(반환 파일명/오브젝트 키)는 구현이 정하고, 호출부는 그 키만 들고 다닌다(image_path·비전 입력 참조). 계약은 불변.
 * data URL 파싱·키 생성·mime 판별은 구현이 공유하도록 여기 static으로 둔다.
 */
public interface ImageStorageService {

    /** base64(선택적 data URL 프리픽스 포함)를 디코드해 저장하고 키(파일명/오브젝트 키)를 돌려준다. */
    String save(String base64OrDataUrl);

    /** 저장된 이미지 바이트(워커 비전 입력용). 부재·오류 시 비어 있는 Optional. */
    Optional<byte[]> readBytes(String key);

    /** 서빙용 리소스(GET /images/{key}). 부재·부적합 시 비어 있는 Optional(→ 404). */
    Optional<Resource> load(String key);

    /** 키(확장자)로 mime을 되돌린다(비전 입력 inline_data.mime_type용). */
    static String mimeOf(String key) {
        String lower = key.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    /** data URL/base64를 {mime, bytes}로 디코드한다. 프리픽스가 없으면 image/jpeg로 본다. */
    static Decoded decode(String base64OrDataUrl) {
        String mime = "image/jpeg";
        String body = base64OrDataUrl;
        if (base64OrDataUrl.startsWith("data:")) {
            int comma = base64OrDataUrl.indexOf(',');
            String header = base64OrDataUrl.substring(5, comma < 0 ? base64OrDataUrl.length() : comma);
            int semi = header.indexOf(';');
            mime = semi < 0 ? header : header.substring(0, semi);
            body = comma < 0 ? "" : base64OrDataUrl.substring(comma + 1);
        }
        return new Decoded(mime, Base64.getDecoder().decode(body.strip()));
    }

    /** 새 저장 키 {uuid}.{ext} — mime에서 확장자를 정한다. */
    static String newKey(String mime) {
        String ext = switch (mime) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
        return UUID.randomUUID() + "." + ext;
    }

    /** 디코드 결과 — 저장 시 contentType(mime)과 원본 바이트. */
    record Decoded(String mimeType, byte[] bytes) {
    }
}
