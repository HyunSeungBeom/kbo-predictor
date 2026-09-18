/**
 * 시뮬레이션 도메인의 입구 — 백엔드 `simulation` 패키지(`/api/simulation`)와 1:1.
 *
 * **쓰는 화면** — 대시보드(`/`)의 우승 확률 차트
 */

export * from "./model/types";
export * from "./model/chart";
export * from "./api/simulationApi";
export * from "./api/keys";
export * from "./hooks/useSimulation";
export * from "./ui/ProbabilityChart";
