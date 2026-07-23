package com.jjikboka.core.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * exam 저장소. package-private 봉인(13 §2). 목록은 다가오는 순(exam_date 오름차순)이 기본 계약이다.
 */
interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByUserIdOrderByExamDateAsc(Long userId);
}
