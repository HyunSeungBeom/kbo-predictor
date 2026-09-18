import type { StarterRecord, StarterView } from "./types";

/**
 * 선발 기록을 화면 문구로 — **표본 수를 반드시 같이 보여준다.**
 * "10승 12패" 만 보면 12등판인지 26등판인지 알 수 없고, 적은 표본을 실력으로 읽게 된다.
 */
export function starterSummary(starter: StarterView): string {
  if (!starter.name) return "선발 미발표";
  if (starter.firstStart) return "첫 선발 — 팀 평균으로 계산";

  const record = `${starter.wins}승 ${starter.losses}패${starter.draws > 0 ? ` ${starter.draws}무` : ""}`;
  return `등판 ${starter.starts}경기 · 팀 ${record}`;
}

/** 표본이 적어 참고만 해야 하는 구간. */
export const SMALL_SAMPLE = 5;

export const isSmallSample = (starter: StarterView): boolean =>
  !starter.firstStart && starter.starts < SMALL_SAMPLE;

/** "LG 상대 2등판 1승 1패" — 표본이 극히 작아 확률에는 넣지 않는다(표시용). */
export function vsOpponentSummary(record: StarterRecord | null, opponentName: string): string | null {
  if (!record || record.starts === 0) return null;
  const draws = record.draws > 0 ? ` ${record.draws}무` : "";
  return `${opponentName} 상대 ${record.starts}등판 ${record.wins}승 ${record.losses}패${draws}`;
}

/** 확률 막대의 접근성 이름. 스크린 리더는 막대를 못 읽으므로 문장으로 준다. */
export const probabilityLabel = (homeName: string, homeProb: number, awayName: string): string =>
  `${homeName} ${percent(homeProb)}, ${awayName} ${percent(1 - homeProb)}`;

export const percent = (prob: number): string => `${Math.round(prob * 1000) / 10}%`;
