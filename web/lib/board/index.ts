/**
 * 팬 게시판 도메인의 입구 — 백엔드 `board` 패키지(`/api/board`)와 1:1.
 *
 * **읽기는 로그인 없이, 쓰기·수정·삭제는 글쓴이 본인만.** 권한은 서버가 세션으로 판단하고,
 * 여기서 쓰는 `mine` 은 버튼을 보여줄지 정하는 표시용이다.
 */

export * from "./model/types";
export * from "./model/postSchema";
export * from "./model/format";
export * from "./api/boardApi";
export * from "./api/keys";
export * from "./hooks/usePosts";
export * from "./ui/BoardList";
export * from "./ui/PostCard";
export * from "./ui/PostForm";
export * from "./ui/TeamBoard";
