package com.seungbeom.kbo.simulation

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.prediction.Predictions
import com.seungbeom.kbo.standings.TeamStanding
import kotlin.random.Random

/**
 * 몬테카를로 시즌 시뮬레이션.
 * 남은 경기를 [iterations]번 가상으로 치르고, 매번 최종 순위 → 상위 5팀(가을야구) →
 * KBO 계단식 포스트시즌으로 우승팀을 가린다. 집계해 진출확률·우승확률을 낸다.
 *
 * 순수 함수 — [Random]을 주입받아 시드 고정으로 테스트 가능.
 *
 * 단순화(MVP): 경기 승률은 현재 시점 승률로 고정(log5 + 홈 이점), 무승부는 시뮬하지 않음,
 * 시리즈는 매 경기 동일 확률(홈 로테이션 무시), 상위 시드가 홈.
 */
object SeasonSimulator {

    fun simulate(
        teams: List<TeamStanding>,
        remainingGames: List<Game>,
        iterations: Int,
        random: Random,
    ): List<SimulationResult> {
        require(teams.size >= 5) { "가을야구는 최소 5팀이 필요합니다 (현재 ${teams.size})" }

        val ids = teams.map { it.teamId }
        val names = teams.associate { it.teamId to it.name }
        val baseWins = teams.associate { it.teamId to it.wins }
        val baseLosses = teams.associate { it.teamId to it.losses }
        val basePct = teams.associate { it.teamId to it.winPct }

        val playoffCount = HashMap<String, Int>().apply { ids.forEach { put(it, 0) } }
        val championCount = HashMap<String, Int>().apply { ids.forEach { put(it, 0) } }

        repeat(iterations) {
            val wins = HashMap(baseWins)
            val losses = HashMap(baseLosses)

            for (g in remainingGames) {
                val pHome = Predictions.homeWinProbability(
                    basePct[g.homeTeamId] ?: 0.0,
                    basePct[g.awayTeamId] ?: 0.0,
                )
                if (random.nextDouble() < pHome) {
                    wins[g.homeTeamId] = (wins[g.homeTeamId] ?: 0) + 1
                    losses[g.awayTeamId] = (losses[g.awayTeamId] ?: 0) + 1
                } else {
                    wins[g.awayTeamId] = (wins[g.awayTeamId] ?: 0) + 1
                    losses[g.homeTeamId] = (losses[g.homeTeamId] ?: 0) + 1
                }
            }

            val finalPct = ids.associateWith {
                val w = wins.getValue(it); val l = losses.getValue(it)
                if (w + l == 0) 0.0 else w.toDouble() / (w + l)
            }
            val ranked = ids.sortedWith(
                compareByDescending<String> { finalPct.getValue(it) }.thenByDescending { wins.getValue(it) },
            )
            val top5 = ranked.take(5)
            top5.forEach { playoffCount[it] = playoffCount.getValue(it) + 1 }

            val champion = postseason(top5, finalPct, random)
            championCount[champion] = championCount.getValue(champion) + 1
        }

        return ids.map { id ->
            SimulationResult(
                teamId = id,
                name = names.getValue(id),
                playoffProb = playoffCount.getValue(id).toDouble() / iterations,
                championshipProb = championCount.getValue(id).toDouble() / iterations,
            )
        }.sortedWith(
            compareByDescending<SimulationResult> { it.championshipProb }.thenByDescending { it.playoffProb },
        )
    }

    /** 상위 5시드로 KBO 계단식 포스트시즌 → 우승팀 id. */
    private fun postseason(top5: List<String>, pct: Map<String, Double>, random: Random): String {
        val wcWinner = wildCard(fourth = top5[3], fifth = top5[4], pct, random)
        val junPoWinner = series(higher = top5[2], lower = wcWinner, pct, random, winsNeeded = 3)  // 준PO 5전3선승
        val poWinner = series(higher = top5[1], lower = junPoWinner, pct, random, winsNeeded = 3)  // PO 5전3선승
        return series(higher = top5[0], lower = poWinner, pct, random, winsNeeded = 4)             // KS 7전4선승
    }

    /** 와일드카드: 4위는 1승, 5위는 2연승 필요. */
    private fun wildCard(fourth: String, fifth: String, pct: Map<String, Double>, random: Random): String {
        val pFourthWins = Predictions.homeWinProbability(pct.getValue(fourth), pct.getValue(fifth))
        val fifthTakesGame1 = random.nextDouble() >= pFourthWins
        if (!fifthTakesGame1) return fourth
        val fifthTakesGame2 = random.nextDouble() >= pFourthWins
        return if (fifthTakesGame2) fifth else fourth
    }

    /** N선승 시리즈. 상위 시드(higher)가 홈. */
    private fun series(higher: String, lower: String, pct: Map<String, Double>, random: Random, winsNeeded: Int): String {
        val pHigher = Predictions.homeWinProbability(pct.getValue(higher), pct.getValue(lower))
        var hi = 0
        var lo = 0
        while (hi < winsNeeded && lo < winsNeeded) {
            if (random.nextDouble() < pHigher) hi++ else lo++
        }
        return if (hi == winsNeeded) higher else lower
    }
}
