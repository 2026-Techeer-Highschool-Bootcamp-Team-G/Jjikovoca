-- [core.card] 수학·FSRS 컬럼 제거 (Phase 1-A, 요구사항 v3.2 영어 전용).
-- card를 WORD 전용으로 단순화한다. Card 엔티티에서 대응 필드를 제거했으므로 ddl-auto=validate 정합을 맞춘다.
-- 유지: type·subject·concept·last_reviewed_at (WORD 흐름·약한 개념 리포트·복습 타임스탬프).
-- answer_format은 CHECK(ck_card_answer_format)이 참조하므로 제약을 먼저 제거한 뒤 컬럼을 드롭한다.
ALTER TABLE card DROP CHECK ck_card_answer_format;

ALTER TABLE card
  DROP COLUMN latex,
  DROP COLUMN summary,
  DROP COLUMN hint1,
  DROP COLUMN hint2,
  DROP COLUMN hint3,
  DROP COLUMN solutions,
  DROP COLUMN answer_value,
  DROP COLUMN answer_format,
  DROP COLUMN diagnosis,
  DROP COLUMN fsrs_state,
  DROP COLUMN fsrs_stability,
  DROP COLUMN fsrs_difficulty;
