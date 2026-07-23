package com.seungbeom.kbo.prediction

import com.seungbeom.kbo.team.Team
import com.seungbeom.kbo.team.TeamRepository
import org.springframework.stereotype.Service

/**
 * 저장된 팀 성적을 읽어 승리확률을 계산한다.
 * 수식 자체는 [Predictions] → Java [Log5] 로 위임 (Kotlin → Java interop).
 */
@Service
class PredictionService(
    private val teamRepository: TeamRepository,
) {

    /** 홈팀이 이길 확률. 팀을 못 찾으면 예외. */
    fun homeWinProbability(homeTeamId: String, awayTeamId: String): Double {
        val home = teamRepository.findById(homeTeamId)
            .orElseThrow { NoSuchElementException("team not found: $homeTeamId") }
        val away = teamRepository.findById(awayTeamId)
            .orElseThrow { NoSuchElementException("team not found: $awayTeamId") }
        return Predictions.homeWinProbability(home.winPct(), away.winPct())
    }

    private fun Team.winPct(): Double =
        if (wins + losses == 0) 0.0 else wins.toDouble() / (wins + losses)
}
