import type { GameFilter } from "../model/types";

/**
 * queryKey 팩토리 — 리터럴 배열을 흩뿌리지 않는다. 키가 흩어지면 무효화 대상을 빠뜨려도
 * 화면이 조용히 낡은 데이터를 보여준다. 목록 키는 필터를 통째로 들어 조건마다 캐시가 갈린다.
 */
export const gameKeys = {
  all: ["games"] as const,
  list: (filter: GameFilter) => [...gameKeys.all, "list", filter] as const,
};
