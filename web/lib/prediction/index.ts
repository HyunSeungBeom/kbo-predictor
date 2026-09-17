/**
 * 예측 도메인의 입구 — 백엔드 `prediction` 패키지(`/api/predict`)와 1:1.
 *
 * **쓰는 화면** — 대시보드(`/`)의 오늘 경기 예측
 */

export * from "./model/types";
export * from "./api/predictionApi";
export * from "./api/keys";
export * from "./hooks/usePrediction";
export * from "./ui/PredictWidget";
