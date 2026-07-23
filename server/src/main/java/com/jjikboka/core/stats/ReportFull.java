package com.jjikboka.core.stats;

import java.util.List;
import java.util.Map;

/**
 * 리포트 상세 지표 (Notion API-ID 17, F-10). <b>프리미엄 전용</b> — 무료 사용자에겐 리포트에서 full 자체가 null이다.
 * 오답 사유 분포·약한 개념·성장·이번 달 졸업 수.
 */
public record ReportFull(
        Map<String, Long> reasonBreakdown,
        List<String> weakConcepts,
        Growth growth,
        long graduatedThisMonth
) {
}
