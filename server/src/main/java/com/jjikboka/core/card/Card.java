package com.jjikboka.core.card;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Duration;
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
class Card {

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

    @Column
    private String latex;

    @Column
    private String summary;

    @Column
    private String hint1;

    @Column
    private String hint2;

    @Column
    private String hint3;

    @Column(columnDefinition = "json")   // F-26 풀이 배열 [{index,label,steps:[{no,title,question,content}],explanation}]
    private String solutions;

    @Column(name = "answer_value")       // F-26 정답(NUMERIC=쉼표 복수) — 판정 전용, 큐/조회 DTO엔 절대 미노출(13 §7)
    private String answerValue;

    @Column(name = "answer_format")
    private String answerFormat;

    @Column(columnDefinition = "json")   // F-18 진단 {failedStep,description,suggestedReason}
    private String diagnosis;

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

    @Column(name = "fsrs_state")
    private String fsrsState;

    @Column(name = "fsrs_stability")
    private Double fsrsStability;

    @Column(name = "fsrs_difficulty")
    private Double fsrsDifficulty;

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
    static Card fromAnalysis(CardCreateCommand command) {
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
        card.pronunciation = command.pronunciation();
        card.pos = command.pos();
        card.tags = command.tags();
        card.emoji = command.emoji();
        card.summary = command.summary();
        card.latex = command.latex();
        card.concept = command.concept();
        card.hint1 = command.hint1();
        card.hint2 = command.hint2();
        card.hint3 = command.hint3();
        card.answerFormat = command.answerFormat();
        card.solutions = command.solutionsJson();
        card.answerValue = command.answerValue();
        card.diagnosis = command.diagnosisJson();
        card.mock = true;
        card.boxLevel = 0;
        card.fsrsState = "NEW";   // 신규 카드는 FSRS로 스케줄(F-19). 첫 복습에 초기 안정도/난이도가 잡힌다.
        return card;
    }

    Long getId() {
        return id;
    }

    /** 소유자 검증(NFR-04)에 쓴다 — 조회 DTO엔 싣지 않는다. */
    Long getUserId() {
        return userId;
    }

    String getType() {
        return type;
    }

    String getSubject() {
        return subject;
    }

    String getConcept() {
        return concept;
    }

    String getImagePath() {
        return imagePath;
    }

    String getWord() {
        return word;
    }

    String getContextMeaning() {
        return contextMeaning;
    }

    String getDictMeaning() {
        return dictMeaning;
    }

    String getExample() {
        return example;
    }

    String getPronunciation() {
        return pronunciation;
    }

    String getPos() {
        return pos;
    }

    List<String> getTags() {
        return tags;
    }

    String getEmoji() {
        return emoji;
    }

    String getLatex() {
        return latex;
    }

    /** 풀이 배열 JSON(원본). 큐/판정 서비스가 파싱해 노출 규칙(단계 content 제거 등)을 적용한다. */
    String getSolutions() {
        return solutions;
    }

    /**
     * 다른 풀이 생성(API-41) 시 갱신된 풀이 배열 JSON을 저장한다. content 포함(단계 공개 30 열람용) —
     * @Transactional 안에서 호출되면 JPA 더티체킹으로 UPDATE된다.
     */
    void updateSolutions(String solutionsJson) {
        this.solutions = solutionsJson;
    }

    /** 진단 JSON(원본). */
    String getDiagnosis() {
        return diagnosis;
    }

    /** <b>정답 판정 전용</b>(NUMERIC/CHOICE). 큐·조회 DTO엔 절대 싣지 않는다 — 판정 응답에서만 공개(13 §7). */
    String getAnswerValue() {
        return answerValue;
    }

    String getAnswerFormat() {
        return answerFormat;
    }

    String getSummary() {
        return summary;
    }

    String getHint1() {
        return hint1;
    }

    String getHint2() {
        return hint2;
    }

    String getHint3() {
        return hint3;
    }

    int getBoxLevel() {
        return boxLevel;
    }

    /** 졸업 여부는 graduated_at 존재로 판정한다(피드 graduated 플래그). */
    boolean isGraduated() {
        return graduatedAt != null;
    }

