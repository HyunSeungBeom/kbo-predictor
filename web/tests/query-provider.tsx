import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

/**
 * TanStack Query 래퍼. 앱은 `app/providers` 아래서 돌지만 화면 테스트는 컴포넌트를 직접 렌더하므로
 * 여기서 준다. 테스트마다 새 클라이언트 — 캐시가 테스트 사이로 새면 앞 테스트의 응답이 보인다.
 * retry 끔 — 실패 화면을 재시도 대기 없이 바로 본다.
 */
export function renderWithQuery(ui: ReactElement, options?: RenderOptions) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...render(ui, { wrapper: Wrapper, ...options }) };
}
