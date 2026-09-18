/**
 * 로그인 도메인의 입구 — 백엔드 `auth` 패키지(`/api/auth`)와 1:1.
 *
 * 세션은 **HttpOnly 쿠키**라 프론트 코드가 토큰을 만지지 않는다. 여기서 아는 것은
 * «지금 누구로 보이는가»(`useMe`)뿐이고, 권한 판정은 전부 서버가 한다.
 */

export * from "./model/types";
export * from "./api/authApi";
export * from "./api/keys";
export * from "./hooks/useMe";
export * from "./ui/LoginButton";
