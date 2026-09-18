import { ACCENT, SITE, WORDMARK } from "../model/site";

/**
 * 로고. «야구르지렁» 을 쓰되 야·르·렁만 붉게 칠해, 빨간 글자만 읽으면 «야르렁» 이 된다.
 *
 * 색으로만 전달되는 정보라 **보이지 않는 사람에게는 사라진다** — 그래서 `title` 로 설명을 달고,
 * 스크린 리더에는 전체 이름이 그대로 읽히게 둔다(강조 글자에 따로 표식을 넣지 않는다).
 *
 * 이미지가 아니라 글자라 어떤 크기·화면에서도 안 깨지고, 색만 바꾸면 테마도 따라온다.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-tight ${className}`} title={`${SITE.name} — 야구르지렁`}>
      {WORDMARK.map(({ char, accent }, i) => (
        <span key={i} style={accent ? { color: ACCENT } : undefined}>
          {char}
        </span>
      ))}
    </span>
  );
}
