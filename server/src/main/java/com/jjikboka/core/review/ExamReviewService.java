package com.jjikboka.core.review;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 시험 대비 조회 (core.review 공개 진입점, API-45·42). 시험 소유를 검증하고, 넛지·시험복습 조립에 필요한
 * 시험 과목·태깅 카드 id를 넘긴다. 카드 자체(최근/ due 판정)는 core.card가, 조립은 app이 맡는다(엔티티 경계, 13 §2).
 */
@Service
public class ExamReviewService {

    private final ExamRepository examRepository;
    private final ExamCardRepository examCardRepository;

    ExamReviewService(ExamRepository examRepository, ExamCardRepository examCardRepository) {
        this.examRepository = examRepository;
        this.examCardRepository = examCardRepository;
    }

    /** 넛지(45)용 — 시험 소유검증 후 과목(null=전과목)을 준다. app이 이 과목으로 최근 카드를 고른다. */
    @Transactional(readOnly = true)
    public String verifyAndGetSubject(Long userId, Long examId) {
        return loadOwned(userId, examId).getSubject();
    }

    /** 시험복습(42)용 — 시험 소유검증 후 이 시험에 태깅된 카드 id 목록을 준다. app이 이 중 due 카드를 고른다. */
    @Transactional(readOnly = true)
    public List<Long> verifyAndGetTaggedCardIds(Long userId, Long examId) {
        loadOwned(userId, examId);
        return examCardRepository.findCardIdsByExamId(examId);
    }

    private Exam loadOwned(Long userId, Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "EXAM_NOT_FOUND", "시험을 찾을 수 없습니다."));
        if (!exam.getUserId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "접근 권한이 없습니다.");
        }
        return exam;
    }
}
