import type { GameStatus } from "@/lib/games";
import type { TeamId } from "@/lib/teams";

/** 백엔드 `GET /api/predict` 응답. log5 + 홈 어드밴티지, 확률은 0~1. */
export interface Prediction {
  home: TeamId;
  away: TeamId;
  homeWinProb: number;
  awayWinProb: number;
}

/** 선발 한 명의 등판 성적(그 투수가 선발일 때의 **팀 승패**). */
export interface StarterRecord {
  starts: number;
  wins: number;
  losses: number;
  draws: number;
  firstStart: boolean;
}

/** 카드에 표시할 선발. `vsOpponent` 는 표시용 — 확률 계산에는 쓰지 않는다. */
export interface StarterView extends StarterRecord {
  /** 발표 전이면 null. */
  name: string | null;
  vsOpponent: StarterRecord | null;
}

/** 백엔드 `GET /api/predict/today` 응답 한 건. */
export interface TodayGame {
  gameId: number | null;
  gameDate: string;
  startTime: string | null;
  stadium: string | null;
  status: GameStatus;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number | null;
  awayScore: number | null;
  homeWinProb: number;
  awayWinProb: number;
  home: StarterView;
  away: StarterView;
}
