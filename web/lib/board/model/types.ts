import type { TeamId } from "@/lib/teams";

/** 글 한 건. `mine` 은 서버가 판단해 내려준 «내가 쓴 글인가» — 버튼 노출 판단에만 쓴다. */
export interface Post {
  id: number;
  teamId: TeamId;
  title: string;
  content: string;
  authorNickname: string;
  authorProfileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  mine: boolean;
}

export interface PostPage {
  items: Post[];
  page: number;
  size: number;
  totalPages: number;
  totalItems: number;
}

/** 글 작성·수정에 보내는 값. 컴포넌트 `PostForm` 과 구분해 Draft 라 부른다. */
export interface PostDraft {
  title: string;
  content: string;
}
