package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.GameStatus
import java.time.LocalDate
import java.time.YearMonth
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * 다음 응답 파싱 테스트. 픽스처(`daum-kbo-schedule-sample.json`)는 2026-08 실제 응답에서
 * 케이스별로 6경기를 잘라낸 것 — 종료(홈승/홈패/무승부), 취소, 예정, `gameType: null`.
 * 네트워크를 타지 않으므로 CI 에서 안정적이고, 출처가 응답 형태를 바꾸면 여기가 먼저 깨진다.
 */
class DaumKboScheduleSourceTest {

    private val sample: String =
        javaClass.getResource("/daum-kbo-schedule-sample.json")!!.readText()

    private fun parsed() = DaumKboScheduleSource.parse(sample)

    @Test
    fun `취소 경기는 제외하고 나머지만 파싱한다`() {
        // 픽스처 6경기 중 CANCEL 2건은 버려지고 4건만 남는다.
        assertEquals(4, parsed().size)
    }

    @Test
    fun `종료 경기는 FINAL 과 점수를 채운다`() {
        // 2026-08-04 LG(8) @ SSG(10) — 홈 승
        val g = parsed().single { it.gameDate == LocalDate.of(2026, 8, 4) && it.homeTeamId == "SK" }
        assertEquals("LG", g.awayTeamId)
        assertEquals(GameStatus.FINAL, g.status)
        assertEquals(10, g.homeScore)
        assertEquals(8, g.awayScore)
    }

    @Test
    fun `무승부도 점수 그대로 보존한다`() {
        // 2026-08-25 삼성(3) @ 키움(3)
        val g = parsed().single { it.gameDate == LocalDate.of(2026, 8, 25) }
        assertEquals("WO", g.homeTeamId)
        assertEquals("SS", g.awayTeamId)
        assertEquals(g.homeScore, g.awayScore)
        assertEquals(GameStatus.FINAL, g.status)
    }

    @Test
    fun `예정 경기는 SCHEDULED 이고 점수가 null 이다`() {
        // 2026-08-27 한화 @ SSG
        val g = parsed().single { it.gameDate == LocalDate.of(2026, 8, 27) }
        assertEquals(GameStatus.SCHEDULED, g.status)
        assertNull(g.homeScore)
        assertNull(g.awayScore)
    }

    @Test
    fun `팀명이 아니라 팀 id 로 매핑한다`() {
        // SSG(384)→SK, 한화(390)→HH 처럼 다음 표기와 우리 DB 코드가 다른 케이스를 확인.
        val codes = parsed().flatMap { listOf(it.homeTeamId, it.awayTeamId) }.toSet()
        val valid = setOf("OB", "LG", "SS", "KT", "SK", "WO", "HH", "LT", "HT", "NC")
        assertTrue(codes.isNotEmpty() && valid.containsAll(codes), "미지의 팀 코드: ${codes - valid}")
    }

    @Test
    fun `깨진 입력에도 예외 대신 빈 리스트를 준다`() {
        assertEquals(emptyList(), DaumKboScheduleSource.parse(null))
        assertEquals(emptyList(), DaumKboScheduleSource.parse(""))
        assertEquals(emptyList(), DaumKboScheduleSource.parse("{}"))
        assertEquals(emptyList(), DaumKboScheduleSource.parse("""{"document":{"schedule":[]}}"""))
    }

    @Test
    fun `URL 은 해당 월의 시작일과 말일로 조회한다`() {
        val url = DaumKboScheduleSource.buildUrl(YearMonth.of(2026, 8))
        assertEquals(
            "https://issue.daum.net/api/arms/SPORTS_SCHEDULE" +
                "?leagueCode=kbo&fromDate=20260801&toDate=20260831&seasonKey=2026",
            url,
        )
        // 2월 말일(28/29)이 하드코딩되지 않았는지 — 윤년 확인
        assertTrue(DaumKboScheduleSource.buildUrl(YearMonth.of(2028, 2)).contains("toDate=20280229"))
    }
}
