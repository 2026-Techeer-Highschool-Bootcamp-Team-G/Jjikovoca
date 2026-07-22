rootProject.name = "jjikboka-server"

// 단일 모듈 모놀리스 (MSA 미전환 — 15 쿠버네티스는 단일 이미지 복제라 멀티모듈 불요).
// 도메인 경계는 패키지 + ArchUnit이 강제한다 (13 §2):
//   com.jjikboka.app       : 조립 — main(), 보안·캐시 설정
//   com.jjikboka.auth      : 회원·로그인·JWT
//   com.jjikboka.core.*    : card / review / stats (한 배포 묶음 — 상호 참조 허용)
//   com.jjikboka.analysis  : Gemini 폴백·프롬프트·analyze_job
//   com.jjikboka.shared    : 에러 규약·이벤트 DTO (도메인 로직 금지)
