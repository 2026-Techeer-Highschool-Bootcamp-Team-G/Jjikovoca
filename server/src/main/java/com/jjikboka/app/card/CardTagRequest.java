package com.jjikboka.app.card;

import java.util.List;

/**
 * 카드 시험 태깅 요청 (Notion API-ID 43). examIds는 태깅할 시험 ID 배열(복수·멱등).
 * 한 카드를 여러 시험에 동시에 걸 수 있다(다대다).
 */
public record CardTagRequest(List<Long> examIds) {
}
