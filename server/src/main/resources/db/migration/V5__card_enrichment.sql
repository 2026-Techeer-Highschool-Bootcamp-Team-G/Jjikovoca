-- V5: WORD 카드 enrichment (Phase 5 #230) — 발음(IPA)·품사·유형태그·이모지. 기존 카드는 NULL(하위호환).
-- tags는 문자열 배열(JSON). 발음 오디오는 클라 Web Speech가 담당, 서버는 표기 텍스트만 보관.
ALTER TABLE card
  ADD COLUMN pronunciation VARCHAR(64) NULL AFTER word,
  ADD COLUMN pos           VARCHAR(20) NULL AFTER pronunciation,
  ADD COLUMN tags          JSON        NULL,
  ADD COLUMN emoji         VARCHAR(16) NULL;
