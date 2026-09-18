package com.seungbeom.kbo.game

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface GameRepository : JpaRepository<Game, Long> {
    fun findByGameDateOrderByIdAsc(gameDate: LocalDate): List<Game>

    /** 순위 계산용: 종료된 경기만. */
    fun findByStatus(status: GameStatus): List<Game>

    /** upsert 1순위 키: 출처 경기 id(더블헤더 구분). */
    fun findByExternalId(externalId: String): Game?

    /** upsert 2순위 키(출처 id 가 없던 시절 데이터): 날짜 + 홈 + 원정. */
    fun findByGameDateAndHomeTeamIdAndAwayTeamId(
        gameDate: LocalDate,
        homeTeamId: String,
        awayTeamId: String,
    ): Game?
}
