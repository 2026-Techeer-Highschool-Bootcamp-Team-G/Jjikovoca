package com.jjikboka.core.card;

import java.time.LocalDate;
import java.util.List;

/**
 * 원문 보관함 일자 그룹 (Notion API-ID 36, core.card 공개 DTO). 하루치 크롭 원문을 묶는다.
 * days는 최신순, 각 날짜의 items도 최신순(created_at DESC)이다.
 */
public record ArchiveDay(
        LocalDate date,
        List<ArchiveItem> items
) {
}
