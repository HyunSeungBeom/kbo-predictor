import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * DOC — 문서와 코드가 같이 산다.
 *
 * 검사만 남고 문서가 사라지면 «왜 막는지» 를 모르게 되고, 문서만 남고 코드가 바뀌면 문서가
 * 거짓말을 한다. 둘 다 조용히 일어나므로 여기서 대조한다.
 */

const WEB = process.cwd();
const REPO = join(WEB, "..");
const read = (path: string) => readFileSync(path, "utf-8");

const DOCS = {
  conventions: join(WEB, "docs/frontend-conventions.md"),
  testing: join(WEB, "docs/testing.md"),
  webClaude: join(WEB, "CLAUDE.md"),
  rootClaude: join(REPO, "CLAUDE.md"),
};

function testFiles(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === "node_modules" || name === ".next") continue;
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.test\.tsx?$/.test(name)) out.push(full);
    }
  };
  for (const dir of ["app", "components", "lib", "tests"]) walk(join(WEB, dir));
  return out;
}

describe("DOC 001: 규약 문서가 있고 CLAUDE.md 가 가리킨다", () => {
  it.each(Object.entries(DOCS))("%s 가 있다", (_, path) => {
    expect(existsSync(path), relative(REPO, path)).toBe(true);
  });

  it("web/CLAUDE.md 가 두 문서를 가리키고 Next 경고(AGENTS.md)를 유지한다", () => {
    const body = read(DOCS.webClaude);
    expect(body).toContain("docs/frontend-conventions.md");
    expect(body).toContain("docs/testing.md");
    expect(body).toMatch(/^@AGENTS\.md/);
  });

  it("루트 CLAUDE.md 가 web/CLAUDE.md 와 두 문서를 가리킨다", () => {
    const body = read(DOCS.rootClaude);
    expect(body).toContain("web/CLAUDE.md");
    expect(body).toContain("web/docs/frontend-conventions.md");
    expect(body).toContain("web/docs/testing.md");
  });
});

describe("DOC 002: 테스트 그룹이 testing.md 표와 일치한다", () => {
  it("코드에 있는 그룹은 표에 있고, 표에 있는 그룹은 코드에 있다", () => {
    const inCode = new Set<string>();
    for (const file of testFiles()) {
      for (const m of read(file).matchAll(/describe\(\s*["'`]([A-Z]+) \d{3}:/g)) inCode.add(m[1]);
    }
    const inDoc = new Set([...read(DOCS.testing).matchAll(/^\| `([A-Z]+)` \|/gm)].map((m) => m[1]));

    expect(inCode.size, "그룹을 하나도 못 모았다 — 정규식이 빗나갔다").toBeGreaterThan(5);
    expect([...inDoc].sort(), "docs/testing.md 의 그룹 표").toEqual([...inCode].sort());
  });
});

describe("DOC 003: 구조 규칙 번호가 frontend-conventions.md 검사표와 일치한다", () => {
  it("conventions.test.ts 의 ARCH 번호 = 문서 검사표의 ARCH 번호", () => {
    const inCode = [...read(join(WEB, "tests/conventions.test.ts")).matchAll(/describe\("(ARCH \d{3}):/g)].map((m) => m[1]);
    const inDoc = [...read(DOCS.conventions).matchAll(/^\| (ARCH \d{3}) \|/gm)].map((m) => m[1]);

    expect(inCode.length).toBeGreaterThan(5);
    expect(inDoc.sort()).toEqual(inCode.sort());
  });
});

describe("DOC 004: 문서가 가리키는 파일이 실제로 있다", () => {
  const sources = Object.values(DOCS).filter(existsSync);

  it("마크다운 상대 링크", () => {
    const broken: string[] = [];
    for (const doc of sources) {
      for (const m of read(doc).matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)) {
        if (/^[a-z]+:/.test(m[1])) continue; // http: 등 외부 링크
        if (!existsSync(join(dirname(doc), m[1]))) broken.push(`${relative(REPO, doc)} → ${m[1]}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("코드 경로로 적은 파일 (`lib/…/x.ts` 형태)", () => {
    /* 파일을 옮기고 문서를 안 고치면 «그 파일을 보라» 가 허공을 가리킨다 */
    const missing: string[] = [];
    let checked = 0;
    for (const doc of sources) {
      for (const m of read(doc).matchAll(/`((?:web\/)?(?:lib|tests|app|components|src)\/[\w./@-]+\.(?:tsx?|mts|kt|java|sql))`/g)) {
        const path = m[1];
        checked += 1;
        const candidates = [join(WEB, path), join(REPO, path), join(REPO, "src/main/resources/db/migration", path)];
        if (!candidates.some(existsSync)) missing.push(`${relative(REPO, doc)} → ${path}`);
      }
    }
    expect(checked, "경로를 하나도 못 모았다 — 정규식이 빗나가면 이 검사는 빈 채로 통과한다").toBeGreaterThan(10);
    expect(missing).toEqual([]);
  });
});
