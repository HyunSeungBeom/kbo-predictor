"use client";

import { useQuery } from "@tanstack/react-query";
import { predictionKeys } from "../api/keys";
import { getTodayGames } from "../api/todayApi";

export function useTodayGames(date?: string) {
  return useQuery({
    queryKey: predictionKeys.today(date),
    queryFn: () => getTodayGames(date),
  });
}
