package com.jjikboka.app.study;

import com.jjikboka.core.card.ClozeItem;

import java.util.List;

/**
 * 빈칸 문항 생성 응답 (Notion API-ID 14). ApiResponse로 감싸져 {@code { success, data:{ items }, message }} 형태가 된다.
 * items의 각 문항은 정답 단어를 담지 않는다(치팅 방지).
 */
public record ClozeGenerateResponse(List<ClozeItem> items) {
}
