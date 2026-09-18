"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import { kakaoLoginUrl, useMe } from "@/lib/auth";
import { TeamLogo, teamName } from "@/lib/teams";
import { useCreatePost, usePosts } from "../hooks/usePosts";
import { PostCard } from "./PostCard";
import { PostForm } from "./PostForm";

/**
 * 팀별 팬 게시판.
 *
 * **읽기는 누구나, 쓰기는 로그인한 사람만.** 로그인하지 않았으면 글쓰기 자리에 로그인 버튼을 둔다 —
 * 빈 폼을 보여주고 제출할 때 막으면, 다 쓰고 나서 로그인하라는 말이 된다.
 */
export function TeamBoard({ teamId }: { teamId: string }) {
  const [page, setPage] = useState(0);
  const { me } = useMe();
  const { data, isLoading, error } = usePosts(teamId, page);
  const create = useCreatePost(teamId);
  const createErrors = create.error instanceof ApiError ? create.error.errors : [];

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <TeamLogo teamId={teamId} size={28} />
        <h1 className="text-lg font-bold">{teamName(teamId)} 게시판</h1>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        {me ? (
          <PostForm
            submitLabel="글쓰기"
            pending={create.isPending}
            serverErrors={createErrors}
            onSubmit={(values) => create.mutate(values, { onSuccess: () => create.reset() })}
          />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">로그인하면 글을 남길 수 있어요.</p>
            <a
              href={kakaoLoginUrl(`/board/${teamId}`)}
              className="rounded-md bg-[#FEE500] px-3 py-1.5 text-sm font-medium text-[#191600]"
            >
              카카오 로그인
            </a>
          </div>
        )}
      </section>

      {isLoading && <p className="text-sm text-slate-500">불러오는 중…</p>}
      {error && <p className="text-sm text-red-600">글을 불러오지 못했어요.</p>}

      {data && data.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          아직 글이 없어요. 첫 글을 남겨보세요.
        </p>
      )}

      {data && data.items.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </ul>
      )}

      {data && data.totalPages > 1 && (
        <nav aria-label="페이지" className="flex items-center justify-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            이전
          </button>
          <span className="tabular-nums text-slate-500">
            {data.page + 1} / {data.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
            disabled={data.page + 1 >= data.totalPages}
            className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-40"
          >
            다음
          </button>
        </nav>
      )}
    </div>
  );
}
