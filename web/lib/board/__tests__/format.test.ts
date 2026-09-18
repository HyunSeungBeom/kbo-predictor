import { describe, expect, it } from "vitest";
import { timeAgo } from "..";

const now = new Date("2026-09-18T12:00:00Z");
const ago = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();

describe("FMT 001: 방금 쓴 글은 «몇 분 전» 으로 보여준다", () => {
  it.each([
    [0, "방금"],
    [1, "1분 전"],
    [59, "59분 전"],
    [60, "1시간 전"],
    [60 * 23, "23시간 전"],
    [60 * 24, "1일 전"],
    [60 * 24 * 6, "6일 전"],
  ])("%i분 전 → %s", (minutes, expected) => {
    expect(timeAgo(ago(minutes), now)).toBe(expected);
  });

  it("일주일이 넘으면 날짜로 적는다 — «14일 전» 은 감이 안 온다", () => {
    expect(timeAgo("2026-09-01T09:00:00Z", now)).toBe("2026.09.01");
  });
});
