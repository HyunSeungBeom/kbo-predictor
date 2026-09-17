/**
 * 구단 도메인의 입구. 밖에서는 이 파일로만 들어온다 — 안을 쪼개고 합쳐도 소비자가 안 깨지게.
 *
 * - 팀 코드(`TeamId`)·이름·색 — 모든 도메인이 쓴다
 * - 내 팀(응원팀) — 헤더에서 고르고, 순위표·우승확률 차트가 강조에 쓴다
 */

export * from "./model/teams";
export * from "./store/favoriteTeam";
export * from "./ui/TeamPicker";
