package com.seungbeom.kbo.game

import java.time.LocalDate
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/** 검색 조건의 매칭·검증 규칙을 DB 없이 검증. */
class GameFilterTest {

    private val teams = setOf("OB", "LG", "HH", "SS")
    private fun d(day: Int) = LocalDate.of(2026, 8, day)
    private fun final(id: Long, day: Int, home: String, away: String, hs: Int, aws: Int) =
        Game(id, d(day), home, away, hs, aws, GameStatus.FINAL)
    private fun scheduled(id: Long, day: Int, home: String, away: String) =
        Game(id, d(day), home, away)

    private val games = listOf(
        final(1, 1, "OB", "LG", 5, 3),   // 두산 홈 승
        final(2, 2, "LG", "OB", 4, 2),   // 두산 원정 패
        final(3, 3, "OB", "HH", 1, 1),   // 두산 홈 무
        final(4, 4, "SS", "LG", 7, 0),   // 두산 무관
        scheduled(5, 20, "HH", "OB"),    // 두산 원정 예정
    )

    private fun ids(filter: GameFilter) = games.filter(filter::matches).map { it.id }

    @Test
    fun `조건이 없으면 전부 통과한다`() {
        assertEquals(listOf(1L, 2, 3, 4, 5), ids(GameFilter()))
    }

    @Test
    fun `team 은 홈과 원정 경기를 모두 포함한다`() {
        assertEquals(listOf(1L, 2, 3, 5), ids(GameFilter(team = "OB")))
    }

    @Test
    fun `venue 는 team 관점의 홈 원정이다`() {
        assertEquals(listOf(1L, 3), ids(GameFilter(team = "OB", venue = Venue.HOME)))
        assertEquals(listOf(2L, 5), ids(GameFilter(team = "OB", venue = Venue.AWAY)))
    }

    @Test
    fun `opponent 는 홈 원정에 상관없이 상대팀으로 거른다`() {
        assertEquals(listOf(1L, 2), ids(GameFilter(team = "OB", opponent = "LG")))
    }

    @Test
    fun `result 는 team 관점의 승패무이고 예정 경기는 제외된다`() {
        assertEquals(listOf(1L), ids(GameFilter(team = "OB", result = GameResult.WIN)))
        assertEquals(listOf(2L), ids(GameFilter(team = "OB", result = GameResult.LOSS)))
        assertEquals(listOf(3L), ids(GameFilter(team = "OB", result = GameResult.DRAW)))
    }

    @Test
    fun `같은 경기라도 관점에 따라 결과가 반대다`() {
        assertEquals(listOf(1L), ids(GameFilter(team = "LG", opponent = "OB", result = GameResult.LOSS)))
    }

    @Test
    fun `기간은 양 끝을 포함한다`() {
        assertEquals(listOf(2L, 3, 4), ids(GameFilter(from = d(2), to = d(4))))
    }

    @Test
    fun `status 로 예정 경기만 고를 수 있다`() {
        assertEquals(listOf(5L), ids(GameFilter(team = "OB", status = GameStatus.SCHEDULED)))
    }

    @Test
    fun `조건들은 AND 로 결합된다`() {
        val f = GameFilter(team = "OB", opponent = "LG", venue = Venue.AWAY, result = GameResult.LOSS, to = d(31))
        assertEquals(listOf(2L), ids(f))
    }

    @Test
    fun `유효한 조건은 위반이 없다`() {
        val f = GameFilter("OB", "LG", Venue.HOME, GameResult.WIN, GameStatus.FINAL, d(1), d(31))
        assertEquals(emptyList(), f.validate(teams))
    }

    @Test
    fun `알 수 없는 팀 코드를 거부한다`() {
        val errors = GameFilter(team = "XX", opponent = "YY").validate(teams)
        assertTrue("알 수 없는 팀 코드: XX" in errors)
        assertTrue("알 수 없는 팀 코드: YY" in errors)
    }

    @Test
    fun `관점이 필요한 조건은 team 없이 쓸 수 없다`() {
        val errors = GameFilter(opponent = "LG", venue = Venue.HOME, result = GameResult.WIN).validate(teams)
        assertEquals(3, errors.size)
    }

    @Test
    fun `자기 자신과의 경기는 거부한다`() {
        assertEquals(1, GameFilter(team = "OB", opponent = "OB").validate(teams).size)
    }

    @Test
    fun `예정 경기에 결과 조건을 걸면 거부한다`() {
        val f = GameFilter(team = "OB", result = GameResult.WIN, status = GameStatus.SCHEDULED)
        assertEquals(1, f.validate(teams).size)
    }

    @Test
    fun `거꾸로 된 기간을 거부한다`() {
        assertEquals(1, GameFilter(from = d(10), to = d(1)).validate(teams).size)
    }
}
