import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// vitest 의 globals 옵션을 켜지 않았으므로 RTL 의 자동 cleanup 이 붙지 않는다 — 명시적으로 건다.
// (주석을 `/* globals` 로 시작하면 ESLint 가 전역 변수 선언 지시문으로 읽는다.)
afterEach(cleanup);
