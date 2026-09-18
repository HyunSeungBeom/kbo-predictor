-- 팬 게시판 + 소셜 로그인.
--
-- 개인정보는 **최소로만** 받는다. 카카오에서 닉네임·프로필 이미지만 받고 이메일·전화번호는
-- 받지 않는다 — 안 받으면 지킬 것도, 유출될 것도 없다.

CREATE TABLE app_user (
    id                BIGSERIAL    PRIMARY KEY,
    -- 어느 소셜로 들어왔는가 + 그쪽의 사용자 id. 같은 사람이 재로그인하면 이 쌍으로 찾는다.
    provider          VARCHAR(20)  NOT NULL,
    provider_user_id  VARCHAR(64)  NOT NULL,
    nickname          VARCHAR(50)  NOT NULL,
    profile_image_url VARCHAR(500),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    UNIQUE (provider, provider_user_id)
);

-- 세션은 서버가 들고 있는다(JWT 아님). 로그아웃·차단 때 **즉시 무효화**할 수 있어야 하고,
-- 토큰 자체는 해시로만 저장해 DB 가 새도 세션을 탈취당하지 않게 한다.
CREATE TABLE user_session (
    token_hash  VARCHAR(64)  PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ  NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_session_user ON user_session (user_id);
CREATE INDEX idx_session_expires ON user_session (expires_at);

-- 팀별 게시판. team_id 는 game/team 과 같은 구단 코드(OB·LG…).
CREATE TABLE post (
    id         BIGSERIAL     PRIMARY KEY,
    team_id    VARCHAR(10)   NOT NULL REFERENCES team(id),
    author_id  BIGINT        NOT NULL REFERENCES app_user(id),
    title      VARCHAR(100)  NOT NULL,
    content    TEXT          NOT NULL,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
    -- 지운 글은 바로 없애지 않는다. 신고·분쟁 때 확인할 수 있어야 하고, 실수로 지운 것도 되살린다.
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_post_team_created ON post (team_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_post_author ON post (author_id);
