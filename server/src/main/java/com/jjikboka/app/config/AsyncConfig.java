package com.jjikboka.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * 분석 워커 전용 스레드풀 (API-6 처리, 05 §5-2). 분석은 톰캣 요청 스레드가 아니라 이 풀에서 돌려
 * 접수 응답(202)이 즉시 반환되고 요청 처리량이 분석에 잠식되지 않게 한다.
 * 큐가 차면 CallerRuns로 유입을 눌러 폭주를 막는다(백프레셔).
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "analysisExecutor")
    Executor analysisExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("analysis-");
        executor.setRejectedExecutionHandler(new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
