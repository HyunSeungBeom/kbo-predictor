"use client";

import Image from "next/image";
import { useState } from "react";
import { teamColor, teamLogoUrl, teamName } from "../model/teams";

/**
 * 구단 로고. 외부 이미지라 언제든 안 열릴 수 있어 **실패하면 팀 색 배지로 대체**한다 —
 * 깨진 이미지 아이콘이 뜨는 것보다 낫고, 화면 구조도 그대로 유지된다.
 *
 * 팀 이름이 옆에 따로 적히는 자리가 많아 기본은 장식(`alt=""`)이다. 이름 없이 로고만 쓰는
 * 자리에서는 `labelled` 로 접근성 이름을 준다.
 */
export function TeamLogo({
  teamId,
  size = 24,
  labelled = false,
}: {
  teamId: string;
  size?: number;
  labelled?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const url = teamLogoUrl(teamId);
  const name = teamName(teamId);

  if (!url || failed) {
    return (
      <span
        role={labelled ? "img" : undefined}
        aria-label={labelled ? name : undefined}
        aria-hidden={labelled ? undefined : true}
        style={{ width: size, height: size, backgroundColor: teamColor(teamId) }}
        className="inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      >
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    <Image
      src={url}
      alt={labelled ? name : ""}
      width={size}
      height={size}
      className="shrink-0 rounded-full bg-white object-contain"
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}
