# KBO Predictor — web

Next.js(App Router) · TypeScript · TanStack Query · Tailwind · Recharts.

```bash
npm install
npm run dev      # http://localhost:3000 — 백엔드(:8080)가 떠 있어야 한다
npm run verify   # type-check · test · lint
npm run build
```

API 주소는 `.env.local` 의 `NEXT_PUBLIC_API_BASE`(기본 `http://localhost:8080`).

- 구조와 그 이유: [docs/frontend-conventions.md](docs/frontend-conventions.md)
- 테스트 붙이는 법: [docs/testing.md](docs/testing.md)
- 레포 전체 안내: [../README.md](../README.md)
