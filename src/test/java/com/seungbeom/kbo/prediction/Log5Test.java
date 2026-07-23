package com.seungbeom.kbo.prediction;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Java 로 짠 계산 코어를 Java 테스트로 검증. */
class Log5Test {

    @Test
    void 실력이_같으면_5할() {
        assertEquals(0.5, Log5.winProbability(0.5, 0.5), 1e-9);
    }

    @Test
    void 강팀이_더_높은_확률을_가진다() {
        double p = Log5.winProbability(0.7, 0.3);
        assertTrue(p > 0.5);
        assertEquals(0.845, p, 0.001); // (.7-.21)/(.7+.3-.42) = .49/.58 ≈ .845
    }

    @Test
    void 분모가_0이면_5할로_폴백() {
        assertEquals(0.5, Log5.winProbability(0.0, 0.0), 1e-9);
    }

    @Test
    void 홈_어드밴티지가_더해진다() {
        double even = Log5.winProbabilityWithHomeEdge(0.5, 0.5, 0.04);
        assertEquals(0.54, even, 1e-9);
    }

    @Test
    void 확률은_0과_1_사이로_클램프된다() {
        double p = Log5.winProbabilityWithHomeEdge(0.99, 0.01, 0.5);
        assertTrue(p <= 1.0);
    }
}
