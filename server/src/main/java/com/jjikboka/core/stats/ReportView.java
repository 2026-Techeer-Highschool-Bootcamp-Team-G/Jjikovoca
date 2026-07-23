package com.jjikboka.core.stats;

import java.util.List;

/**
 * 월간 리포트 (Notion API-ID 17, core.stats 공개 DTO). basic·grass는 공통, full은 프리미엄만이다.
 * 무료 사용자는 {@code full: null}로 내려간다(키는 유지 — 스펙 계약). accuracy·growth의 null 필드도 그대로 노출된다.
 */
public record ReportView(
        String period,
        ReportBasic basic,
        ReportFull full,
        List<GrassDay> grass
) {
}
