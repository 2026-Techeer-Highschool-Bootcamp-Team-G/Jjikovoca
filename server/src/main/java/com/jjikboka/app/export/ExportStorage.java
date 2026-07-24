package com.jjikboka.app.export;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;
import java.util.stream.Stream;

/**
 * 내보내기 파일 로컬 저장소 (API-25·26). 파일명은 서버 발급 exportId + 렌더 확장자(txt·pdf·png)로만 만들어(사용자 입력 없음)
 * 경로 조작 여지가 없다. 렌더 산출이 스텁(txt)이든 Chromium(pdf/png)이든 저장·다운로드 계약은 같다 — 확장자만 달라진다.
 *
 * <p>다운로드 시점엔 확장자를 모르므로 {@code export-{id}.*}를 glob으로 찾아 해석한다(export_log에 확장자 컬럼을 두지 않는다).
 */
@Component
class ExportStorage {

    private final Path baseDir;

    ExportStorage(@Value("${app.export.dir}") String exportDir) {
        this.baseDir = Paths.get(exportDir).toAbsolutePath().normalize();
    }

    /** 내보내기 바이트를 확장자와 함께 저장한다(디렉토리는 없으면 생성). */
    void write(Long exportId, byte[] content, String extension) {
        try {
            Files.createDirectories(baseDir);
            Files.write(baseDir.resolve("export-" + exportId + "." + extension), content);
        } catch (IOException e) {
            throw new UncheckedIOException("내보내기 파일 저장 실패: " + exportId, e);
        }
    }

    /** 다운로드용 리소스. 없거나 읽을 수 없으면(만료) 빈 Optional(→ 404). */
    Optional<Resource> load(Long exportId) {
        return find(exportId).map(PathResource::new);
    }

    /** 다운로드 파일명(Content-Disposition) — 저장된 실제 확장자를 반영. 없으면 기본 확장자로 둔다. */
    String filename(Long exportId) {
        String ext = find(exportId)
                .map(path -> path.getFileName().toString())
                .map(name -> name.substring(name.lastIndexOf('.') + 1))
                .orElse("bin");
        return "jjikoboka-export-" + exportId + "." + ext;
    }

    /** {@code export-{id}.*} 중 실제 파일 하나를 찾는다. exportId가 서버 발급이라 프리픽스는 안전하다. */
    private Optional<Path> find(Long exportId) {
        if (!Files.isDirectory(baseDir)) {
            return Optional.empty();
        }
        try (Stream<Path> files = Files.list(baseDir)) {
            return files.filter(path -> path.getFileName().toString().startsWith("export-" + exportId + "."))
                    .filter(Files::isReadable)
                    .findFirst();
        } catch (IOException e) {
            return Optional.empty();
        }
    }
}
