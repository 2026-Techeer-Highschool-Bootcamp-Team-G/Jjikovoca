package com.jjikboka.app;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;
import jakarta.persistence.Entity;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

/**
 * 모듈 경계를 빌드에서 강제한다 (13 §2). ci.yml backend-test에 포함 → 위반 시 머지 차단.
 * "규율이 아니라 빌드가 막는다" — 12 §5-2 steiger(프론트 FSD 경계)의 백엔드 대응.
 *
 * <p>모듈 간 허용 의존(DAG)·순환 검출은 Spring Modulith verify()가 담당한다(ModularityTest). 여기서는
 * Modulith가 다루지 않는 보강 규칙만 둔다 — common의 도메인 무의존, @Entity 모듈 밖 비공개.
 * allowEmptyShould(true): 대상 집합이 비어도 통과(도메인 이관 단계 정합).
 */
@AnalyzeClasses(packages = "com.jjikboka")
class ArchitectureTest {

    @ArchTest
    // common(공용 인프라)은 어떤 도메인 모듈도 몰라야 한다. 실제 도메인 모듈을 열거해 정확히 금지한다
    // (와일드카드 "..core.." 류는 org.springframework.core.io 등을 오탐하므로 쓰지 않는다).
    static final ArchRule common은_도메인을_모름 = noClasses()
            .that().resideInAPackage("com.jjikboka.common..")
            .should().dependOnClassesThat()
            .resideInAnyPackage(
                    "com.jjikboka.auth..", "com.jjikboka.analysis..", "com.jjikboka.card..",
                    "com.jjikboka.exam..", "com.jjikboka.studylog..", "com.jjikboka.stats..",
                    "com.jjikboka.quota..", "com.jjikboka.subscription..",
                    "com.jjikboka.notification..", "com.jjikboka.export..")
            .allowEmptyShould(true);

    @ArchTest
    static final ArchRule 엔티티는_모듈_밖_비공개 = classes()
            .that().areAnnotatedWith(Entity.class)
            .should().bePackagePrivate()    // 노출은 DTO로만 — 04 §11-7 비노출 계약의 구조적 토대
            .allowEmptyShould(true);
}
