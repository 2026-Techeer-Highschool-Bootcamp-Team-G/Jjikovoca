package com.jjikboka.core.card;

import java.time.LocalDateTime;

/**
 * 프리미엄 결제 정보 (core.card 공개 DTO, API-3 me 조립용). 마이/결제완료 화면의 "다음 결제일·플랜" 표시에 쓴다.
 * 비프리미엄이면 {@code premium=false}이고 plan·expiresAt는 null이다(금액은 모의 결제라 app이 상수로 붙인다).
 */
public record PremiumDetail(boolean premium, String plan, LocalDateTime expiresAt) {
}
