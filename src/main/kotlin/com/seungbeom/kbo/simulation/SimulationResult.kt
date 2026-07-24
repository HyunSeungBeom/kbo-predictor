package com.seungbeom.kbo.simulation

/**
 * 시뮬레이션 집계 결과 한 팀.
 * @property playoffProb 가을야구(상위 5) 진출 확률 0~1
 * @property championshipProb 한국시리즈 우승 확률 0~1
 */
data class SimulationResult(
    val teamId: String,
    val name: String,
    val playoffProb: Double,
    val championshipProb: Double,
)
