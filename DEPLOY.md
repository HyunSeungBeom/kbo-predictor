# 배포 가이드

전부 **카드 등록 없는 무료 티어**다. main 에 push 하고 테스트가 통과하면 GitHub Actions 가 알아서 배포한다.

## 구조

```
push(main) ─▶ backend: gradle build ──────┐
              frontend: verify · build ────┴─▶ image: 백엔드 이미지 → GHCR (:커밋SHA, :latest)
                                                 └─▶ deploy-api: Render 배포 훅(이 커밋의 이미지)
                                                       → 확인: /actuator/info 의 app.commit == SHA
                                                               ingestSource == DaumKboScheduleSource
                                                       └─▶ deploy-web: vercel build → deploy --prebuilt
                                                             → 확인: 번들에 운영 API 주소 · / · /schedule 응답
PR ─▶ backend · frontend 만 (배포 job 은 건너뜀)
매일 06:00 KST ─▶ ingest.yml: 토큰을 붙여 수집 API 호출 (잠든 서버도 깨움)
```

| 구성 | 서비스 | 왜 이걸 골랐나 |
| ---- | ------ | -------------- |
| 프론트 | **Vercel** Hobby | Next.js 기본 호스팅. 자체 Git 자동배포는 끄고(`web/vercel.json`) **Actions 만** 배포한다 — 테스트가 실패한 커밋이 배포되지 않게 |
| 백엔드 | **Render** Free, 이미지 기반 서비스 | 카드 없이 Docker 를 돌릴 수 있다. Render 가 코드를 다시 빌드하지 않고 **CI 에서 만든 이미지를 그대로** 받는다 |
| 이미지 | **GHCR** (공개) | 공개 패키지는 무료. 태그가 커밋 SHA 라 무엇이 떠 있는지 추적하고 되돌리기 쉽다 |
| DB | **Neon** Free | Postgres 0.5GB, **만료 없음**. Render 무료 Postgres 는 30일 뒤 만료된다 |
| 파이프라인 | **GitHub Actions** | 공개 레포라 실행 시간 무제한, `production` Environment 로 비밀값과 배포 이력을 관리 |

### 알고 쓰는 한계

- **첫 접속이 느리다.** Render 무료 인스턴스는 15분 동안 요청이 없으면 잠들고, 깨어나는 데 1분가량 걸린다
  (0.1 CPU 에서 Spring 기동 포함). 깨우기용 주기 핑은 넣지 않았다.
- Render 무료는 워크스페이스당 월 750시간, Neon 무료는 프로젝트당 월 100 CU-시간 · 0.5GB.
  이 서비스 하나로는 넘지 않는다.
- **GitHub 은 60일 동안 레포에 활동이 없으면 예약 워크플로(`ingest.yml`)를 끈다.** 시즌 중 커밋이 뜸하면
  Actions 탭에서 다시 켠다.
- Vercel Hobby 는 비상업 용도다(포트폴리오는 해당).

## 처음 한 번 — 계정과 비밀값

순서대로 한다. 값은 전부 **GitHub → Settings → Environments → `production`** 에 모인다.

### 1. 레포를 Public 으로
Settings → General → Danger Zone → Change visibility. (공개 전 이력 전체를 gitleaks 로 스캔해 유출 없음을 확인했다.)

### 2. Neon — DB
1. https://neon.com 가입 → 프로젝트 생성. **Region = AWS Asia Pacific (Singapore)** (Render 와 같은 곳), DB 이름 `kbo`
2. Connect 에서 **Connection pooling 을 끈** 연결 정보를 본다 — Flyway 마이그레이션은 직접 연결로 돌린다
3. 아래 형식으로 만들어 둔다
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://<host>/kbo?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`

### 3. 첫 이미지 만들기 → GHCR 공개
1. `production` Environment 를 만든다(값은 아직 비워도 된다) → main 에 push
2. `image` job 까지 초록이면 GitHub 프로필 → Packages → `kbo-predictor-api` → Package settings →
   **Change visibility → Public**. GHCR 은 공개 레포에서도 처음엔 비공개로 만든다(Render 가 못 받는다)
3. 이때 `deploy-api` 는 설정이 없어 빨간 게 정상이다

### 4. Render — 백엔드
1. https://render.com 가입(개인 GitHub) → **New → Blueprint** → 이 레포 선택 → `render.yaml` 적용
2. `sync: false` 인 값을 채운다
   - `SPRING_DATASOURCE_URL` · `SPRING_DATASOURCE_USERNAME` · `SPRING_DATASOURCE_PASSWORD` (2단계)
   - `APP_ADMIN_TOKEN` — 긴 무작위 문자열 (`openssl rand -hex 32`). 아래 `ADMIN_TOKEN` 과 **같은 값**
   - `APP_CORS_ALLOWED_ORIGINS` — 5단계에서 Vercel 주소가 나오면 채운다
