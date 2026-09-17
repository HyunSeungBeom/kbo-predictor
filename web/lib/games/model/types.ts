import type { TeamId } from "@/lib/teams";

export const GAME_STATUSES = ["SCHEDULED", "FINAL"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

export const VENUES = ["HOME", "AWAY"] as const;
export type Venue = (typeof VENUES)[number];

export const GAME_RESULTS = ["WIN", "LOSS", "DRAW"] as const;
export type GameResult = (typeof GAME_RESULTS)[number];

/** 백엔드 `GET /api/games` 응답 한 행. 예정 경기는 점수가 null 이다. */
export interface Game {
  id: number;
  gameDate: string; // YYYY-MM-DD
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number | null;
  awayScore: number | null;
  status: GameStatus;
}

/**
 * 백엔드 `GameFilter` 와 같은 모양. 조건이 없으면 필드 자체를 두지 않는다.
 * opponent·venue·result 는 team 관점이라 team 이 있을 때만 의미가 있다.
 */
export interface GameFilter {
  team?: TeamId;
  opponent?: TeamId;
  venue?: Venue;
  result?: GameResult;
  status?: GameStatus;
  from?: string; // YYYY-MM-DD
  to?: string;
}

/** 필터 키 순서. 고정해 두면 같은 필터는 항상 같은 URL(= 같은 캐시 키)이 된다. */
export const GAME_FILTER_KEYS = ["team", "opponent", "venue", "result", "status", "from", "to"] as const;

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: string | null | undefined): v is T =>
    v != null && (values as readonly string[]).includes(v);

export const isGameStatus = oneOf(GAME_STATUSES);
export const isVenue = oneOf(VENUES);
export const isGameResult = oneOf(GAME_RESULTS);
