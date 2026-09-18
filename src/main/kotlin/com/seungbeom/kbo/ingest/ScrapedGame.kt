package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.GameStatus
import java.time.LocalDate

/**
 * 외부 출처에서 긁어온 경기 한 건(원시 데이터). DB 엔티티([com.seungbeom.kbo.game.Game])와 분리해서
 * "가져오기"와 "저장"을 느슨하게 결합한다 — 출처가 바뀌어도 upsert 로직은 그대로.
 */
data class ScrapedGame(
    val gameDate: LocalDate,
    val homeTeamId: String,
    val awayTeamId: String,
    val homeScore: Int? = null,
    val awayScore: Int? = null,
    val status: GameStatus = GameStatus.SCHEDULED,
    val homeStartPitcher: String? = null,
    val awayStartPitcher: String? = null,
    val startTime: String? = null,
    val stadium: String? = null,
    /** 출처 경기 id — upsert 키. 없으면 (날짜+홈+원정) 으로 매칭한다. */
    val externalId: String? = null,
)
