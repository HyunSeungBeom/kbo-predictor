package com.seungbeom.kbo.prediction

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameStatus
import com.seungbeom.kbo.prediction.StarterRatings.Companion.adjustment
import java.time.LocalDate
import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * 선발 보정 — 표본이 적을 때 우연을 실력으로 읽지 않는지가 핵심이다.
 * 여기가 틀리면 «3등판 3승» 투수의 경기에서 확률이 근거 없이 치솟는다.
 */
class StarterRatingsTest {

    private var seq = 0L
    private fun game(
        home: String, away: String, homeScore: Int?, awayScore: Int?,
        homePitcher: String? = null, awayPitcher: String? = null,
        status: GameStatus = if (homeScore == null) GameStatus.SCHEDULED else GameStatus.FINAL,
    ) = Game(
        id = ++seq,
        gameDate = LocalDate.of(2026, 8, 1),
        homeTeamId = home,
        awayTeamId = away,
        homeScore = homeScore,
        awayScore = awayScore,
        status = status,
        homeStartPitcher = homePitcher,
        awayStartPitcher = awayPitcher,
    )

    /** 같은 투수가 n번 선발로 나와 w번 이긴 시즌 */
    private fun season(pitcher: String, starts: Int, wins: Int) =
        (1..starts).map { i ->
            if (i <= wins) game("OB", "LG", 5, 3, homePitcher = pitcher)
            else game("OB", "LG", 2, 4, homePitcher = pitcher)
        }

    /* ── 수축 ───────────────────────────────────────────── */

    @Test
    fun `등판 이력이 없으면 보정이 0 이다 — 첫 선발은 팀 평균으로 계산된다`() {
        val ratings = StarterRatings(emptyList())

        assertEquals(0.0, ratings.adjustment("신인", "OB", teamWinPct = 0.520))
        assertTrue(ratings.record("신인", "OB").firstStart)
    }

    @Test
    fun `표본이 적으면 조금만 움직인다 — 3등판 3승이 팀 평균을 크게 못 끌어올린다`() {
        val teamWinPct = 0.500
        val ratings = StarterRatings(season("반짝", starts = 3, wins = 3))

        val adj = ratings.adjustment("반짝", "OB", teamWinPct)

        /* 그대로 쓰면 +0.5 다. 수축 후에는 0.15 미만이어야 한다 */
        assertTrue(adj in 0.0..0.15, "3등판 3승 보정이 과하다: $adj")
    }

    @Test
    fun `표본이 쌓일수록 본인 기록에 수렴한다`() {
        val teamWinPct = 0.500
        val short = StarterRatings(season("에이스", starts = 5, wins = 4)).adjustment("에이스", "OB", teamWinPct)
        val long = StarterRatings(season("에이스", starts = 30, wins = 24)).adjustment("에이스", "OB", teamWinPct)

        /* 둘 다 승률 0.8 인데, 등판이 많은 쪽이 실제 기록(0.8 − 0.5 = 0.3)에 더 가깝다 */
        assertTrue(long > short, "등판이 많은데 보정이 더 작다: short=$short long=$long")
        assertTrue(abs(0.30 - long) < abs(0.30 - short))
    }

    @Test
    fun `부진한 선발은 음수 보정을 받는다`() {
        val adj = StarterRatings(season("부진", starts = 20, wins = 4)).adjustment("부진", "OB", 0.500)

        assertTrue(adj < -0.1, "보정이 충분히 내려가지 않았다: $adj")
    }

    @Test
    fun `보정을 더해도 승률은 0 과 1 에 닿지 않는다 — log5 가 무너지는 구간`() {
        assertTrue(StarterRatings.effectiveWinPct(0.99, +0.5) < 1.0)
        assertTrue(StarterRatings.effectiveWinPct(0.01, -0.5) > 0.0)
    }

    @Test
    fun `순수 계산 — 등판 0 이면 k 와 무관하게 0`() {
        assertEquals(0.0, adjustment(StarterRecord(), teamWinPct = 0.6, k = 1.0))
        assertEquals(0.0, adjustment(StarterRecord(), teamWinPct = 0.6, k = 100.0))
        /* k=0(수축 끄기)이면 공식이 0÷0 이 된다 — 등판 0 을 먼저 걸러야 NaN 이 안 나온다 */
        assertEquals(0.0, adjustment(StarterRecord(), teamWinPct = 0.6, k = 0.0))
    }

