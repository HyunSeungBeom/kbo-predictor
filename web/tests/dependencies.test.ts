import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DEP — 의존성 정책. 같은 일을 하는 라이브러리가 둘이 되면 화면마다 다른 쪽을 쓰게 된다.
 * **왜 막는지**를 여기 남긴다 — 이유가 사라지면 다음 사람이 "편해서" 다시 넣는다.
 */

const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf-8"));
const direct: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };
/* overrides 도 본다 — 직접 의존성이 아니라 패키지 정책이라, 라이브러리를 지워도 남아 있다가
   전이 의존성으로 들어올 때 해석된다 */
const overrides: Record<string, unknown> = pkg.overrides ?? {};

const BANNED: Record<string, string> = {
  axios: "HTTP 는 lib/api 의 fetch 코어 한 벌이다. 둘이 되면 실패 해석(ApiError)이 갈린다",
  ky: "위와 같다",
  "node-fetch": "Node 18+ 와 브라우저에 fetch 가 내장돼 있다",
  swr: "서버 상태는 TanStack Query 가 소유한다. 캐시가 둘이면 같은 데이터를 두 시점으로 들고 있게 된다",
};

describe("DEP 001: 금지 의존성이 없다", () => {
  it.each(Object.entries(BANNED))("%s — %s", (name) => {
    expect(direct, "dependencies/devDependencies").not.toHaveProperty(name);
    expect(overrides, "overrides").not.toHaveProperty(name);
  });
});

describe("DEP 002: 규약이 요구하는 것이 실제로 설치돼 있다", () => {
  it("서버 상태 = TanStack Query", () => {
    expect(pkg.dependencies).toHaveProperty("@tanstack/react-query");
  });
});

describe("DEP 003: lockfile 에 선택 의존성(플랫폼 바이너리)이 빠지지 않았다", () => {
  /**
   * npm 버그(npm/cli#4828) — 기존 lockfile 위에서 `npm install <pkg>`·`npm uninstall <pkg>` 를 하면
   * rolldown·lightningcss 같은 패키지의 **플랫폼별 바이너리 항목이 lockfile 에서 조용히 사라진다.**
   * 지금 머신에는 이미 설치돼 있어서 아무 일 없고, `npm ci` 를 하는 다른 머신·CI 에서야
   * "Cannot find native binding" 으로 테스트가 기동조차 안 된다. 이 레포에서 두 번 났다.
   *
   * 고칠 때: lockfile 을 통째로 재생성하면 운영 의존성까지 함께 올라가므로, 빠진 항목만 되살린다.
   */
  const lock = JSON.parse(readFileSync(join(process.cwd(), "package-lock.json"), "utf-8"));
  const packages: Record<string, { optionalDependencies?: Record<string, string> }> = lock.packages;

  /** Node 해석 규칙대로 부모 쪽으로 올라가며 찾는다 — 중첩 설치(`vite/node_modules/lightningcss-*`)도 인정 */
  const isResolvable = (from: string, dep: string) => {
    let base = from;
    for (;;) {
      if (`${base ? `${base}/` : ""}node_modules/${dep}` in packages) return true;
      const at = base.lastIndexOf("/node_modules/");
      if (base === "") return false;
      base = at === -1 ? "" : base.slice(0, at);
    }
  };

  const missing = Object.entries(packages).flatMap(([path, entry]) =>
    Object.keys(entry.optionalDependencies ?? {})
      .filter((dep) => !isResolvable(path, dep))
      .map((dep) => `${path} → ${dep}`),
  );

  it("모든 선택 의존성이 lockfile 에 항목을 갖는다", () => {
    expect(missing).toEqual([]);
  });

  it("검사 대상이 실제로 있다 — 선택 의존성을 가진 패키지를 못 찾으면 위 검사가 빈 채로 통과한다", () => {
    expect(Object.values(packages).filter((e) => e.optionalDependencies).length).toBeGreaterThan(0);
  });
});
