# Vide Analyst - C4 Container Diagram

> Context 한 단계 아래. `src/` 하위 최상위 폴더가 곧 Container다.
>
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

**역할**: Next.js가 요구하는 라우팅 구조. 각 route.ts는 "접착제" — 요청 파싱 → `features/` 호출 → 응답 반환. 비즈니스 로직 0줄.

**규칙**: route.ts에 `if/else` 비즈니스 로직이 생기면 `features/`로 옮긴다.

---

### ② `src/features/` — Business Logic

```
src/features/
│
├── analysis/
│   ├── collect/                       데이터 수집 + LLM 컨텍스트 구성
│   ├── report/                        종합 리포트 생성
│   ├── investor/                      투자 대가 6인 분석
│   └── valuation/                     DCF/RIM/Comparable 밸류에이션
│
├── search/                            티커 검색
└── cache/                             분석 결과 캐싱
```

**역할**: 핵심 비즈니스 로직. 도메인별로 응집. FMP, Gemini, Supabase라는 이름을 모른다 — `infra/`의 Port 인터페이스만 안다.

**규칙**: 이 폴더의 코드는 외부 서비스 교체(Gemini→Claude, FMP→다른API)에 영향받지 않는다.

---

### ③ `src/infra/` — External Adapters

```
src/infra/
│
├── market-data/                       재무 데이터 (FMP + EDGAR)
├── news/                              뉴스 (Finnhub)
├── llm/                               LLM (Gemini)
└── database/                          DB + 캐시 (Supabase)
```

**역할**: 외부 서비스 연결. 각 폴더에 `port.ts`(인터페이스) + `*.adapter.ts`(구현) + `index.ts`(팩토리).

**규칙**: 서비스 교체 시 이 폴더만 수정. 새 adapter 작성 + 팩토리의 return 변경. `features/` 변경 0줄.

---

### ④ `src/orchestration/` — Pipeline Coordination

```
src/orchestration/
└── client/
    ├── use-analysis-pipeline.ts       브라우저에서 API 10단계 순차 호출
    ├── pipeline-steps.ts              스텝 정의 (순서, 엔드포인트)
    └── types.ts                       PipelineState, StepStatus
```

**역할**: 브라우저가 10단계 API를 순차 호출하는 로직. Vercel 60초 타임아웃 때문에 존재.

**규칙**: 유료 전환 시 `server/` 폴더 추가하고 `client/` 제거 가능. `features/` 변경 0줄.

---

### ⑤ `src/components/` — UI Components

```
src/components/
│
├── ui/                                shadcn/ui 프리미티브 (Button, Card, Tabs, Slider...)
├── analysis/
│   ├── analysis-orchestrator.tsx       오케스트레이션 훅 + 진행 UI 조합
│   ├── progress-tracker.tsx           단계별 진행 표시
│   ├── streaming-text.tsx             스트리밍 마크다운 렌더러
│   ├── report-view.tsx                종합 리포트 (결론, 강점/리스크, 재무카드)
│   ├── investor-card.tsx              투자자 개별 분석 카드
│   ├── investor-roundtable.tsx        라운드테이블 합의 요약
│   ├── valuation-panel.tsx            DCF 슬라이더 패널
│   └── valuation-range-chart.tsx      적정주가 레인지 차트
├── charts/                            Recharts 래퍼
└── home/
    └── search-bar.tsx                 티커 검색창 + 자동완성
```

**역할**: React 컴포넌트. `types/`의 타입을 props로 받아 렌더링만 한다.

**규칙**: 데이터 fetching이나 LLM 호출 로직이 들어가면 안 된다.

---

### ⑥ `src/design-system/` — Design Tokens

```
src/design-system/
├── tokens.ts                          컬러, 스페이싱 상수
└── fonts.ts                           Pretendard, Inter, JetBrains Mono 설정
```

---

### ⑦ `src/hooks/` — UI Hooks

```
src/hooks/
└── use-valuation-sliders.ts           슬라이더 조정 → DCF 실시간 재계산
```

---

### ⑧ `src/types/` — Shared Types

```
src/types/
├── analysis.ts                        AnalysisResult, AnalysisStatus
├── financial.ts                       CompanyProfile, IncomeStatement, BalanceSheet
├── investor.ts                        InvestorId, InvestorVerdict, InvestorAnalysis
└── valuation.ts                       DCFInput, DCFResult, ValuationRange
```

**역할**: `features/`, `infra/`, `components/` 모두가 공유하는 타입.

---

### ⑨ `supabase/` — DB Migrations

```
supabase/
└── migrations/
    └── 001_initial_schema.sql         테이블 정의 + RLS 정책
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

---

## 4. 통신 방식

| 출발 | 도착 | 방식 |
|------|------|------|
| Browser (`orchestration/`) | `app/api/` | HTTP (fetch), SSE (스트리밍) |
| `app/api/` route | `features/` | 함수 import 호출 |
| `features/` | `infra/` | Port 인터페이스를 통한 함수 호출 |
| `infra/` | 외부 서비스 | REST API (HTTPS), TCP (PostgreSQL) |
