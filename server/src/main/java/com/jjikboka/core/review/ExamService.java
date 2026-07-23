package com.jjikboka.core.review;

import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * 시험 CRUD (core.review 공개 진입점, API-32~35). exam 엔티티는 패키지 비공개 — 노출은 {@link ExamView}로만(13 §2).
 * 복습 일정 재배치(core.card)는 app이 이 CRUD와 한 트랜잭션으로 엮는다. 소유자 검증을 서버가 강제한다(404 EXAM_NOT_FOUND·403).
 */
@Service
public class ExamService {

    private final ExamRepository examRepository;

    ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    @Transactional(readOnly = true)
    public List<ExamView> list(Long userId) {
        return examRepository.findByUserIdOrderByExamDateAsc(userId).stream().map(ExamView::from).toList();
    }

    @Transactional
    public ExamView create(Long userId, String title, String subject, LocalDate examDate) {
        return ExamView.from(examRepository.save(Exam.create(userId, title, subject, examDate)));
    }

    @Transactional
    public ExamView update(Long userId, Long examId, String title, String subject, LocalDate examDate) {
        Exam exam = loadOwned(userId, examId);
        exam.update(title, subject, examDate);
        return ExamView.from(exam);
    }

    @Transactional
    public ExamView delete(Long userId, Long examId) {
        Exam exam = loadOwned(userId, examId);
        ExamView view = ExamView.from(exam);
        examRepository.delete(exam);
        return view;
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
