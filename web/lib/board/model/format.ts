/** 글 목록·상세의 시간 표기. 방금 쓴 글은 «몇 분 전» 이 더 읽기 쉽다. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const diffMinutes = Math.floor((now.getTime() - then.getTime()) / 60_000);

  if (diffMinutes < 1) return "방금";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;

  /* 일주일이 넘으면 «며칠 전» 이 감이 안 온다 — 날짜로 적는다 */
  return `${then.getFullYear()}.${String(then.getMonth() + 1).padStart(2, "0")}.${String(then.getDate()).padStart(2, "0")}`;
}
