import { describe, expect, it } from "vitest";
import { OG_IMAGE, SITE, WORDMARK, wordmarkShortName } from "..";

/**
 * 링크 미리보기는 **한 번 잘못 나가면 캐시돼서** 고쳐도 한참 그대로다.
 * 그래서 값의 모양(절대 주소·길이)을 여기서 고정한다.
 */

describe("SITE 001: 사이트 메타는 미리보기가 요구하는 모양을 지킨다", () => {
  it("주소는 절대 주소이고 끝에 슬래시가 없다 — 상대 주소는 미리보기에서 깨진다", () => {
    expect(SITE.url).toMatch(/^https?:\/\/[^/]+$/);
  });

  it("설명은 미리보기에서 잘리지 않는 길이다", () => {
    expect(SITE.description.length).toBeGreaterThan(20);
    expect(SITE.description.length).toBeLessThanOrEqual(120);
  });

  it("제목에 서비스 이름이 들어 있다", () => {
    expect(SITE.title).toContain(SITE.name);
  });

  it("미리보기 이미지는 OG 표준 비율(1.91:1)이다", () => {
    expect(OG_IMAGE.width / OG_IMAGE.height).toBeCloseTo(1.91, 1);
  });
});

describe("SITE 002: 로고 워드마크", () => {
  it("빨간 글자만 이으면 서비스 이름이 된다 — 이게 워드마크의 존재 이유다", () => {
    expect(wordmarkShortName()).toBe(SITE.name);
  });

  it("전체 글자는 «야구르지렁» 이다", () => {
    expect(WORDMARK.map((c) => c.char).join("")).toBe("야구르지렁");
  });

  it("강조는 일부만 — 전부 강조하면 줄임말이 드러나지 않는다", () => {
    const accented = WORDMARK.filter((c) => c.accent).length;
    expect(accented).toBeGreaterThan(0);
    expect(accented).toBeLessThan(WORDMARK.length);
  });

  it("태그라인이 서비스가 뭘 하는지 알려준다 — 이름만으로는 알 수 없다", () => {
    expect(SITE.tagline.length).toBeGreaterThan(5);
    expect(SITE.tagline).not.toContain(SITE.name);
  });
});
