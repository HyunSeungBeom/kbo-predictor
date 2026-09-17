package com.seungbeom.kbo.game

import java.time.LocalDate

/** [GameFilter.team] 관점의 홈/원정. */
enum class Venue { HOME, AWAY }

/** [GameFilter.team] 관점의 경기 결과. 종료(FINAL) 경기에만 존재한다. */
enum class GameResult { WIN, LOSS, DRAW }

/**
 * 경기 검색 조건 — 순수 값 객체. 모든 필드는 선택(null = 조건 없음)이고 조건끼리는 AND.
 * opponent·venue·result 는 "누구 관점인지"가 있어야 의미가 생기므로 team 과 함께만 쓸 수 있다.
 *
 * 자연어 검색에서 LLM 이 이 객체를 만들어낼 예정이라, 말이 안 되는 조합을 조용히 무시하지 않고
 * [validate] 가 이유와 함께 거부한다(그 메시지를 그대로 LLM 재시도에 되먹일 수 있게).
 */
data class GameFilter(
    val team: String? = null,
    val opponent: String? = null,
    val venue: Venue? = null,
    val result: GameResult? = null,
    val status: GameStatus? = null,
    val from: LocalDate? = null,
    val to: LocalDate? = null,
) {

    /** 위반 사항 목록. 비어 있으면 유효. */
    fun validate(knownTeamIds: Set<String>): List<String> = buildList {
        listOfNotNull(team, opponent)
            .filter { it !in knownTeamIds }
            .forEach { add("알 수 없는 팀 코드: $it") }

        if (team == null) {
            if (opponent != null) add("opponent 는 team 과 함께 써야 합니다")
            if (venue != null) add("venue 는 team 과 함께 써야 합니다")
            if (result != null) add("result 는 team 과 함께 써야 합니다")
        } else if (team == opponent) {
            add("team 과 opponent 가 같습니다: $team")
        }

        if (result != null && status == GameStatus.SCHEDULED) {
            add("result 는 종료 경기에만 있으므로 status=SCHEDULED 와 함께 쓸 수 없습니다")
        }
        if (from != null && to != null && from > to) add("from($from) 이 to($to) 보다 늦습니다")
    }

    fun matches(g: Game): Boolean {
        if (from != null && g.gameDate < from) return false
        if (to != null && g.gameDate > to) return false
        if (status != null && g.status != status) return false
        if (team == null) return true

        val isHome = g.homeTeamId == team
        if (!isHome && g.awayTeamId != team) return false
        if (venue != null && (venue == Venue.HOME) != isHome) return false
        if (opponent != null && (if (isHome) g.awayTeamId else g.homeTeamId) != opponent) return false
        if (result != null && resultFor(g, isHome) != result) return false
        return true
    }

    private fun resultFor(g: Game, isHome: Boolean): GameResult? {
        if (g.status != GameStatus.FINAL) return null
        val mine = (if (isHome) g.homeScore else g.awayScore) ?: return null
        val theirs = (if (isHome) g.awayScore else g.homeScore) ?: return null
        return when {
            mine > theirs -> GameResult.WIN
            mine < theirs -> GameResult.LOSS
            else -> GameResult.DRAW
        }
    }
}
