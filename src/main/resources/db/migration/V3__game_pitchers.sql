-- 선발 투수·경기 시간·구장을 저장한다. 선발은 단일 경기 승패에 가장 크게 작용하는 변수라
-- 예측에 쓰고(등판 이력을 수축해 반영), 카드 화면에 그대로 보여준다.
ALTER TABLE game ADD COLUMN home_start_pitcher VARCHAR(50);
ALTER TABLE game ADD COLUMN away_start_pitcher VARCHAR(50);
ALTER TABLE game ADD COLUMN start_time         VARCHAR(5);   -- "18:30"
ALTER TABLE game ADD COLUMN stadium            VARCHAR(100);

-- 출처의 경기 id. upsert 키를 (날짜+홈+원정) 에서 이것으로 옮기기 위한 것 —
-- 더블헤더(같은 날 같은 카드 2경기)가 한 건으로 덮어써지던 문제를 막는다.
-- 이 마이그레이션 이전에 들어온 행은 값이 없으므로 NULL 을 허용하고, 채워진 값만 유일하게 한다.
ALTER TABLE game ADD COLUMN external_id VARCHAR(40);
CREATE UNIQUE INDEX uk_game_external_id ON game (external_id) WHERE external_id IS NOT NULL;
