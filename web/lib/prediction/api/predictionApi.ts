import { get } from "@/lib/api";
import type { TeamId } from "@/lib/teams";
import type { Prediction } from "../model/types";

/** 단일 경기 승부 예측. `GET /api/predict?home=OB&away=LG` */
export const getPrediction = (home: TeamId, away: TeamId) =>
  get<Prediction>(`/api/predict?home=${home}&away=${away}`);
