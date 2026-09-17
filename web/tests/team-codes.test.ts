import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TEAMS } from "@/lib/teams";

/**
 * 프론트 팀 코드 ↔ 백엔드 team 시드의 계약.
 *
 * 프론트는 팀 코드를 리터럴 유니온(`TeamId`)으로 좁혀 쓰므로, 백엔드가 코드를 바꾸거나 구단이
 * 추가되면 **타입은 통과하는데** URL 필터가 그 팀을 모르는 값으로 버리고 이름도 코드로만 뜬다.
 * 두 쪽이 한 레포에 있으니 마이그레이션을 직접 읽어 대조한다.
 */

const MIGRATIONS = join(process.cwd(), "../src/main/resources/db/migration");

function seededTeams(): Record<string, string> {
  const sql = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith(".sql"))
    .map((f) => readFileSync(join(MIGRATIONS, f), "utf-8"))
    .join("\n");
  const insert = /INSERT INTO team\s*\(id, name\)\s*VALUES([\s\S]*?);/g;
  const teams: Record<string, string> = {};
  for (const [, values] of sql.matchAll(insert)) {
    for (const [, id, name] of values.matchAll(/\('([^']+)',\s*'([^']+)'\)/g)) teams[id] = name;
  }
  return teams;
}

describe("TEAM 003: 프론트 팀 목록은 백엔드 시드와 같다", () => {
  const seeded = seededTeams();

  it("시드를 실제로 읽었다 — 정규식이 빗나가면 아래 비교가 빈 것끼리 통과한다", () => {
    expect(Object.keys(seeded).length).toBeGreaterThanOrEqual(10);
  });

  it("코드와 이름이 일치한다", () => {
    const front = Object.fromEntries(Object.entries(TEAMS).map(([id, meta]) => [id, meta.name]));
    expect(front).toEqual(seeded);
  });
});
