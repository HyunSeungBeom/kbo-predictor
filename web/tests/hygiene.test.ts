import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/** HYG — 테스트 자체의 위생. 테스트가 조용히 덜 돌거나 두 번 도는 것을 막는다. */

const ROOT = process.cwd();
const isTestFile = (p: string) => /\.test\.tsx?$/.test(p);

function testFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next") continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (isTestFile(name)) out.push(relative(ROOT, full));
    }
  };
  for (const dir of ["app", "components", "lib", "tests"]) walk(join(ROOT, dir));
  return out;
}

describe("HYG 001: 테스트 파일이 다른 테스트 파일을 import 하지 않는다", () => {
  it("import 하면 그 안의 테스트가 가져온 쪽에서 다시 등록돼 두 번 돈다 — 공유 헬퍼는 비-테스트 모듈로", () => {
    const hits: string[] = [];
    for (const file of testFiles()) {
      const body = readFileSync(join(ROOT, file), "utf-8");
      for (const m of body.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) {
        if (/\.test(\.tsx?)?$/.test(m[1])) hits.push(`${file} → ${m[1]}`);
      }
    }
    expect(hits).toEqual([]);
  });

  it("검사 대상이 실제로 있다", () => {
    expect(testFiles().length).toBeGreaterThanOrEqual(5);
  });
});

describe("HYG 002: 테스트 타임존이 고정돼 있다", () => {
  it("vitest 설정에서 TZ 가 사라지면 서울에서만 통과하는 날짜 테스트가 생긴다", () => {
    expect(readFileSync(join(ROOT, "vitest.config.mts"), "utf-8")).toMatch(/TZ:\s*["']Asia\/Seoul["']/);
    expect(process.env.TZ).toBe("Asia/Seoul");
  });
});

describe("HYG 003: 테스트 러너 접미사가 갈려 있다", () => {
  it("유닛·컴포넌트는 *.test.* 만 — 나중에 Playwright(*.spec.*)와 서로 주워가지 않게", () => {
    const config = readFileSync(join(ROOT, "vitest.config.mts"), "utf-8");
    expect(config).toContain(`include: ["**/*.test.{ts,tsx}"]`);
  });
});
