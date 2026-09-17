import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, getGames } from "../api";

/**
 * HTTP 코어 — 가짜 클라이언트가 아니라 **fetch 를 갈아끼운다.** 주소 조립과 실패 해석이
 * 실제 코드 경로를 그대로 타게 하기 위해서다.
 */

/* 호출마다 새 Response — 본문은 한 번만 읽을 수 있어서 같은 객체를 돌려주면 두 번째 호출이 죽는다 */
const respond = (status: number, body: unknown) =>
  vi.fn().mockImplementation(
    async () =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );

afterEach(() => vi.unstubAllGlobals());

describe("API 001: 필터가 쿼리스트링으로 실린다", () => {
  it("조건이 있으면 붙이고, 없으면 경로만 부른다", async () => {
    const fetch = respond(200, []);
    vi.stubGlobal("fetch", fetch);

    await getGames({ team: "OB", result: "WIN" });
    await getGames({});

    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/games\?team=OB&result=WIN$/);
    expect(fetch.mock.calls[1][0]).toMatch(/\/api\/games$/);
  });
});

describe("API 002: 검증 실패는 사유 목록을 담아 던진다", () => {
  it("ProblemDetail 의 errors 를 그대로 옮긴다", async () => {
    vi.stubGlobal(
      "fetch",
      respond(400, { status: 400, detail: "검색 조건이 올바르지 않습니다", errors: ["opponent 는 team 과 함께 써야 합니다"] }),
    );

    const error = await getGames({}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 400, errors: ["opponent 는 team 과 함께 써야 합니다"] });
  });

  it.each([
    ["본문이 JSON 이 아님", 502, "Bad Gateway"],
    ["errors 가 없음 (스프링 기본 400)", 400, { status: 400, error: "Bad Request" }],
    ["errors 가 문자열 배열이 아님", 400, { errors: [{ message: "x" }] }],
  ])("%s → 빈 목록 — 화면이 이상한 값을 사유로 그리지 않는다", async (_, status, body) => {
    vi.stubGlobal("fetch", respond(status, body));

    await expect(getGames({})).rejects.toMatchObject({ status, errors: [] });
  });
});
