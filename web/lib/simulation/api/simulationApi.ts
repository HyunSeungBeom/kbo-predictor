import { get } from "@/lib/api";
import type { SimulationResult } from "../model/types";

/** 가을야구 진출·우승 확률(몬테카를로). `GET /api/simulation?iterations=10000` */
export const getSimulation = (iterations: number) =>
  get<SimulationResult[]>(`/api/simulation?iterations=${iterations}`);
