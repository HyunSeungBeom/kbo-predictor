import { describe, expect, it } from "vitest";
import { TEAM_IDS, isTeamId, teamColor, teamName } from "..";

describe("TEAM 001: 외부 문자열을 팀 코드로 좁힌다", () => {
  it("알려진 코드만 통과한다", () => {
    expect(isTeamId("OB")).toBe(true);
    expect(TEAM_IDS.every(isTeamId)).toBe(true);
  });

  it.each([null, undefined, "", "ob", "XX", "toString"])("%s 는 팀 코드가 아니다", (value) => {
    /* "toString" — `id in TEAMS` 가 프로토타입 체인까지 보면 통과해 버리는 자리다 */
    expect(isTeamId(value)).toBe(false);
  });
});

describe("TEAM 002: 모르는 코드도 화면을 깨지 않는다", () => {
  it("이름은 코드를 그대로, 색은 기본색을 준다 — 신생 구단이 먼저 내려와도 목록이 그려진다", () => {
    expect(teamName("OB")).toBe("두산 베어스");
    expect(teamName("NEW")).toBe("NEW");
    expect(teamColor("NEW")).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
