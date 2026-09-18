"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { kakaoLoginUrl } from "../api/authApi";
import { useLogout, useMe } from "../hooks/useMe";

/** 헤더의 로그인/로그아웃. 로그인 후 **보던 자리로 돌아오게** 현재 경로를 함께 넘긴다. */
export function LoginButton() {
  const { me, isLoading } = useMe();
  const logout = useLogout();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;

  if (isLoading) return <span className="text-xs text-slate-400">확인 중…</span>;

  if (!me) {
    return (
      <a
        href={kakaoLoginUrl(here)}
        className="rounded-md bg-[#FEE500] px-3 py-1 text-sm font-medium text-[#191600] hover:brightness-95"
      >
        카카오 로그인
      </a>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm">
      {me.profileImageUrl && (
        <Image
          src={me.profileImageUrl}
          alt=""
          width={22}
          height={22}
          className="rounded-full"
          unoptimized
        />
      )}
      <span className="max-w-24 truncate font-medium">{me.nickname}</span>
      <button
        type="button"
        onClick={() => logout.mutate()}
        disabled={logout.isPending}
        className="text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        로그아웃
      </button>
    </span>
  );
}
