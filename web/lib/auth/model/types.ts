/** 로그인한 사람. 서버가 세션 쿠키를 보고 판단해 내려준다. */
export interface Me {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
}
