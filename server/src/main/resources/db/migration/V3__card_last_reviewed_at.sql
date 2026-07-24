-- [F-19 FSRS] 복습 시각 기록 — FSRS 회상확률 R(t)의 경과일(now − last_reviewed_at) 계산에 쓴다.
-- 기존 카드(Lightner, fsrs_state NULL)는 NULL로 남고 영향 없다. 신규 FSRS 카드가 복습마다 갱신한다.
ALTER TABLE card
  ADD COLUMN last_reviewed_at DATETIME(6) NULL AFTER next_review_at;
