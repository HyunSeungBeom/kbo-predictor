package com.seungbeom.kbo.prediction

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameStatus

/** 선발 한 명의 등판 성적(팀 기준 승패). 무승부는 승도 패도 아니다. */
data class StarterRecord(
    val starts: Int = 0,
    val wins: Int = 0,
    val losses: Int = 0,
) {
    val draws: Int get() = starts - wins - losses
    val firstStart: Boolean get() = starts == 0

    operator fun plus(other: StarterRecord) =
        StarterRecord(starts + other.starts, wins + other.wins, losses + other.losses)
}

/**
 * 선발 투수가 나온 경기의 **팀 승패**를 모아 «팀 평균 대비 얼마나 좋은 선발인가» 를 낸다.
 *
 * ## 왜 승패만 쓰나
 * 우리가 가진 데이터는 경기 결과뿐이다(자책점·이닝 같은 개인 스탯은 다른 출처가 필요하다).
 * 그래서 이 값은 «그 투수가 선발일 때 팀이 이겼는가» 이고, 타선·불펜의 영향이 섞여 있다.
 *
 * ## 그래서 그대로 쓰지 않는다 — 표본이 적을수록 팀 평균으로 끌어당긴다(수축)
 * ```
 * p̂ = (승 + k · 팀승률) / (등판 + k)      k = SHRINKAGE
 * 보정 = p̂ − 팀승률
 * ```
 * - 등판 0회(첫 선발·신인·트레이드 직후)면 보정이 정확히 0 → **팀 승률만 쓰던 예측과 같아진다.**
 *   «데이터가 없으면 아무 말도 하지 않는다» 가 기본값이라 별도 분기가 필요 없다.
 * - 3등판 3승이면 그대로 쓸 때 +0.4 가 붙지만, 수축하면 +0.1 남짓이다. 우연을 실력으로 읽지 않는다.
 * - 25등판쯤 되면 본인 기록이 대부분 반영된다.
 *
 * ## 상대전적은 계산에 넣지 않는다
 * 같은 팀 상대 등판은 한 시즌 1~3회다. 확률을 움직이기엔 표본이 너무 작아 **화면 표시용**으로만 낸다
 * ([against]).
 */
class StarterRatings(finalGames: List<Game>) {

    /** (투수, 소속팀) → 성적 */
    private val overall: Map<Key, StarterRecord>

    /** (투수, 소속팀, 상대팀) → 성적 */
    private val byOpponent: Map<OpponentKey, StarterRecord>

    init {
        val all = HashMap<Key, StarterRecord>()
        val vs = HashMap<OpponentKey, StarterRecord>()
        for (game in finalGames) {
            if (game.status != GameStatus.FINAL) continue
            val home = game.homeScore ?: continue
            val away = game.awayScore ?: continue
            add(all, vs, game.homeStartPitcher, game.homeTeamId, game.awayTeamId, home, away)
            add(all, vs, game.awayStartPitcher, game.awayTeamId, game.homeTeamId, away, home)
        }
        overall = all
        byOpponent = vs
    }

    /** 그 투수의 전체 등판 성적. 이력이 없으면 빈 기록(첫 선발). */
    fun record(pitcher: String?, teamId: String): StarterRecord =
        pitcher?.let { overall[Key(it, teamId)] } ?: StarterRecord()

    /** 그 투수의 특정 팀 상대 성적 — **표시용**. 계산에는 쓰지 않는다. */
    fun against(pitcher: String?, teamId: String, opponentTeamId: String): StarterRecord? =
        pitcher?.let { byOpponent[OpponentKey(it, teamId, opponentTeamId)] }

    /** 팀 승률 대비 보정치. 등판 이력이 없으면 0. */
    fun adjustment(pitcher: String?, teamId: String, teamWinPct: Double): Double =
        adjustment(record(pitcher, teamId), teamWinPct)

    companion object {
        /**
         * 수축 상수 — "평균적인 등판 k경기" 를 섞는 효과. 크면 팀 평균에 가깝고 작으면 본인 기록에 가깝다.
         * 10 은 «3~4등판으로는 확률이 크게 안 움직이고, 한 시즌(25등판)쯤이면 대부분 반영» 되는 지점이다.
         */
        const val SHRINKAGE: Double = 10.0

        /** 보정치를 포함한 승률은 이 범위를 벗어나지 않는다(log5 가 0·1 에서 무너진다). */
        private val RANGE = 0.05..0.95

        fun adjustment(record: StarterRecord, teamWinPct: Double, k: Double = SHRINKAGE): Double {
            if (record.starts == 0) return 0.0
            val shrunk = (record.wins + k * teamWinPct) / (record.starts + k)
            return shrunk - teamWinPct
        }

        /** 팀 승률에 보정치를 더해 log5 에 넣을 값. */
        fun effectiveWinPct(teamWinPct: Double, adjustment: Double): Double =
            (teamWinPct + adjustment).coerceIn(RANGE.start, RANGE.endInclusive)

        private fun add(
            all: HashMap<Key, StarterRecord>,
            vs: HashMap<OpponentKey, StarterRecord>,
            pitcher: String?,
            teamId: String,
            opponentTeamId: String,
            scored: Int,
            allowed: Int,
        ) {
            if (pitcher.isNullOrBlank()) return
            val one = StarterRecord(
                starts = 1,
                wins = if (scored > allowed) 1 else 0,
                losses = if (scored < allowed) 1 else 0,
            )
            val key = Key(pitcher, teamId)
            all[key] = (all[key] ?: StarterRecord()) + one
            val opponentKey = OpponentKey(pitcher, teamId, opponentTeamId)
            vs[opponentKey] = (vs[opponentKey] ?: StarterRecord()) + one
        }
    }

    /** 동명이인이 다른 팀에 있을 수 있어 팀까지 키에 넣는다(출처가 선수 id 를 주지 않는다). */
    private data class Key(val pitcher: String, val teamId: String)

    private data class OpponentKey(val pitcher: String, val teamId: String, val opponentTeamId: String)
}
