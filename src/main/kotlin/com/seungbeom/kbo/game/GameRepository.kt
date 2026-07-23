package com.seungbeom.kbo.game

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDate

interface GameRepository : JpaRepository<Game, Long> {
    fun findByGameDateOrderByIdAsc(gameDate: LocalDate): List<Game>
}
