import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TeamBoard } from "@/lib/board";
import { TEAM_IDS, isTeamId, teamName } from "@/lib/teams";

/** 팀 게시판 10개는 팀 코드가 고정이라 미리 만들어 둔다(정적 생성). */
export function generateStaticParams() {
  return TEAM_IDS.map((teamId) => ({ teamId }));
}

export async function generateMetadata({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return { title: isTeamId(teamId) ? `${teamName(teamId)} 게시판` : "게시판" };
}

export default async function TeamBoardPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  /* 모르는 팀 코드로 들어오면 빈 게시판 대신 404 — 잘못된 링크가 정상 화면처럼 보이지 않게 */
  if (!isTeamId(teamId)) notFound();

  return (
    <Suspense>
      <TeamBoard teamId={teamId} />
    </Suspense>
  );
}
