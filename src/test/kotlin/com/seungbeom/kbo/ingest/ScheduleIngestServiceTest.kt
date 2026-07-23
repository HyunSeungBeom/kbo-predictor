package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameStatus
import com.seungbeom.kbo.ingest.ScheduleIngestService.Companion.reconcile
import java.time.LocalDate
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

/** upsert 의 핵심 로직(reconcile)을 DB 없이 검증. */
class ScheduleIngestServiceTest {

    private val date = LocalDate.of(2026, 7, 20)

    @Test
    fun `기존 레코드가 없으면 새 경기를 만든다`() {
        val scraped = ScrapedGame(date, "OB", "LG", null, null, GameStatus.SCHEDULED)

        val game = reconcile(existing = null, s = scraped)

        assertNull(game.id) // 아직 저장 전
        assertEquals("OB", game.homeTeamId)
        assertEquals("LG", game.awayTeamId)
        assertEquals(GameStatus.SCHEDULED, game.status)
    }

    @Test
    fun `예정 경기에 결과가 나오면 같은 레코드를 갱신한다`() {
        val existing = Game(id = 42, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
        val scraped = ScrapedGame(date, "OB", "LG", 7, 3, GameStatus.FINAL)

        val game = reconcile(existing, scraped)

        assertEquals(42, game.id) // 새로 만들지 않고 기존 것 유지 → 중복 없음
        assertEquals(7, game.homeScore)
        assertEquals(3, game.awayScore)
        assertEquals(GameStatus.FINAL, game.status)
    }
}
