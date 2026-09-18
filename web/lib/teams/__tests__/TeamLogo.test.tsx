import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamLogo } from "..";

/**
 * 로고는 외부 서버 이미지라 언제든 안 열릴 수 있다 — 그때 화면이 깨진 아이콘으로 남지 않아야 한다.
 */

describe("TLG 001: 로고를 못 불러오면 팀 색 배지로 대체한다", () => {
  it("이미지 로드 실패 시 팀 이름 첫 글자를 보여준다", () => {
    const { container } = render(<TeamLogo teamId="OB" labelled />);

    fireEvent.error(screen.getByRole("img", { name: "두산 베어스" }));

    expect(screen.getByRole("img", { name: "두산 베어스" }).tagName).toBe("SPAN");
    expect(container.textContent).toBe("두");
  });

  it("모르는 팀 코드는 처음부터 배지로 그린다", () => {
    const { container } = render(<TeamLogo teamId="XX" />);

    expect(container.querySelector("img")).toBeNull();
  });
});

describe("TLG 002: 팀 이름이 옆에 있으면 로고는 장식이다", () => {
  it("기본은 접근성 트리에서 빠진다 — 이름을 두 번 읽지 않게", () => {
    render(<TeamLogo teamId="OB" />);

    expect(screen.queryByRole("img", { name: "두산 베어스" })).not.toBeInTheDocument();
  });

  it("labelled 를 주면 이름을 갖는다", () => {
    render(<TeamLogo teamId="OB" labelled />);

    expect(screen.getByRole("img", { name: "두산 베어스" })).toBeInTheDocument();
  });
});
