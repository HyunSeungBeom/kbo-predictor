package com.seungbeom.kbo.prediction

import com.seungbeom.kbo.game.GameStatus
import java.time.LocalDate

/** 카드에 보여줄 선발 한 명. [vsOpponent] 는 **표시용** — 확률 계산에는 쓰지 않는다. */
data class StarterView(
    val name: String?,
    val starts: Int,
    val wins: Int,
    val losses: Int,
    val draws: Int,
    /** 등판 이력이 없다 = 이 경기 예측은 팀 승률만으로 계산됐다. */
    val firstStart: Boolean,
    val vsOpponent: StarterRecord?,
)

/** 오늘(또는 지정일) 경기 한 건 + 예측. */
data class TodayGame(
    val gameId: Long?,
    val gameDate: LocalDate,
    val startTime: String?,
    val stadium: String?,
    val status: GameStatus,
    val homeTeamId: String,
    val awayTeamId: String,
    val homeScore: Int?,
    val awayScore: Int?,
    val homeWinProb: Double,
    val awayWinProb: Double,
    val home: StarterView,
    val away: StarterView,
)
