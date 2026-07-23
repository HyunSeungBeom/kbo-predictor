package com.seungbeom.kbo.game

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface GameRepository : JpaRepository<Game, Long> {
    fun findByGameDateOrderByIdAsc(gameDate: LocalDate): List<Game>

    /** 순위 계산용: 종료된 경기만. */
    fun findByStatus(status: GameStatus): List<Game>

    /** upsert 시 중복 판별 키: 날짜 + 홈 + 원정. */
    fun findByGameDateAndHomeTeamIdAndAwayTeamId(
        gameDate: LocalDate,
        homeTeamId: String,
        awayTeamId: String,
    ): Game?
}
