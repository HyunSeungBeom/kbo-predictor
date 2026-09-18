"use client";

import Link from "next/link";
import { TEAM_IDS, TeamLogo, teamName } from "@/lib/teams";
import { useFavoriteTeam } from "@/lib/teams";

/** 팀별 게시판 목록. 내 팀을 골라 뒀으면 맨 위에 따로 보여준다. */
export function BoardList() {
  const { team } = useFavoriteTeam();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold">팬 게시판</h1>

      {team && (
        <Link
          href={`/board/${team}`}
          className="flex items-center gap-2 rounded-xl border border-slate-900 bg-white p-4 text-sm font-semibold"
        >
          <TeamLogo teamId={team} size={24} />
          {teamName(team)} 게시판 <span className="text-xs font-normal text-slate-500">내 팀</span>
        </Link>
      )}

      <ul className="grid gap-3 sm:grid-cols-2">
        {TEAM_IDS.filter((id) => id !== team).map((id) => (
          <li key={id}>
            <Link
              href={`/board/${id}`}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm hover:border-slate-400"
            >
              <TeamLogo teamId={id} size={24} />
              {teamName(id)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
