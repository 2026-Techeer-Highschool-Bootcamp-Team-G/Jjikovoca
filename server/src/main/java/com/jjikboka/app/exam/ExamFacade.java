package com.jjikboka.app.exam;

import com.jjikboka.core.card.CardStatsService;
import com.jjikboka.core.card.ExamRescheduler;
import com.jjikboka.core.review.ExamFeedService;
import com.jjikboka.core.review.ExamService;
import com.jjikboka.core.review.ExamView;
import com.jjikboka.shared.error.BusinessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * 시험 CRUD 조립 (API-32~35, app 파사드). 시험 정보(core.review)와 복습 일정 재배치(core.card)를 한 트랜잭션으로 엮는다 —
 * 등록·날짜수정은 시험일 이전으로 재배치, 삭제는 기본 일정으로 복원한다. 날짜 형식·필수 누락은 400 INVALID_EXAM_DATE.
 */
@Service
public class ExamFacade {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_LOCAL_DATE;   // yyyy-MM-dd

    private final ExamService examService;
    private final ExamRescheduler examRescheduler;
    private final CardStatsService cardStatsService;
    private final ExamFeedService examFeedService;

    ExamFacade(ExamService examService, ExamRescheduler examRescheduler,
               CardStatsService cardStatsService, ExamFeedService examFeedService) {
        this.examService = examService;
        this.examRescheduler = examRescheduler;
        this.cardStatsService = cardStatsService;
        this.examFeedService = examFeedService;
    }

    /** 시험 목록 + 각 시험의 시험범위 기억률(태깅 카드들의 FSRS R 평균)을 조립해 준다(대상 없으면 memoryRate=null). */
    @Transactional(readOnly = true)
    public ExamListResponse list(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        List<ExamView> exams = examService.list(userId).stream()
                .map(exam -> exam.withMemoryRate(
                        cardStatsService.averageRecallOf(userId, examFeedService.cardIdsForExam(exam.id()), now)))
                .toList();
        return new ExamListResponse(exams);
    }

    @Transactional
    public ExamResponse create(Long userId, ExamCreateRequest request) {
        if (request.title() == null || request.title().isBlank()) {
            throw invalidDate();
        }
        LocalDate examDate = parseDate(request.examDate());
        ExamView view = examService.create(userId, request.title(), request.subject(), examDate);
        int rescheduled = examRescheduler.rescheduleBefore(userId, request.subject(), examDate);
        return ExamResponse.of(view, rescheduled);
    }

    @Transactional
    public ExamResponse update(Long userId, Long examId, ExamUpdateRequest request) {
        LocalDate examDate = request.examDate() == null ? null : parseDate(request.examDate());
        ExamView view = examService.update(userId, examId, request.title(), request.subject(), examDate);   // 404·403
        int rescheduled = examDate == null ? 0 : examRescheduler.rescheduleBefore(userId, view.subject(), examDate);
        return ExamResponse.of(view, rescheduled);
    }

    @Transactional
    public ExamDeleteResponse delete(Long userId, Long examId) {
        ExamView view = examService.delete(userId, examId);   // 404·403
        int restored = examRescheduler.restoreDefault(userId, view.subject());
        return new ExamDeleteResponse(view.id(), restored);
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            throw invalidDate();
        }
        try {
            return LocalDate.parse(value, DATE);
        } catch (DateTimeParseException e) {
            throw invalidDate();
        }
    }

    private BusinessException invalidDate() {
        return new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_EXAM_DATE",
                "시험 날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)");
    }
}
