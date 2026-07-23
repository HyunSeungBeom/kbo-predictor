package com.seungbeom.kbo.game

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface GameRepository : JpaRepository<Game, Long> {
    fun findByGameDateOrderByIdAsc(gameDate: LocalDate): List<Game>

    /** upsert 시 중복 판별 키: 날짜 + 홈 + 원정. */
    fun findByGameDateAndHomeTeamIdAndAwayTeamId(
        gameDate: LocalDate,
        homeTeamId: String,
        awayTeamId: String,
    ): Game?
}
