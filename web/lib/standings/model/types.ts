import type { TeamId } from "@/lib/teams";

/** 백엔드 `GET /api/standings` 응답 한 행. 종료 경기에서 실시간 집계한 값이다. */
export interface TeamStanding {
  teamId: TeamId;
  name: string;
  games: number;
  wins: number;
  losses: number;
  draws: number;
  winPct: number;
  rank: number;
  gamesBehind: number;
}
