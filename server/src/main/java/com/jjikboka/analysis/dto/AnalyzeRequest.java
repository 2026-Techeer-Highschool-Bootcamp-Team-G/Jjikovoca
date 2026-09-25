package com.jjikboka.analysis.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 캡처 분석 접수 요청 (Notion API-ID 6). 검증 실패는 GlobalExceptionHandler가 400 VALIDATION_ERROR로 변환한다.
 *
 * <p>영어 단어(WORD) 전용 — {@code cropImages}(형광펜 크롭 1~10개, 크롭마다 AI 1회·카드 1개; 차감은 접수 시 1회)
 * + {@code fullImage}(문맥 뜻 판별). {@code examId}로 활성 시험 자동 태깅(선택).
 */
public record AnalyzeRequest(

        @NotBlank
        @Pattern(regexp = "WORD", message = "type은 WORD여야 합니다.")
        String type,

        @Size(max = 10, message = "크롭 이미지는 최대 10개까지입니다.")
        List<String> cropImages,

        // OCR 단어 힌트(프론트 Tesseract) — cropImages와 인덱스 정렬. 있으면 단어키 캐시 조회에 쓰고,
        // 없거나 ""(저신뢰)면 무시하고 기존 경로(이미지 해시 캐시→Gemini). 순수 힌트라 하위호환.
        @Size(max = 10, message = "단어 힌트는 최대 10개까지입니다.")
        List<String> words,

        String fullImage,

        Long examId
) {

    /** WORD면 cropImages(1개 이상, 각 비어있지 않음)와 fullImage가 있어야 한다. */
    @JsonIgnore
    @AssertTrue(message = "WORD 요청은 cropImages와 fullImage가 필요합니다.")
    public boolean isWordFieldsPresent() {
        if (!"WORD".equals(type)) {
            return true;
        }
        boolean cropsOk = cropImages != null && !cropImages.isEmpty()
                && cropImages.stream().allMatch(image -> image != null && !image.isBlank());
        return cropsOk && fullImage != null && !fullImage.isBlank();
    }
}
