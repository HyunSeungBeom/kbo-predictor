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

    /* ── 선발 투수 ──────────────────────────────────────── */

    @Test
    fun `예정 경기의 선발은 새 값으로 갈아끼운다 — 경기 당일까지 바뀐다`() {
        val existing = Game(id = 1, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
            .apply { homeStartPitcher = "곽빈" }
        val scraped = ScrapedGame(date, "OB", "LG", homeStartPitcher = "최원준")

        assertEquals("최원준", reconcile(existing, scraped).homeStartPitcher)
    }

    @Test
    fun `새 값이 없으면 이미 발표된 선발을 지우지 않는다`() {
        /* 재수집 한 번에 선발이 사라지면 화면이 비어 버린다 */
        val existing = Game(id = 1, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
            .apply { homeStartPitcher = "곽빈"; awayStartPitcher = "손주영" }
        val scraped = ScrapedGame(date, "OB", "LG", homeStartPitcher = null, awayStartPitcher = null)

        val game = reconcile(existing, scraped)

        assertEquals("곽빈", game.homeStartPitcher)
        assertEquals("손주영", game.awayStartPitcher)
    }

    @Test
    fun `종료된 경기의 선발은 확정값이라 덮어쓰지 않는다`() {
        val existing = Game(id = 1, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
            .apply { status = GameStatus.FINAL; homeStartPitcher = "곽빈" }
        val scraped = ScrapedGame(date, "OB", "LG", 5, 3, GameStatus.FINAL, homeStartPitcher = "엉뚱한이름")

        assertEquals("곽빈", reconcile(existing, scraped).homeStartPitcher)
    }

    @Test
    fun `시간 구장 출처id 를 채운다`() {
        val scraped = ScrapedGame(
            date, "OB", "LG",
            startTime = "18:30", stadium = "잠실야구장", externalId = "80108778",
        )

        val game = reconcile(existing = null, s = scraped)

        assertEquals("18:30", game.startTime)
        assertEquals("잠실야구장", game.stadium)
        assertEquals("80108778", game.externalId)
    }
}
