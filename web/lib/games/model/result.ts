import type { TeamId } from "@/lib/teams";
import type { Game, GameResult } from "./types";

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

export type GameRecord = Record<GameResult, number>;

/** 경기 목록에서 team 의 승·패·무를 센다. 결과가 없는 경기(예정·무관)는 세지 않는다. */
export function recordOf(games: readonly Game[], team: TeamId): GameRecord {
  const record: GameRecord = { WIN: 0, LOSS: 0, DRAW: 0 };
  for (const game of games) {
    const result = resultFor(game, team);
    if (result) record[result] += 1;
  }
  return record;
}
