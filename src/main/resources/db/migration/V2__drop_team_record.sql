-- 순위(승/패/무)는 game(FINAL)에서 실시간 계산한다 → team 테이블의 중복 컬럼 제거.
-- 단일 진실원천 = game. (drift 방지)
ALTER TABLE team DROP COLUMN wins;
ALTER TABLE team DROP COLUMN losses;
ALTER TABLE team DROP COLUMN draws;
