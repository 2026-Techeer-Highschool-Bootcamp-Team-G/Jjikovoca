package com.jjikboka.exam.dto;


import java.util.List;

/**
 * 시험 목록 응답 (Notion API-ID 32). ApiResponse로 감싸져 {@code { success, data:{ exams }, message }} 형태가 된다.
 * exams는 다가오는 순(exam_date 오름차순), 각 항목에 dday 포함.
 */
public record ExamListResponse(List<ExamView> exams) {
}
