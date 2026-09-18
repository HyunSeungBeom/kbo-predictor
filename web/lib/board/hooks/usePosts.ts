"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { boardKeys } from "../api/keys";
import { createPost, deletePost, getPost, getPosts, updatePost } from "../api/boardApi";
import type { PostDraft } from "../model/types";

export function usePosts(teamId: string, page = 0) {
  return useQuery({ queryKey: boardKeys.list(teamId, page), queryFn: () => getPosts(teamId, page) });
}

export function usePost(id: number) {
  return useQuery({ queryKey: boardKeys.detail(id), queryFn: () => getPost(id) });
}

/** 글을 쓰거나 고치거나 지우면 그 팀 게시판을 통째로 새로 받는다 — 목록·상세가 어긋나지 않게. */
function useBoardMutation<TArgs, TResult>(teamId: string, fn: (args: TArgs) => Promise<TResult>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardKeys.team(teamId) }),
  });
}

export const useCreatePost = (teamId: string) =>
  useBoardMutation(teamId, (form: PostDraft) => createPost(teamId, form));

export const useUpdatePost = (teamId: string, id: number) =>
  useBoardMutation(teamId, (form: PostDraft) => updatePost(id, form));

export const useDeletePost = (teamId: string, id: number) =>
  useBoardMutation(teamId, () => deletePost(id));
