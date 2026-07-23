package com.jjikboka.auth;

/**
 * auth 도메인이 밖으로 노출하는 사용자 프로필 (엔티티 AppUser는 비공개, 이 DTO로만 나간다).
 * app 조립 레벨(예: /api/me)이 이 값을 다른 도메인 정보와 조합한다.
 */
public record UserProfile(String email, String nickname) {
}
