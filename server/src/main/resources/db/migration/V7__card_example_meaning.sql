-- WORD 카드 예문 한글뜻(exampleMeaning) — 플래시카드 앞면에 "예문 + 예문의 한글 뜻"을 함께 표시하기 위함.
-- 영어 예문(example)은 이미 있고, 그 한글 번역을 여기 담는다. 기존 카드는 NULL(백필 없음 — 신규 분석 카드부터 채워진다).
ALTER TABLE card ADD COLUMN example_meaning TEXT NULL AFTER example;
