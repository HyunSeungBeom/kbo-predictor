import {
  GAME_FILTER_KEYS,
  isGameResult,
  isGameStatus,
  type GameFilter,
  type GameResult,
  type GameStatus,
} from "./types";

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
  GAME_FILTER_KEYS.some((key) => filter[key] !== undefined);

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
  if (isGameStatus(outcome)) return { ...rest, status: outcome };
  if (isGameResult(outcome)) return normalize({ ...rest, result: outcome });
  return rest;
}
