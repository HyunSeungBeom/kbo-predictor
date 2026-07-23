package com.seungbeom.kbo.prediction

/**
 * 예측 계산의 Kotlin 진입점. 실제 수식은 Java 의 [Log5] 를 호출한다.
 * → Kotlin 코드가 Java 코드를 그대로 쓰는 상호운용(interop) 예시.
 *
 * Spring 의존성이 없는 순수 객체라 테스트가 쉽다(컨텍스트/DB 불필요).
 */
object Predictions {

    /** KBO 홈 어드밴티지 보정치 (경험적 근사값). */
    const val HOME_EDGE: Double = 0.04

    /** 승률만으로 홈팀 승리확률을 계산. */
    fun homeWinProbability(homeWinPct: Double, awayWinPct: Double): Double =
        Log5.winProbabilityWithHomeEdge(homeWinPct, awayWinPct, HOME_EDGE)
}
