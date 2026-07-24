package com.seungbeom.kbo.simulation

import com.seungbeom.kbo.standings.TeamStanding
import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertTrue

/** 시드 고정 Random 으로 몬테카를로 결과를 검증. */
class SeasonSimulatorTest {

    private fun standing(id: String, w: Int, l: Int) =
        TeamStanding(id, id, w + l, w, l, 0, if (w + l == 0) 0.0 else w.toDouble() / (w + l))

    private val sixTeams = listOf(
        standing("A", 80, 20), standing("B", 70, 30), standing("C", 60, 40),
        standing("D", 50, 50), standing("E", 45, 55), standing("F", 30, 70),
    )

    @Test
    fun `우승확률 합은 1, 진출확률은 0에서 1 사이`() {
        val res = SeasonSimulator.simulate(sixTeams, emptyList(), iterations = 3000, random = Random(42))

        assertEquals(1.0, res.sumOf { it.championshipProb }, 1e-9)
        res.forEach { assertTrue(it.playoffProb in 0.0..1.0) }
    }

    @Test
    fun `강팀이 약팀보다 우승확률이 높다`() {
        val teams = listOf(
            standing("A", 90, 10), standing("B", 55, 45), standing("C", 52, 48),
            standing("D", 50, 50), standing("E", 48, 52), standing("F", 20, 80),
        )
        val res = SeasonSimulator.simulate(teams, emptyList(), iterations = 4000, random = Random(7))

        val a = res.first { it.teamId == "A" }
        val f = res.first { it.teamId == "F" }
        assertTrue(a.championshipProb > f.championshipProb)
        assertTrue(a.playoffProb > 0.9) // 압도적 1위는 거의 항상 가을야구
    }

    @Test
    fun `5팀 미만이면 예외`() {
        assertFailsWith<IllegalArgumentException> {
            SeasonSimulator.simulate(listOf(standing("A", 10, 0)), emptyList(), 100, Random(1))
        }
    }
}
