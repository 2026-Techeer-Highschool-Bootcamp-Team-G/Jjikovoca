package com.jjikboka.core.export;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 내보내기 기록 (core.export 공개 진입점, API-25·26). 생성 시 export_log를 남겨 id를 발급하고,
 * 다운로드 시 소유자 검증을 서버가 강제한다(파일은 app이 저장·서빙, 기록은 여기 소유, 13 §2).
 */
@Service
public class ExportLogService {

    private final ExportLogRepository exportLogRepository;

    ExportLogService(ExportLogRepository exportLogRepository) {
        this.exportLogRepository = exportLogRepository;
    }

    /** 내보내기 요청을 기록하고 발급된 id를 돌려준다. 이 id가 다운로드 URL·파일 키가 된다. */
    @Transactional
    public Long record(Long userId, String type, int cardCount) {
        return exportLogRepository.save(ExportLog.of(userId, type, cardCount)).getId();
    }

    /** 다운로드 소유자 검증(API-26). 없거나 남의 것이면 404 EXPORT_NOT_FOUND(존재 여부를 감춰 열람 방지). */
    @Transactional(readOnly = true)
    public void verifyOwned(Long userId, Long exportId) {
        ExportLog log = exportLogRepository.findById(exportId)
                .orElseThrow(() -> notFound());
        if (!log.getUserId().equals(userId)) {
            throw notFound();
        }
    }

    private BusinessException notFound() {
        return new BusinessException(HttpStatus.NOT_FOUND, "EXPORT_NOT_FOUND", "파일이 만료되었거나 존재하지 않습니다.");
    }
}
