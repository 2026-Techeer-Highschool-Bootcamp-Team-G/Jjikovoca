package com.jjikboka.app.cards;

/**
 * 연상 이미지 응답 (API-6c). mnemonicImagePath=저장 키(크롭과 같은 {@code /images/{key}}로 서빙).
 */
public record MnemonicResponse(String mnemonicImagePath) {
}
