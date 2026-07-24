package com.jjikboka.app.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

/**
 * 크롭 이미지 로컬 저장소 (API-10, MVP·기본). 저장 위치는 {@code app.image.dir}이며, 서빙 시 이 하위만 접근을 허용한다.
 * {@code app.image.storage}가 s3가 아니면(기본) 활성 — 키·버킷 없이 로컬에서 전체 흐름이 돈다.
 *
 * <p><b>경로 traversal 방어(NFR-04)</b>: 키에 {@code ../}·절대경로가 섞여도 정규화 후 베이스 디렉토리
 * 하위인지({@code startsWith}) 확인해 밖으로 벗어나면 거절한다.
 */
@Service
@ConditionalOnProperty(prefix = "app.image", name = "storage", havingValue = "local", matchIfMissing = true)
class LocalImageStorageService implements ImageStorageService {

    private final Path baseDir;

    LocalImageStorageService(@Value("${app.image.dir}") String imageDir) {
        this.baseDir = Paths.get(imageDir).toAbsolutePath().normalize();
    }

    @Override
    public String save(String base64OrDataUrl) {
        ImageStorageService.Decoded decoded = ImageStorageService.decode(base64OrDataUrl);
        String key = ImageStorageService.newKey(decoded.mimeType());
        try {
            Files.createDirectories(baseDir);
            Files.write(baseDir.resolve(key), decoded.bytes());
        } catch (IOException e) {
            throw new UncheckedIOException("이미지 저장 실패", e);
        }
        return key;
    }

    @Override
    public Optional<byte[]> readBytes(String key) {
        Path resolved = safeResolve(key);
        if (resolved == null) {
            return Optional.empty();
        }
        try {
            return Optional.of(Files.readAllBytes(resolved));
        } catch (IOException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Resource> load(String key) {
        Path resolved = safeResolve(key);
        return resolved == null ? Optional.empty() : Optional.of(new PathResource(resolved));
    }

    /** traversal 방어 + 존재·가독 확인. 벗어나거나 없으면 null. */
    private Path safeResolve(String key) {
        Path resolved = baseDir.resolve(key).normalize();
        if (!resolved.startsWith(baseDir) || !Files.isReadable(resolved) || Files.isDirectory(resolved)) {
            return null;
        }
        return resolved;
    }
}
