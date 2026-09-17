# 배포 가이드 (전부 무료 티어)

프론트 = **Vercel**, 백엔드 + DB = **Render**. 모두 무료. 계정 생성·연결은 본인이 진행(내가 대신 클릭 불가).

> ⚠️ 무료 티어 한계(정직하게): Render 무료 웹 서비스는 **15분 유휴 시 슬립** → 첫 접속 때 콜드스타트 30~60초.
> 무료 Postgres는 **약 30일 후 만료**되어 재생성 필요. 상시 라이브가 필요하면 유료(과금)로 올려야 함 — 그건 먼저 상의.

## 1) 백엔드 + DB — Render

1. https://render.com 가입(개인 GitHub 계정으로).
2. **New → Blueprint** → 이 레포(`HyunSeungBeom/kbo-predictor`) 선택. 루트의 `render.yaml`을 읽어
   웹 서비스(`kbo-predictor-api`, Docker) + 무료 Postgres(`kbo-db`)를 자동 생성.
3. 배포되면 백엔드 URL 확인: `https://kbo-predictor-api.onrender.com` (이름은 다를 수 있음).
4. 첫 배포 후 시드 주입(선택): `curl -X POST ".../api/admin/ingest?month=2026-07"`.
5. 프론트 배포 후, Render 대시보드에서 `APP_CORS_ALLOWED_ORIGINS`를 **Vercel 프론트 URL**로 설정 → 재배포.

DB 접속값(DB_HOST 등)은 `render.yaml`이 자동 연결하고, 앱은 이를 JDBC로 조립한다. `PORT`는 Render가 주입.

## 2) 프론트 — Vercel

1. https://vercel.com 가입(개인 GitHub).
2. **Add New → Project** → 같은 레포 선택.
3. **Root Directory = `web`** 로 지정(모노레포라 중요). 프레임워크는 Next.js 자동 감지.
4. 환경변수 **`NEXT_PUBLIC_API_BASE`** = Render 백엔드 URL(예: `https://kbo-predictor-api.onrender.com`).
5. Deploy → `https://<프로젝트>.vercel.app` 생성. 이후 push마다 자동배포(=CD).
6. 이 Vercel URL을 위 1-5의 `APP_CORS_ALLOWED_ORIGINS`에 넣어야 API 호출이 CORS 통과.

## 순서 요약
Render 배포 → 백엔드 URL 확보 → Vercel 배포(그 URL을 API_BASE로) → Vercel URL을 백엔드 CORS에 등록 → 끝.

## CI/CD 현황
- **CI**: GitHub Actions(`.github/workflows/ci.yml`) — push/PR마다 backend(gradle build) + frontend(`npm run verify` = type-check·test·lint, build) 검증.
- **CD**: Vercel/Render의 Git 연동이 push마다 자동배포. 별도 배포 워크플로 불필요.
