"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { parseGameFilter, toQueryString } from "../model/urlFilter";
import type { GameFilter } from "../model/types";

/**
 * 일정 필터를 URL 에 결합한다 — 라우터를 상대하는 부분만 여기 있다.
 * 읽고 쓰는 규칙은 `model/urlFilter` 의 순수 함수가 갖는다.
 *
 * URL 이 원천이라 새로고침·뒤로가기·링크 공유에도 같은 검색 결과가 유지되고,
 * 자연어 검색도 "문장 → 필터 → URL" 로 이 경로를 그대로 쓴다.
 */
export function useGameFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = useMemo(() => parseGameFilter(searchParams), [searchParams]);

  /* replace 라 필터를 만질 때마다 뒤로 가기 스택이 쌓이지 않고, scroll:false 라 목록 위치가 튀지 않는다 */
  const setFilter = (next: GameFilter) => router.replace(`${pathname}${toQueryString(next)}`, { scroll: false });

  return { filter, setFilter };
}
