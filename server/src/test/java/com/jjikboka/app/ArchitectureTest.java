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
    // 상호 독립 모듈만 슬라이스로 검사한다(서로 의존이 없어야 하는 쌍). DAG를 따르는 교차 의존(card→exam 등)의
    // 전면 강제는 Phase 2h의 Spring Modulith verify()가 담당한다. core는 Phase 2에서 도메인 모듈로 해체되어 제거됐다.
    static final ArchRule 모듈_상호참조_금지 = slices()
            .matching("com.jjikboka.(auth|analysis)..")
            .should().notDependOnEachOther()
            .allowEmptyShould(true);

    @ArchTest
    // common(공용 인프라)은 어떤 도메인 모듈도 몰라야 한다. 과거 "..core.." 금지는 org.springframework.core.io까지
    // 오탐 매칭했고 core 자체가 사라졌으므로, 실제 도메인 모듈을 열거해 정확히 금지한다.
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
