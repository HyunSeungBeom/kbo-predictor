import type { SimulationResult } from "./types";

/** 차트 한 행 — 팀 하나의 «가을야구 진출» 과 «우승» 확률(%). */
export interface ProbabilityRow {
  teamId: string;
  name: string;
  playoff: number;
  champ: number;
}

/**
 * 시뮬레이션 결과 → 차트 행. 확률(0~1)을 퍼센트로 바꾸고 **진출 확률 순으로 세운다.**
 *
 * 우승 확률로 세우면 «진출은 거의 확정인데 우승 확률만 낮은 팀» 이 바닥에 깔려, 가을야구 경쟁이
 * 어떻게 되고 있는지가 안 보인다. 시즌 막바지에 사람들이 궁금해하는 건 5위 싸움이다.
 */
export function toProbabilityRows(results: readonly SimulationResult[]): ProbabilityRow[] {
  return results
    .map((r) => ({
      teamId: r.teamId,
      name: r.name,
      playoff: toPercent(r.playoffProb),
      champ: toPercent(r.championshipProb),
    }))
    .sort((a, b) => b.playoff - a.playoff || b.champ - a.champ);
}

/** 소수 한 자리. 0.0247 → 2.5 */
const toPercent = (prob: number): number => Math.round(prob * 1000) / 10;
