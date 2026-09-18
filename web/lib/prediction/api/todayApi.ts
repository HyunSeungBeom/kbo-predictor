import { get } from "@/lib/api";
import type { TodayGame } from "../model/types";

/** 그날 열리는 경기 + 선발 반영 예측. date 를 생략하면 서버가 KST 오늘로 판단한다. */
export const getTodayGames = (date?: string) =>
  get<TodayGame[]>(`/api/predict/today${date ? `?date=${date}` : ""}`);
