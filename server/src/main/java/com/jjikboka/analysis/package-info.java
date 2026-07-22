/**
 * analysis — Gemini 클라이언트·폴백 체인·프롬프트·analyze_job 처리 (F-03/18, NFR-01).
 * @Async 전용 스레드풀로 톰캣 워커 보호(05 §5-2). AnalyzeRequested 이벤트를 소비,
 * 진행/완료/실패 이벤트를 발행(13 §6). 10 전환 시 analysis 워커로 승격.
 * 소유 테이블: analyze_job.
 */
package com.jjikboka.analysis;
