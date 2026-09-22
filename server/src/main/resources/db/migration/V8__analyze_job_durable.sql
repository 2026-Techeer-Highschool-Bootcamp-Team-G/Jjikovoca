-- [analysis] analyze_job 내구 처리 컬럼 (P1-6, 13 §6 — 크래시·재시작에도 정확히 1회).
-- 이벤트에만 있던 재구성 payload를 job에 영속화하고, lease 기반 claim·재시도 상한을 위한 상태를 더한다.
-- Flyway가 스키마 소유(ddl-auto=validate) — AnalyzeJob 엔티티 매핑과 컬럼 타입이 정확히 일치해야 한다.
ALTER TABLE analyze_job
  -- 재구성 payload(type·cropImageRefs·words·fullImageRef) — watchdog가 이벤트 없이 job만으로 재처리한다.
  ADD COLUMN payload_json JSON         NULL,
  -- lease 만료 시각 — RUNNING claim의 소유권 기한. now 이후면 워커 생존, 지났으면 사망으로 보고 재수거 가능.
  ADD COLUMN lease_until  DATETIME(6)  NULL,
  -- claim(=처리 시도) 횟수 — 상한(N) 초과 시 FAILED 확정 + quota 환불.
  ADD COLUMN attempts     INT          NOT NULL DEFAULT 0,
  -- 마지막 실패 사유(관측·디버깅용, 짧게).
  ADD COLUMN last_error   VARCHAR(500) NULL;

-- watchdog 조회 인덱스 — claimable(PENDING + lease 만료 RUNNING)을 (status, lease_until)로 좁힌다.
CREATE INDEX ix_job_lease ON analyze_job (status, lease_until);
