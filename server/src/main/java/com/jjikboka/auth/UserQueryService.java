package com.jjikboka.auth;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * auth 도메인의 공개 조회 진입점. 다른 도메인·조립 레벨은 AppUser 엔티티가 아니라 이 서비스를 통해
 * {@link UserProfile}만 받는다(엔티티 비공개 유지, 13 §2).
 */
@Service
public class UserQueryService {

    private final AppUserRepository userRepository;

    UserQueryService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfile getProfile(Long userId) {
        return userRepository.findById(userId)
                .map(user -> new UserProfile(user.getEmail(), user.getNickname()))
                .orElseThrow(() -> new BusinessException(
                        HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "사용자를 찾을 수 없습니다."));
    }
}
