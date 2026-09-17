import { get } from "@/lib/api";
import { toQueryString } from "../model/urlFilter";
import type { Game, GameFilter } from "../model/types";

/** 조건 검색. `GET /api/games?team=OB&...` */
export const getGames = (filter: GameFilter) => get<Game[]>(`/api/games${toQueryString(filter)}`);
