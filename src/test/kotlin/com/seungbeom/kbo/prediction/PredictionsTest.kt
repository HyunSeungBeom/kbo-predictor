package com.seungbeom.kbo.prediction

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

/** Kotlin [Predictions] 가 Java [Log5] 를 제대로 호출하는지 검증 (interop). */
class PredictionsTest {

    @Test
    fun `실력 같으면 홈 어드밴티지만큼만 높다`() {
        assertEquals(0.5 + Predictions.HOME_EDGE, Predictions.homeWinProbability(0.6, 0.6), 1e-9)
    }

    @Test
    fun `강한 홈팀이 더 높은 확률`() {
        assertTrue(Predictions.homeWinProbability(0.7, 0.4) > 0.5)
    }
}
