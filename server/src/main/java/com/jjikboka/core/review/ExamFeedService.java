package com.jjikboka.core.review;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 피드 시험 태깅 연동 (core.review 공개 진입점, API-7 F-29). exam_card를 근거로 피드의 examId·untagged 필터와
 * 카드별 exams 칩을 제공한다. 카드 자체(피드 본문)는 core.card, 조립은 app이 한다(엔티티 경계, 13 §2).
 */
@Service
public class ExamFeedService {

    private final ExamCardRepository examCardRepository;

    ExamFeedService(ExamCardRepository examCardRepository) {
        this.examCardRepository = examCardRepository;
    }

    /** examId 필터 — 그 시험에 태깅된 카드 id들. app이 피드를 이 집합으로 좁힌다. */
    @Transactional(readOnly = true)
    public Set<Long> cardIdsForExam(Long examId) {
        return Set.copyOf(examCardRepository.findCardIdsByExamId(examId));
    }

    /** untagged 필터 — 이 사용자의 태깅된 카드 id들. app이 피드에서 이 집합을 제외하면 미태깅만 남는다. */
    @Transactional(readOnly = true)
    public Set<Long> taggedCardIds(Long userId) {
        return Set.copyOf(examCardRepository.findTaggedCardIdsByUser(userId));
    }

    /** exams 칩 — 카드 id별 시험 태그 목록(배치). 태그 없는 카드는 맵에 없다. */
    @Transactional(readOnly = true)
    public Map<Long, List<ExamTag>> examsFor(List<Long> cardIds) {
        if (cardIds.isEmpty()) {
            return Map.of();
        }
        return examCardRepository.findExamsByCardIds(cardIds).stream().collect(Collectors.groupingBy(
                row -> (Long) row[0],
                LinkedHashMap::new,
                Collectors.mapping(row -> ExamTag.from((Exam) row[1]), Collectors.toList())));
    }
}
