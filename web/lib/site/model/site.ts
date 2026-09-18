/**
 * 사이트 한 곳에서 관리하는 이름·설명·주소. 브라우저 탭(파비콘 옆), 카카오톡·슬랙에 링크를
 * 붙였을 때 뜨는 미리보기, 검색 결과가 전부 이 값을 쓴다 — 여러 곳에 흩어지면 서로 달라진다.
 */
export const SITE = {
  /** 줄임말이 진짜 이름이다. 로고는 [WORDMARK] 로 «야구르지렁» 을 보여주고 빨간 글자만 읽으면 야르렁. */
  name: "야르렁",
  title: "야르렁 — KBO 승부 예보 · 팬 게시판",
  /** 이름만으로는 뭘 하는지 모르므로 태그라인이 그 일을 한다. */
  tagline: "오늘 경기 승부 예보 · KBO 팬 게시판",
  description:
    "선발 투수까지 반영한 KBO 오늘 경기 승리 확률, 실시간 순위, 가을야구 진출·우승 확률, 팀별 팬 게시판.",
  /** 링크 미리보기 이미지는 절대 주소여야 한다 — 배포 주소를 모르면 로컬로 떨어진다. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://yareureong.vercel.app",
  locale: "ko_KR",
} as const;

/**
 * 로고 워드마크. «야구르지렁» 에서 **야·르·렁만 빨강** → 빨간 글자만 읽으면 «야르렁».
 * 야구팬은 화가 많아 으르렁거린다는 데서 온 이름이라, 강조색도 붉은 계열이다.
 *
 * 이미지가 아니라 글자라 어떤 화면에서도 안 깨지고, 스크린 리더에는 전체 이름이 그대로 읽힌다.
 */
export const WORDMARK = [
  { char: "야", accent: true },
  { char: "구", accent: false },
  { char: "르", accent: true },
  { char: "지", accent: false },
  { char: "렁", accent: true },
] as const;

/** 강조 글자만 이었을 때 줄임말(=서비스 이름)이 되는지 — 워드마크의 존재 이유다. */
export const wordmarkShortName = (): string =>
  WORDMARK.filter((c) => c.accent).map((c) => c.char).join("");

/** 미리보기 카드 이미지 크기(OG 표준 1.91:1). */
export const OG_IMAGE = { width: 1200, height: 630, alt: `${SITE.name} — ${SITE.tagline}` } as const;

/** 강조색. 로고·미리보기 이미지가 같은 값을 쓴다. */
export const ACCENT = "#dc2626";