    @Test
    fun `수축을 끄면 본인 기록 그대로다 — 공식 확인`() {
        val record = StarterRecord(starts = 4, wins = 3, losses = 1)

        assertEquals(0.75 - 0.5, adjustment(record, teamWinPct = 0.5, k = 0.0), 1e-9)
    }

    /* ── 집계 ───────────────────────────────────────────── */

    @Test
    fun `홈 원정을 가리지 않고 그 투수의 팀 기준으로 센다`() {
        val ratings = StarterRatings(
            listOf(
                game("OB", "LG", 5, 3, homePitcher = "곽빈"),   // 홈 선발 승
                game("LG", "OB", 4, 2, awayPitcher = "곽빈"),   // 원정 선발 패
                game("OB", "HH", 1, 1, homePitcher = "곽빈"),   // 무승부
            ),
        )

        val record = ratings.record("곽빈", "OB")
        assertEquals(StarterRecord(starts = 3, wins = 1, losses = 1), record)
        assertEquals(1, record.draws)
    }

    @Test
    fun `예정 경기와 점수 없는 경기는 세지 않는다`() {
        val ratings = StarterRatings(
            listOf(
                game("OB", "LG", null, null, homePitcher = "곽빈"),
                game("OB", "LG", null, null, homePitcher = "곽빈", status = GameStatus.FINAL),
                /* 점수가 들어 있어도 «종료» 가 아니면 아직 결과가 아니다 (수집 중간 상태) */
                game("OB", "LG", 5, 3, homePitcher = "곽빈", status = GameStatus.SCHEDULED),
            ),
        )

        assertTrue(ratings.record("곽빈", "OB").firstStart)
    }

    @Test
    fun `같은 이름이라도 팀이 다르면 다른 투수로 센다 — 출처가 선수 id 를 주지 않는다`() {
        val ratings = StarterRatings(listOf(game("OB", "LG", 5, 3, homePitcher = "김민수")))

        assertEquals(1, ratings.record("김민수", "OB").starts)
        assertTrue(ratings.record("김민수", "LG").firstStart)
    }

    @Test
    fun `선발이 비어 있는 경기는 건너뛴다`() {
        val ratings = StarterRatings(listOf(game("OB", "LG", 5, 3, homePitcher = null, awayPitcher = " ")))

        assertTrue(ratings.record(null, "OB").firstStart)
        assertTrue(ratings.record(" ", "LG").firstStart)
    }

    /* ── 상대전적 (표시용) ──────────────────────────────── */

    @Test
    fun `상대팀별로 따로 센다`() {
        val ratings = StarterRatings(
            listOf(
                game("OB", "LG", 5, 3, homePitcher = "곽빈"),
                game("OB", "LG", 1, 2, homePitcher = "곽빈"),
                game("OB", "HH", 7, 0, homePitcher = "곽빈"),
            ),
        )

        assertEquals(StarterRecord(starts = 2, wins = 1, losses = 1), ratings.against("곽빈", "OB", "LG"))
        assertEquals(StarterRecord(starts = 1, wins = 1, losses = 0), ratings.against("곽빈", "OB", "HH"))
    }

    @Test
    fun `맞붙은 적 없는 상대는 null 이다`() {
        val ratings = StarterRatings(listOf(game("OB", "LG", 5, 3, homePitcher = "곽빈")))

        assertNull(ratings.against("곽빈", "OB", "KT"))
    }

    @Test
    fun `상대전적은 확률에 영향을 주지 않는다 — 표시용이다`() {
        /* LG 상대 2승 0패인 투수라도, 전체 등판이 같으면 보정치가 같아야 한다 */
        val vsLg = StarterRatings(
            listOf(
                game("OB", "LG", 5, 3, homePitcher = "곽빈"),
                game("OB", "LG", 6, 1, homePitcher = "곽빈"),
            ),
        )
        val spread = StarterRatings(
            listOf(
                game("OB", "LG", 5, 3, homePitcher = "곽빈"),
                game("OB", "HH", 6, 1, homePitcher = "곽빈"),
            ),
        )

        assertEquals(vsLg.adjustment("곽빈", "OB", 0.5), spread.adjustment("곽빈", "OB", 0.5))
    }
}
