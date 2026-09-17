"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { ApiError, getGames } from "@/lib/api";
import {
  parseGameFilter,
  resultFor,
  toQueryString,
  type GameFilter,
  type GameResult,
} from "@/lib/gameFilter";
import { teamName } from "@/lib/teams";
import Card from "./Card";
import GameFilterBar from "./GameFilterBar";

const RESULT_BADGE: Record<GameResult, { label: string; className: string }> = {
  WIN: { label: "승", className: "text-blue-600" },
  LOSS: { label: "패", className: "text-red-600" },
  DRAW: { label: "무", className: "text-slate-500" },
};

/**
 * 경기 일정 + 조건 검색. 필터의 원천은 URL 쿼리스트링이다.
 * - 새로고침·뒤로가기·링크 공유에도 같은 검색 결과가 유지된다.
 * - 이후 자연어 검색은 "문장 → 필터 → URL" 로 이 화면을 그대로 재사용한다.
 */
export default function ScheduleList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(() => parseGameFilter(searchParams), [searchParams]);
  const qs = toQueryString(filter);

  // 조건을 바꿀 때마다 히스토리가 쌓이지 않도록 push 대신 replace.
  const setFilter = (next: GameFilter) =>
    router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ["games", qs],
    queryFn: () => getGames(filter),
  });

  const record = useMemo(() => {
    if (!data || !filter.team) return null;
    const team = filter.team;
    const counts = { WIN: 0, LOSS: 0, DRAW: 0 };
    for (const g of data) {
      const r = resultFor(g, team);
      if (r) counts[r] += 1;
    }
    return counts;
  }, [data, filter.team]);

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold">경기 일정</h2>

      <div className="mb-4 border-b border-slate-100 pb-4">
        <GameFilterBar filter={filter} onChange={setFilter} />
      </div>

      {isLoading && <p className="text-sm text-slate-500">불러오는 중…</p>}

      {error && (
        <div className="text-sm text-red-600">
          {error instanceof ApiError && error.errors.length > 0 ? (
            <>
              <p>검색 조건을 확인해 주세요.</p>
              <ul className="mt-1 list-inside list-disc">
                {error.errors.map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>일정을 불러오지 못했어요. 백엔드가 켜져 있나요?</p>
          )}
        </div>
      )}

      {data && (
        <p className="mb-2 text-xs text-slate-500">
          {data.length}경기
          {record && filter.team && (
            <>
              {" · "}
              {teamName(filter.team)} {record.WIN}승 {record.LOSS}패 {record.DRAW}무
            </>
          )}
        </p>
      )}

      {data && data.length === 0 && <p className="text-sm text-slate-500">조건에 맞는 경기가 없어요.</p>}

      {data && data.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {data.map((g) => {
            const result = filter.team ? resultFor(g, filter.team) : null;
            const badge = result
              ? RESULT_BADGE[result]
              : g.status === "FINAL"
                ? { label: "종료", className: "text-slate-400" }
                : { label: "예정", className: "text-emerald-600" };
            return (
              <li key={g.id} className="flex items-center gap-2 py-2 text-sm">
                <span className="w-24 text-slate-500 tabular-nums">{g.gameDate}</span>
                <span
                  className={`flex-1 text-right ${g.homeTeamId === filter.team ? "font-semibold" : ""}`}
                >
                  {teamName(g.homeTeamId)}
                </span>
                <span className="w-16 text-center font-medium tabular-nums">
                  {g.status === "FINAL" ? `${g.homeScore} : ${g.awayScore}` : "vs"}
                </span>
                <span className={`flex-1 ${g.awayTeamId === filter.team ? "font-semibold" : ""}`}>
                  {teamName(g.awayTeamId)}
                </span>
                <span className={`w-12 text-right text-xs font-medium ${badge.className}`}>
                  {badge.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
