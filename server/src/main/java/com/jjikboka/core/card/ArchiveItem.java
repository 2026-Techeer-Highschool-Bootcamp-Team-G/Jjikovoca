package com.jjikboka.core.card;

/**
 * 원문 보관함 항목 (Notion API-ID 36, core.card 공개 DTO). 크롭 원문 한 장 = 카드 하나.
 * imageUrl은 지금은 card.image_path 그대로 — 소유자 검증 후 presigned 발급은 이미지 저장소 확정 후(API-10) 적용.
 */
public record ArchiveItem(
        Long cardId,
        String type,
        String subject,
        String imageUrl
) {

    static ArchiveItem from(Card card) {
        return new ArchiveItem(card.getId(), card.getType(), card.getSubject(), card.getImagePath());
    }
}
