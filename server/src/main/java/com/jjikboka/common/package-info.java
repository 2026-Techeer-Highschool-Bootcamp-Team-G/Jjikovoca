/**
 * common — 전 모듈 공용 기술 인프라(도메인 무의존): 표준 응답(response)·에러(error)·도메인 이벤트(event)·
 * 이미지 저장소(image)·헬스체크(health). 어떤 도메인 모듈도 참조하지 않으며, 모든 모듈이 참조한다.
 *
 * <p>OPEN 모듈로 선언해 하위 패키지(response·error·event·image·health)를 외부 모듈에 전부 노출한다 —
 * 공용 인프라는 캡슐화 대상이 아니라 공유 기반이기 때문이다(도메인 모듈만 하위패키지 은닉 대상).
 */
@org.springframework.modulith.ApplicationModule(type = org.springframework.modulith.ApplicationModule.Type.OPEN)
package com.jjikboka.common;
