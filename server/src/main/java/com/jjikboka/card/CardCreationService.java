package com.jjikboka.card;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 카드 생성 (core.card 공개 진입점, API-6 처리). 분석 워커(app)가 커맨드를 넘기면 새 오답 카드를 INSERT한다.
 * card 엔티티는 패키지 비공개 — 밖으로는 생성된 cardId(Long)만 넘긴다(13 §2).
 *
 * <p><b>멱등(P1-6)</b>: 재처리(watchdog·재시도)가 같은 job의 카드를 중복 생성하지 않게, 같은
 * (analyze_job_id, image_path) 카드가 이미 있으면 INSERT를 건너뛴다(앱 레벨 존재-시-skip). DB 유니크 제약으로
 * 경합 창까지 못박는 것은 P1-7의 몫이다(경계 명시).
 */
@Service
public class CardCreationService {

    private final CardRepository cardRepository;

    CardCreationService(CardRepository cardRepository) {
        this.cardRepository = cardRepository;
    }

    /**
     * 카드를 INSERT하고 cardId를 돌려준다. 이미 같은 (analyze_job_id, image_path) 카드가 있으면 생성하지 않고
     * null을 돌려준다 — 재처리 멱등. analyze_job_id가 없는(레거시) 커맨드는 가드 없이 항상 INSERT한다.
     */
    @Transactional
    public Long create(CardCreateCommand command) {
        if (command.analyzeJobId() != null
                && cardRepository.existsByAnalyzeJobIdAndImagePath(command.analyzeJobId(), command.imagePath())) {
            return null;   // 이미 만들어진 카드 — 재처리가 중복 생성하지 않게 skip(멱등)
        }
        return cardRepository.save(Card.fromAnalysis(command)).getId();
    }
}
