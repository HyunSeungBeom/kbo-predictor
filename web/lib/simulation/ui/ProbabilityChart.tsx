"use client";

import { Bar, BarChart, Cell, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ds";
import { teamColor, useFavoriteTeam } from "@/lib/teams";
import { useSimulation } from "../hooks/useSimulation";
import { toProbabilityRows } from "../model/chart";

// recharts 의 Tooltip 은 제네릭 컴포넌트가 아니라서 formatter 인자가
// number | string | ReadonlyArray<number|string> | undefined 로 고정이다.
// 우리 값(champ)은 항상 number 이므로 여기서 한 번 좁히고 나머지는 방어적으로 처리한다.
type TooltipValue = number | string | ReadonlyArray<number | string>;
const formatPercent = (value: TooltipValue | undefined): string =>
  typeof value === "number" ? `${value}%` : "-";

export function ProbabilityChart() {
  const { team } = useFavoriteTeam();
  const { data, isLoading, error } = useSimulation();
  const rows = data ? toProbabilityRows(data) : [];

  /* 내 팀을 골랐으면 그 팀만 진하게 — 10팀이 전부 진하면 어디를 볼지 알 수 없다 */
  const opacityOf = (teamId: string, base: number) => (team && teamId !== team ? base * 0.35 : base);

  return (
    <Card>
      <h2 className="text-base font-semibold">가을야구 진출 · 우승 확률</h2>
      <p className="mb-3 text-xs text-slate-500">남은 경기를 몬테카를로 10,000회 시뮬레이션</p>
      {isLoading && <p className="text-sm text-slate-500">계산 중…</p>}
      {error && <p className="text-sm text-red-600">확률을 불러오지 못했어요.</p>}
      {data && (
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24 }} barGap={2}>
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatPercent} />
            <Legend verticalAlign="top" height={28} iconType="square" wrapperStyle={{ fontSize: 12 }} />
            {/* 진출은 연하게, 우승은 진하게 — 우승은 진출의 부분집합이라 같은 색의 농도로 구분한다 */}
            <Bar dataKey="playoff" name="가을야구 진출" radius={[0, 4, 4, 0]} barSize={10}>
              {rows.map((r) => (
                <Cell key={r.teamId} fill={teamColor(r.teamId)} fillOpacity={opacityOf(r.teamId, 0.35)} />
              ))}
            </Bar>
            <Bar dataKey="champ" name="우승" radius={[0, 4, 4, 0]} barSize={10}>
              {rows.map((r) => (
                <Cell key={r.teamId} fill={teamColor(r.teamId)} fillOpacity={opacityOf(r.teamId, 1)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
