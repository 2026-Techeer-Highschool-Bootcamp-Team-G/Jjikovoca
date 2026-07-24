package com.jjikboka.app.stats;

/**
 * 랭킹 항목 (Notion API-ID 20). 순위·닉네임·값만 노출한다 — 개인정보 최소화(닉네임 외 미노출).
 */
public record RankItem(int rank, String nickname, long value) {
}
