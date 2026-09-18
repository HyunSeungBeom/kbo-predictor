/**
 * 사이트 한 곳에서 관리하는 이름·설명·주소. 브라우저 탭(파비콘 옆), 카카오톡·슬랙에 링크를
 * 붙였을 때 뜨는 미리보기, 검색 결과가 전부 이 값을 쓴다 — 여러 곳에 흩어지면 서로 달라진다.
 */
export const SITE = {
  name: "KBO Predictor",
  title: "KBO Predictor — 오늘 경기 예측 · 순위 · 우승 확률",
  description:
    "KBO 오늘 경기를 선발 투수 기록까지 반영해 예측합니다. 실시간 순위, 몬테카를로 우승 확률, 경기 일정 검색.",
  /** 링크 미리보기 이미지는 절대 주소여야 한다 — 배포 주소를 모르면 로컬로 떨어진다. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kbo-predictor-three.vercel.app",
  locale: "ko_KR",
} as const;

/** 미리보기 카드 이미지 크기(OG 표준 1.91:1). */
export const OG_IMAGE = { width: 1200, height: 630, alt: SITE.title } as const;
