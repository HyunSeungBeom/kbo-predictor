package com.seungbeom.kbo.standings

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.team.Team

/**
 * 순위 계산의 핵심 — 순수 함수. FINAL 경기들을 집계해 순위표를 만든다.
 * Spring/DB 없이 단독 테스트 가능.
 *
 * 정렬: 승률 내림차순 → 승수 내림차순. (KBO 실제 동률 규정은 상대전적 등 더 복잡 — MVP는 승률 우선.)
 */
object Standings {

    fun compute(teams: List<Team>, finalGames: List<Game>): List<TeamStanding> {
        val wins = HashMap<String, Int>()
        val losses = HashMap<String, Int>()
        val draws = HashMap<String, Int>()
        teams.forEach { wins[it.id] = 0; losses[it.id] = 0; draws[it.id] = 0 }

        for (g in finalGames) {
            val home = g.homeScore ?: continue
            val away = g.awayScore ?: continue
            if (g.homeTeamId !in wins || g.awayTeamId !in wins) continue
            when {
                home > away -> { wins.inc(g.homeTeamId); losses.inc(g.awayTeamId) }
                home < away -> { losses.inc(g.homeTeamId); wins.inc(g.awayTeamId) }
                else -> { draws.inc(g.homeTeamId); draws.inc(g.awayTeamId) }
            }
        }

        val rows = teams.map { t ->
            val w = wins.getValue(t.id)
            val l = losses.getValue(t.id)
            val d = draws.getValue(t.id)
            TeamStanding(t.id, t.name, w + l + d, w, l, d, winPct(w, l))
        }.sortedWith(
            compareByDescending<TeamStanding> { it.winPct }.thenByDescending { it.wins },
        )

        if (rows.isEmpty()) return rows
        val leader = rows.first()
        return rows.mapIndexed { i, r ->
            r.copy(
                rank = i + 1,
                gamesBehind = ((leader.wins - r.wins) + (r.losses - leader.losses)) / 2.0,
            )
        }
    }

    private fun HashMap<String, Int>.inc(key: String) { this[key] = getValue(key) + 1 }

    private fun winPct(w: Int, l: Int): Double =
        if (w + l == 0) 0.0 else w.toDouble() / (w + l)
}
