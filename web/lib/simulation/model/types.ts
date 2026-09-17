import type { TeamId } from "@/lib/teams";

/** 백엔드 `GET /api/simulation` 응답 한 행. 확률은 0~1. */
export interface SimulationResult {
  teamId: TeamId;
  name: string;
  playoffProb: number;
  championshipProb: number;
}
