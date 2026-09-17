import { useCallback, useSyncExternalStore } from "react";
import { isTeamId, type TeamId } from "./teams";

const KEY = "kbo:favoriteTeam";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // 다른 탭 변경 동기화
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

/**
 * localStorage 는 아무 문자열이나 들어올 수 있는 외부 입력이다(사용자가 직접 고치거나,
 * 예전 버전이 쓴 값이 남아 있을 수 있음). [isTeamId] 로 걸러 알 수 없는 값은 "선택 안 함"으로 취급한다.
 * 반환값이 원시값(string | null)이라 useSyncExternalStore 의 스냅샷 동일성 요건도 만족한다.
 */
const getSnapshot = (): TeamId | null => {
  const raw = localStorage.getItem(KEY);
  return isTeamId(raw) ? raw : null;
};
const getServerSnapshot = (): TeamId | null => null; // SSR: 서버는 내 팀 모름

/**
 * 내 팀(응원팀)을 localStorage에 저장하고 전 컴포넌트가 구독한다.
 * useSyncExternalStore → SSR 안전 + 같은 탭/다른 탭 모두 실시간 반영.
 */
export function useFavoriteTeam() {
  const team = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTeam = useCallback((id: TeamId | null) => {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
    listeners.forEach((l) => l()); // 같은 탭 즉시 반영(storage 이벤트는 타 탭만 발생)
  }, []);

  return { team, setTeam };
}
