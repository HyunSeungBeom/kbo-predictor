import { del, get, post as postJson, put } from "@/lib/api";
import type { Post, PostDraft, PostPage } from "../model/types";

export const getPosts = (teamId: string, page = 0) =>
  get<PostPage>(`/api/board/${teamId}/posts?page=${page}`);

export const getPost = (id: number) => get<Post>(`/api/board/posts/${id}`);

export const createPost = (teamId: string, form: PostDraft) =>
  postJson<Post>(`/api/board/${teamId}/posts`, form);

export const updatePost = (id: number, form: PostDraft) => put<Post>(`/api/board/posts/${id}`, form);

export const deletePost = (id: number) => del<void>(`/api/board/posts/${id}`);
