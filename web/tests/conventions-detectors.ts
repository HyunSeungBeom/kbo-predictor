import { dirname, join, normalize } from "node:path";

/**
 * 규약 판정 함수 — `conventions.test.ts` 가 레포에 돌리고, `conventions.detect.test.ts` 가
 * 판정 자체가 맞는지 우회 예시로 검사한다.
 *
 * **테스트 파일이 아니어야 한다.** 테스트 파일을 import 하면 그 안의 테스트가 가져온 쪽에서
 * 다시 등록돼 두 번 돈다(HYG 001).
 *
 * 소스를 문자열로 훑는 검사라 증명이 아니라 **가장 흔한 우회를 막는 걸림쇠**다. 그래서 무엇을
 * 잡고 무엇을 못 잡는지를 detect 테스트에 적어 둔다.
 */

/** 도메인 안의 슬롯 — 고정 어휘. 열어 두면 어디 넣을지 몰라 `hook`/`hooks` 처럼 갈린다 */
export const SLOTS = ["model", "schemas", "mocks", "api", "store", "hooks", "ui"] as const;

/** lib/ 바로 아래의 도메인이 아닌 코어. 슬롯으로 나누지 않는 평평한 모듈이다 */
export const CORES = ["api"] as const;

/** lib/ 바로 아래에 두면 안 되는 기술 이름. 같이 바뀌는 것(타입·상수·그걸 읽는 함수)이 흩어진다 */
export const TECH_FOLDERS = [
  "utils",
  "util",
  "helpers",
  "helper",
  "types",
  "constants",
  "hooks",
  "stores",
  "store",
  "schemas",
  "components",
  "services",
] as const;

/** 도메인 루트 + 슬롯 + 파일. `lib/games/model/types.ts` 가 끝이다 */
export const MAX_DEPTH = 4;

/**
 * 주석을 지운다 — 규약을 설명하는 주석이 그 규약의 위반처럼 읽히면 안 된다.
 * 문자열 안의 `//`(예: "http://localhost")는 주석이 아니므로 따옴표를 추적한다.
 */
export function stripComments(src: string): string {
  let out = "";
  let quote: string | null = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const next = src[i + 1];
    if (quote) {
      out += c;
      if (c === "\\") {
        out += next ?? "";
        i++;
      } else if (c === quote) {
        quote = null;
      }
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      out += c;
    } else if (c === "/" && next === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      out += "\n";
    } else if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2);
      const comment = src.slice(i, end === -1 ? src.length : end + 2);
      out += comment.replace(/[^\n]/g, "");
      i = end === -1 ? src.length : end + 1;
    } else {
      out += c;
    }
  }
  return out;
}

/** import·export-from·동적 import 의 모듈 스펙 전부 */
export function importSpecs(src: string): string[] {
  const specs: string[] = [];
  for (const m of src.matchAll(/(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g)) specs.push(m[1]);
  return specs;
}

/** 스펙에서 가져오는 **값** 이름(type 전용 import 제외) */
export function importedValueNames(src: string, specPredicate: (spec: string) => boolean): string[] {
  const names: string[] = [];
  for (const m of src.matchAll(/import\s+(type\s+)?\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
    if (m[1] || !specPredicate(m[3])) continue;
    for (const part of m[2].split(",")) {
      const item = part.trim();
      if (!item || item.startsWith("type ")) continue;
      names.push(item.split(/\s+as\s+/)[0].trim());
    }
  }
  return names;
}

/**
 * 스펙 → 레포 기준 경로(확장자 없음). `@/` 별칭과 상대 경로를 같은 모양으로 정규화한다 —
 * 문자열에 `lib/games` 가 있는지만 보면 `../../games/model/types` 같은 상대 경로가 빠져나간다.
 * 패키지(`react` 등)는 null.
 */
export function resolveSpec(fromFile: string, spec: string): string | null {
  if (spec.startsWith("@/")) return normalize(spec.slice(2));
  if (spec.startsWith(".")) return normalize(join(dirname(fromFile), spec));
  return null;
}

const parts = (path: string) => path.split("/");

/** `lib/games/...` → "games". 코어(`lib/api`)도 이름을 돌려준다. lib 밖이면 null */
export function moduleOf(path: string): string | null {
  const p = parts(path);
  return p[0] === "lib" && p.length >= 2 ? p[1] : null;
}

const isCore = (module: string) => (CORES as readonly string[]).includes(module);

/** `lib/games/model/types.ts` → "model". 도메인 루트 파일·`__tests__`·코어면 null */
export function slotOf(path: string): string | null {
  const p = parts(path);
  if (p[0] !== "lib" || p.length < 4 || isCore(p[1]) || p[2] === "__tests__") return null;
  return p[2];
}

/** 서버를 직접 부르는가 — `refetch(` 나 `obj.fetch(` 는 아니고, `window.fetch(` 는 맞다 */
export function callsServerDirectly(src: string): boolean {
  return (
    /(?:^|[^\w$.])fetch\s*\(/m.test(src) ||
    /\b(?:window|globalThis|self)\.fetch\s*\(/.test(src) ||
    /(?:from|import)\s*\(?\s*["']axios["']/.test(src)
  );
}

/**
 * queryKey 를 리터럴 배열로 적었는가 — 인라인(`queryKey: ["x"]`)과 **변수로 한 번 뺀 것**
 * (`const key = ["x"]; … queryKey: key`) 둘 다. 모듈을 넘는 추적은 하지 않는다.
 */
export function literalQueryKeys(src: string): string[] {
  const hits: string[] = [];
  if (/\bqueryKey\s*:\s*\[/.test(src)) hits.push("inline");
  for (const m of src.matchAll(/\bqueryKey\s*:\s*([A-Za-z_$][\w$]*)\s*[,}\n]/g)) {
    if (new RegExp(`\\b(?:const|let|var)\\s+${m[1]}\\s*(?::[^=]+)?=\\s*\\[`).test(src)) hits.push(m[1]);
  }
  return hits;
}

/** 모듈 간 의존 그래프에서 순환을 찾는다. 순환은 "a → b → a" 형태로 돌려준다 */
export function findCycles(edges: Record<string, string[]>): string[] {
  const cycles = new Set<string>();
  const visit = (node: string, path: string[]) => {
    const at = path.indexOf(node);
    if (at !== -1) {
      const loop = path.slice(at);
      /* 같은 순환을 시작점만 바꿔 여러 번 세지 않도록 가장 작은 이름에서 시작하게 돌린다 */
      const start = loop.indexOf([...loop].sort()[0]);
      const rotated = [...loop.slice(start), ...loop.slice(0, start)];
      cycles.add([...rotated, rotated[0]].join(" → "));
      return;
    }
    for (const next of edges[node] ?? []) visit(next, [...path, node]);
  };
  for (const node of Object.keys(edges)) visit(node, []);
  return [...cycles].sort();
}
