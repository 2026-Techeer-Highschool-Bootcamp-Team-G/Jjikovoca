package com.jjikboka.core.review;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 카드 시험 태깅 (core.review 공개 진입점, API-43·44). exam_card 매핑을 멱등하게 걸고 뗀다(다대다, source=MANUAL).
 * <b>시험 소유 검증만</b> 여기서 하고, 카드 소유 검증은 app이 core.card로 먼저 한다(엔티티 경계, 13 §2).
 */
@Service
public class ExamTagService {

    private final ExamRepository examRepository;
    private final ExamCardRepository examCardRepository;

    ExamTagService(ExamRepository examRepository, ExamCardRepository examCardRepository) {
        this.examRepository = examRepository;
        this.examCardRepository = examCardRepository;
    }

    /** 카드를 여러 시험에 태깅(멱등)하고, 카드의 현재 시험 태그 전체를 돌려준다. */
    @Transactional
    public List<ExamTag> tag(Long userId, Long cardId, List<Long> examIds) {
        for (Long examId : examIds) {
            assertExamOwned(userId, examId);
            if (!examCardRepository.existsByExamIdAndCardId(examId, cardId)) {
                examCardRepository.save(ExamCard.manual(examId, cardId));
            }
        }
        return examCardRepository.findExamsByCardId(cardId).stream().map(ExamTag::from).toList();
    }

    /** 카드를 시험 범위에서 제외(멱등 — 이미 없어도 정상). 시험 소유는 확인한다. */
    @Transactional
    public void untag(Long userId, Long cardId, Long examId) {
        assertExamOwned(userId, examId);
        examCardRepository.deleteByExamIdAndCardId(examId, cardId);
    }

    /**
     * 넛지 일괄 태깅(API-45) — 카드 id들을 시험에 멱등하게 건다. source=MANUAL로 자동 재태깅에 덮이지 않게 한다.
     * 시험 소유는 <b>이 메서드가 직접 강제</b>한다(호출자 검증에 기대지 않음, IDOR 방어). 카드 대상 선정은 app이 userId로 스코프한다.
     */
    @Transactional
    public void tagRecent(Long userId, Long examId, List<Long> cardIds) {
        assertExamOwned(userId, examId);
        for (Long cardId : cardIds) {
            if (!examCardRepository.existsByExamIdAndCardId(examId, cardId)) {
                examCardRepository.save(ExamCard.manual(examId, cardId));
            }
        }
    }

    private void assertExamOwned(Long userId, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "대상을 찾을 수 없습니다."));
        if (!exam.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
    }
}
