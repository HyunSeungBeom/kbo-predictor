import { vi } from "vitest";

/**
 * next/navigation 모의 — 라우터에 결합된 훅·화면을 라우트 밖에서 돌린다. 한 벌만 둔다
 * (파일마다 따로 세우면 서로 다른 반쪽 모의가 생긴다).
 *
 * 쓰는 쪽 (vi.mock 은 파일 맨 위로 끌어올려지므로 팩토리 안에서 지연 import 한다):
 *
 *   vi.mock("next/navigation", async () => (await import("@/tests/next-navigation-mock")).nextNavigationModule);
 *   beforeEach(resetNavigation);
 *
 * `useSearchParams` 는 **진짜 URLSearchParams** 를 돌려준다. `.get()` 만 흉내 내면 소비자가
 * 부르는 다른 메서드가 조용히 빈 값이 되어, 판별력 없는 테스트가 된다.
 *
 * `router.replace` 는 위치를 바꾸지 않는다 — 화면은 URL 을 읽기만 하고 쓰기는 라우터에 맡기므로,
 * 테스트도 «어떤 주소로 보냈나»(쓰기)와 «주소가 이러면 무엇을 그리나»(읽기)를 따로 본다.
 */

export const router = {
  replace: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

let pathname = "/";
let search = "";

/** 현재 위치. `search` 는 "team=OB" · "?team=OB" 둘 다 받는다 */
export function setLocation(nextPathname: string, nextSearch = "") {
  pathname = nextPathname;
  search = nextSearch.replace(/^\?/, "");
}

/** beforeEach 에서 부른다 — 호출 기록과 위치를 같이 되돌린다 */
export function resetNavigation() {
  Object.values(router).forEach((fn) => fn.mockClear());
  setLocation("/", "");
}

export const nextNavigationModule = {
  useRouter: () => router,
  usePathname: () => pathname,
  useSearchParams: () => new URLSearchParams(search),
};
