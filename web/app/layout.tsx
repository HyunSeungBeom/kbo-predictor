import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import Providers from "./providers";
import TeamPicker from "@/components/TeamPicker";

export const metadata: Metadata = {
  title: "KBO Predictor",
  description: "KBO 순위 · 가을야구 진출/우승 확률 · 경기 예측",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <Providers>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <nav className="flex items-center gap-5">
                <Link href="/" className="text-lg font-bold">
                  ⚾ KBO Predictor
                </Link>
                <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                  대시보드
                </Link>
                <Link href="/schedule" className="text-sm text-slate-600 hover:text-slate-900">
                  일정
                </Link>
              </nav>
              <TeamPicker />
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
