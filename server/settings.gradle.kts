rootProject.name = "chilldan-server"

// 단일 모듈 모놀리스 (MSA 미전환 — 15 쿠버네티스는 단일 이미지 복제라 멀티모듈 불요).
// 도메인 경계는 패키지 + Spring Modulith verify()가 강제한다 (13 §2).
// 모듈 목록과 허용 의존은 각 모듈의 package-info.java(@ApplicationModule)가 정본이다.
