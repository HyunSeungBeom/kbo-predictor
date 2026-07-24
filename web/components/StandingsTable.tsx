"use client";

import { useQuery } from "@tanstack/react-query";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { getStandings } from "@/lib/api";
import { teamName } from "@/lib/teams";
import Card from "./Card";

export default function StandingsTable() {
  const { team } = useFavoriteTeam();
  const { data, isLoading, error } = useQuery({ queryKey: ["standings"], queryFn: getStandings });

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold">순위</h2>
      {isLoading && <p className="text-sm text-slate-500">불러오는 중…</p>}
      {error && (
        <p className="text-sm text-red-600">순위를 불러오지 못했어요. 백엔드가 켜져 있나요?</p>
      )}
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1 pr-2 font-medium">#</th>
                <th className="font-medium">팀</th>
                <th className="px-2 text-right font-medium">승</th>
                <th className="px-2 text-right font-medium">패</th>
                <th className="px-2 text-right font-medium">무</th>
                <th className="px-2 text-right font-medium">승률</th>
                <th className="pl-2 text-right font-medium">게임차</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr
                  key={r.teamId}
                  className={`border-t border-slate-100 ${
                    r.teamId === team ? "bg-amber-50 font-semibold" : ""
                  }`}
                >
                  <td className="py-1.5 pr-2 tabular-nums">{r.rank}</td>
                  <td>{teamName(r.teamId)}</td>
                  <td className="px-2 text-right tabular-nums">{r.wins}</td>
                  <td className="px-2 text-right tabular-nums">{r.losses}</td>
                  <td className="px-2 text-right tabular-nums">{r.draws}</td>
                  <td className="px-2 text-right tabular-nums">{r.winPct.toFixed(3)}</td>
                  <td className="pl-2 text-right tabular-nums">{r.gamesBehind.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
