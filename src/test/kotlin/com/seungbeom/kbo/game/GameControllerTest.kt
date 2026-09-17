package com.seungbeom.kbo.game

import com.seungbeom.kbo.prediction.PredictionService
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.Mockito.verifyNoInteractions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import java.time.LocalDate

/** /api/games 의 파라미터 바인딩과 400 응답 형태를 검증(서비스는 목). */
@WebMvcTest(GameController::class)
class GameControllerTest {

    @Autowired lateinit var mvc: MockMvc
    @MockitoBean lateinit var gameRepository: GameRepository
    @MockitoBean lateinit var predictionService: PredictionService
    @MockitoBean lateinit var gameSearchService: GameSearchService

    @Test
    fun `쿼리 파라미터가 GameFilter 로 바인딩된다`() {
        val expected = GameFilter(
            "OB", "LG", Venue.HOME, GameResult.WIN, GameStatus.FINAL,
            LocalDate.of(2026, 8, 1), LocalDate.of(2026, 8, 31),
        )
        given(gameSearchService.search(expected)).willReturn(
            listOf(Game(1, LocalDate.of(2026, 8, 1), "OB", "LG", 5, 3, GameStatus.FINAL)),
        )

        mvc.get("/api/games?team=OB&opponent=LG&venue=HOME&result=WIN&status=FINAL&from=2026-08-01&to=2026-08-31")
            .andExpect {
                status { isOk() }
                jsonPath("$[0].homeTeamId") { value("OB") }
                jsonPath("$[0].homeScore") { value(5) }
            }
    }

    @Test
    fun `검증 실패는 400 과 위반 목록을 돌려준다`() {
        given(gameSearchService.search(GameFilter(opponent = "LG")))
            .willThrow(InvalidGameFilterException(listOf("opponent 는 team 과 함께 써야 합니다")))

        mvc.get("/api/games?opponent=LG").andExpect {
            status { isBadRequest() }
            jsonPath("$.errors[0]") { value("opponent 는 team 과 함께 써야 합니다") }
        }
    }

    @Test
    fun `enum 에 없는 값은 서비스까지 가지 않고 400`() {
        mvc.get("/api/games?team=OB&venue=NEUTRAL").andExpect { status { isBadRequest() } }
        verifyNoInteractions(gameSearchService)
    }
}
