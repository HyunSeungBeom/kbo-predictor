package com.seungbeom.kbo.prediction;

/**
 * log5 (Bill James) 단일 경기 승리확률 계산 — 순수 함수, 부작용 없음.
 *
 * <p>의도적으로 <b>Java</b>로 작성했다. 프로젝트 전반은 Kotlin이지만, 이 계산 코어는
 * (1) 자바 기본기를 드러내고 (2) Kotlin 쪽에서 그대로 호출되어 <b>Java ↔ Kotlin 상호운용</b>을
 * 보여주는 지점이다. 회사의 "레거시 Java → Kotlin 전환" 상황을 축소 재현한 것이기도 하다.
 */
public final class Log5 {

    private Log5() {
    }

    /**
     * 두 팀의 승률만으로 A가 B를 이길 확률을 구한다.
     *
     * <pre>P(A) = (pa - pa*pb) / (pa + pb - 2*pa*pb)</pre>
     *
     * @param pa A팀 승률 (0.0 ~ 1.0)
     * @param pb B팀 승률 (0.0 ~ 1.0)
     * @return A가 B를 이길 확률. 두 팀이 동일하거나 분모가 0이면 0.5.
     */
    public static double winProbability(double pa, double pb) {
        double denominator = pa + pb - 2 * pa * pb;
        if (denominator == 0) {
            return 0.5;
        }
        return (pa - pa * pb) / denominator;
    }

    /**
     * 홈 어드밴티지를 더한 홈팀 승리확률. (KBO 홈 승률은 대략 0.53~0.54)
     *
     * @param homeWinPct 홈팀 승률
     * @param awayWinPct 원정팀 승률
     * @param homeEdge   홈 보정치 (예: 0.04)
     * @return 0.0~1.0로 클램프된 홈팀 승리확률
     */
    public static double winProbabilityWithHomeEdge(double homeWinPct, double awayWinPct, double homeEdge) {
        double base = winProbability(homeWinPct, awayWinPct);
        return Math.min(1.0, Math.max(0.0, base + homeEdge));
    }
}
