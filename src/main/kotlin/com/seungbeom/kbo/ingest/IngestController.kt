package com.seungbeom.kbo.ingest

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.YearMonth

/**
 * 수동 수집 트리거(개발/운영 편의). 예: POST /api/admin/ingest?month=2026-07
 * (실서비스에선 인증을 붙여야 함 — TODO.)
 */
@RestController
class IngestController(
    private val ingestService: ScheduleIngestService,
) {
    @PostMapping("/api/admin/ingest")
    fun ingest(@RequestParam month: String): Map<String, Any> {
        val target = YearMonth.parse(month)
        val count = ingestService.ingestMonth(target)
        return mapOf("month" to month, "ingested" to count)
    }
}
