import { get } from "@/lib/api";
import type { TeamStanding } from "../model/types";

/** 현재 순위표. `GET /api/standings` */
export const getStandings = () => get<TeamStanding[]>("/api/standings");
