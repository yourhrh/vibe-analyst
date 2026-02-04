# Vide Analyst - C4 Container Diagram (현재 상태)

> **최종 업데이트: 2026-02-04**
> 청사진: [blueprint/container-diagram.md](../blueprint/container-diagram.md)

---

## 1. 폴더 ↔ Container 현황

```
src/
│
├── app/                 ① Routing Layer          🟡 스켈레톤만
│   ├── layout.tsx                                 🟢
│   ├── page.tsx                                   🟢 (검색바 UI 없음)
│   ├── globals.css                                🟢
│   ├── analyze/[ticker]/page.tsx                  🟢 (빈 스켈레톤)
│   └── api/                                       🔴 route 0개
│
├── features/            ② Business Logic         🔴 폴더만 존재
│
├── infra/               ③ External Adapters      🟡 Port만
│   ├── market-data/port.ts                        🟢
│   ├── news/port.ts                               🟢
│   ├── llm/port.ts                                🟢
│   └── database/port.ts                           🟢
│
├── orchestration/       ④ Pipeline               🔴 미존재
│
├── components/          ⑤ UI Components          🟡 기초만
│   └── ui/                                        🟢 24개 (아래 상세)
│
├── design-system/       ⑥ Design Tokens          🟢 완료
│   ├── tokens.ts                                  🟢
│   └── fonts.ts                                   🟢
│
├── hooks/               ⑦ UI Hooks               🔴 미존재
│
└── types/               ⑧ Shared Types           🟢 완료
    ├── financial.ts                               🟢
    ├── investor.ts                                🟢
    ├── valuation.ts                               🟢
    └── analysis.ts                                🟢
```

---

## 2. 각 Container 상세

### ① `src/app/` — Routing Layer 🟡

**존재하는 파일:**

```
src/app/
├── layout.tsx               🟢 Pretendard + Inter + JetBrains Mono, IDEO 메타데이터
├── page.tsx                 🟢 홈 화면 스켈레톤 (텍스트만, SearchBar 미연결)
├── globals.css              🟢 IDEO CSS 변수, Tailwind v4
├── favicon.ico              🟢
│
└── analyze/[ticker]/
    └── page.tsx             🟢 분석 페이지 스켈레톤 (오케스트레이터 미연결)
```

**존재하지 않는 파일:**

```
src/app/api/                 🔴 전체 미구현
    ├── search/route.ts
    ├── cache/[ticker]/route.ts
    ├── analyze/
    │   ├── collect/route.ts
    │   ├── report/route.ts
    │   ├── investor/[id]/route.ts
    │   ├── valuation/route.ts
    │   └── save/route.ts
    └── cron/keep-alive/route.ts
```

---

### ② `src/features/` — Business Logic 🔴

빈 디렉토리 구조만 존재. 비즈니스 로직 파일 0개.

```
features/
├── analysis/
│   ├── collect/             🔴
│   ├── report/              🔴
│   ├── investor/            🔴
│   └── valuation/           🔴
├── search/                  🔴
└── cache/                   🔴
```

---

### ③ `src/infra/` — External Adapters 🟡

**Port 인터페이스 4개 완료, Adapter 0개:**

```
infra/
├── market-data/
│   └── port.ts              🟢 MarketDataPort (getCompanyProfile, getFinancials, getQuote, getRatios, getPeers)
│
├── news/
│   └── port.ts              🟢 NewsPort (getArticles)
│
├── llm/
│   └── port.ts              🟢 LLMPort (streamText, generateObject)
│
└── database/
    └── port.ts              🟢 DatabasePort (getCachedAnalysis, saveAnalysis, getCachedData, saveData)
```

**미구현:**

```
infra/
├── market-data/
│   ├── fmp.adapter.ts       🔴
│   ├── edgar.adapter.ts     🔴
│   └── index.ts             🔴
├── news/
│   ├── finnhub.adapter.ts   🔴
│   └── index.ts             🔴
├── llm/
│   ├── gemini.adapter.ts    🔴
│   ├── streaming.ts         🔴
│   └── index.ts             🔴
└── database/
    ├── supabase.adapter.ts  🔴
    ├── client.ts            🔴
    ├── server.ts            🔴
    └── index.ts             🔴
```

