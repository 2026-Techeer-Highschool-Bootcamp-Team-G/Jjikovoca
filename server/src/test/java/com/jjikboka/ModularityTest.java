package com.jjikboka;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

/**
 * 모듈 경계를 빌드에서 강제한다 (13 §2). Spring Modulith가 com.jjikboka 하위 패키지를 application module로 인식하고,
 * 각 모듈 package-info의 @ApplicationModule(allowedDependencies=…)로 허용 의존을 제한한다.
 * verify()는 (1) 모듈 간 순환 없음, (2) 외부 접근은 노출(API/named interface) 패키지로만, (3) 선언된 허용 의존 준수를 검사한다.
 * 정적 분석이라 Spring 컨텍스트·DB가 필요 없다(빠른 단위 검증).
 */
class ModularityTest {

    static final ApplicationModules MODULES = ApplicationModules.of(JjikbokaApplication.class);

    @Test
    void 모듈_경계를_준수한다() {
        MODULES.verify();
    }
}
