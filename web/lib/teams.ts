export const TEAMS: Record<string, { name: string; color: string }> = {
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
};

export const TEAM_IDS = Object.keys(TEAMS);
export const teamName = (id: string): string => TEAMS[id]?.name ?? id;
export const teamColor = (id: string): string => TEAMS[id]?.color ?? "#64748b";
