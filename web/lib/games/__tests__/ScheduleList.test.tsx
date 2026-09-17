import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScheduleList, type Game } from "..";
import { respondWith } from "@/tests/fetch-stub";
import { resetNavigation, router, setLocation } from "@/tests/next-navigation-mock";
import { renderWithQuery } from "@/tests/query-provider";

vi.mock("next/navigation", async () => (await import("@/tests/next-navigation-mock")).nextNavigationModule);

/**
 * 일정 화면 — 주소를 읽어 조회하고(읽기), 필터를 만지면 주소를 바꾼다(쓰기).
 * 서버는 fetch 를 갈아끼워 흉내 낸다 — 거르기는 서버 일이므로, 응답을 그대로 그리는지만 본다.
 */

const game = (id: number, date: string, home: string, away: string, hs: number | null, awayScore: number | null) =>
  ({
    id,
    gameDate: date,
    homeTeamId: home,
    awayTeamId: away,
    homeScore: hs,
    awayScore,
    status: hs == null ? "SCHEDULED" : "FINAL",
  }) as Game;

const OB_VS_LG = [
  game(1, "2026-08-01", "OB", "LG", 5, 3),
  game(2, "2026-08-02", "LG", "OB", 4, 2),
  game(3, "2026-08-03", "OB", "LG", 1, 1),
  game(4, "2026-09-20", "LG", "OB", null, null),
];

let fetch: ReturnType<typeof respondWith>;
const serve = (status: number, body: unknown) => {
  fetch = respondWith(status, body);
  vi.stubGlobal("fetch", fetch);
};

beforeEach(() => {
  resetNavigation();
  setLocation("/schedule");
});
afterEach(() => vi.unstubAllGlobals());

const rows = () => within(screen.getByRole("list")).getAllByRole("listitem");

describe("SCH 001: 주소의 조건으로 조회해 그린다", () => {
  it("주소 조건이 그대로 서버 요청에 실린다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?opponent=LG&team=OB");
    renderWithQuery(<ScheduleList />);

    await screen.findByText(/4경기/);
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/games\?team=OB&opponent=LG$/);
  });

  it("주소가 이상하면 버리고 전체를 조회한다 — 잘못된 링크가 에러 화면이 되지 않게", async () => {
    serve(200, []);
    setLocation("/schedule", "?team=XX&venue=NEUTRAL");
    renderWithQuery(<ScheduleList />);

    await screen.findByText("조건에 맞는 경기가 없어요.");
    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/games$/);
  });

  it("주소의 조건이 필터 입력에 채워져 있다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB&result=WIN");
    renderWithQuery(<ScheduleList />);

    expect(screen.getByLabelText("팀")).toHaveValue("OB");
    expect(screen.getByLabelText("결과")).toHaveValue("WIN");
  });
});

describe("SCH 002: 팀을 고르면 그 팀 기준으로 보여준다", () => {
  it("승·패·무 합계는 종료 경기만 센다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB&opponent=LG");
    renderWithQuery(<ScheduleList />);

    expect(await screen.findByText("4경기 · 두산 베어스 1승 1패 1무")).toBeInTheDocument();
  });

  it("경기마다 그 팀 기준 결과를 붙인다 — 원정 경기도 뒤집어 읽는다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB");
    renderWithQuery(<ScheduleList />);

    await screen.findByText(/4경기/);
    const badges = rows().map((row) => row.lastElementChild?.textContent);
    expect(badges).toEqual(["승", "패", "무", "예정"]);
  });

  it("팀이 없으면 합계 없이 종료·예정만 붙인다", async () => {
    serve(200, OB_VS_LG);
    renderWithQuery(<ScheduleList />);

    expect(await screen.findByText("4경기")).toBeInTheDocument();
    expect(rows().map((row) => row.lastElementChild?.textContent)).toEqual(["종료", "종료", "종료", "예정"]);
  });
});

describe("SCH 003: 필터를 만지면 주소를 바꾼다", () => {
  it("조건을 붙인 주소로 replace 한다 — 뒤로 가기 기록을 쌓지 않고 스크롤도 유지", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB");
    renderWithQuery(<ScheduleList />);

    await userEvent.click(within(screen.getByRole("group", { name: "홈/원정" })).getByRole("button", { name: "홈" }));

    expect(router.replace).toHaveBeenCalledWith("/schedule?team=OB&venue=HOME", { scroll: false });
    expect(router.push).not.toHaveBeenCalled();
  });

  it("팀을 지우면 딸린 조건이 빠진 주소가 된다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB&opponent=LG&result=WIN&from=2026-08-01");
    renderWithQuery(<ScheduleList />);

    await userEvent.selectOptions(screen.getByLabelText("팀"), "");

    expect(router.replace).toHaveBeenLastCalledWith("/schedule?from=2026-08-01", { scroll: false });
  });

  it("초기화하면 조건 없는 주소가 된다", async () => {
    serve(200, OB_VS_LG);
    setLocation("/schedule", "?team=OB");
    renderWithQuery(<ScheduleList />);

    await userEvent.click(screen.getByRole("button", { name: "초기화" }));

    expect(router.replace).toHaveBeenLastCalledWith("/schedule", { scroll: false });
  });
});

describe("SCH 004: 실패를 구분해 알린다", () => {
  it("검증 실패(400)는 서버가 준 사유를 그대로 보여준다", async () => {
    serve(400, { status: 400, errors: ["from(2026-09-01) 이 to(2026-08-01) 보다 늦습니다"] });
    renderWithQuery(<ScheduleList />);

    expect(await screen.findByText("검색 조건을 확인해 주세요.")).toBeInTheDocument();
    expect(screen.getByText("from(2026-09-01) 이 to(2026-08-01) 보다 늦습니다")).toBeInTheDocument();
  });

  it("사유가 없는 실패는 연결 문제로 안내한다", async () => {
    serve(502, "Bad Gateway");
    renderWithQuery(<ScheduleList />);

    expect(await screen.findByText(/일정을 불러오지 못했어요/)).toBeInTheDocument();
    expect(screen.queryByText("검색 조건을 확인해 주세요.")).not.toBeInTheDocument();
  });
});
