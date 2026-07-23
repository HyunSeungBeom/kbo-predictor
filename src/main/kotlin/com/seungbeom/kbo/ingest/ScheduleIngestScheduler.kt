package com.seungbeom.kbo.ingest

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.time.YearMonth

/** 매일 06:00 이번 달 일정/결과를 갱신. (@EnableScheduling 은 메인 클래스에) */
@Component
class ScheduleIngestScheduler(
    private val ingestService: ScheduleIngestService,
) {
    @Scheduled(cron = "0 0 6 * * *", zone = "Asia/Seoul")
    fun refreshCurrentMonth() {
        ingestService.ingestMonth(YearMonth.now())
    }
}