    LocalDateTime getNextReviewAt() {
        return nextReviewAt;
    }

    /** 시험일 역산 재배치(API-33~35)로 다음 복습 시각을 옮긴다 — @Transactional 안에서 JPA 더티체킹으로 UPDATE된다. */
    void scheduleReviewAt(LocalDateTime nextReviewAt) {
        this.nextReviewAt = nextReviewAt;
    }

    LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /** FSRS 졸업 임계 — 다음 복습 간격이 이 일수 이상이면 '외웠다'로 보고 졸업시킨다. */
    private static final int GRADUATE_INTERVAL_DAYS = 60;

    /**
     * 복습 전이 진입 (API-11·15). fsrs_state가 있으면 FSRS(F-19), 없으면 Lightner로 간다 — 단일 분기.
     * 결과 문자열(KNOW/CONFUSED/DONT_KNOW)·큐(next_review)·졸업(graduated_at) 계약은 양쪽 동일하다.
     */
    void review(String result, LocalDateTime now) {
        if (fsrsState == null) {
            applyLightner(result, now);
        } else {
            applyFsrs(result, now);
        }
    }

    /**
     * FSRS 복습 전이 (F-19). 첫 복습(NEW)은 등급으로 초기 안정도/난이도를, 이후는 직전 복습 경과일로 R을 구해 갱신한다.
     * DONT_KNOW→Again·CONFUSED→Hard·KNOW→Good. 다음 간격이 졸업 임계 이상이면 졸업, Again이면 몰라요 빈도+1.
     */
    private void applyFsrs(String result, LocalDateTime now) {
        int grade = grade(result);
        FsrsScheduler.FsrsState state;
        if ("NEW".equals(fsrsState) || fsrsStability == null) {
            state = FsrsScheduler.initial(grade);
        } else {
            long elapsed = lastReviewedAt == null ? 0 : Duration.between(lastReviewedAt, now).toDays();
            state = FsrsScheduler.next(fsrsStability, fsrsDifficulty, elapsed, grade);
        }
        fsrsStability = state.stability();
        fsrsDifficulty = state.difficulty();
        fsrsState = "REVIEW";
        if (grade == 1) {
            wrongCount += 1;
        }
        long interval = FsrsScheduler.intervalDays(fsrsStability);
        lastReviewedAt = now;
        nextReviewAt = now.plusDays(interval);
        if (interval >= GRADUATE_INTERVAL_DAYS) {
            graduatedAt = now;
        }
    }

    /** 결과 문자열 → FSRS 등급(1=Again·2=Hard·3=Good). Easy(4)는 이 앱 UX에 없다. */
    private static int grade(String result) {
        return switch (result) {
            case "DONT_KNOW" -> 1;
            case "CONFUSED" -> 2;
            case "KNOW" -> 3;
            default -> throw new IllegalArgumentException("unknown result: " + result);
        };
    }

    /** 현재 시점 회상확률 R(t) — FSRS 카드만(Lightner·미복습은 null). 시험 오늘복습(42) recallProb·추천에 쓴다. */
    Double currentRetrievability(LocalDateTime now) {
        if (fsrsStability == null || lastReviewedAt == null) {
            return null;
        }
        long elapsed = Duration.between(lastReviewedAt, now).toDays();
        return FsrsScheduler.retrievability(fsrsStability, elapsed);
    }

    /**
     * 라이트너 복습 전이 (API-11, 서버 고정). box는 카드가 소유하므로 전이 규칙도 여기 둔다.
     * fsrs_state IS NULL(기존 카드)일 때의 경로 — 신규 카드는 FSRS로 간다(review 분기).
     *
     * <ul>
     *   <li>KNOW — box+1(최대 4). 다음 복습 간격 1·3·7·30일, box 4 도달 시 졸업</li>
     *   <li>CONFUSED — box 유지, +1일</li>
     *   <li>DONT_KNOW — box 0, +1일, 몰라요 빈도(wrong_count)+1</li>
     * </ul>
     */
    void applyLightner(String result, LocalDateTime now) {
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
    void softDelete(LocalDateTime now) {
        this.deletedAt = now;
    }
}
