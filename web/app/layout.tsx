import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import { SITE, Wordmark } from "@/lib/site";
import { LoginButton } from "@/lib/auth";
import { TeamPicker } from "@/lib/teams";

export const metadata: Metadata = {
  /* 링크 미리보기 이미지는 절대 주소여야 해서 기준 주소를 알려준다 */
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    url: SITE.url,
    locale: SITE.locale,
  },
  twitter: { card: "summary_large_image", title: SITE.title, description: SITE.description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-y-2 gap-x-4 px-4 py-3">
              <nav className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <Link href="/" className="text-lg">
                  <Wordmark />
                </Link>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                  대시보드
                </Link>
                <Link href="/schedule" className="text-sm text-slate-600 hover:text-slate-900">
                  일정
                </Link>
                <Link href="/board" className="text-sm text-slate-600 hover:text-slate-900">
                  게시판
                </Link>
              </nav>
              <span className="flex items-center gap-3">
                <TeamPicker />
                <Suspense fallback={null}>
                  <LoginButton />
                </Suspense>
              </span>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
