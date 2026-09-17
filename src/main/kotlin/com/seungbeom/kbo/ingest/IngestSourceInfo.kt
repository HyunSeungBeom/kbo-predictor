package com.seungbeom.kbo.ingest

import org.springframework.boot.actuate.info.Info
import org.springframework.boot.actuate.info.InfoContributor
import org.springframework.stereotype.Component
import org.springframework.util.ClassUtils

/**
 * 지금 켜진 수집 출처를 `/actuator/info` 의 `ingestSource` 로 노출한다.
 *
 * `live` 프로필을 빠뜨리면 샘플 출처(Seed)가 켜지고, 수집이 **실제 경기 결과를 가짜 점수로 조용히
 * 덮어쓴다**(upsert 라 에러가 없다). 배포 파이프라인이 이 값을 확인해 실데이터 출처가 아니면 배포를
 * 실패시킨다.
 */
@Component
class IngestSourceInfo(private val source: KboScheduleSource) : InfoContributor {
    override fun contribute(builder: Info.Builder) {
        builder.withDetail("ingestSource", nameOf(source))
    }

    companion object {
        /** 프록시로 감싸져 있어도 원래 클래스 이름 */
        fun nameOf(source: KboScheduleSource): String = ClassUtils.getUserClass(source).simpleName
    }
}
