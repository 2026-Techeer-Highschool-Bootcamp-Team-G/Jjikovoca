package com.jjikboka.app.analysis;

import com.jjikboka.analysis.GeminiImage;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * 비전 입력 이미지 다운스케일. 지문(문맥) 이미지는 정밀할 필요가 없어 긴 변을 상한(px)으로 줄여 입력 토큰·지연을 낮춘다 —
 * 크롭별 호출마다 지문을 반복 전송하므로(N×) 효과가 크다. JDK ImageIO만 사용(추가 의존성 없음).
 *
 * <p>못 읽거나(디코드 실패) 이미 상한 이하면 원본을 그대로 돌려준다 — 다운스케일 실패가 분석을 막지 않는다(안전 폴백).
 */
final class VisionImageScaler {

    private VisionImageScaler() {
    }

    static GeminiImage downscale(GeminiImage image, int maxDimension) {
        if (image == null) {
            return null;
        }
        try {
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(image.data()));
            if (src == null) {
                return image;   // 디코드 불가 → 원본 유지
            }
            int longest = Math.max(src.getWidth(), src.getHeight());
            if (longest <= maxDimension) {
                return image;   // 이미 상한 이하
            }
            double ratio = (double) maxDimension / longest;
            int width = Math.max(1, (int) Math.round(src.getWidth() * ratio));
            int height = Math.max(1, (int) Math.round(src.getHeight() * ratio));
            BufferedImage dst = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = dst.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(src, 0, 0, width, height, null);
            g.dispose();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            ImageIO.write(dst, "jpeg", out);
            return new GeminiImage("image/jpeg", out.toByteArray());
        } catch (IOException e) {
            return image;   // 인코드 실패 → 원본 유지
        }
    }
}
