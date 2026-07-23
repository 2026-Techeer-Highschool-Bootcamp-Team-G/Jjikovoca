package com.jjikboka.core.card;

import java.util.List;

/**
 * 재생성된 빈칸 문항 (Notion API-ID 16, core.card 공개 DTO). AI 새 예문을 빈칸 처리한 결과 —
 * 세션용이라 카드 원문 예문은 바뀌지 않는다. 정답 단어는 담지 않는다(치팅 방지, 13 §7).
 */
public record ClozeRegenerated(
        Long cardId,
        String clozeText,
        List<String> hints
) {
}
