"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { authKeys } from "../api/keys";
import { getMe, logout } from "../api/authApi";
import type { Me } from "../model/types";

/**
 * 지금 로그인한 사람. **비로그인(401)은 실패가 아니라 «없음»** 이다 — 에러 화면을 띄우면 안 된다.
 */
export function useMe() {
  const query = useQuery<Me | null>({
    queryKey: authKeys.me(),
    queryFn: async () => {
      try {
        return await getMe();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    staleTime: 60_000,
  });

  return { me: query.data ?? null, isLoading: query.isLoading };
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    /* 로그아웃 후에는 화면 곳곳의 «내 글» 표시가 달라진다 — 전부 새로 받는다 */
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
