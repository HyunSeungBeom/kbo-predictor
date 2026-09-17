package com.seungbeom.kbo.ingest

import org.springframework.boot.actuate.info.Info
import kotlin.test.Test
import kotlin.test.assertEquals

class IngestSourceInfoTest {

    @Test
    fun `켜진 출처의 클래스 이름을 info 에 싣는다 — 배포 파이프라인이 실데이터 출처인지 확인한다`() {
        val builder = Info.Builder()
        IngestSourceInfo(SeedKboScheduleSource()).contribute(builder)

        assertEquals("SeedKboScheduleSource", builder.build().get("ingestSource"))
    }
}
