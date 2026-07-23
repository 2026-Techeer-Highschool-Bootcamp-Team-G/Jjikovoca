-- [analysis→core.card 연결] 캡처 분석 워커가 만든 카드를 job으로 되짚기 (API-6 처리·39 폴링).
-- analyze_job.id는 크로스 경계라 FK 없이 값+인덱스로 잇는다(13 §4, analyze_job 테이블과 동일 정책).
ALTER TABLE card
  ADD COLUMN analyze_job_id BIGINT UNSIGNED NULL AFTER user_id,
  ADD KEY ix_card_job (user_id, analyze_job_id);
