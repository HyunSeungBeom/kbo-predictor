import { isTeamId } from "@/lib/teams";
import { normalize } from "./filter";
import { GAME_FILTER_KEYS, isGameResult, isGameStatus, isVenue, type GameFilter } from "./types";

/**
 * URL 쿼리 ↔ 필터 — 순수 함수만 둔다. 라우터를 상대하는 부분은 `hooks/useGameFilter` 에 있다.
 * 갈라 둔 이유는 이쪽이 라우터 없이 검사되기 때문이다 — 링크가 조용히 다른 목록을 여는 종류의
 * 버그는 여기서 잡힌다.
 */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * URL → 필터. URL 은 사용자가 직접 고칠 수 있는 외부 입력이라 모르는 값은 버린다.
 * 조합 규칙도 여기서 정리해, 화면이 말이 안 되는 상태를 갖지 않게 한다.
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
  if (isVenue(venue)) f.venue = venue;
  if (isGameResult(result)) f.result = result;
  if (isGameStatus(status)) f.status = status;
  if (from && DATE_RE.test(from)) f.from = from;
  if (to && DATE_RE.test(to)) f.to = to;

  return normalize(f);
}

/** 필터 → "?team=OB&..." (조건이 없으면 ""). */
export function toQueryString(filter: GameFilter): string {
  const params = new URLSearchParams();
  for (const key of GAME_FILTER_KEYS) {
    const value = filter[key];
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
