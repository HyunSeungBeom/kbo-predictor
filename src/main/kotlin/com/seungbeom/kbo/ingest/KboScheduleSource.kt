package com.seungbeom.kbo.ingest

import java.time.YearMonth

/**
 * 일정/결과 데이터의 출처 추상화. 구현을 갈아끼워 출처를 바꾼다
 * (시드 → 다음/네이버/KBO 등). 이게 스크래퍼 구조의 핵심 — 취약한 fetch 를 한 곳에 가둔다.
 */
interface KboScheduleSource {
    fun fetch(month: YearMonth): List<ScrapedGame>
}
