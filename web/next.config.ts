import type { NextConfig } from "next";

/**
 * API 는 다른 호스트(Render)에 있지만, 브라우저에는 **같은 사이트로 보이게** 프록시한다.
 *
 * 로그인 세션을 HttpOnly 쿠키로 다루는데, 프론트(vercel.app)와 API(onrender.com)가 다른 사이트면
 * 그 쿠키는 «제3자 쿠키» 가 되어 **사파리·아이폰에서 차단**된다. 프록시를 두면 쿠키가 1차 쿠키가
 * 되고, 덤으로 CORS 설정도 필요 없어진다.
 *
 * 프록시 대상이 없으면(로컬에서 API 를 직접 부르는 경우) 재작성하지 않는다.
 */
const API_ORIGIN = process.env.API_PROXY_ORIGIN ?? process.env.NEXT_PUBLIC_API_BASE ?? "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!API_ORIGIN) return [];
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
