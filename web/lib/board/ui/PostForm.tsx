"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { MAX_CONTENT, MAX_TITLE, postSchema, type PostInput } from "../model/postSchema";

/**
 * 글 작성·수정 폼.
 *
 * 값·검증·제출 상태의 주인은 **폼 하나**다(react-hook-form). 각 입력을 `useState` 로 들면
 * 검증 시점과 에러 표시가 제각각이 된다. 규칙은 zod 스키마 한 곳에 있고, 서버도 같은 규칙을
 * 따로 검사한다 — 프론트 검증은 «바로 알려주기» 지 보안 장치가 아니다.
 */
export function PostForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  pending,
  serverErrors,
}: {
  defaultValues?: PostInput;
  submitLabel: string;
  onSubmit: (values: PostInput) => void;
  onCancel?: () => void;
  pending?: boolean;
  serverErrors?: string[];
}) {
  const { control, handleSubmit, formState, watch } = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    mode: "onBlur",
    defaultValues: defaultValues ?? { title: "", content: "" },
  });
  const content = watch("content") ?? "";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <Controller
        name="title"
        control={control}
        render={({ field, fieldState }) => (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            제목
            <input
              {...field}
              maxLength={MAX_TITLE}
              placeholder="제목을 입력하세요"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            {fieldState.error && <span className="text-red-600">{fieldState.error.message}</span>}
          </label>
        )}
      />

      <Controller
        name="content"
        control={control}
        render={({ field, fieldState }) => (
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            내용
            <textarea
              {...field}
              rows={6}
              maxLength={MAX_CONTENT}
              placeholder="응원하는 말을 남겨보세요"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
            <span className="flex justify-between">
              {fieldState.error ? (
                <span className="text-red-600">{fieldState.error.message}</span>
              ) : (
                <span />
              )}
              <span className="tabular-nums">
                {content.length} / {MAX_CONTENT}
              </span>
            </span>
          </label>
        )}
      />

      {/* 서버가 막은 이유(도배 방지 등)는 프론트 규칙으로는 알 수 없다 — 그대로 보여준다 */}
      {serverErrors && serverErrors.length > 0 && (
        <ul className="list-inside list-disc text-xs text-red-600">
          {serverErrors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending || formState.isSubmitting}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white disabled:opacity-40"
        >
          {pending ? "저장 중…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-300 px-4 py-1.5 text-sm"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
