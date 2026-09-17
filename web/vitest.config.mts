import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    /**
     * 타임존을 고정한다. 경기 날짜는 KST 기준인데, 날짜를 만드는 코드는 머신 타임존에 따라 결과가
     * 달라진다 — 서울에서는 통과하고 UTC 인 CI 에서는 하루 밀려 실패하는 테스트가 생긴다.
     * (자연어 검색의 "지난주" 같은 상대 날짜가 들어오면 바로 해당된다.)
     */
    env: { TZ: "Asia/Seoul" },
    setupFiles: ["./vitest.setup.ts"],
    /* 유닛·컴포넌트는 *.test.*. 나중에 Playwright 를 넣으면 e2e/*.spec.* 로 갈라 서로 주워가지 않게 한다 */
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
});
