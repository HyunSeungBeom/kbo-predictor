import { useCallback, useSyncExternalStore } from "react";

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

const getSnapshot = (): string | null => localStorage.getItem(KEY);
const getServerSnapshot = (): string | null => null; // SSR: 서버는 내 팀 모름

/**
 * 내 팀(응원팀)을 localStorage에 저장하고 전 컴포넌트가 구독한다.
 * useSyncExternalStore → SSR 안전 + 같은 탭/다른 탭 모두 실시간 반영.
 */
export function useFavoriteTeam() {
  const team = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTeam = useCallback((id: string | null) => {
    if (id) localStorage.setItem(KEY, id);
    else localStorage.removeItem(KEY);
    listeners.forEach((l) => l()); // 같은 탭 즉시 반영(storage 이벤트는 타 탭만 발생)
  }, []);

  return { team, setTeam };
}
