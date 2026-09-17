import type { TeamId } from "./teams";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

// 팀 코드는 우리 백엔드(team 테이블)에서만 오므로 TeamId 로 좁혀 쓴다.
// 표시 헬퍼(teamName/teamColor)는 여전히 string 을 받아 모르는 코드도 안전하게 처리한다.

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

export interface SimulationResult {
  teamId: TeamId;
  name: string;
  playoffProb: number;
  championshipProb: number;
}

export interface Game {
  id: number;
  gameDate: string;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "FINAL";
}

export interface Prediction {
  home: TeamId;
  away: TeamId;
  homeWinProb: number;
  awayWinProb: number;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return (await res.json()) as T;
}

export const getStandings = () => get<TeamStanding[]>("/api/standings");
export const getSimulation = (iterations = 10000) =>
  get<SimulationResult[]>(`/api/simulation?iterations=${iterations}`);
export const getSchedule = (date?: string) =>
  get<Game[]>(`/api/schedule${date ? `?date=${date}` : ""}`);
export const getPrediction = (home: TeamId, away: TeamId) =>
  get<Prediction>(`/api/predict?home=${home}&away=${away}`);
