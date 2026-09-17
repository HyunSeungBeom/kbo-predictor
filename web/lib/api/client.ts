/**
 * HTTP 코어 — 서버 호출은 전부 여기를 지난다.
 *
 * 도메인의 `api/` 슬롯이 [get] 을 쓰고, 훅·화면은 fetch 를 직접 부르지 않는다.
 * 주소 조립과 실패 해석이 한 곳에 있어야 고칠 때도 한 곳만 고친다.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080";

/**
 * API 실패. 검증 실패(400)면 백엔드 ProblemDetail 의 `errors`(위반 사유 목록)를 담는다.
 * 사유를 화면에 그대로 보여주고, 나중엔 자연어 검색 재시도에도 쓴다.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly errors: string[] = [],
  ) {
    super(`API ${status}`);
  }
}

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === "string");

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const errors =
      body && typeof body === "object" && "errors" in body && isStringArray(body.errors)
        ? body.errors
        : [];
    throw new ApiError(res.status, errors);
  }
  return (await res.json()) as T;
}
