import type { Game } from "./api";
import { isTeamId, type TeamId } from "./teams";

export const VENUES = ["HOME", "AWAY"] as const;
export type Venue = (typeof VENUES)[number];

export const GAME_RESULTS = ["WIN", "LOSS", "DRAW"] as const;
export type GameResult = (typeof GAME_RESULTS)[number];

export const GAME_STATUSES = ["SCHEDULED", "FINAL"] as const;
export type GameStatus = (typeof GAME_STATUSES)[number];

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

const isOneOf = <T extends string>(values: readonly T[], v: string | null): v is T =>
  v != null && (values as readonly string[]).includes(v);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** 쿼리스트링 키 순서. 고정해 두면 같은 필터는 항상 같은 URL(= 같은 캐시 키)이 된다. */
const KEYS = ["team", "opponent", "venue", "result", "status", "from", "to"] as const;

/**
 * URL → 필터. URL 은 사용자가 직접 고칠 수 있는 외부 입력이라 모르는 값은 버린다.
 * 조합 규칙(team 없는 opponent 등)도 여기서 정리해, 화면이 말이 안 되는 상태를 갖지 않게 한다.
 */
export function parseGameFilter(params: URLSearchParams): GameFilter {
  const f: GameFilter = {};
  const team = params.get("team");
  const opponent = params.get("opponent");
  const venue = params.get("venue");
  const result = params.get("result");
  const status = params.get("status");
  const from = params.get("from");
  const to = params.get("to");

  if (isTeamId(team)) f.team = team;
  if (isTeamId(opponent)) f.opponent = opponent;
  if (isOneOf(VENUES, venue)) f.venue = venue;
  if (isOneOf(GAME_RESULTS, result)) f.result = result;
  if (isOneOf(GAME_STATUSES, status)) f.status = status;
  if (from && DATE_RE.test(from)) f.from = from;
  if (to && DATE_RE.test(to)) f.to = to;

  return normalize(f);
}

/** 필터 → "?team=OB&..." (조건이 없으면 ""). */
export function toQueryString(filter: GameFilter): string {
  const params = new URLSearchParams();
  for (const key of KEYS) {
    const value = filter[key];
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * 조합 규칙 정리 — 백엔드 validate 가 거부할 상태를 미리 없앤다.
 * - team 이 없으면 team 관점 조건(opponent·venue·result)을 지운다.
 * - opponent 가 team 과 같으면 지운다.
 * - result 는 종료 경기에만 있으므로 status 를 따로 두지 않는다(아래 [Outcome] 참고).
 */
export function normalize(filter: GameFilter): GameFilter {
  const f = { ...filter };
  if (!f.team) {
    delete f.opponent;
    delete f.venue;
    delete f.result;
  } else if (f.opponent === f.team) {
    delete f.opponent;
  }
  if (f.result) delete f.status;
  return f;
}

export const hasAnyCondition = (filter: GameFilter): boolean =>
  KEYS.some((key) => filter[key] !== undefined);

/**
 * 화면의 "결과" 선택지 하나로 status 와 result 를 함께 다룬다.
 * 둘을 따로 고르게 하면 "예정 + 승리" 같은 불가능한 조합이 생기는데, 한 선택지로 합치면 구조적으로 막힌다.
 */
export type Outcome = "" | GameStatus | GameResult;

export const outcomeOf = (filter: GameFilter): Outcome => filter.result ?? filter.status ?? "";

export function withOutcome(filter: GameFilter, outcome: Outcome): GameFilter {
  const rest = { ...filter };
  delete rest.status;
  delete rest.result;
  if (isOneOf(GAME_STATUSES, outcome)) return { ...rest, status: outcome };
  if (isOneOf(GAME_RESULTS, outcome)) return normalize({ ...rest, result: outcome });
  return rest;
}

/** team 관점의 경기 결과. 예정 경기거나 team 이 뛰지 않은 경기면 null. */
export function resultFor(game: Game, team: TeamId): GameResult | null {
  if (game.status !== "FINAL" || game.homeScore == null || game.awayScore == null) return null;
  const isHome = game.homeTeamId === team;
  if (!isHome && game.awayTeamId !== team) return null;
  const mine = isHome ? game.homeScore : game.awayScore;
  const theirs = isHome ? game.awayScore : game.homeScore;
  if (mine > theirs) return "WIN";
  if (mine < theirs) return "LOSS";
  return "DRAW";
}
