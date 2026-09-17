import type { TeamId } from "@/lib/teams";

/** 백엔드 `GET /api/predict` 응답. log5 + 홈 어드밴티지, 확률은 0~1. */
export interface Prediction {
  home: TeamId;
  away: TeamId;
  homeWinProb: number;
  awayWinProb: number;
}
