const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

export interface TeamStanding {
  teamId: string;
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
  teamId: string;
  name: string;
  playoffProb: number;
  championshipProb: number;
}

export interface Game {
  id: number;
  gameDate: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "FINAL";
}

export interface Prediction {
  home: string;
  away: string;
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
export const getPrediction = (home: string, away: string) =>
  get<Prediction>(`/api/predict?home=${home}&away=${away}`);
