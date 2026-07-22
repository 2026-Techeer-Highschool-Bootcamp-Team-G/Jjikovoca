package com.jjikboka.app;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import jakarta.persistence.Entity;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

/**
 * 모듈 경계를 빌드에서 강제한다 (13 §2). ci.yml backend-test에 포함 → 위반 시 머지 차단.
 * "규율이 아니라 빌드가 막는다" — 12 §5-2 steiger(프론트 FSD 경계)의 백엔드 대응.
 *
 * allowEmptyShould(true): 스캐폴드 단계엔 대상 클래스(도메인·@Entity)가 아직 없어
 * 규칙 대상 집합이 비는 것이 정상이다. 도메인 이관 후엔 실제 클래스에 규칙이 적용된다.
 */
@AnalyzeClasses(packages = "com.jjikboka")
class ArchitectureTest {

    @ArchTest
    static final ArchRule 모듈_상호참조_금지 = slices()
            .matching("com.jjikboka.(auth|core|analysis)..")
            .should().notDependOnEachOther()
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule shared는_도메인을_모름 = noClasses()
            .that().resideInAPackage("..shared..")
            .should().dependOnClassesThat()
            .resideInAnyPackage("..auth..", "..core..", "..analysis..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule 엔티티는_모듈_밖_비공개 = classes()
            .that().areAnnotatedWith(Entity.class)
            .should().bePackagePrivate()    // 노출은 DTO로만 — 04 §11-7 비노출 계약의 구조적 토대
            .allowEmptyShould(true);
}
