package com.jjikboka.app.export;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

/**
 * 내보내기 파일 로컬 저장소 (API-25·26, MVP). 파일명은 서버 발급 exportId로만 만들어(사용자 입력 없음) 경로 조작 여지가 없다.
 * MVP 렌더는 텍스트 스텁 — 실 렌더(headless Chromium PDF/JPG) 전환 시 write의 콘텐츠·확장자만 바꾸면 된다.
 */
@Component
class ExportStorage {

    private final Path baseDir;

    ExportStorage(@Value("${app.export.dir}") String exportDir) {
        this.baseDir = Paths.get(exportDir).toAbsolutePath().normalize();
    }

    /** 내보내기 파일을 저장한다(디렉토리는 없으면 생성). */
    void write(Long exportId, String content) {
        try {
            Files.createDirectories(baseDir);
            Files.writeString(fileOf(exportId), content, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException("내보내기 파일 저장 실패: " + exportId, e);
        }
    }

    /** 다운로드용 리소스. 없거나 읽을 수 없으면(만료) 빈 Optional(→ 404). */
    Optional<Resource> load(Long exportId) {
        Path path = fileOf(exportId);
        if (!Files.isReadable(path)) {
            return Optional.empty();
        }
        return Optional.of(new PathResource(path));
    }

    /** 다운로드 파일명(Content-Disposition). */
    String filename(Long exportId) {
        return "jjikoboka-export-" + exportId + ".txt";
    }

    private Path fileOf(Long exportId) {
        return baseDir.resolve("export-" + exportId + ".txt");
    }
}