---

### ④ `src/orchestration/` — Pipeline 🔴

전체 미존재.

---

### ⑤ `src/components/` — UI Components 🟡

**shadcn/ui 프리미티브 (18개) 🟢**

```
components/ui/
├── button.tsx       ├── avatar.tsx       ├── dialog.tsx
├── card.tsx         ├── progress.tsx     ├── sheet.tsx
├── tabs.tsx         ├── accordion.tsx    ├── scroll-area.tsx
├── input.tsx        ├── switch.tsx       ├── separator.tsx
├── slider.tsx       ├── table.tsx        ├── tooltip.tsx
├── badge.tsx        ├── alert.tsx        └── skeleton.tsx
```

**IDEO 커스텀 컴포넌트 (6개) 🟢 — Storybook Stories 포함**

```
components/ui/
├── financial-number.tsx     JetBrains Mono 수치, 단위축약, 변화율(▲▼)
├── score-bar.tsx            투자자 기준별 점수 바 (Gold)
├── verdict-badge.tsx        판정 뱃지 (강력매수/매수고려/관망/매수부적합)
├── stat-card.tsx            재무 하이라이트 카드
├── range-bar.tsx            적정주가 레인지 바 + 현재가 마커
└── progress-step.tsx        분석 진행 단계 (4개 상태)
```

**미구현 컴포넌트:**

```
components/
├── analysis/                🔴 전체 미구현
│   ├── analysis-orchestrator.tsx
│   ├── progress-tracker.tsx
│   ├── streaming-text.tsx
│   ├── report-view.tsx
│   ├── investor-card.tsx
│   ├── investor-roundtable.tsx
│   ├── valuation-panel.tsx
│   └── valuation-range-chart.tsx
├── charts/                  🔴 전체 미구현
└── home/
    └── search-bar.tsx       🔴 미구현
```

---

### ⑥ `src/design-system/` 🟢 — 완료

```
design-system/
├── tokens.ts        🟢 IDEO 컬러 (#1a1a2e, #e2b857, #4a9079, #c75a3a, #8b8fa3)
│                        스페이싱, 라디우스 상수
└── fonts.ts         🟢 Inter, JetBrains Mono (next/font), Pretendard (CDN)
```

---

### ⑦ `src/hooks/` 🔴 — 미존재

---

### ⑧ `src/types/` 🟢 — 완료

```
types/
├── financial.ts     🟢 CompanyProfile, StockQuote, IncomeStatement, BalanceSheet,
│                       CashFlowStatement, FinancialRatios, Financials, NewsArticle
├── investor.ts      🟢 InvestorId (6명 유니온), InvestorVerdict, InvestorCriteria,
│                       InvestorAnalysis, InvestorMeta
├── valuation.ts     🟢 DCFInput, DCFResult, RIMInput, RIMResult,
│                       ComparableInput, ComparableResult, ValuationRange
└── analysis.ts      🟢 AnalysisType, AnalysisStatus, CollectedData, AnalysisResult
```

---

## 3. Container 간 의존 — 현재 연결된 것

```
app/ ─ ─ ─ ─► features/          (미연결)
  │               │
  │               │
  │               ▼
  │          infra/               (Port 정의만, adapter 없음)
  │
  ├─ ─ ─ ─► orchestration/       (미존재)
  │
  └────────► components/ ───► design-system/    ✅ 연결됨
                  │
                  └──────────► types/           ✅ 연결됨
```

실선(━) = 실제 import 존재, 점선(─ ─) = 아직 연결 안 됨

---

## 4. Storybook 현황

```
Storybook v8.6.15 (@storybook/react-vite)
http://localhost:6006

Design System/
├── FinancialNumber    8 stories (Currency, 변화율, 크기비교, 단위축약)
├── ProgressStep       7 stories (4상태 + 파이프라인, 전체완료, 에러)
├── RangeBar           6 stories (범위 내/고평가/저평가/안전마진)
├── ScoreBar           6 stories (기본/고점수/버핏기준/커스텀)
├── StatCard           5 stories (매출/영업이익률/PER/하락/그리드)
└── VerdictBadge       6 stories (4판정 + 전체비교 + 크기비교)
```
