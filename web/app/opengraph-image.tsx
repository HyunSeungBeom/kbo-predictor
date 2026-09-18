import { ImageResponse } from "next/og";
import { ACCENT, OG_IMAGE, SITE, WORDMARK } from "@/lib/site";

/**
 * 링크를 붙였을 때 뜨는 미리보기 이미지. 빌드 때 한 장 만들어 둔다.
 *
 * 화면 스크린샷 대신 제목·설명을 그린다 — 미리보기는 카톡·슬랙에서 작게 뜨고, 그때 읽히는 건
 * 글자뿐이라 스크린샷을 넣으면 뭉개진다.
 */
export const alt = OG_IMAGE.alt;
export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: 80,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#f8fafc",
          fontSize: 40,
        }}
      >
        {/* 로고 워드마크 — 빨간 글자만 읽으면 «야르렁» */}
        <div style={{ display: "flex", fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
          {WORDMARK.map(({ char, accent }, i) => (
            <span key={i} style={{ color: accent ? ACCENT : "#f8fafc" }}>
              {char}
            </span>
          ))}
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, lineHeight: 1.3 }}>{SITE.tagline}</div>
        <div style={{ fontSize: 30, color: "#cbd5e1", lineHeight: 1.4 }}>
          선발 투수까지 보고 계산한 오늘 경기 승리 확률
        </div>
      </div>
    ),
    size,
  );
}
