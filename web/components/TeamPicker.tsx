"use client";

import { useFavoriteTeam } from "@/lib/useFavoriteTeam";
import { TEAM_IDS, teamName } from "@/lib/teams";

export default function TeamPicker() {
  const { team, setTeam } = useFavoriteTeam();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">내 팀</span>
      <select
        value={team ?? ""}
        onChange={(e) => setTeam(e.target.value || null)}
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
