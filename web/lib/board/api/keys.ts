/** queryKey 팩토리 — 글을 쓰거나 지우면 이 키로 목록을 무효화한다. */
export const boardKeys = {
  all: ["board"] as const,
  team: (teamId: string) => [...boardKeys.all, teamId] as const,
  list: (teamId: string, page: number) => [...boardKeys.team(teamId), "list", page] as const,
  detail: (id: number) => [...boardKeys.all, "post", id] as const,
};