3. 서비스 → Settings → **Deploy Hook** URL 복사
4. 서비스 주소 확인 (예: `https://kbo-predictor-api.onrender.com`)

### 5. Vercel — 프론트
1. https://vercel.com 가입(**개인 GitHub**) → 프로젝트 생성 시 **Root Directory = `web`**
2. 로컬 **레포 루트**에서 `npx vercel@59.20.0 link` → 생긴 `.vercel/project.json` 의 `orgId` · `projectId`
   (`.vercel/` 은 gitignore 돼 있다)
3. Account Settings → Tokens 에서 토큰 발급
4. 프로젝트 주소 확인 (예: `https://kbo-predictor.vercel.app`) → Render 의 `APP_CORS_ALLOWED_ORIGINS` 에 넣는다

> ⚠️ Vercel Hobby 는 `--prebuilt` 배포 때 **커밋 작성자가 계정과 연결돼 있는지** 본다. 커밋 이메일이 Vercel 에
> 연결한 GitHub 계정의 인증된 이메일이어야 한다. `deploy-web` 이 권한 문제로 실패하면 이것부터 확인한다.

### 6. GitHub `production` Environment

| 종류 | 이름 | 값 |
| ---- | ---- | -- |
| Secret | `RENDER_DEPLOY_HOOK_URL` | 4-3 |
| Secret | `ADMIN_TOKEN` | Render `APP_ADMIN_TOKEN` 과 같은 값 |
| Secret | `VERCEL_TOKEN` | 5-3 |
| Secret | `VERCEL_ORG_ID` · `VERCEL_PROJECT_ID` | 5-2 |
| Variable | `API_URL` | Render 주소 (끝에 `/` 없이) |
| Variable | `WEB_URL` | Vercel 주소 (끝에 `/` 없이) |

값이 빠진 채 돌면 배포 job 첫 단계가 **무엇이 없는지** 알려주고 멈춘다.

### 7. 배포 → 데이터 채우기
1. Actions → CI/CD → 최신 main 실행을 **Re-run all jobs** (또는 아무 커밋 push)
2. 전부 초록이면 Actions → **Ingest schedule → Run workflow**, `months` = `2026-03,2026-04,2026-05,2026-06,2026-07,2026-08,2026-09`
3. `WEB_URL` 에서 대시보드와 일정 필터가 동작하는지 본다

## 평소

- **main 에 push 하면 끝이다.** PR 에서는 검증만 돈다
- 배포가 어디서 멈췄는지는 Actions 그래프에서 job 단위로 보인다. 배포 이력은 레포 오른쪽 **Deployments**
- 수집은 매일 06:00 KST 에 «어제가 속한 달 + 오늘이 속한 달» 을 받는다(1일 새벽에 지난달 말일 결과가 빠지지 않게).
  특정 달만 다시 받으려면 Ingest schedule 을 수동 실행

## 되돌리기

| 상황 | 방법 |
| ---- | ---- |
| API 만 이전 버전으로 | Render 대시보드 → Events → 이전 배포의 **Rollback**. 또는 이전 SHA 이미지로 배포 훅 호출: `curl -X POST --get "$RENDER_DEPLOY_HOOK_URL" --data-urlencode "imgURL=ghcr.io/hyunseungbeom/kbo-predictor-api:<이전SHA>"` |
| 웹만 이전 버전으로 | Vercel 대시보드 → Deployments → 이전 배포 → **Instant Rollback** |
| 커밋 자체를 되돌리기 | `git revert <SHA>` → push. 파이프라인이 테스트를 거쳐 다시 배포한다(가장 추적하기 쉽다) |

API 와 웹의 계약(검색 조건 · 팀 코드)을 바꾼 커밋을 되돌릴 때는 **둘을 같이** 되돌린다.

## 로컬에서 운영과 같은 이미지 확인

```bash
docker build --build-arg APP_COMMIT=local-test -t kbo-api:test .
docker run --rm -p 8090:8080 -e SPRING_PROFILES_ACTIVE=live -e APP_ADMIN_TOKEN=dev \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/kbo \
  -e SPRING_DATASOURCE_USERNAME=kbo -e SPRING_DATASOURCE_PASSWORD=kbo -m 512m kbo-api:test
curl localhost:8090/actuator/info   # {"app":{"commit":"local-test"},"ingestSource":"DaumKboScheduleSource"}
```

⚠️ `SPRING_PROFILES_ACTIVE=live` 를 빼면 샘플 출처가 켜진다. 그 상태로 수집을 부르면 **DB 의 실제 결과가 가짜 점수로
덮어써진다**(에러 없이). 운영 파이프라인은 `ingestSource` 확인으로 이걸 막는다.
