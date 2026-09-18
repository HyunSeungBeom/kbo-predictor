import { z } from "zod";

/**
 * 글 입력 규칙 — **서버 규칙(PostRules)과 같은 값**이다.
 *
 * 프론트 검증은 «타이핑하는 동안 바로 알려주기» 위한 것이지 보안 장치가 아니다. 최종 판정은
 * 언제나 서버가 하고, 그래서 두 곳에 같은 숫자가 있다. 한쪽을 고치면 **둘 다** 고쳐야 한다.
 */
export const MAX_TITLE = 100;
export const MAX_CONTENT = 2000;

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "제목을 입력해 주세요")
    .max(MAX_TITLE, `제목은 ${MAX_TITLE}자까지 쓸 수 있어요`),
  content: z
    .string()
    .trim()
    .min(1, "내용을 입력해 주세요")
    .max(MAX_CONTENT, `내용은 ${MAX_CONTENT}자까지 쓸 수 있어요`),
});

export type PostInput = z.infer<typeof postSchema>;
