package com.jjikboka.app.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * S3 이미지 저장소 배선 (API-10). {@code app.image.storage=s3}일 때만 S3Client 빈을 만든다 — 기본(local)에선 생성되지 않는다.
 * 리전은 설정에서, 자격증명은 {@link DefaultCredentialsProvider}(env·프로파일·IAM 인스턴스 롤)로 해결한다(이미지에 미탑재, 15 §7).
 * 빌드 시점엔 연결하지 않으므로(요청 시 lazy) 리전만 있으면 컨텍스트가 뜬다.
 */
@Configuration
@ConditionalOnProperty(prefix = "app.image", name = "storage", havingValue = "s3")
class S3Config {

    @Bean
    S3Client s3Client(@Value("${app.image.s3.region}") String region) {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
