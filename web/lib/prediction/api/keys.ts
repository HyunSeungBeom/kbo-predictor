import type { TeamId } from "@/lib/teams";

/** queryKey 팩토리 — 리터럴 배열을 흩뿌리지 않는다. */
export const predictionKeys = {
  all: ["prediction"] as const,
  matchup: (home: TeamId, away: TeamId) => [...predictionKeys.all, home, away] as const,
  /** 날짜별 오늘 경기. date 가 없으면 서버가 정하는 "오늘"이라 키도 그 상태를 그대로 둔다. */
  today: (date?: string) => [...predictionKeys.all, "today", date ?? null] as const,
};
