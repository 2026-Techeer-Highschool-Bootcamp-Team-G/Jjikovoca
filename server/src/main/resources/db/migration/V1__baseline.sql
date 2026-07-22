-- V1__baseline.sql — 찍어보카 초기 스키마 (03 ERD v1.9, 리팩터링 4컬럼 제거 반영)
-- Flyway 파일 불변·roll-forward (08 §6). 소유 모듈은 각 테이블 주석.
-- ⚠ 크로스 모듈 FK는 분해 대비 시 제거 대상(13 §4) — 현재 단일 스키마라 무결성 위해 유지.
--   단, analyze_job.user_id 등 13 신규 크로스 경계는 FK 없이 값+인덱스만.

SET NAMES utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- [auth] 사용자 — 인증·프로필 전용 (v1.9: premium·voice_locale 제거)
CREATE TABLE app_user (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  nickname      VARCHAR(50)     NULL,
  created_at    DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at    DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at    DATETIME(6)     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_email (email)
) ENGINE=InnoDB;

-- [auth] refresh 토큰 — 무상태 JWT의 refresh만 저장 (13 §5)
CREATE TABLE refresh_token (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255)    NOT NULL,
  expires_at DATETIME(6)     NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_hash (token_hash),
  KEY ix_refresh_user (user_id),
  CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- [core.stats] 통계 캐시 1:1 (v1.9: best_combo 제거)
CREATE TABLE user_stat (
  user_id          BIGINT UNSIGNED NOT NULL,
  exp              INT             NOT NULL DEFAULT 0,
  level            INT             NOT NULL DEFAULT 1,
  streak_days      INT             NOT NULL DEFAULT 0,
  last_attend_date DATE            NULL,
  fsrs_params      JSON            NULL,
  updated_at       DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id),
  CONSTRAINT fk_stat_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- [core.card] 일별 무료 한도 (NFR-02) — 날짜별 행 분리로 자정 리셋 로직 소멸
CREATE TABLE user_quota_daily (
  user_id    BIGINT UNSIGNED NOT NULL,
  quota_date DATE            NOT NULL,
  used_count INT             NOT NULL DEFAULT 0,
  updated_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, quota_date),
  CONSTRAINT fk_quota_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- [core.card] 카드 (STI: WORD/PROBLEM) — v1.9 최종
CREATE TABLE card (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            VARCHAR(10)     NOT NULL,
  subject         VARCHAR(10)     NULL,
  concept         VARCHAR(100)    NULL,
  image_path      VARCHAR(255)    NULL,
  word            VARCHAR(100)    NULL,
  context_meaning TEXT            NULL,
  dict_meaning    TEXT            NULL,
  example         TEXT            NULL,
  latex           TEXT            NULL,
  summary         TEXT            NULL,
  hint1           TEXT            NULL,
  hint2           TEXT            NULL,
  hint3           TEXT            NULL,
  solutions       JSON            NULL,   -- F-26 풀이 배열 [{label,steps,explanation}]
  answer_value    VARCHAR(255)    NULL,   -- F-26 정답(NUMERIC=쉼표 복수 숫자) — 조회 응답 미포함
  answer_format   VARCHAR(10)     NULL,   -- NUMERIC | CHOICE
  diagnosis       JSON            NULL,   -- F-18 진단
  mock            TINYINT(1)      NOT NULL DEFAULT 0,
  box_level       TINYINT         NOT NULL DEFAULT 0,
  fsrs_state      VARCHAR(10)     NULL,   -- F-19 NEW|LEARNING|REVIEW|RELEARNING
  fsrs_stability  DOUBLE          NULL,
  fsrs_difficulty DOUBLE          NULL,
  wrong_count     INT             NOT NULL DEFAULT 0,
  next_review_at  DATETIME(6)     NULL,
  graduated_at    DATETIME(6)     NULL,
  created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at      DATETIME(6)     NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_card_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  CONSTRAINT ck_card_type CHECK (type IN ('WORD','PROBLEM')),
  CONSTRAINT ck_card_subject CHECK (subject IS NULL OR subject IN ('ENGLISH','MATH')),
  CONSTRAINT ck_card_answer_format CHECK (answer_format IS NULL OR answer_format IN ('NUMERIC','CHOICE')),
  KEY ix_card_feed   (user_id, subject, created_at DESC),
  KEY ix_card_review (user_id, next_review_at),
  KEY ix_card_queue  (user_id, graduated_at, wrong_count DESC)
) ENGINE=InnoDB;

-- [core.review/stats] 학습 이력 원장 (INSERT-only, v1.9: memo 제거)
CREATE TABLE study_log (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  card_id     BIGINT UNSIGNED NOT NULL,
  activity    VARCHAR(12)     NOT NULL,
  result      VARCHAR(12)     NOT NULL,
  reason_tag  VARCHAR(10)     NULL,
  duration_ms INT             NULL,
  detail      JSON            NULL,   -- F-26 단계 클릭 로그 · F-18 제안 수용 여부
  created_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  CONSTRAINT fk_log_card FOREIGN KEY (card_id) REFERENCES card(id)     ON DELETE CASCADE,
  CONSTRAINT ck_log_activity CHECK (activity IN ('RETRY','FLASHCARD','CLOZE','MATH_REVIEW')),
  CONSTRAINT ck_log_result   CHECK (result   IN ('KNOW','CONFUSED','DONT_KNOW')),
  KEY ix_log_user_time (user_id, created_at),
  KEY ix_log_card_time (card_id, created_at)
) ENGINE=InnoDB;

