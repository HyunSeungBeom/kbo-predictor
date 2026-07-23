package com.seungbeom.kbo.prediction

import com.seungbeom.kbo.standings.StandingsService
import org.springframework.stereotype.Service

/**
 * 계산된 순위(승률)를 읽어 승리확률을 낸다.
 * 수식 자체는 [Predictions] → Java [Log5] 로 위임 (Kotlin → Java interop).
 */
@Service
class PredictionService(
    private val standingsService: StandingsService,
) {

    /** 홈팀이 이길 확률. 기록이 없는 팀은 승률 0으로 취급. */
    fun homeWinProbability(homeTeamId: String, awayTeamId: String): Double {
        val winPct = standingsService.winPctByTeam()
        val home = winPct[homeTeamId] ?: 0.0
        val away = winPct[awayTeamId] ?: 0.0
        return Predictions.homeWinProbability(home, away)
    }
}
