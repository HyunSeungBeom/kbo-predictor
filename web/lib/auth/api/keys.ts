/** queryKey 팩토리 — 리터럴 배열을 흩뿌리지 않는다. */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};
