"use client";

import Image from "next/image";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useDeletePost, useUpdatePost } from "../hooks/usePosts";
import { timeAgo } from "../model/format";
import type { Post } from "../model/types";
import { PostForm } from "./PostForm";

/**
 * 글 한 건. 수정·삭제 버튼은 **내 글일 때만** 보인다.
 * 다만 이건 화면 편의일 뿐이고, 실제 권한은 서버가 세션으로 판단한다 — 버튼을 억지로 눌러도 막힌다.
 */
export function PostCard({ post }: { post: Post }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdatePost(post.teamId, post.id);
  const remove = useDeletePost(post.teamId, post.id);
  const errors = update.error instanceof ApiError ? update.error.errors : [];

  if (editing) {
    return (
      <li className="rounded-xl border border-slate-200 bg-white p-4">
        <PostForm
          defaultValues={{ title: post.title, content: post.content }}
          submitLabel="수정"
          pending={update.isPending}
          serverErrors={errors}
          onCancel={() => setEditing(false)}
          onSubmit={(values) => update.mutate(values, { onSuccess: () => setEditing(false) })}
        />
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {post.authorProfileImageUrl && (
          <Image src={post.authorProfileImageUrl} alt="" width={20} height={20} className="rounded-full" unoptimized />
        )}
        <span className="font-medium text-slate-700">{post.authorNickname}</span>
        <span>{timeAgo(post.createdAt)}</span>
        {post.edited && <span className="text-slate-400">(수정됨)</span>}
      </div>

      <h3 className="font-semibold break-keep">{post.title}</h3>
      {/* 평문만 저장하고 평문으로 그린다 — HTML 을 허용하지 않으므로 XSS 가 성립하지 않는다 */}
      <p className="mt-1 text-sm whitespace-pre-wrap break-words text-slate-700">{post.content}</p>

      {post.mine && (
        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <button type="button" onClick={() => setEditing(true)} className="hover:text-slate-900 hover:underline">
            수정
          </button>
          <button
            type="button"
            onClick={() => remove.mutate(undefined)}
            disabled={remove.isPending}
            className="hover:text-red-600 hover:underline disabled:opacity-40"
          >
            {remove.isPending ? "지우는 중…" : "삭제"}
          </button>
        </div>
      )}
    </li>
  );
}
