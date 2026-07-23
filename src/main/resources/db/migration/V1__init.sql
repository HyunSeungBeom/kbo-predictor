-- 초기 스키마: 구단 + 경기
CREATE TABLE team (
    id     VARCHAR(10)  PRIMARY KEY,
    name   VARCHAR(50)  NOT NULL,
    wins   INT          NOT NULL DEFAULT 0,
    losses INT          NOT NULL DEFAULT 0,
    draws  INT          NOT NULL DEFAULT 0
);

CREATE TABLE game (
    id           BIGSERIAL    PRIMARY KEY,
    game_date    DATE         NOT NULL,
    home_team_id VARCHAR(10)  NOT NULL REFERENCES team(id),
    away_team_id VARCHAR(10)  NOT NULL REFERENCES team(id),
    home_score   INT,
    away_score   INT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'SCHEDULED'
);

CREATE INDEX idx_game_date ON game (game_date);

-- KBO 10개 구단 시드 (id는 통용 약칭)
INSERT INTO team (id, name) VALUES
    ('OB', '두산 베어스'),
    ('LG', 'LG 트윈스'),
    ('SS', '삼성 라이온즈'),
    ('KT', 'KT 위즈'),
    ('SK', 'SSG 랜더스'),
    ('WO', '키움 히어로즈'),
    ('HH', '한화 이글스'),
    ('LT', '롯데 자이언츠'),
    ('HT', 'KIA 타이거즈'),
    ('NC', 'NC 다이노스');
