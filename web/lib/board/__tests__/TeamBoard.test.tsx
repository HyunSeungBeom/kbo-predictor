import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TeamBoard, type Post } from "..";
import { resetNavigation } from "@/tests/next-navigation-mock";
import { renderWithQuery } from "@/tests/query-provider";

vi.mock("next/navigation", async () => (await import("@/tests/next-navigation-mock")).nextNavigationModule);

/**
 * 게시판 화면 — «로그인해야 쓸 수 있고, 내 글만 고칠 수 있다» 가 화면에서도 지켜지는지 본다.
 * (실제 권한은 서버가 판단한다. 여기서 확인하는 건 사용자가 헛수고하지 않게 하는 안내다.)
 */

const post = (over: Partial<Post> = {}): Post => ({
  id: 1,
  teamId: "OB",
  title: "오늘 이기자",
  content: "잠실로 갑니다",
  authorNickname: "두산팬",
  authorProfileImageUrl: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  edited: false,
  mine: false,
  ...over,
});

/** 경로별로 다른 응답을 준다 — 로그인 여부(/api/auth/me)와 글 목록을 같이 흉내 내야 한다 */
function serve(routes: Record<string, { status?: number; body?: unknown }>) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const match = Object.keys(routes).find((path) => url.includes(path));
      const { status = 200, body = {} } = match ? routes[match] : { status: 404 };
      return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
    }),
  );
}

const emptyPage = { items: [], page: 0, size: 20, totalPages: 0, totalItems: 0 };
const pageOf = (items: Post[]) => ({ items, page: 0, size: 20, totalPages: 1, totalItems: items.length });
const LOGGED_OUT = { "/api/auth/me": { status: 401 } };
const LOGGED_IN = { "/api/auth/me": { body: { id: 7, nickname: "두산팬", profileImageUrl: null } } };

beforeEach(resetNavigation);
afterEach(() => vi.unstubAllGlobals());

describe("BRD 001: 읽기는 누구나, 쓰기는 로그인한 사람만", () => {
  it("로그인하지 않으면 글쓰기 폼 대신 로그인 안내를 보여준다 — 다 쓰고 나서 막지 않게", async () => {
    serve({ ...LOGGED_OUT, "/posts": { body: pageOf([post()]) } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    expect(await screen.findByText("로그인하면 글을 남길 수 있어요.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "글쓰기" })).not.toBeInTheDocument();
    /* 그래도 남의 글은 읽힌다 */
    expect(await screen.findByText("오늘 이기자")).toBeInTheDocument();
  });

  it("로그인하면 글쓰기 폼이 나온다", async () => {
    serve({ ...LOGGED_IN, "/posts": { body: emptyPage } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    expect(await screen.findByRole("button", { name: "글쓰기" })).toBeInTheDocument();
    expect(screen.getByLabelText("제목")).toBeInTheDocument();
  });
});

describe("BRD 002: 수정·삭제 버튼은 내 글에만 보인다", () => {
  it("남의 글에는 없다", async () => {
    serve({ ...LOGGED_IN, "/posts": { body: pageOf([post({ mine: false })]) } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    await screen.findByText("오늘 이기자");
    expect(screen.queryByRole("button", { name: "수정" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "삭제" })).not.toBeInTheDocument();
  });

  it("내 글에는 있다", async () => {
    serve({ ...LOGGED_IN, "/posts": { body: pageOf([post({ mine: true })]) } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    expect(await screen.findByRole("button", { name: "수정" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("수정을 누르면 그 자리에서 편집 폼이 열린다", async () => {
    serve({ ...LOGGED_IN, "/posts": { body: pageOf([post({ mine: true })]) } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    await userEvent.click(await screen.findByRole("button", { name: "수정" }));

    const item = screen.getAllByRole("listitem")[0];
    expect(within(item).getByLabelText("제목")).toHaveValue("오늘 이기자");
    expect(within(item).getByRole("button", { name: "수정" })).toHaveAttribute("type", "submit");
  });
});

describe("BRD 003: 입력 규칙을 바로 알려준다", () => {
  it("빈 제목으로는 제출되지 않는다", async () => {
    serve({ ...LOGGED_IN, "/posts": { body: emptyPage } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    await userEvent.click(await screen.findByRole("button", { name: "글쓰기" }));

    expect(await screen.findByText("제목을 입력해 주세요")).toBeInTheDocument();
    expect(screen.getByText("내용을 입력해 주세요")).toBeInTheDocument();
  });
});

describe("BRD 004: 글이 없을 때", () => {
  it("첫 글을 권한다", async () => {
    serve({ ...LOGGED_OUT, "/posts": { body: emptyPage } });
    renderWithQuery(<TeamBoard teamId="OB" />);

    expect(await screen.findByText(/아직 글이 없어요/)).toBeInTheDocument();
  });
});
