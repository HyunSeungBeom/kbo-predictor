import { afterEach, describe, expect, it, vi } from "vitest";
import { getGames } from "..";
import { respondWith } from "@/tests/fetch-stub";

afterEach(() => vi.unstubAllGlobals());

describe("GAPI 001: 필터가 쿼리스트링으로 실린다", () => {
  it("조건이 있으면 붙이고, 없으면 경로만 부른다", async () => {
    const fetch = respondWith(200, []);
    vi.stubGlobal("fetch", fetch);

    await getGames({ team: "OB", result: "WIN" });
    await getGames({});

    expect(fetch.mock.calls[0][0]).toMatch(/\/api\/games\?team=OB&result=WIN$/);
    expect(fetch.mock.calls[1][0]).toMatch(/\/api\/games$/);
  });
});
