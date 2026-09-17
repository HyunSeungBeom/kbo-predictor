"use client";

import { useQuery } from "@tanstack/react-query";
import type { TeamId } from "@/lib/teams";
import { predictionKeys } from "../api/keys";
import { getPrediction } from "../api/predictionApi";

/** 팀을 고르는 동안에는 부르지 않고, [예측] 버튼이 `refetch` 할 때만 부른다. */
export function usePrediction(home: TeamId, away: TeamId) {
  return useQuery({
    queryKey: predictionKeys.matchup(home, away),
    queryFn: () => getPrediction(home, away),
    enabled: false,
  });
}
