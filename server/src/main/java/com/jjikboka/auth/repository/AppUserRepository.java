package com.jjikboka.auth.repository;

import com.jjikboka.auth.entity.AppUser;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * app_user 저장소. 리포지토리도 모듈 내부에 봉인(13 §2) — package-private.
 */
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    boolean existsByEmail(String email);

    Optional<AppUser> findByEmail(String email);
}
