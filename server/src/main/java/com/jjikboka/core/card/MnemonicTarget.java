package com.jjikboka.core.card;

/**
 * 연상 이미지 생성 대상 (API-6c, core.card 공개 DTO). existingPath=이미 생성된 키(있으면 캐시 반환),
 * word·contextMeaning=프롬프트 재료. app 파사드가 생성 여부를 판단하고 프롬프트를 만든다.
 */
public record MnemonicTarget(String existingPath, String word, String contextMeaning) {
}
