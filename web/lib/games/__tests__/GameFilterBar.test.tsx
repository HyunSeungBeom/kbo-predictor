import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { GameFilterBar, type GameFilter } from "..";

/**
 * 필터 바 — controlled 컴포넌트다. 필터를 prop 으로 받고 바꾼 결과를 onChange 로 올린다.
 * 그래서 «무엇을 올렸나» 만 보면 된다(URL 에 쓰는 것은 ScheduleList 테스트가 본다).
 */

function setup(filter: GameFilter) {
  const onChange = vi.fn<(next: GameFilter) => void>();
  render(<GameFilterBar filter={filter} onChange={onChange} />);
  return { onChange, user: userEvent.setup(), lastChange: () => onChange.mock.calls.at(-1)?.[0] };
}

const venueGroup = () => screen.getByRole("group", { name: "홈/원정" });

describe("GFB 001: 팀을 고르기 전에는 팀 관점 조건을 쓸 수 없다", () => {
  it("상대팀·홈/원정이 잠기고 안내가 보인다", () => {
    setup({});
    expect(screen.getByLabelText("상대팀")).toBeDisabled();
    for (const button of within(venueGroup()).getAllByRole("button")) expect(button).toBeDisabled();
    expect(screen.getByText(/팀을 고르면/)).toBeInTheDocument();
  });

  it("결과에서 예정·종료는 고를 수 있고 승·패·무는 못 고른다", () => {
    setup({});
    const option = (name: string) => within(screen.getByLabelText("결과")).getByRole("option", { name });
    expect(option("예정")).toBeEnabled();
    expect(option("종료")).toBeEnabled();
    for (const name of ["승", "패", "무"]) expect(option(name)).toBeDisabled();
  });

  it("팀을 고르면 잠금이 풀리고 안내가 사라진다", () => {
    setup({ team: "OB" });
    expect(screen.getByLabelText("상대팀")).toBeEnabled();
    expect(within(venueGroup()).getByRole("button", { name: "홈" })).toBeEnabled();
    expect(screen.queryByText(/팀을 고르면/)).not.toBeInTheDocument();
  });
});

describe("GFB 002: 팀을 바꾸면 딸린 조건이 같이 정리된다", () => {
  it("팀을 고른다", async () => {
    const { user, lastChange } = setup({});
    await user.selectOptions(screen.getByLabelText("팀"), "OB");
    expect(lastChange()).toEqual({ team: "OB" });
  });

  it("팀을 지우면 상대팀·홈/원정·승패가 사라지고 기간은 남는다", async () => {
    const { user, lastChange } = setup({ team: "OB", opponent: "LG", venue: "HOME", result: "WIN", from: "2026-08-01" });
    await user.selectOptions(screen.getByLabelText("팀"), "");
    expect(lastChange()).toEqual({ from: "2026-08-01" });
  });

  it("상대팀과 같은 팀으로 바꾸면 상대팀이 사라진다", async () => {
    const { user, lastChange } = setup({ team: "OB", opponent: "LG" });
    await user.selectOptions(screen.getByLabelText("팀"), "LG");
    expect(lastChange()).toEqual({ team: "LG" });
  });

  it("상대팀 목록에는 고른 팀이 없다", () => {
    setup({ team: "OB" });
    const names = within(screen.getByLabelText("상대팀")).getAllByRole("option").map((o) => o.textContent);
    expect(names).not.toContain("두산 베어스");
    expect(names).toContain("LG 트윈스");
  });
});

describe("GFB 003: 홈/원정은 눌린 상태를 알린다", () => {
  it("현재 값의 버튼만 aria-pressed 다", () => {
    setup({ team: "OB", venue: "AWAY" });
    const pressed = within(venueGroup())
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-pressed") === "true")
      .map((b) => b.textContent);
    expect(pressed).toEqual(["원정"]);
  });

  it("홈을 누르면 venue=HOME, 전체를 누르면 사라진다", async () => {
    const { user, onChange } = setup({ team: "OB", venue: "AWAY" });
    await user.click(within(venueGroup()).getByRole("button", { name: "홈" }));
    await user.click(within(venueGroup()).getByRole("button", { name: "전체" }));
    expect(onChange.mock.calls.map(([f]) => f)).toEqual([{ team: "OB", venue: "HOME" }, { team: "OB" }]);
  });

  it("「홈/원정」 이름 글자를 눌러도 선택이 풀리지 않는다", async () => {
    /* 이름을 <label> 로 감쌌을 때는 label 이 첫 버튼(전체)에 연결돼, 글자를 누르면 venue 가 지워졌다 */
    const { user, onChange } = setup({ team: "OB", venue: "HOME" });
    await user.click(screen.getByText("홈/원정"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("GFB 004: 결과 선택지 하나가 상태와 승패를 바꾼다", () => {
  it("종료 → 승: 상태가 빠지고 승패가 들어간다", async () => {
    const { user, lastChange } = setup({ team: "OB", status: "FINAL" });
    await user.selectOptions(screen.getByLabelText("결과"), "WIN");
    expect(lastChange()).toEqual({ team: "OB", result: "WIN" });
  });

  it("승 → 예정: 승패가 빠지고 상태가 들어간다", async () => {
    const { user, lastChange } = setup({ team: "OB", result: "WIN" });
    await user.selectOptions(screen.getByLabelText("결과"), "SCHEDULED");
    expect(lastChange()).toEqual({ team: "OB", status: "SCHEDULED" });
  });

  it("현재 필터가 선택지에 반영돼 있다", () => {
    setup({ team: "OB", result: "DRAW" });
    expect(screen.getByLabelText("결과")).toHaveValue("DRAW");
  });
});

describe("GFB 005: 기간", () => {
  it("시작일을 비우면 조건이 사라진다", async () => {
    const { user, onChange } = setup({ team: "OB", from: "2026-08-01" });
    await user.clear(screen.getByLabelText("시작일"));
    expect(onChange).toHaveBeenLastCalledWith({ team: "OB" });
  });

  it("시작일·종료일이 서로의 한계가 된다 — 거꾸로 된 기간을 달력에서 못 고르게", () => {
    setup({ from: "2026-08-01", to: "2026-08-31" });
    expect(screen.getByLabelText("시작일")).toHaveAttribute("max", "2026-08-31");
    expect(screen.getByLabelText("종료일")).toHaveAttribute("min", "2026-08-01");
  });
});

describe("GFB 006: 초기화", () => {
  it("조건이 없으면 버튼이 없다", () => {
    setup({});
    expect(screen.queryByRole("button", { name: "초기화" })).not.toBeInTheDocument();
  });

  it("누르면 빈 필터를 올린다", async () => {
    const { user, lastChange } = setup({ team: "OB", from: "2026-08-01" });
    await user.click(screen.getByRole("button", { name: "초기화" }));
    expect(lastChange()).toEqual({});
  });
});
