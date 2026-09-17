import type { TeamId } from "@/lib/teams";

/** queryKey 팩토리 — 리터럴 배열을 흩뿌리지 않는다. */
export const predictionKeys = {
  all: ["prediction"] as const,
  matchup: (home: TeamId, away: TeamId) => [...predictionKeys.all, home, away] as const,
};
