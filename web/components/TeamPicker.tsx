"use client";

import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { TEAM_IDS, isTeamId, teamName } from "@/lib/teams";

export default function TeamPicker() {
  const { team, setTeam } = useFavoriteTeam();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">내 팀</span>
      <select
        value={team ?? ""}
        // select 의 value 는 string 이라 TeamId 로 좁혀서 넘긴다("선택 안 함" = "" → null)
        onChange={(e) => setTeam(isTeamId(e.target.value) ? e.target.value : null)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1"
      >
        <option value="">선택 안 함</option>
        {TEAM_IDS.map((id) => (
          <option key={id} value={id}>
            {teamName(id)}
          </option>
        ))}
      </select>
    </label>
  );
}
