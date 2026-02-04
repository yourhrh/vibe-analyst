# Vide Analyst - C4 Container Diagram (Blueprint)

> **이 문서는 청사진(목표 아키텍처)입니다.**
> 현재 구현 상태는 [current/implementation-status.md](../current/implementation-status.md)를 참고하세요.

---

> Container = `src/` 하위 최상위 폴더.
> 이 문서를 읽으면 "어떤 종류의 코드가 어떤 폴더에 있는지" 알 수 있다.

---

## 1. 폴더 ↔ Container 매핑

```
vide-analyst/
│
├── src/
│   ├── app/                 ← ① Routing Layer
│   ├── features/            ← ② Business Logic
│   ├── infra/               ← ③ External Adapters
│   ├── orchestration/       ← ④ Pipeline Coordination
│   ├── components/          ← ⑤ UI Components
│   ├── design-system/       ← ⑥ Design Tokens
│   ├── hooks/               ← ⑦ UI Hooks
│   └── types/               ← ⑧ Shared Types
│
└── supabase/                ← ⑨ DB Migrations
```

---

## 2. 각 Container 역할

### ① `src/app/` — Routing Layer

```
src/app/
├── layout.tsx                         루트 레이아웃 (폰트, 전역 providers)
├── page.tsx                           홈 화면 (SearchBar 렌더)
├── globals.css                        전역 스타일
│
├── analyze/[ticker]/
│   ├── page.tsx                       분석 화면 (AnalysisOrchestrator 렌더)
│   └── layout.tsx                     탭 레이아웃
│
└── api/
    ├── search/route.ts                GET  — 티커 자동완성
    ├── cache/[ticker]/route.ts        GET  — 캐시 확인
    ├── analyze/
    │   ├── collect/route.ts           POST — 데이터 수집        (Node.js)
    │   ├── report/route.ts            POST — 종합 리포트        (Edge, 스트리밍)
    │   ├── investor/[id]/route.ts     POST — 투자자 분석        (Edge, 스트리밍)
    │   ├── valuation/route.ts         POST — 밸류에이션         (Edge, 스트리밍)
    │   └── save/route.ts             POST — 결과 저장          (Node.js)
    └── cron/keep-alive/route.ts       GET  — Supabase 자동정지 방지
```

**역할**: Next.js 라우팅 구조. 각 route.ts는 "접착제" — 요청 파싱 → `features/` 호출 → 응답 반환. 비즈니스 로직 0줄.

---

### ② `src/features/` — Business Logic

```
src/features/
├── analysis/
│   ├── collect/           데이터 수집 + LLM 컨텍스트 구성
│   ├── report/            종합 리포트 생성
│   ├── investor/          투자 대가 6인 분석
│   └── valuation/         DCF/RIM/Comparable 밸류에이션
├── search/                티커 검색
└── cache/                 분석 결과 캐싱
```

**역할**: 핵심 비즈니스 로직. `infra/`의 Port 인터페이스만 의존.

---

### ③ `src/infra/` — External Adapters

```
src/infra/
├── market-data/           재무 데이터 (FMP + EDGAR)
├── news/                  뉴스 (Finnhub)
├── llm/                   LLM (Gemini)
└── database/              DB + 캐시 (Supabase)
```

**역할**: 각 폴더에 `port.ts`(인터페이스) + `*.adapter.ts`(구현) + `index.ts`(팩토리).

---

### ④ `src/orchestration/` — Pipeline Coordination

```
src/orchestration/
└── client/
    ├── use-analysis-pipeline.ts    브라우저에서 API 10단계 순차 호출
    ├── pipeline-steps.ts           스텝 정의 (순서, 엔드포인트)
    └── types.ts                    PipelineState, StepStatus
```

---

### ⑤ `src/components/` — UI Components

```
src/components/
├── ui/                     shadcn/ui 프리미티브 + IDEO 커스텀
├── analysis/               분석 결과 표시 컴포넌트
├── charts/                 Recharts 래퍼
└── home/                   홈 화면 컴포넌트
```

---

### ⑥~⑧ 나머지

```
src/design-system/          컬러, 스페이싱, 폰트 토큰
src/hooks/                  UI 훅 (슬라이더 재계산 등)
src/types/                  공유 타입 정의
supabase/migrations/        DB 스키마 + RLS 정책
```

---

## 3. Container 간 의존 방향

```
app/ ───────► features/
  │               │
  │               │ Port 인터페이스만
  │               ▼
  │          infra/
  │
  ├────────► orchestration/
  │
  └────────► components/ ───► design-system/
                  │
                  └──────────► types/ ◄── features/, infra/
```

**역방향 의존 금지:**
- `infra/`가 `features/`를 import ❌
- `features/`가 `components/`를 import ❌
- `components/`가 `features/`를 import ❌
