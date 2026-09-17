"use client";

import { useQuery } from "@tanstack/react-query";
import { getSimulation } from "../api/simulationApi";
import { simulationKeys } from "../api/keys";

export const DEFAULT_ITERATIONS = 10_000;

export function useSimulation(iterations = DEFAULT_ITERATIONS) {
  return useQuery({
    queryKey: simulationKeys.result(iterations),
    queryFn: () => getSimulation(iterations),
  });
}
