package com.jjikboka.app.cards;

import com.jjikboka.core.card.ArchiveDay;

import java.util.List;

/**
 * 원문 보관함 응답 (Notion API-ID 36). ApiResponse로 감싸져 {@code { success, data:{ days }, message }} 형태가 된다.
 * days는 core.card가 만든 일자별 그룹(최신순) 목록.
 */
public record CardArchiveResponse(List<ArchiveDay> days) {
}
