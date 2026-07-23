package com.jjikboka.app.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

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
