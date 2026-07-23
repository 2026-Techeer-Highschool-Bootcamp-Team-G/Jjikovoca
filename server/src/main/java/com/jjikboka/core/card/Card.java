package com.jjikboka.core.card;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

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

    @Column(name = "answer_format")
    private String answerFormat;

    @Column
    private boolean mock;

    @Column(name = "box_level")
    private int boxLevel;

    @Column(name = "wrong_count")
    private int wrongCount;

    @Column(name = "graduated_at")
    private LocalDateTime graduatedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    protected Card() {
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

    String getLatex() {
        return latex;
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

    LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * soft delete — deleted_at만 찍고 행은 남긴다(학습 이력·통계 근거 보존, ERD v1.1).
     * @Transactional 안에서 호출되면 JPA 더티체킹으로 UPDATE된다.
     */
    void softDelete(LocalDateTime now) {
        this.deletedAt = now;
    }
}
