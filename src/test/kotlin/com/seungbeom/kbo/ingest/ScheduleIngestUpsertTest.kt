package com.seungbeom.kbo.ingest

import com.seungbeom.kbo.game.Game
import com.seungbeom.kbo.game.GameRepository
import org.mockito.ArgumentMatchers.anyString
import org.mockito.BDDMockito.given
import org.mockito.Mockito.mock
import org.mockito.Mockito.never
import org.mockito.Mockito.times
import org.mockito.Mockito.verify
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import java.time.LocalDate
import java.time.YearMonth
import kotlin.test.Test
import kotlin.test.assertEquals

/**
 * 같은 경기를 어떻게 찾아내는가 — DB 대신 목 저장소로 검증한다.
 *
 * (날짜+홈+원정)만 키로 쓰면 **더블헤더 두 경기가 한 건으로 덮어써진다**(에러 없이 조용히).
 * 그래서 출처 경기 id 를 1순위 키로 쓴다.
 */
class ScheduleIngestUpsertTest {

    /** Mockito 의 any() 는 null 을 돌려줘서 Kotlin 의 non-null 파라미터와 안 맞는다 — 그 자리를 메운다 */
    @Suppress("UNCHECKED_CAST")
    private fun <T> anyArg(): T = ArgumentMatchers.any<T>() as T

    private val date = LocalDate.of(2026, 8, 4)
    private val repository = mock(GameRepository::class.java)
    private val source = mock(KboScheduleSource::class.java)
    private val service = ScheduleIngestService(repository, source)

    private fun scraped(externalId: String) =
        ScrapedGame(date, "OB", "LG", 5, 3, externalId = externalId)

    @Test
    fun `더블헤더는 두 건으로 남는다 — 출처 id 가 다르면 다른 경기다`() {
        given(source.fetch(YearMonth.of(2026, 8))).willReturn(listOf(scraped("1"), scraped("2")))
        given(repository.findByExternalId(anyString())).willReturn(null)
        /* 옛 키로는 이미 저장된 1차전이 잡힐 수 있다 — 그걸 재사용하면 2차전이 1차전을 덮어쓴다 */
        val firstGame = Game(id = 1, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
            .apply { externalId = "1" }
        given(repository.findByGameDateAndHomeTeamIdAndAwayTeamId(date, "OB", "LG")).willReturn(firstGame)

        service.ingestMonth(YearMonth.of(2026, 8))

        val saved = ArgumentCaptor.forClass(Game::class.java)
        verify(repository, times(2)).save(saved.capture())
        assertEquals(listOf("1", "2"), saved.allValues.map { it.externalId })
        assertEquals(2, saved.allValues.distinct().size, "두 경기가 같은 레코드에 덮어써졌다")
    }

    @Test
    fun `출처 id 로 기존 경기를 찾으면 그 레코드를 갱신한다`() {
        val existing = Game(id = 7, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
            .apply { externalId = "1" }
        given(source.fetch(YearMonth.of(2026, 8))).willReturn(listOf(scraped("1")))
        given(repository.findByExternalId("1")).willReturn(existing)

        service.ingestMonth(YearMonth.of(2026, 8))

        verify(repository).save(existing)
    }

    @Test
    fun `출처 id 가 없던 시절 데이터는 옛 키로 찾아 이어붙인다`() {
        val legacy = Game(id = 9, gameDate = date, homeTeamId = "OB", awayTeamId = "LG")
        given(source.fetch(YearMonth.of(2026, 8))).willReturn(listOf(scraped("1")))
        given(repository.findByExternalId("1")).willReturn(null)
        given(repository.findByGameDateAndHomeTeamIdAndAwayTeamId(date, "OB", "LG")).willReturn(legacy)

        service.ingestMonth(YearMonth.of(2026, 8))

        verify(repository).save(legacy)
    }
}
