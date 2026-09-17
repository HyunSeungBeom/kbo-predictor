"use client";

import { useQuery } from "@tanstack/react-query";
import { getStandings } from "../api/standingsApi";
import { standingsKeys } from "../api/keys";

export function useStandings() {
  return useQuery({ queryKey: standingsKeys.all, queryFn: getStandings });
}
