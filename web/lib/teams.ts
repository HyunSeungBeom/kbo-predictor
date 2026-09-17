export interface TeamMeta {
  name: string;
  color: string;
}

/**
 * 구단 메타. `as const satisfies` 조합이 핵심 —
 * - `as const` : 키를 리터럴("OB" | "LG" | ...)로 보존해 [TeamId]를 만들 수 있게 한다.
 * - `satisfies`: 값이 [TeamMeta] 형태인지 검사하되, 추론된 리터럴 타입은 넓히지 않는다.
 *
 * 예전처럼 `const TEAMS: Record<string, TeamMeta>` 로 **선언**하면 키가 string 으로 뭉개져
 * TEAM_IDS 가 string[] 이 되고, `TEAM_IDS.map((id) => ...)` 의 id 도 string 으로 추론된다.
 * (팀 코드 오타를 컴파일러가 못 잡던 원인)
 */
export const TEAMS = {
  OB: { name: "두산 베어스", color: "#131230" },
  LG: { name: "LG 트윈스", color: "#C30452" },
  SS: { name: "삼성 라이온즈", color: "#074CA1" },
  KT: { name: "KT 위즈", color: "#000000" },
  SK: { name: "SSG 랜더스", color: "#CE0E2D" },
  WO: { name: "키움 히어로즈", color: "#820024" },
  HH: { name: "한화 이글스", color: "#FC4E00" },
  LT: { name: "롯데 자이언츠", color: "#041E42" },
  HT: { name: "KIA 타이거즈", color: "#EA0029" },
  NC: { name: "NC 다이노스", color: "#315288" },
} as const satisfies Record<string, TeamMeta>;

/** "OB" | "LG" | "SS" | ... — 백엔드 team 테이블의 PK와 같은 값. */
export type TeamId = keyof typeof TEAMS;

/** Object.keys 는 항상 string[] 을 주므로 여기서만 단언한다(키 출처가 TEAMS 하나뿐이라 안전). */
export const TEAM_IDS = Object.keys(TEAMS) as TeamId[];

/**
 * 런타임 문자열 → TeamId 좁히기. localStorage·select value·URL 처럼 외부에서 온 값에 쓴다.
 * `in` 이 아니라 자기 속성만 본다 — `in` 은 프로토타입까지 봐서 "toString" 도 팀으로 통과시킨다.
 */
export const isTeamId = (id: string | null | undefined): id is TeamId =>
  id != null && Object.hasOwn(TEAMS, id);

const FALLBACK_COLOR = "#64748b";

/**
 * 표시용 헬퍼는 일부러 `string` 을 받는다. 신생 구단이 생기거나 백엔드가 모르는 코드를
 * 내려보내도 화면이 깨지지 않고 코드 그대로 보여주며 넘어가게 하기 위함.
 */
export const teamName = (id: string): string => (isTeamId(id) ? TEAMS[id].name : id);
export const teamColor = (id: string): string => (isTeamId(id) ? TEAMS[id].color : FALLBACK_COLOR);
