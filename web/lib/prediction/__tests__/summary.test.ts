import { describe, expect, it } from "vitest";
import {
  isSmallSample,
  percent,
  probabilityLabel,
  starterSummary,
  vsOpponentSummary,
  type StarterView,
} from "..";

const starter = (over: Partial<StarterView> = {}): StarterView => ({
  name: "곽빈",
  starts: 26,
  wins: 12,
  losses: 13,
  draws: 1,
  firstStart: false,
  vsOpponent: null,
  ...over,
});

/**
 * 선발 기록을 문구로 바꾸는 규칙. 여기가 틀리면 **표본이 적은 기록이 대단해 보인다** —
 * 숫자는 맞는데 읽는 사람이 오해하는 종류의 버그다.
 */

describe("SUM 001: 선발 요약은 표본 수를 함께 보여준다", () => {
  it("등판 수와 팀 승패를 같이 적는다", () => {
    expect(starterSummary(starter())).toBe("등판 26경기 · 팀 12승 13패 1무");
  });

  it("무승부가 없으면 생략한다", () => {
    expect(starterSummary(starter({ draws: 0, starts: 25 }))).toBe("등판 25경기 · 팀 12승 13패");
  });

  it("첫 선발은 계산 방식을 그대로 알린다 — 숫자가 없는 게 아니라 팀 평균을 쓴 것이다", () => {
    expect(starterSummary(starter({ starts: 0, wins: 0, losses: 0, draws: 0, firstStart: true }))).toBe(
      "첫 선발 — 팀 평균으로 계산",
    );
  });

  it("선발이 발표되지 않았으면 그렇게 적는다", () => {
    expect(starterSummary(starter({ name: null }))).toBe("선발 미발표");
  });
});

describe("SUM 002: 표본이 적으면 표시로 경고한다", () => {
  it.each([
    [1, true],
    [4, true],
    [5, false],
    [26, false],
  ])("등판 %i → 경고 %s", (starts, expected) => {
    expect(isSmallSample(starter({ starts }))).toBe(expected);
  });

  it("첫 선발은 이미 문구로 알리므로 중복 경고하지 않는다", () => {
    expect(isSmallSample(starter({ starts: 0, firstStart: true }))).toBe(false);
  });
});

describe("SUM 003: 상대전적은 표시용 문구다", () => {
  it("등판 수를 앞세워 표본이 작다는 게 드러나게 한다", () => {
    const record = { starts: 2, wins: 1, losses: 1, draws: 0, firstStart: false };
    expect(vsOpponentSummary(record, "LG 트윈스")).toBe("LG 트윈스 상대 2등판 1승 1패");
  });

  it("무승부가 있으면 함께 적는다", () => {
    const record = { starts: 3, wins: 2, losses: 0, draws: 1, firstStart: false };
    expect(vsOpponentSummary(record, "한화 이글스")).toBe("한화 이글스 상대 3등판 2승 0패 1무");
  });

  it("맞붙은 적이 없으면 아무것도 보여주지 않는다", () => {
    expect(vsOpponentSummary(null, "LG 트윈스")).toBeNull();
    expect(vsOpponentSummary({ starts: 0, wins: 0, losses: 0, draws: 0, firstStart: true }, "LG")).toBeNull();
  });
});

describe("SUM 004: 확률 표기", () => {
  it("소수 한 자리까지 — 0.5 는 50%", () => {
    expect(percent(0.5)).toBe("50%");
    expect(percent(0.2317)).toBe("23.2%");
    expect(percent(1)).toBe("100%");
  });

  it("막대 대신 읽어줄 문장을 만든다", () => {
    expect(probabilityLabel("두산 베어스", 0.674, "키움 히어로즈")).toBe(
      "두산 베어스 67.4%, 키움 히어로즈 32.6%",
    );
  });
});
