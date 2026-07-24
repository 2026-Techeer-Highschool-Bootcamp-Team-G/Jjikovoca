package com.jjikboka.app.me;

import java.time.LocalDateTime;

/**
 * 내 정보 응답 (Notion API-ID 3). 여러 도메인을 조합한 결과이므로 app 조립 레벨에 둔다.
 * ApiResponse로 감싸져 {@code { success, data:{ ... }, message }} 형태가 된다.
 *
 * - premium: subscription status+expires_at 계산값(app_user 컬럼 아님).
 * - dailyUsed/dailyLimit: user_quota_daily 오늘 사용/한도(free 5 · premium 100).
 * - aiMockMode: gemini.mock 설정값(키 없는 팀원 온보딩용 모의 AI 모드).
 * - level/exp: user_stat 게이미피케이션(F-11) — 별도 exp 호출 없이 홈/마이가 표기.
 * - premiumPlan/ExpiresAt/Amount: 결제완료·마이 화면용. 비프리미엄이면 plan/expiresAt null, amount는 모의 상수.
 */
public record MeResponse(
        String email,
        String nickname,
        boolean premium,
        int dailyUsed,
        int dailyLimit,
        boolean aiMockMode,
        int level,
        int exp,
        String premiumPlan,
        LocalDateTime premiumExpiresAt,
        Integer premiumAmount
) {
}
