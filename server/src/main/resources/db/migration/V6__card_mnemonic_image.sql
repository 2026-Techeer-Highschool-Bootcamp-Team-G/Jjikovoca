-- V6: AI 연상 이미지 (Phase 6c #236). 온디맨드 생성 후 S3 키를 캐시한다(/images/{key} 서빙). 기존 카드 NULL.
ALTER TABLE card ADD COLUMN mnemonic_image_path VARCHAR(255) NULL AFTER emoji;
