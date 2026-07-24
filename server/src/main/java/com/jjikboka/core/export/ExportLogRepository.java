package com.jjikboka.core.export;

import org.springframework.data.jpa.repository.JpaRepository;

/**
 * export_log 저장소. package-private 봉인(13 §2). 생성 기록 저장과 소유자 검증용 단건 조회만 쓴다.
 */
interface ExportLogRepository extends JpaRepository<ExportLog, Long> {
}
