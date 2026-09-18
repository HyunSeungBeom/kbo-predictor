import { ImageResponse } from "next/og";
import { OG_IMAGE, SITE } from "@/lib/site";

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
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, color: "#94a3b8" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              background: "#f8fafc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#dc2626",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            ⚾
          </div>
          KBO PREDICTOR
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.2 }}>
          오늘 경기, 선발까지 보고 예측합니다
        </div>
        <div style={{ fontSize: 34, color: "#cbd5e1", lineHeight: 1.4 }}>
          실시간 순위 · 몬테카를로 우승 확률 · 경기 일정 검색
        </div>
      </div>
    ),
    size,
  );
}
