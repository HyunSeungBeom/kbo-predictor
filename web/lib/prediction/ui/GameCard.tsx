"use client";

import { TeamLogo, teamName } from "@/lib/teams";
import {
  isSmallSample,
  percent,
  probabilityLabel,
  starterSummary,
  vsOpponentSummary,
} from "../model/summary";
import type { StarterView, TodayGame } from "../model/types";

/** 한 팀 열 — 팀명·확률·선발. */
function Side({
  teamId,
  opponentId,
  prob,
  starter,
  align,
}: {
  teamId: string;
  opponentId: string;
  prob: number;
  starter: StarterView;
  align: "left" | "right";
}) {
  const vs = vsOpponentSummary(starter.vsOpponent, teamName(opponentId));
  return (
    <div className={`min-w-0 flex-1 ${align === "right" ? "text-right" : ""}`}>
      <p
        className={`flex items-center gap-1.5 text-sm font-semibold break-keep ${
          align === "right" ? "justify-end" : ""
        }`}
      >
        <TeamLogo teamId={teamId} size={20} />
        {teamName(teamId)}
      </p>
      <p className="text-xl font-bold tabular-nums sm:text-2xl">{percent(prob)}</p>
      <p className="mt-1 text-sm">{starter.name ?? "선발 미발표"}</p>
      <p className="text-xs break-keep text-slate-500">
        {starterSummary(starter)}
        {isSmallSample(starter) && <span className="text-amber-600"> · 표본 적음</span>}
      </p>
      {vs && <p className="text-xs break-keep text-slate-400">{vs}</p>}
    </div>
  );
}

/**
 * 오늘 경기 한 건.
 *
 * 선발 기록은 **숫자와 표본 수를 글로** 보여준다 — 등판 2~3회짜리 기록을 막대나 차트로 그리면
 * 근거보다 커 보인다.
 */
export function GameCard({ game }: { game: TodayGame }) {
  const finished = game.status === "FINAL";
  const homeName = teamName(game.homeTeamId);
  const awayName = teamName(game.awayTeamId);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500">
        <span>
          {game.startTime ?? "시간 미정"}
          {game.stadium && ` · ${game.stadium}`}
        </span>
        {finished ? (
          <span className="font-medium text-slate-400">
            종료 {game.awayScore} : {game.homeScore}
          </span>
        ) : (
          <span className="font-medium text-emerald-600">예정</span>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 sm:gap-4">
        <Side
          teamId={game.awayTeamId}
          opponentId={game.homeTeamId}
          prob={game.awayWinProb}
          starter={game.away}
          align="left"
        />
        <span className="shrink-0 pt-6 text-xs text-slate-400">vs</span>
        <Side
          teamId={game.homeTeamId}
          opponentId={game.awayTeamId}
          prob={game.homeWinProb}
          starter={game.home}
          align="right"
        />
      </div>

      {/* 막대는 장식이 아니라 확률 비교라, 스크린 리더에는 문장으로 같은 정보를 준다 */}
      <div
        role="img"
        aria-label={`승리 확률 — ${probabilityLabel(homeName, game.homeWinProb, awayName)}`}
        className="mt-3 flex h-2 overflow-hidden rounded bg-slate-100"
      >
        <div className="bg-slate-300" style={{ width: `${game.awayWinProb * 100}%` }} />
        <div className="bg-slate-800" style={{ width: `${game.homeWinProb * 100}%` }} />
      </div>
      <p className="mt-1 text-right text-xs text-slate-400">홈 {homeName}</p>
    </li>
  );
}
