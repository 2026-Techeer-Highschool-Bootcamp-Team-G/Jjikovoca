package com.jjikboka.app.cards;

/**
 * 카드 삭제 응답 (Notion API-ID 9). ApiResponse로 감싸져 {@code { success, data:{ deletedId }, message }} 형태가 된다.
 * soft delete라 행은 남지만, 클라이언트엔 삭제된 카드 id만 돌려준다.
 */
public record CardDeleteResponse(Long deletedId) {
}
