import { Suspense } from "react";
import { ScheduleList } from "@/lib/games";

// ScheduleList 가 useSearchParams 로 URL 필터를 읽으므로, 정적 빌드 시 Suspense 경계가 필요하다.
export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleList />
    </Suspense>
  );
}