-- [core.stats] 경험치 원장 (INSERT-only)
CREATE TABLE exp_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  source     VARCHAR(12)     NOT NULL,
  amount     INT             NOT NULL,
  earn_date  DATE            NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_exp_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  CONSTRAINT ck_exp_source CHECK (source IN ('CAPTURE','CORRECT','ATTEND','GOAL','GROWTH')),
  KEY ix_exp_daily (user_id, earn_date)
) ENGINE=InnoDB;

-- [core.stats] 월간 리포트 스냅샷 (배치 적재, 재실행 멱등)
CREATE TABLE report_monthly (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NOT NULL,
  period              CHAR(7)         NOT NULL,             -- 'YYYY-MM'
  new_cards           INT             NOT NULL DEFAULT 0,
  study_count         INT             NOT NULL DEFAULT 0,
  accuracy_word       DECIMAL(3,2)    NULL,
  accuracy_problem    DECIMAL(3,2)    NULL,
  graduated_count     INT             NOT NULL DEFAULT 0,
  study_minutes       INT             NOT NULL DEFAULT 0,
  avg_session_minutes DECIMAL(5,1)    NULL,
  subject_study_minutes JSON          NULL,                 -- 과목 도넛 {"ENGLISH":120,"MATH":168}
  reason_breakdown    JSON            NULL,
  created_at          DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  UNIQUE KEY uk_report_user_period (user_id, period)
) ENGINE=InnoDB;

-- [core.card] 시험 일정 (F-19 D-day · F-29 범위 기준)
CREATE TABLE exam (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(100)    NOT NULL,
  subject    VARCHAR(10)     NULL,                          -- NULL=전과목
  exam_date  DATE            NOT NULL,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_exam_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  CONSTRAINT ck_exam_subject CHECK (subject IS NULL OR subject IN ('ENGLISH','MATH')),
  KEY ix_exam_user_date (user_id, exam_date)
) ENGINE=InnoDB;

-- [core.card] 시험-카드 매핑 (F-29 다대다, 자동+수동)
CREATE TABLE exam_card (
  exam_id    BIGINT UNSIGNED NOT NULL,
  card_id    BIGINT UNSIGNED NOT NULL,
  source     VARCHAR(6)      NOT NULL DEFAULT 'AUTO',       -- AUTO(캡처 시 활성 시험) | MANUAL
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (exam_id, card_id),
  CONSTRAINT fk_ec_exam FOREIGN KEY (exam_id) REFERENCES exam(id) ON DELETE CASCADE,
  CONSTRAINT fk_ec_card FOREIGN KEY (card_id) REFERENCES card(id) ON DELETE CASCADE,
  CONSTRAINT ck_ec_source CHECK (source IN ('AUTO','MANUAL')),
  KEY ix_ec_card (card_id)
) ENGINE=InnoDB;

-- [core.card] 구독 (결제 모의 — provider='MOCK', billing_key=NULL)
CREATE TABLE subscription (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  plan        VARCHAR(10)     NOT NULL DEFAULT 'PREMIUM',
  status      VARCHAR(10)     NOT NULL,
  provider    VARCHAR(10)     NOT NULL DEFAULT 'MOCK',
  billing_key VARCHAR(255)    NULL,
  started_at  DATETIME(6)     NOT NULL,
  expires_at  DATETIME(6)     NOT NULL,
  updated_at  DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE RESTRICT,
  KEY ix_sub_active (user_id, status, expires_at)
) ENGINE=InnoDB;

-- 결제 이력 (⏸ 모의 단계 미사용 — 실 PG 전환 시 활성. 스키마는 선생성)
CREATE TABLE payment_log (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  subscription_id BIGINT UNSIGNED NOT NULL,
  amount          INT             NOT NULL,
  status          VARCHAR(10)     NOT NULL,
  pg_tid          VARCHAR(100)    NULL,
  created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_pay_sub FOREIGN KEY (subscription_id) REFERENCES subscription(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_pay_tid (pg_tid)
) ENGINE=InnoDB;

-- [core.stats] 내보내기 이력 (INSERT-only)
CREATE TABLE export_log (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       VARCHAR(15)     NOT NULL,
  card_count INT             NOT NULL DEFAULT 0,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_export_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- [analysis] 분석 job 상태 머신 (13 §6 — 202/SSE·watchdog). user_id는 크로스 경계라 FK 없이 값+인덱스(13 §4)
CREATE TABLE analyze_job (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  status     VARCHAR(12)     NOT NULL DEFAULT 'PENDING',
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT ck_job_status CHECK (status IN ('PENDING','RUNNING','DONE','FAILED')),
  KEY ix_job_user (user_id),
  KEY ix_job_status (status, created_at)
) ENGINE=InnoDB;
