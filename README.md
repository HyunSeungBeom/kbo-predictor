# ⚾ KBO Predictor

KBO 경기 일정과 **가을야구 진출확률·우승확률**, 그리고 **오늘 경기 승부 예측**을 제공하는 웹 서비스.
내 팀(응원팀)을 설정하면 해당 팀 관점으로 하이라이트한다.

> 🔗 **배포 링크: (배포 후 여기에)**  —  포트폴리오이므로 배포 링크가 최우선.

---

## 왜 이 스택인가 (설계 의도)

- **백엔드: Spring Boot 4 + Java · Kotlin 공존** — 이 프로젝트는 "레거시 Java → 모던 Kotlin 전환"을
  축소 재현한다. 계산 코어([`Log5.java`](src/main/java/com/seungbeom/kbo/prediction/Log5.java))는
  **Java**로 두어 기본기를 드러내고, 이를 호출하는 서비스·엔티티·API는 **Kotlin**으로 작성해
  **Java ↔ Kotlin 상호운용**을 보여준다.
- **영속성: Spring Data JPA + PostgreSQL**, 스키마는 **Flyway**로 버전 관리.
- **프론트(예정): Next.js + TypeScript + Recharts** — 별도 레포. 타입은 springdoc-openapi 스펙에서 생성.

## 확률 모델

| 예측 | 방법 | 상태 |
|------|------|------|
| 오늘 경기 승리확률 | **log5** (승률 기반) + 홈 어드밴티지 | ✅ 구현 |
| 가을야구 진출확률 / 우승확률 | **몬테카를로 시뮬레이션** (잔여 일정 N회 가상 플레이) | ⏳ Phase 2 |
| 승률 대신 Elo·선발투수 반영 | 레이팅 시스템 | 🔮 v2 |

## 실행 방법

```bash
# 1) DB 띄우기
docker compose up -d db

# 2) 앱 실행 (로컬)
./gradlew bootRun

# 또는 앱까지 컨테이너로 한 방에
docker compose up --build
```

- 일정:  `GET http://localhost:8080/api/schedule`  (특정일: `?date=2026-07-20`)
- 예측:  `GET http://localhost:8080/api/predict?home=OB&away=LG`
- 헬스:  `GET http://localhost:8080/actuator/health`

## 테스트

```bash
./gradlew test
```
계산 코어는 Java·Kotlin 양쪽 테스트로 검증한다
([`Log5Test.java`](src/test/java/com/seungbeom/kbo/prediction/Log5Test.java),
[`PredictionsTest.kt`](src/test/kotlin/com/seungbeom/kbo/prediction/PredictionsTest.kt)).
DB가 필요한 통합 테스트(Testcontainers)는 Phase 2에서 추가 예정.

## 데이터 출처

KBO는 공식 오픈 API가 없어, 일정·결과는 공개 출처(KBO 공식 / 다음 스포츠 등)를
**하루 1회 스크래핑 → DB upsert**하는 방식으로 수집한다(예정, Phase 0). 원본 사이트를
직접 호출하지 않고 항상 DB만 조회하며, 스크래퍼는 요청 간격을 두고 robots.txt를 존중한다.
비상업·학습 목적.

## 로드맵

- [x] 프로젝트 뼈대 (Spring Boot 4 · Java/Kotlin · JPA · Flyway · Docker · CI)
- [x] log5 단일 경기 승리확률 + 테스트
- [ ] **Phase 0** — 데이터 스크래퍼(일정/결과) → `team`/`game` upsert
- [ ] **Phase 1** — 순위 계산, 일정 API 확장
- [ ] **Phase 2** — 몬테카를로 진출/우승 확률 + 캐싱
- [ ] **Phase 3** — Next.js 프론트(대시보드, 내 팀 설정)
- [ ] **Phase 4** — 배포(Fly.io/Railway) + 배포 링크

## 기술 스택

`Kotlin 2.3` · `Java 17` · `Spring Boot 4.1` · `Spring Data JPA` · `Flyway` ·
`PostgreSQL 16` · `Gradle (Kotlin DSL)` · `Docker` · `GitHub Actions`
