"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getSchedule } from "@/lib/api";
import { teamName } from "@/lib/teams";
import Card from "./Card";

export default function ScheduleList() {
  const [date, setDate] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["schedule", date],
    queryFn: () => getSchedule(date || undefined),
  });

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">경기 일정</h2>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      {isLoading && <p className="text-sm text-slate-500">불러오는 중…</p>}
      {error && <p className="text-sm text-red-600">일정을 불러오지 못했어요.</p>}
      {data && data.length === 0 && <p className="text-sm text-slate-500">경기가 없어요.</p>}
      {data && data.length > 0 && (
        <ul className="divide-y divide-slate-100">
          {data.map((g) => (
            <li key={g.id} className="flex items-center gap-2 py-2 text-sm">
              <span className="w-24 text-slate-500 tabular-nums">{g.gameDate}</span>
              <span className="flex-1 text-right">{teamName(g.homeTeamId)}</span>
              <span className="w-16 text-center font-medium tabular-nums">
                {g.status === "FINAL" ? `${g.homeScore} : ${g.awayScore}` : "vs"}
              </span>
              <span className="flex-1">{teamName(g.awayTeamId)}</span>
              <span
                className={`w-12 text-right text-xs ${
                  g.status === "FINAL" ? "text-slate-400" : "text-emerald-600"
                }`}
              >
                {g.status === "FINAL" ? "종료" : "예정"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
