"use client";

import { useId } from "react";
import { TEAM_IDS, isTeamId, teamName } from "@/lib/teams";
import { hasAnyCondition, normalize, outcomeOf, withOutcome, type Outcome } from "../model/filter";
import type { GameFilter, Venue } from "../model/types";

const OUTCOME_OPTIONS: { value: Outcome; label: string; needsTeam: boolean }[] = [
  { value: "", label: "전체", needsTeam: false },
  { value: "SCHEDULED", label: "예정", needsTeam: false },
  { value: "FINAL", label: "종료", needsTeam: false },
  { value: "WIN", label: "승", needsTeam: true },
  { value: "LOSS", label: "패", needsTeam: true },
  { value: "DRAW", label: "무", needsTeam: true },
];

const VENUE_OPTIONS: { value: Venue | undefined; label: string }[] = [
  { value: undefined, label: "전체" },
  { value: "HOME", label: "홈" },
  { value: "AWAY", label: "원정" },
];

const isOutcome = (v: string): v is Outcome => OUTCOME_OPTIONS.some((o) => o.value === v);

const fieldClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

/** 입력 하나에 붙는 이름. `<label>` 로 감싸 이름과 입력을 연결한다 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      {label}
      {children}
    </label>
  );
}

/**
 * 버튼 여러 개에 붙는 이름. `<label>` 로 감싸면 안 된다 — label 은 첫 번째 버튼 하나에만 연결돼서
 * 그 버튼 이름이 "홈/원정 홈 원정" 으로 읽히고, **이름 글자를 누르면 그 버튼이 눌려 선택이 풀린다.**
 */
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1 text-xs text-slate-500">
      <span id={id}>{label}</span>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  );
}

export function GameFilterBar({
  filter,
  onChange,
}: {
  filter: GameFilter;
  onChange: (next: GameFilter) => void;
}) {
  // 모든 변경은 normalize 를 거친다 — 팀을 지우면 그 팀 관점 조건도 같이 사라지도록.
  const update = (patch: Partial<GameFilter>) => onChange(normalize({ ...filter, ...patch }));
  const noTeam = !filter.team;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Field label="팀">
        <select
          value={filter.team ?? ""}
          onChange={(e) => update({ team: isTeamId(e.target.value) ? e.target.value : undefined })}
          className={fieldClass}
        >
          <option value="">전체 팀</option>
          {TEAM_IDS.map((id) => (
            <option key={id} value={id}>
              {teamName(id)}
            </option>
          ))}
        </select>
      </Field>

      <Field label="상대팀">
        <select
          value={filter.opponent ?? ""}
          disabled={noTeam}
          onChange={(e) =>
            update({ opponent: isTeamId(e.target.value) ? e.target.value : undefined })
          }
          className={fieldClass}
        >
          <option value="">전체</option>
          {TEAM_IDS.filter((id) => id !== filter.team).map((id) => (
            <option key={id} value={id}>
              {teamName(id)}
            </option>
          ))}
        </select>
      </Field>

      <FieldGroup label="홈/원정">
        <div className="flex overflow-hidden rounded-md border border-slate-300 text-sm">
          {VENUE_OPTIONS.map((o) => (
            <button
              key={o.label}
              type="button"
              disabled={noTeam}
              aria-pressed={filter.venue === o.value}
              onClick={() => update({ venue: o.value })}
              className={`px-3 py-1 disabled:cursor-not-allowed disabled:text-slate-400 ${
                filter.venue === o.value && !noTeam
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      <Field label="결과">
        <select
          value={outcomeOf(filter)}
          onChange={(e) => {
            if (isOutcome(e.target.value)) onChange(withOutcome(filter, e.target.value));
          }}
          className={fieldClass}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value} disabled={o.needsTeam && noTeam}>
              {o.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="시작일">
        <input
          type="date"
          value={filter.from ?? ""}
          max={filter.to}
          onChange={(e) => update({ from: e.target.value || undefined })}
          className={fieldClass}
        />
      </Field>

      <Field label="종료일">
        <input
          type="date"
          value={filter.to ?? ""}
          min={filter.from}
          onChange={(e) => update({ to: e.target.value || undefined })}
          className={fieldClass}
        />
      </Field>

      {hasAnyCondition(filter) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-sm text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          초기화
        </button>
      )}

      {/* 줄 전체(basis-full)를 차지하므로 맨 끝에 둬야 초기화 버튼이 입력칸과 같은 줄에 남는다. */}
      {noTeam && (
        <p className="basis-full text-xs text-slate-400">
          팀을 고르면 상대팀 · 홈/원정 · 승패 조건을 쓸 수 있어요.
        </p>
      )}
    </div>
  );
}
