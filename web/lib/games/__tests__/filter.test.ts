import { describe, expect, it } from "vitest";
import {
  hasAnyCondition,
  normalize,
  outcomeOf,
  parseGameFilter,
  recordOf,
  resultFor,
  toQueryString,
  withOutcome,
  type Game,
} from "..";

/**
 * 일정 화면의 필터 규칙. 화면은 이 함수들로 URL 을 읽고 쓰므로, 여기가 틀리면
 * **공유한 링크가 에러 없이 다른 목록을 연다** — 건수만 조용히 어긋나는 종류라 눈으로 못 잡는다.
 */

const q = (s: string) => new URLSearchParams(s);

describe("URL 001: 주소 → 필터 → 주소 왕복", () => {
  it("모든 조건이 그대로 되돌아온다", () => {
    const qs = "?team=OB&opponent=LG&venue=HOME&result=WIN&from=2026-08-01&to=2026-08-31";
    expect(toQueryString(parseGameFilter(q(qs)))).toBe(qs);
  });

  it("조건이 없으면 빈 문자열이다 — 기본 주소는 ?도 붙지 않는다", () => {
    expect(toQueryString({})).toBe("");
    expect(hasAnyCondition(parseGameFilter(q("")))).toBe(false);
  });

  it("키 순서가 고정된다 — 같은 필터는 같은 주소(= 같은 캐시 키)가 된다", () => {
    expect(toQueryString(parseGameFilter(q("to=2026-08-31&team=OB")))).toBe("?team=OB&to=2026-08-31");
  });
});

describe("URL 002: 주소는 외부 입력이다 — 모르는 값은 버린다", () => {
  it.each([
    ["없는 팀 코드", "team=XX"],
    ["소문자 팀 코드", "team=ob"],
    ["없는 홈/원정", "venue=NEUTRAL"],
    ["없는 결과", "result=MAYBE"],
    ["없는 상태", "status=LIVE"],
    ["날짜 형식이 아님", "from=8월&to=2026/08/31"],
  ])("%s", (_, search) => {
    expect(parseGameFilter(q(search))).toEqual({});
  });
});

describe("NRM 001: 팀 관점 조건은 팀이 있어야 산다", () => {
  it("주소에 팀 없이 상대·홈/원정·승패가 오면 지운다 — 백엔드가 400 으로 거부하는 조합이다", () => {
    expect(parseGameFilter(q("opponent=LG&venue=HOME&result=WIN&status=FINAL"))).toEqual({ status: "FINAL" });
  });

  it("팀을 지우면 딸린 조건도 같이 지운다", () => {
    expect(normalize({ opponent: "LG", venue: "AWAY", result: "LOSS", from: "2026-08-01" })).toEqual({
      from: "2026-08-01",
    });
  });

  it("자기 자신을 상대로 고를 수 없다", () => {
    expect(normalize({ team: "OB", opponent: "OB" })).toEqual({ team: "OB" });
  });

  it("승패가 있으면 상태를 따로 두지 않는다 — 승패는 종료 경기에만 있다", () => {
    expect(parseGameFilter(q("team=OB&result=WIN&status=SCHEDULED"))).toEqual({ team: "OB", result: "WIN" });
  });

  it("원본을 바꾸지 않는다", () => {
    const original = { team: "OB", opponent: "OB" } as const;
    normalize(original);
    expect(original).toEqual({ team: "OB", opponent: "OB" });
  });
});

describe("OUT 001: 「결과」 선택지 하나가 상태와 승패를 함께 다룬다", () => {
  it("현재 필터에서 선택지를 읽는다 — 승패가 상태보다 우선한다", () => {
    expect(outcomeOf({ team: "OB", result: "DRAW" })).toBe("DRAW");
    expect(outcomeOf({ status: "SCHEDULED" })).toBe("SCHEDULED");
    expect(outcomeOf({})).toBe("");
  });

  it("승패 → 예정으로 바꾸면 승패가 사라진다", () => {
    expect(withOutcome({ team: "OB", result: "WIN" }, "SCHEDULED")).toEqual({ team: "OB", status: "SCHEDULED" });
  });

  it("종료 → 패로 바꾸면 상태가 사라진다", () => {
    expect(withOutcome({ team: "OB", status: "FINAL" }, "LOSS")).toEqual({ team: "OB", result: "LOSS" });
  });

  it("팀이 없으면 승패를 고를 수 없다", () => {
    expect(withOutcome({ status: "FINAL" }, "WIN")).toEqual({});
  });

  it("전체를 고르면 둘 다 사라지고 나머지는 남는다", () => {
    expect(withOutcome({ team: "OB", status: "FINAL", from: "2026-09-01" }, "")).toEqual({
      team: "OB",
      from: "2026-09-01",
    });
  });
});

describe("RES 001: 승패는 고른 팀 기준이다", () => {
  const game: Game = {
    id: 1,
    gameDate: "2026-08-01",
    homeTeamId: "OB",
    awayTeamId: "LG",
    homeScore: 5,
    awayScore: 3,
    status: "FINAL",
  };

  it("같은 경기도 팀에 따라 승패가 반대다", () => {
    expect(resultFor(game, "OB")).toBe("WIN");
    expect(resultFor(game, "LG")).toBe("LOSS");
  });

  it("동점은 무승부다", () => {
    expect(resultFor({ ...game, awayScore: 5 }, "LG")).toBe("DRAW");
  });

  it("그 팀이 뛰지 않은 경기는 결과가 없다", () => {
    expect(resultFor(game, "HH")).toBeNull();
  });

  it("예정 경기는 결과가 없다", () => {
    expect(resultFor({ ...game, status: "SCHEDULED", homeScore: null, awayScore: null }, "OB")).toBeNull();
  });
});

describe("RES 002: 목록에서 고른 팀의 승·패·무를 센다", () => {
  const g = (id: number, home: string, away: string, hs: number | null, awayScore: number | null): Game =>
    ({
      id,
      gameDate: "2026-08-01",
      homeTeamId: home,
      awayTeamId: away,
      homeScore: hs,
      awayScore,
      status: hs == null ? "SCHEDULED" : "FINAL",
    }) as Game;

  it("홈·원정을 가리지 않고 그 팀 기준으로 센다", () => {
    const games = [g(1, "OB", "LG", 5, 3), g(2, "LG", "OB", 4, 2), g(3, "HH", "OB", 1, 1), g(4, "OB", "SS", 2, 1)];
    expect(recordOf(games, "OB")).toEqual({ WIN: 2, LOSS: 1, DRAW: 1 });
  });

  it("예정 경기와 그 팀이 안 뛴 경기는 세지 않는다", () => {
    expect(recordOf([g(1, "OB", "LG", null, null), g(2, "SS", "LG", 7, 0)], "OB")).toEqual({ WIN: 0, LOSS: 0, DRAW: 0 });
  });
});
