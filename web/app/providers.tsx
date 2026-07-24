"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "kbo:favoriteTeam";

type FavoriteTeam = { team: string | null; setTeam: (id: string | null) => void };
const FavoriteTeamContext = createContext<FavoriteTeam>({ team: null, setTeam: () => {} });

/** 내 팀(응원팀)을 앱 전역에서 공유 — localStorage 영속. */
export const useFavoriteTeam = () => useContext(FavoriteTeamContext);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
      }),
  );

  const [team, setTeamState] = useState<string | null>(null);
  useEffect(() => {
    setTeamState(localStorage.getItem(STORAGE_KEY));
  }, []);

  const setTeam = (id: string | null) => {
    setTeamState(id);
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <QueryClientProvider client={client}>
      <FavoriteTeamContext.Provider value={{ team, setTeam }}>
        {children}
      </FavoriteTeamContext.Provider>
    </QueryClientProvider>
  );
}
