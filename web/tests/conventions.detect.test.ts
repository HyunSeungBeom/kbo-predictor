import { describe, expect, it } from "vitest";
import {
  callsServerDirectly,
  findCycles,
  importSpecs,
  importedValueNames,
  literalQueryKeys,
  moduleOf,
  resolveSpec,
  slotOf,
  stripComments,
} from "./conventions-detectors";

/**
 * DET — 판정 함수가 실제로 무엇을 잡는가.
 *
 * 규약 검사는 레포에 위반이 없으면 초록이다. 그런데 **판정이 우회로를 놓쳐도 초록이다** —
 * 레포에 그런 코드가 없으면 아무도 모른다. 그래서 우회 예시를 판정 함수에 직접 먹여 둔다.
 */

describe("DET 001: 주석은 코드가 아니다", () => {
  it("주석 속 fetch( 는 지우고, 문자열 속 // 는 남긴다", () => {
    const src = `// fetch("/x")\n/* fetch("/y") */\nconst url = "http://localhost:8080"; call();`;
    const out = stripComments(src);
    expect(out).not.toContain("fetch");
    expect(out).toContain(`"http://localhost:8080"; call();`);
  });

  it("줄 수를 유지한다 — 위반 위치를 찾을 때 어긋나지 않게", () => {
    const src = "a\n/* 1\n2\n3 */\nb";
    expect(stripComments(src).split("\n")).toHaveLength(src.split("\n").length);
  });
});

describe("DET 002: import 스펙을 모두 모은다", () => {
  it("정적·타입·재수출·동적·부작용 import", () => {
    const src = [
      `import { a } from "@/lib/games";`,
      `import type { B } from "../model/types";`,
      `export * from "./ui/X";`,
      `const m = await import("@/lib/teams");`,
      `import "./side-effect";`,
    ].join("\n");
    expect(importSpecs(src)).toEqual(["@/lib/games", "../model/types", "./ui/X", "@/lib/teams", "./side-effect"]);
  });

  it("값 이름만 뽑는다 — type import 와 별칭은 원래 이름으로", () => {
    const src = `import { get as fetchIt, type ApiError, API_BASE } from "@/lib/api";\nimport type { get } from "@/lib/api";`;
    expect(importedValueNames(src, (s) => s === "@/lib/api")).toEqual(["get", "API_BASE"]);
  });
});

describe("DET 003: 경로를 같은 모양으로 정규화한다", () => {
  it("별칭과 상대 경로가 같은 대상을 가리키면 같은 결과다 — 상대 경로로 배럴을 우회하지 못하게", () => {
    expect(resolveSpec("lib/games/ui/ScheduleList.tsx", "../../teams/model/teams")).toBe("lib/teams/model/teams");
    expect(resolveSpec("app/page.tsx", "@/lib/teams/model/teams")).toBe("lib/teams/model/teams");
    expect(resolveSpec("app/page.tsx", "react")).toBeNull();
  });

  it("모듈·슬롯을 읽는다", () => {
    expect(moduleOf("lib/games/model/types.ts")).toBe("games");
    expect(moduleOf("app/page.tsx")).toBeNull();
    expect(slotOf("lib/games/model/types.ts")).toBe("model");
    expect(slotOf("lib/games/index.ts")).toBeNull();
    expect(slotOf("lib/api/client.ts")).toBeNull(); // 코어는 슬롯이 없다
  });
});

describe("DET 004: 서버 직접 호출", () => {
  it.each([
    [`await fetch("/api")`, true],
    [`window.fetch(url)`, true],
    [`import axios from "axios"`, true],
    [`const { refetch } = q; refetch()`, false],
    [`client.fetch(url)`, false],
    [`vi.stubGlobal("fetch", stub)`, false],
  ])("%s → %s", (src, expected) => {
    expect(callsServerDirectly(src)).toBe(expected);
  });
});

describe("DET 005: queryKey 리터럴", () => {
  it("인라인 배열을 잡는다", () => {
    expect(literalQueryKeys(`useQuery({ queryKey: ["games", id], queryFn })`)).toEqual(["inline"]);
  });

  it("변수로 한 번 뺀 배열도 잡는다 — 가장 흔한 우회", () => {
    expect(literalQueryKeys(`const key = ["games"];\nuseQuery({ queryKey: key, queryFn })`)).toEqual(["key"]);
  });

  it("팩토리 호출은 통과한다", () => {
    expect(literalQueryKeys(`useQuery({ queryKey: gameKeys.list(filter), queryFn })`)).toEqual([]);
  });

  it("못 잡는 것: 다른 모듈에서 가져온 리터럴 — 모듈을 넘는 추적은 하지 않는다", () => {
    expect(literalQueryKeys(`import { KEY } from "./k";\nuseQuery({ queryKey: KEY, queryFn })`)).toEqual([]);
  });
});

describe("DET 006: 순환 찾기", () => {
  it("직접·간접 순환을 한 번씩만 센다", () => {
    expect(findCycles({ a: ["b"], b: ["a"] })).toEqual(["a → b → a"]);
    expect(findCycles({ games: ["teams"], teams: ["standings"], standings: ["games"] })).toEqual([
      "games → teams → standings → games",
    ]);
  });

  it("한 방향 의존은 순환이 아니다", () => {
    expect(findCycles({ games: ["teams", "api"], standings: ["teams"], teams: [] })).toEqual([]);
  });
});
