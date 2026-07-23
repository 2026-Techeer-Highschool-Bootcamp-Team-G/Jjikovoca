package com.jjikboka.app.study;

import com.jjikboka.core.card.MathCard;

import java.util.List;

/**
 * 수학 복습 큐 응답 (Notion API-ID 29). ApiResponse로 감싸져 {@code { success, data:{ cards }, message }} 형태가 된다.
 * cards의 각 풀이는 masked(단계 content·해설 제거)이며 정답(answerValue)은 포함되지 않는다(13 §7).
 */
public record MathQueueResponse(List<MathCard> cards) {
}
