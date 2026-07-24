-- V4: 알림 (프론트 §1, Phase 4). streak·레벨업은 발생 이벤트로 인서트, 복습대기는 조회 시 파생(미저장).
-- 저장형 type은 STREAK·LEVEL_UP 2종(REVIEW_DUE는 저장하지 않음). user 단위 최신순 조회 인덱스.
CREATE TABLE notification (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       VARCHAR(20)     NOT NULL,
  message    VARCHAR(255)    NOT NULL,
  is_read    TINYINT(1)      NOT NULL DEFAULT 0,
  created_at DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE,
  CONSTRAINT ck_notif_type CHECK (type IN ('STREAK','LEVEL_UP')),
  KEY ix_notif_user_time (user_id, created_at)
) ENGINE=InnoDB;
