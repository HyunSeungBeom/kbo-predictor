package com.seungbeom.kbo.standings

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameStatus
import com.seungbeom.kbo.team.Team
import java.time.LocalDate
import kotlin.test.Test
import kotlin.test.assertEquals

/** 순위 계산(Standings.compute)을 DB 없이 검증. */
class StandingsTest {

    private fun team(id: String) = Team(id, id)
    private fun final(home: String, away: String, hs: Int, ascore: Int) =
        Game(
            gameDate = LocalDate.of(2026, 4, 1),
            homeTeamId = home, awayTeamId = away,
            homeScore = hs, awayScore = ascore, status = GameStatus.FINAL,
        )

    @Test
    fun `승패 집계와 순위 계산`() {
        val teams = listOf(team("OB"), team("LG"), team("SS"))
        val games = listOf(
            final("OB", "LG", 5, 3), // OB 승, LG 패
            final("OB", "SS", 2, 1), // OB 승, SS 패
            final("LG", "SS", 4, 4), // 무승부
        )

        val s = Standings.compute(teams, games)

        // OB: 2승 0패 → 승률 1.0, 1위, 게임차 0
        assertEquals("OB", s[0].teamId)
        assertEquals(1, s[0].rank)
        assertEquals(2, s[0].wins)
        assertEquals(0, s[0].losses)
        assertEquals(1.0, s[0].winPct, 1e-9)
        assertEquals(0.0, s[0].gamesBehind, 1e-9)

        // LG: 0승 1패 1무 → 무는 승률 제외
        val lg = s.first { it.teamId == "LG" }
        assertEquals(1, lg.draws)
        assertEquals(0.0, lg.winPct, 1e-9)
    }

    @Test
    fun `종료 경기가 없으면 전원 승률 0`() {
        val s = Standings.compute(listOf(team("OB"), team("LG")), emptyList())
        assertEquals(2, s.size)
        assertEquals(0.0, s[0].winPct, 1e-9)
    }

    @Test
    fun `예정 경기는 집계에서 제외된다`() {
        val teams = listOf(team("OB"), team("LG"))
        val scheduled = Game(
            gameDate = LocalDate.of(2026, 4, 2),
            homeTeamId = "OB", awayTeamId = "LG",
            homeScore = null, awayScore = null, status = GameStatus.SCHEDULED,
        )
        // compute 는 FINAL 만 받는 계약이지만, 점수 없는 경기가 섞여도 안전해야 함
        val s = Standings.compute(teams, listOf(scheduled))
        assertEquals(0, s[0].games)
    }
}
