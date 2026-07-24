package com.jjikboka.app.image;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.util.Optional;

/**
 * 크롭 이미지 S3 저장소 (API-10, 프로덕션). {@code app.image.storage=s3}일 때 활성 — 오브젝트 키는 {@code {uuid}.{ext}}로,
 * 로컬 구현과 같은 계약(save/readBytes/load)이라 접수·워커·서빙 호출부는 무수정이다.
 *
 * <p>부재·오류(NoSuchKey 등)는 비어 있는 Optional로 삼켜 404/미로드로 처리한다 — 저장 실패만 예외로 올린다(접수 롤백·quota 환불).
 * 자격증명·리전은 {@link S3Config}가 준비한 S3Client에 실린다.
 */
@Service
@ConditionalOnProperty(prefix = "app.image", name = "storage", havingValue = "s3")
class S3ImageStorageService implements ImageStorageService {

    private final S3Client s3Client;
    private final String bucket;

    S3ImageStorageService(S3Client s3Client, @Value("${app.image.s3.bucket}") String bucket) {
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    @Override
    public String save(String base64OrDataUrl) {
        ImageStorageService.Decoded decoded = ImageStorageService.decode(base64OrDataUrl);
        String key = ImageStorageService.newKey(decoded.mimeType());
        s3Client.putObject(
                PutObjectRequest.builder().bucket(bucket).key(key).contentType(decoded.mimeType()).build(),
                RequestBody.fromBytes(decoded.bytes()));
        return key;
    }

    @Override
    public Optional<byte[]> readBytes(String key) {
        try {
            return Optional.of(s3Client.getObjectAsBytes(
                    GetObjectRequest.builder().bucket(bucket).key(key).build()).asByteArray());
        } catch (S3Exception e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Resource> load(String key) {
        return readBytes(key).map(bytes -> new ByteArrayResource(bytes));
    }
}
