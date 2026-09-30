package com.jjikboka.integration;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * FR-7 단어 시험지 PDF 인수조건 (#470, P1-9).
 * <ul>
 *   <li>Given 영어 단어 보유, When PDF 내보내기, Then PDF가 생성·다운로드된다</li>
 *   <li>예외: 프리미엄 게이팅 · 다운로드 소유자 검증(남의 파일은 존재 여부도 숨김)</li>
 * </ul>
 * 렌더러는 기본값 PDFBox(브라우저 불필요)라 CI에서도 실제 PDF 바이트를 만든다. 네이티브 저장·공유 시트(Capacitor)는 Phase 4 범위.
 */
class ExportIntegrationTest extends IntegrationTestSupport {

    @Test
    void 무료_사용자가_내보내기를_요청하면_403_PREMIUM_REQUIRED다() throws Exception {
        String token = register("fr7-free@test.com");
        List<Long> cardIds = seedCards(token, 2);

        export(token, cardIds)
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorName").value("PREMIUM_REQUIRED"));
    }

    @Test
    void 프리미엄_사용자는_PDF를_만들고_내려받을_수_있다() throws Exception {
        String token = register("fr7-premium@test.com");
        List<Long> cardIds = seedCards(token, 3);
        activatePremium(token);

        String downloadUrl = downloadUrl(export(token, cardIds).andExpect(status().isOk()).andReturn());
        byte[] pdf = mockMvc.perform(get(downloadUrl).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsByteArray();

        assertThat(new String(pdf, 0, 5)).isEqualTo("%PDF-");
    }

    @Test
    void 남의_내보내기_파일은_존재여부를_숨긴_채_404다() throws Exception {
        String owner = register("fr7-owner@test.com");
        List<Long> cardIds = seedCards(owner, 1);
        activatePremium(owner);
        String downloadUrl = downloadUrl(export(owner, cardIds).andExpect(status().isOk()).andReturn());

        String intruder = register("fr7-intruder@test.com");
        mockMvc.perform(get(downloadUrl).header("Authorization", bearer(intruder)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorName").value("EXPORT_NOT_FOUND"));
    }

    private ResultActions export(String token, List<Long> cardIds) throws Exception {
        return mockMvc.perform(post("/api/export/note").header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON).content(json(Map.of("type", "PDF_WORDTEST", "cardIds", cardIds))));
    }

    private void activatePremium(String token) throws Exception {
        mockMvc.perform(post("/api/premium/activate").header("Authorization", bearer(token)))
                .andExpect(status().isOk());
    }

    private String downloadUrl(MvcResult created) throws Exception {
        String url = data(created).get("downloadUrl").asText();
        assertThat(url).isNotBlank();
        return url;
    }
}
