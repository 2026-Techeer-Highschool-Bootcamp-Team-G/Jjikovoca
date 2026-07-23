package com.jjikboka.app.cards;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 캡처 분석 접수 요청 (Notion API-ID 6). 검증 실패는 GlobalExceptionHandler가 400 VALIDATION_ERROR로 변환한다.
 *
 * <p>타입별 필수 필드가 갈린다:
 * <ul>
 *   <li>WORD — {@code cropImages}(형광펜 크롭 1~10개, AI 호출·차감은 1회) + {@code fullImage}(문맥 뜻 판별)</li>
 *   <li>PROBLEM — {@code cropImage}(문제 박스 단일), {@code examId}로 활성 시험 자동 태깅(선택)</li>
 * </ul>
 * 교차 필드 규칙은 @AssertTrue로 표현한다(한쪽 타입 필드만 채워졌는지).
 */
public record AnalyzeRequest(

        @NotBlank
        @Pattern(regexp = "WORD|PROBLEM", message = "type은 WORD 또는 PROBLEM이어야 합니다.")
        String type,

        @Size(max = 10, message = "크롭 이미지는 최대 10개까지입니다.")
        List<String> cropImages,

        String fullImage,

        String cropImage,

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

    /** PROBLEM이면 cropImage(단일)가 있어야 한다. */
    @JsonIgnore
    @AssertTrue(message = "PROBLEM 요청은 cropImage가 필요합니다.")
    public boolean isProblemFieldsPresent() {
        if (!"PROBLEM".equals(type)) {
            return true;
        }
        return cropImage != null && !cropImage.isBlank();
    }
}
