package com.jjikboka.core.stats;

import java.time.LocalDate;

/**
 * 잔디 한 칸 (Notion API-ID 17, F-12). 일자별 학습 수·학습 분·색 강도 — 리포트/홈 잔디·주간 일별 학습시간 막대의 데이터 소스.
 * minutes=해당 일자 duration_ms 합/60000. level=학습 수 기준 색 강도(0~4, 서버 임계): 0→0, 1~2→1, 3~4→2, 5~7→3, 8+→4.
 */
public record GrassDay(LocalDate date, long count, int minutes, int level) {

    /** 학습 수(count)로 잔디 색 강도(0~4)를 정한다 — GitHub 잔디식 임계. 프론트 4×7 그리드 색 매핑을 서버가 통일. */
    static int levelOf(long count) {
        if (count <= 0) {
            return 0;
        }
        if (count <= 2) {
            return 1;
        }
        if (count <= 4) {
            return 2;
        }
        if (count <= 7) {
            return 3;
        }
        return 4;
    }
}
