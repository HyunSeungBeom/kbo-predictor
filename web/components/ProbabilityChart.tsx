"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { getSimulation } from "@/lib/api";
import { teamColor, teamName, type TeamId } from "@/lib/teams";
import Card from "./Card";

/** 차트에 실제로 들어가는 행 모양. 익명 객체로 두면 dataKey 오타를 잡을 근거가 없다. */
interface ChampDatum {
  teamId: TeamId;
  name: string;
  champ: number;
}

// recharts 의 Tooltip 은 제네릭 컴포넌트가 아니라서 formatter 인자가
// number | string | ReadonlyArray<number|string> | undefined 로 고정이다.
// 우리 값(champ)은 항상 number 이므로 여기서 한 번 좁히고 나머지는 방어적으로 처리한다.
type TooltipValue = number | string | ReadonlyArray<number | string>;
const formatPercent = (value: TooltipValue | undefined): string =>
  typeof value === "number" ? `${value}%` : "-";

export default function ProbabilityChart() {
  const { team } = useFavoriteTeam();
  const { data, isLoading, error } = useQuery({
    queryKey: ["simulation"],
    queryFn: () => getSimulation(10000),
  });

  return (
    <Card>
      <h2 className="text-base font-semibold">우승 확률</h2>
      <p className="mb-3 text-xs text-slate-500">몬테카를로 10,000회 시뮬레이션</p>
      {isLoading && <p className="text-sm text-slate-500">계산 중…</p>}
      {error && <p className="text-sm text-red-600">확률을 불러오지 못했어요.</p>}
      {data && (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            data={data.map<ChampDatum>((d) => ({
              teamId: d.teamId,
              name: teamName(d.teamId),
              champ: Number((d.championshipProb * 100).toFixed(1)),
            }))}
            layout="vertical"
            margin={{ left: 8, right: 24 }}
          >
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" width={92} tick={{ fontSize: 12 }} />
            <Tooltip formatter={formatPercent} />
            <Bar dataKey="champ" radius={[0, 4, 4, 0]}>
              {data.map((d) => (
                <Cell
                  key={d.teamId}
                  fill={teamColor(d.teamId)}
                  fillOpacity={team && d.teamId !== team ? 0.3 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
