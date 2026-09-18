import { Suspense } from "react";
import { BoardList } from "@/lib/board";

export const metadata = { title: "팬 게시판" };

export default function BoardPage() {
  return (
    <Suspense>
      <BoardList />
    </Suspense>
  );
}
