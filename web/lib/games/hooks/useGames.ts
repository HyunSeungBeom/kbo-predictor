"use client";

import { useQuery } from "@tanstack/react-query";
import { getGames } from "../api/gamesApi";
import { gameKeys } from "../api/keys";
import type { GameFilter } from "../model/types";

export function useGames(filter: GameFilter) {
  return useQuery({
    queryKey: gameKeys.list(filter),
    queryFn: () => getGames(filter),
  });
}
