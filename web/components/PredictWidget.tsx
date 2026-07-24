"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPrediction } from "@/lib/api";
import { TEAM_IDS, teamName } from "@/lib/teams";
import Card from "./Card";

function ProbBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="tabular-nums">{(pct * 100).toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded bg-slate-100">
        <div className="h-2 rounded bg-slate-800" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

export default function PredictWidget() {
  const [home, setHome] = useState("OB");
  const [away, setAway] = useState("LG");
  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ["predict", home, away],
    queryFn: () => getPrediction(home, away),
    enabled: false,
  });

  const teamSelect = (value: string, onChange: (v: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm"
    >
      {TEAM_IDS.map((id) => (
        <option key={id} value={id}>
          {teamName(id)}
        </option>
      ))}
    </select>
  );

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold">오늘 경기 예측</h2>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-slate-500">홈</span>
        {teamSelect(home, setHome)}
        <span className="text-slate-400">vs</span>
        <span className="text-slate-500">원정</span>
        {teamSelect(away, setAway)}
        <button
          onClick={() => refetch()}
          disabled={home === away || isFetching}
          className="rounded-md bg-slate-900 px-3 py-1 text-white disabled:opacity-40"
        >
          {isFetching ? "계산 중…" : "예측"}
        </button>
      </div>
      {home === away && (
        <p className="mt-2 text-xs text-amber-600">서로 다른 팀을 골라주세요.</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">예측을 불러오지 못했어요.</p>}
      {data && (
        <div className="mt-4 max-w-md">
          <ProbBar label={`${teamName(data.home)} (홈)`} pct={data.homeWinProb} />
          <ProbBar label={`${teamName(data.away)} (원정)`} pct={data.awayWinProb} />
        </div>
      )}
    </Card>
  );
}
