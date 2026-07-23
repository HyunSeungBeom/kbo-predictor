package com.seungbeom.kbo.game

import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDate

enum class GameStatus { SCHEDULED, FINAL }

/**
 * 한 경기. 예정(SCHEDULED)일 땐 점수가 null, 종료(FINAL)면 채워진다.
 * 스크래퍼가 매일 이 테이블을 upsert 하고, 프론트/시뮬레이터는 여기만 읽는다.
 */
@Entity
@Table(name = "game")
class Game(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val gameDate: LocalDate,
    val homeTeamId: String,
    val awayTeamId: String,

    var homeScore: Int? = null,
    var awayScore: Int? = null,

    @Enumerated(EnumType.STRING)
    var status: GameStatus = GameStatus.SCHEDULED,
)
