/** queryKey 팩토리 — 반복 횟수가 다르면 다른 결과이므로 키에 넣는다. */
export const simulationKeys = {
  all: ["simulation"] as const,
  result: (iterations: number) => [...simulationKeys.all, iterations] as const,
};
