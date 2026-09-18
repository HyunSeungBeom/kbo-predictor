import { describe, expect, it } from "vitest";
import { MAX_CONTENT, MAX_TITLE, postSchema } from "..";

const parse = (title: string, content: string) => postSchema.safeParse({ title, content });
const messages = (title: string, content: string) =>
  parse(title, content).error?.issues.map((i) => i.message) ?? [];

/** 프론트 검증 규칙. **서버 PostRules 와 같은 값**이어야 한다 — 한쪽만 고치면 사용자가 헷갈린다. */
describe("PSC 001: 글 입력 규칙", () => {
  it("제목과 내용이 있으면 통과한다", () => {
    expect(parse("제목", "내용").success).toBe(true);
  });

  it("공백만 있는 것은 빈 것으로 본다", () => {
    expect(messages("   ", "내용")).toContain("제목을 입력해 주세요");
    expect(messages("제목", "  \n ")).toContain("내용을 입력해 주세요");
  });

  it("길이 제한은 경계에서 갈린다", () => {
    expect(parse("가".repeat(MAX_TITLE), "내용").success).toBe(true);
    expect(messages("가".repeat(MAX_TITLE + 1), "내용")).toContain(`제목은 ${MAX_TITLE}자까지 쓸 수 있어요`);
    expect(parse("제목", "가".repeat(MAX_CONTENT)).success).toBe(true);
    expect(messages("제목", "가".repeat(MAX_CONTENT + 1))).toContain(`내용은 ${MAX_CONTENT}자까지 쓸 수 있어요`);
  });

  it("앞뒤 공백은 잘라서 보낸다", () => {
    expect(parse("  제목  ", "  내용  ").data).toEqual({ title: "제목", content: "내용" });
  });
});
