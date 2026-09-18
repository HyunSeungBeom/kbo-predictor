import { describe, expect, it } from "vitest";
import { toProbabilityRows, type SimulationResult } from "..";

const result = (teamId: string, playoffProb: number, championshipProb: number): SimulationResult =>
  ({ teamId, name: teamId, playoffProb, championshipProb }) as SimulationResult;

describe("SIM 001: 차트 행은 진출 확률 순이다", () => {
  it("우승 확률이 낮아도 진출이 확실하면 위에 온다 — 시즌 막바지 관심사는 5위 싸움이다", () => {
    const rows = toProbabilityRows([
      result("HT", 1.0, 0.026),
      result("NC", 0.027, 0),
      result("OB", 0.974, 0.005),
    ]);

    expect(rows.map((r) => r.teamId)).toEqual(["HT", "OB", "NC"]);
  });

  it("진출 확률이 같으면 우승 확률로 가린다", () => {
    const rows = toProbabilityRows([result("SS", 1.0, 0.273), result("KT", 1.0, 0.627)]);

    expect(rows.map((r) => r.teamId)).toEqual(["KT", "SS"]);
  });
});

describe("SIM 002: 확률을 퍼센트로 바꾼다", () => {
  it("소수 한 자리까지 — 0.0247 은 2.5%", () => {
    const [row] = toProbabilityRows([result("NC", 0.0247, 0.0004)]);

    expect(row.playoff).toBe(2.5);
    expect(row.champ).toBe(0);
  });

  it("빈 결과도 그대로 빈 목록이다", () => {
    expect(toProbabilityRows([])).toEqual([]);
  });
});
