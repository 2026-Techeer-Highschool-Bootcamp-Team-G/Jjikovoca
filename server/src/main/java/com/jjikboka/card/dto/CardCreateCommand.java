package com.jjikboka.card.dto;

/**
 * 카드 생성 커맨드 (core.card 공개 입력 DTO, API-6 처리). analysis가 만든 콘텐츠를 app이 이 커맨드로 옮겨
 * core.card에 넘긴다 — 슬라이스 간 DTO를 직접 공유하지 않으려는 경계 장치(13 §2).
 *
 * <p>영어 단어(WORD) 카드 전용. mock=true, boxLevel=0으로 새 오답 카드를 만든다.
 * imagePath는 모의 단계엔 null(실 이미지 저장은 실 전환 시). concept은 약한 개념 리포트용(미채움 null).
 */
public record CardCreateCommand(
        Long userId,
        Long analyzeJobId,
        String type,
        String subject,
        String imagePath,
        String word,
        String contextMeaning,
        String dictMeaning,
        String example,
        String exampleMeaning,   // 예문의 한글 뜻(플래시카드 앞면)
        // enrichment (Phase 5) — 발음(IPA)·품사·유형태그·이모지
        String pronunciation,
        String pos,
        java.util.List<String> tags,
        String emoji,
        String concept           // 약한 개념 리포트용 분류(미채움 null)
) {
}
