package com.seungbeom.kbo.game

import com.seungbeom.kbo.prediction.PredictionService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/api")
class GameController(
    private val gameRepository: GameRepository,
    private val predictionService: PredictionService,
) {

    /** 전체 일정 또는 특정 날짜(?date=2026-07-20)의 경기 목록. */
    @GetMapping("/schedule")
    fun schedule(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        date: LocalDate?,
    ): List<Game> =
        if (date != null) gameRepository.findByGameDateOrderByIdAsc(date)
        else gameRepository.findAll()

    /** 오늘 경기 승부 예측: /api/predict?home=OB&away=LG */
    @GetMapping("/predict")
    fun predict(
        @RequestParam home: String,
        @RequestParam away: String,
    ): Map<String, Any> {
        val homeWin = predictionService.homeWinProbability(home, away)
        return mapOf(
            "home" to home,
            "away" to away,
            "homeWinProb" to homeWin,
            "awayWinProb" to 1.0 - homeWin,
        )
    }
}
