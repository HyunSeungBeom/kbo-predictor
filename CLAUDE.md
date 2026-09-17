# CLAUDE.md

> KBO Predictor — KBO 일정 · 순위 · 가을야구 진출/우승 확률 · 경기 승부 예측 웹 서비스.
> 이직 포트폴리오라 **기능 개수보다 완성도**(테스트 · 설계 이유 · 배포 링크)가 우선이다.

## 레포 구성

| 경로 | 무엇 | 스택 |
| ---- | ---- | ---- |
| `src/` | 백엔드 API | Spring Boot 4 · Kotlin + Java · JPA · Flyway · PostgreSQL |
| `web/` | 프론트 | Next.js 16 (App Router) · React 19 · TanStack Query · Tailwind · Recharts |
| `.github/workflows/ci.yml` | CI/CD | PR = 검증만 · main push = 검증 → 이미지(GHCR) → Render → Vercel |
| `.github/workflows/ingest.yml` | 수집 | 매일 06:00 KST 운영 API 에 수집 요청 |
| `DEPLOY.md` | 배포 | Render(API) · Neon(DB) · Vercel(웹) · GHCR, 전부 무료 티어. 설정·비밀값·롤백 |

프론트 작업 규칙은 **`web/CLAUDE.md`** 에 있다(그 폴더에서 일하면 함께 읽힌다).

## 실행

```bash
docker compose up -d db                 # PostgreSQL :5432
./gradlew bootRun                       # API :8080 — 기본은 seed 데이터
./gradlew bootRun --args='--spring.profiles.active=live --app.admin.token=dev'   # 다음 스포츠 실데이터
curl -X POST -H "X-Admin-Token: dev" "localhost:8080/api/admin/ingest?month=2026-08"  # 한 달치 수집
./gradlew test

cd web && npm run dev                   # :3000
cd web && npm run verify                # type-check · test · lint
```

포트가 겹치면 DB 는 `DB_PORT=5544`, 프론트는 `next dev -p <포트>` 로 바꾸고, 백엔드에
`--app.cors.allowed-origins=http://localhost:<포트>` 를 준다(안 주면 브라우저가 CORS 로 막는다).

## 백엔드 규칙

- **계산 코어는 순수 함수**로 두고 DB 없이 테스트한다 — `Log5`(Java) · `Standings` · `SeasonSimulator` ·
  `GameFilter` · `ScheduleIngestService.reconcile`
- **Java 는 계산 코어(`Log5.java`)만, 나머지는 Kotlin.** «레거시 Java → Kotlin 전환» 을 작게 보여주는 의도다
- **순위는 저장하지 않는다.** `game`(FINAL)에서 매번 집계한다 — 진실은 한 곳(`V2__drop_team_record.sql`)
- 스키마는 **Flyway** 가 소유하고 JPA 는 `ddl-auto: validate` 로 검증만 한다. 스키마 변경 = 새 마이그레이션
- 수집 출처는 `KboScheduleSource` 로 추상화 — `SeedKboScheduleSource`(기본) / `DaumKboScheduleSource`(`live`
  프로필, 문서 없는 비공식 JSON). 매일 06:00 KST 스케줄러가 이번 달을 upsert 한다
- 검색 조건이 말이 안 되면 **조용히 무시하지 않고 400 + `errors` 목록**으로 거부한다(`GameFilter.validate`)
- 수집 API 는 `X-Admin-Token` 이 `app.admin.token` 과 같아야 한다. **토큰 설정이 비면 항상 403** — 설정을 빠뜨려도 열리지 않게
- ⚠️ **`live` 프로필 없이 수집을 부르면 샘플 출처가 실제 결과를 가짜 점수로 덮어쓴다**(upsert 라 에러 없음).
  실DB 에 붙은 앱은 반드시 `live` 로 띄운다. 운영은 `/actuator/info` 의 `ingestSource` 를 배포 파이프라인이 확인한다

## 프론트 ↔ 백엔드 계약

한 레포에 있으니 어긋나면 테스트가 잡게 해 두었다.

| 계약 | 백엔드 | 프론트 | 검사 |
| ---- | ------ | ------ | ---- |
| 팀 코드·이름 | `V1__init.sql` 시드 | `web/lib/teams/model/teams.ts` | `web/tests/team-codes.test.ts` (TEAM 003) |
| 경기 검색 조건 | `GameFilter.kt` (validate) | `web/lib/games/model/` (normalize) | 양쪽 각자 테스트 — 규칙을 바꾸면 **둘 다** 고친다 |
| 검증 실패 응답 | `ProblemDetail` + `errors: string[]` | `ApiError.errors` | `web/lib/api/__tests__/client.test.ts` (API 002) |

## 배포

main 에 push → 테스트 통과 → 자동 배포. 배포된 커밋은 `/actuator/info` 의 `app.commit` 으로 확인한다.
배포 파이프라인을 바꾸면 커밋 전에 `docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:latest` 로 검사한다.

## 문서

- 프론트 구조와 그 이유: [web/docs/frontend-conventions.md](web/docs/frontend-conventions.md)
- 테스트 붙이는 법 · 밟은 함정: [web/docs/testing.md](web/docs/testing.md)
- 배포: [DEPLOY.md](DEPLOY.md)
