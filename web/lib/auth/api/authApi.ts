import { get, post } from "@/lib/api";
import type { Me } from "../model/types";

/** 로그인 여부. 비로그인은 401 이라 호출부에서 null 로 바꾼다. */
export const getMe = () => get<Me>("/api/auth/me");

export const logout = () => post<void>("/api/auth/logout");

/**
 * 카카오 로그인은 **페이지 이동**이다(fetch 아님). 서버가 카카오로 보냈다가 쿠키를 심어
 * 돌려보낸다. `redirect` 에 지금 보던 경로를 넘겨 로그인 후 그 자리로 돌아온다.
 */
export const kakaoLoginUrl = (redirect: string) =>
  `/api/auth/kakao/login?redirect=${encodeURIComponent(redirect)}`;
