package com.jjikboka.app.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

/**
 * 크롭 이미지 로컬 저장소 (API-10, MVP). 저장 위치는 {@code app.image.dir}이며, 서빙 시 이 하위만 접근을 허용한다.
 *
 * <p><b>경로 traversal 방어(NFR-04)</b>: 파일명에 {@code ../}·절대경로가 섞여도 정규화 후 베이스 디렉토리
 * 하위인지({@code startsWith}) 확인해 밖으로 벗어나면 거절한다. S3 전환 시 이 클래스만 버킷 접근으로 교체한다.
 */
@Service
public class ImageStorageService {

    private final Path baseDir;

    ImageStorageService(@Value("${app.image.dir}") String imageDir) {
        this.baseDir = Paths.get(imageDir).toAbsolutePath().normalize();
    }

    /**
     * base64(선택적 data URL 프리픽스 포함)를 디코드해 {@code {uuid}.{ext}}로 저장하고 파일명을 돌려준다(API-6).
     * 접수가 받은 크롭/지문을 워커(비전 입력)·서빙(image_path)이 공유하도록 저장한다. mime는 프리픽스에서, 없으면 jpg로 본다.
     */
    public String save(String base64OrDataUrl) {
        String mime = "image/jpeg";
        String body = base64OrDataUrl;
        if (base64OrDataUrl.startsWith("data:")) {
            int comma = base64OrDataUrl.indexOf(',');
            String header = base64OrDataUrl.substring(5, comma < 0 ? base64OrDataUrl.length() : comma);
            int semi = header.indexOf(';');
            mime = semi < 0 ? header : header.substring(0, semi);
            body = comma < 0 ? "" : base64OrDataUrl.substring(comma + 1);
        }
        byte[] bytes = Base64.getDecoder().decode(body.strip());
        String filename = UUID.randomUUID() + "." + extensionOf(mime);
        try {
            Files.createDirectories(baseDir);
            Files.write(baseDir.resolve(filename), bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("이미지 저장 실패", e);
        }
        return filename;
    }

    /** 저장된 이미지 바이트를 읽는다(워커 비전 입력용). traversal·부재 시 비어 있는 Optional. */
    public Optional<byte[]> readBytes(String filename) {
        Path resolved = baseDir.resolve(filename).normalize();
        if (!resolved.startsWith(baseDir) || !Files.isReadable(resolved) || Files.isDirectory(resolved)) {
            return Optional.empty();
        }
        try {
            return Optional.of(Files.readAllBytes(resolved));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    /** 파일명 확장자로 mime을 되돌린다(비전 입력 inline_data.mime_type용). */
    public static String mimeOf(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        if (lower.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private static String extensionOf(String mime) {
        return switch (mime) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }

    /**
     * 파일명을 안전하게 해석해 읽을 수 있는 이미지 리소스를 돌려준다.
     * traversal이거나 파일이 없거나 읽을 수 없으면 비어 있는 Optional(→ 404)로 처리한다.
     */
    public Optional<Resource> load(String filename) {
        Path resolved = baseDir.resolve(filename).normalize();
        if (!resolved.startsWith(baseDir)) {
            return Optional.empty();
        }
        if (!Files.isReadable(resolved) || Files.isDirectory(resolved)) {
            return Optional.empty();
        }
        return Optional.of(new PathResource(resolved));
    }
}
