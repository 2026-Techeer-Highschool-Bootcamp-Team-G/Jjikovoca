package com.jjikboka.app.stats;

import java.util.List;

/**
 * 랭킹 응답 (Notion API-ID 20). ApiResponse로 감싸져 {@code { success, data:{ scope, items }, message }} 형태가 된다.
 * scope는 적용된 기준(weekly·level), items는 순위순.
 */
public record RankingResponse(String scope, List<RankItem> items) {
}
