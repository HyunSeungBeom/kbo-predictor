package com.seungbeom.kbo.standings

/**
 * 순위표 한 줄. winPct(승률)은 KBO 관례대로 **무승부를 제외**한 승/(승+패).
 * gamesBehind(게임차)는 1위 대비. rank 는 1부터.
 */
data class TeamStanding(
    val teamId: String,
    val name: String,
    val games: Int,
    val wins: Int,
    val losses: Int,
    val draws: Int,
    val winPct: Double,
    val rank: Int = 0,
    val gamesBehind: Double = 0.0,
)
