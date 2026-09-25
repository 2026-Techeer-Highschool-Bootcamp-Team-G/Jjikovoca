package com.jjikboka.card.entity;

import com.jjikboka.card.dto.CardCreateCommand;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 카드 (03 card, STI: WORD/PROBLEM 단일 테이블). type으로 단어/문제를 가르고, 타입별 필드는 nullable.
 * @Entity는 core.card 밖에서 비공개 — 노출은 조회 서비스의 DTO로만(13 §2).
 *
 * <p><b>정답 미노출 원칙(13 §7)</b>: answer_value·풀이(solutions) 등은 매핑은 하되(워커가 채움) 조회 DTO엔 절대 싣지 않는다.
 * 그래서 answer_value에는 게터를 두지 않는다 — 구조적으로 응답 유출을 막는다.
 * 채움(INSERT)은 Phase 2 워커의 몫이라, 지금은 조회에 필요한 게터만 노출한다.
 */
@Entity
@Table(name = "card")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "analyze_job_id")
    private Long analyzeJobId;

    @Column(nullable = false)
    private String type;

    @Column
    private String subject;

    @Column
    private String concept;

    @Column(name = "image_path")
    private String imagePath;

    @Column
    private String word;

    @Column(name = "context_meaning")
    private String contextMeaning;

    @Column(name = "dict_meaning")
    private String dictMeaning;

    @Column
    private String example;

    @Column(name = "example_meaning")
    private String exampleMeaning;   // 예문의 한글 뜻(플래시카드 앞면). 기존 카드는 NULL.

    // WORD enrichment (Phase 5) — 발음(IPA 표기)·품사·유형태그(JSON 배열)·이모지. 기존 카드는 NULL.
    @Column
    private String pronunciation;

    @Column
    private String pos;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private List<String> tags;

    @Column
    private String emoji;

    @Column(name = "mnemonic_image_path")   // Phase 6c: AI 연상 이미지 S3 키(온디맨드 생성 후 캐시). NULL=미생성
    private String mnemonicImagePath;

    @Column
    private boolean mock;

    @JdbcTypeCode(SqlTypes.TINYINT)   // DB 컬럼이 TINYINT(box 0~4) — int 기본 매핑(INTEGER)과 달라 validate 실패, 명시로 일치
    @Column(name = "box_level")
    private int boxLevel;

    @Column(name = "wrong_count")
    private int wrongCount;

    @Column(name = "next_review_at")
    private LocalDateTime nextReviewAt;

    @Column(name = "graduated_at")
    private LocalDateTime graduatedAt;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    protected Card() {
    }

    /**
     * 분석 산출로 새 오답 카드를 만든다 (API-6 처리). mock=true·boxLevel=0로 시작하고 analyze_job_id로 job에 잇는다.
     * 실 Gemini 전환 시 mock만 false가 되고 필드 출처가 바뀔 뿐, 이 팩토리 계약은 그대로다.
     */
    public static Card fromAnalysis(CardCreateCommand command) {
        Card card = new Card();
        card.userId = command.userId();
        card.analyzeJobId = command.analyzeJobId();
        card.type = command.type();
        card.subject = command.subject();
        card.imagePath = command.imagePath();
        card.word = command.word();
        card.contextMeaning = command.contextMeaning();
        card.dictMeaning = command.dictMeaning();
        card.example = command.example();
        card.exampleMeaning = command.exampleMeaning();
        card.pronunciation = command.pronunciation();
        card.pos = command.pos();
        card.tags = command.tags();
        card.emoji = command.emoji();
        card.concept = command.concept();
        card.mock = true;
        card.boxLevel = 0;   // 신규 카드는 Leitner box 0에서 시작(복습 전이는 review()가 담당).
        return card;
    }

    public Long getId() {
        return id;
    }

    /** 소유자 검증(NFR-04)에 쓴다 — 조회 DTO엔 싣지 않는다. */
    public Long getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }

    public String getSubject() {
        return subject;
    }

    public String getConcept() {
        return concept;
    }

    public String getImagePath() {
        return imagePath;
    }

    public String getWord() {
        return word;
    }

    public String getContextMeaning() {
        return contextMeaning;
    }

    public String getDictMeaning() {
        return dictMeaning;
    }

    public String getExample() {
        return example;
    }

    public String getExampleMeaning() {
        return exampleMeaning;
    }

    public String getPronunciation() {
        return pronunciation;
    }

    public String getPos() {
        return pos;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getMnemonicImagePath() {
        return mnemonicImagePath;
    }

    /** AI 연상 이미지(Phase 6c) 저장 키를 붙인다 — 온디맨드 생성 후 1회 캐시. */
    public void assignMnemonicImage(String path) {
        this.mnemonicImagePath = path;
    }

    public int getBoxLevel() {
        return boxLevel;
    }

    /** 졸업 여부는 graduated_at 존재로 판정한다(피드 graduated 플래그). */
    public boolean isGraduated() {
        return graduatedAt != null;
    }

    public LocalDateTime getNextReviewAt() {
        return nextReviewAt;
    }

    /** 시험일 역산 재배치(API-33~35)로 다음 복습 시각을 옮긴다 — @Transactional 안에서 JPA 더티체킹으로 UPDATE된다. */
    public void scheduleReviewAt(LocalDateTime nextReviewAt) {
        this.nextReviewAt = nextReviewAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * 복습 전이 진입 (API-11·15) — Leitner box 단일 경로.
     * 결과 문자열(KNOW/CONFUSED/DONT_KNOW)·큐(next_review)·졸업(graduated_at) 계약을 지킨다.
     */
    public void review(String result, LocalDateTime now) {
        applyLightner(result, now);
    }

    /**
     * 라이트너 복습 전이 (API-11, 서버 고정). box는 카드가 소유하므로 전이 규칙도 여기 둔다.
     *
     * <ul>
     *   <li>KNOW — box+1(최대 4). 다음 복습 간격 1·3·7·30일, box 4 도달 시 졸업</li>
     *   <li>CONFUSED — box 유지, +1일</li>
     *   <li>DONT_KNOW — box 0, +1일, 몰라요 빈도(wrong_count)+1</li>
     * </ul>
     */
    public void applyLightner(String result, LocalDateTime now) {
        switch (result) {
            case "KNOW" -> {
                boxLevel = Math.min(boxLevel + 1, 4);
                nextReviewAt = now.plusDays(intervalDays(boxLevel));
                if (boxLevel == 4) {
                    graduatedAt = now;
                }
            }
            case "CONFUSED" -> nextReviewAt = now.plusDays(1);
            case "DONT_KNOW" -> {
                boxLevel = 0;
                wrongCount += 1;
                nextReviewAt = now.plusDays(1);
            }
            default -> throw new IllegalArgumentException("unknown result: " + result);
        }
    }

    /** box 도달 시 다음 복습까지 일수: box1=1 · box2=3 · box3=7 · box4=30. */
    private static int intervalDays(int box) {
        return switch (box) {
            case 1 -> 1;
            case 2 -> 3;
            case 3 -> 7;
            default -> 30;
        };
    }

    /**
     * soft delete — deleted_at만 찍고 행은 남긴다(학습 이력·통계 근거 보존, ERD v1.1).
     * @Transactional 안에서 호출되면 JPA 더티체킹으로 UPDATE된다.
     */
    public void softDelete(LocalDateTime now) {
        this.deletedAt = now;
    }
}
