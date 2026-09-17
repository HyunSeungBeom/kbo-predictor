import { vi } from "vitest";

/**
 * fetch 대역 — 호출마다 **새 Response** 를 만든다. 본문은 한 번만 읽을 수 있어서 같은 객체를
 * 돌려주면 두 번째 호출이 "Body has already been read" 로 죽는다.
 *
 * 테스트 파일이 아닌 모듈로 둔다 — 테스트 파일을 import 하면 그 안의 테스트가 다시 등록돼 두 번 돈다.
 */
export const respondWith = (status: number, body: unknown) =>
  vi.fn().mockImplementation(
    async () =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  );
