package com.jjikboka.app.analysis;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 분석 SSE 구독자 보관·전송 허브 (API-40, 단일 레플리카 MVP). jobId별로 열린 emitter들을 들고,
 * 워커가 발행한 이벤트를 포워더가 여기로 밀면 해당 job 구독자에게 전송한다.
 *
 * <p>한 job의 구독자는 모두 같은 소유자다(소유자만 구독 가능, 403). 그래서 채널당 userId 하나를 함께 보관해
 * done 이벤트의 카드 조회에 재사용한다. 멀티 레플리카 팬아웃(Redis pub/sub)은 후속(15 §3-1).
 */
@Component
class AnalysisSseRegistry {

    private static final Logger log = LoggerFactory.getLogger(AnalysisSseRegistry.class);

    /** jobId → 채널(소유자 + 열린 emitter들). */
    private final Map<Long, Channel> channels = new ConcurrentHashMap<>();

    private record Channel(Long userId, Set<SseEmitter> emitters) {
    }

    /** 구독 등록. emitter가 끝나면(완료/타임아웃/에러) 스스로 빠지도록 콜백을 건다. */
    void register(Long jobId, Long userId, SseEmitter emitter) {
        Channel channel = channels.computeIfAbsent(jobId,
                key -> new Channel(userId, ConcurrentHashMap.newKeySet()));
        channel.emitters().add(emitter);
        emitter.onCompletion(() -> remove(jobId, emitter));
        emitter.onTimeout(() -> remove(jobId, emitter));
        emitter.onError(e -> remove(jobId, emitter));
    }

    /** 이 job의 소유자 userId(없으면 null) — done 카드 조회에 쓴다. */
    Long ownerOf(Long jobId) {
        Channel channel = channels.get(jobId);
        return channel == null ? null : channel.userId();
    }

    /** 진행 단계 이벤트 전송. 전송 실패한 emitter는 정리한다. */
    void push(Long jobId, String eventName, Object data) {
        Channel channel = channels.get(jobId);
        if (channel == null) {
            return;
        }
        for (SseEmitter emitter : channel.emitters()) {
            send(jobId, emitter, eventName, data);
        }
    }

    /** 종료 이벤트를 보내고 해당 job의 모든 emitter를 닫는다(done/error 공통). */
    void pushAndComplete(Long jobId, String eventName, Object data) {
        Channel channel = channels.remove(jobId);
        if (channel == null) {
            return;
        }
        for (SseEmitter emitter : channel.emitters()) {
            send(jobId, emitter, eventName, data);
            emitter.complete();
        }
    }

    private void send(Long jobId, SseEmitter emitter, String eventName, Object data) {
        try {
            emitter.send(SseEmitter.event().name(eventName).data(data));
        } catch (IOException | IllegalStateException e) {
            log.debug("SSE 전송 실패 — jobId={}, event={} (구독 종료로 간주)", jobId, eventName);
            remove(jobId, emitter);
        }
    }

    private void remove(Long jobId, SseEmitter emitter) {
        Channel channel = channels.get(jobId);
        if (channel == null) {
            return;
        }
        channel.emitters().remove(emitter);
        if (channel.emitters().isEmpty()) {
            channels.remove(jobId, channel);
        }
    }
}
