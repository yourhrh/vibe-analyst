# Vide Analyst - C4 Component Diagram (현재 상태)

> **최종 업데이트: 2026-02-04**
> 청사진: [blueprint/component-diagram.md](../blueprint/component-diagram.md)

---

> 실제 존재하는 파일만 기록. 청사진에 있지만 미구현인 파일은 생략.

---

## 1. `infra/` — Port 인터페이스 (Adapter 미구현)

### `infra/market-data/port.ts` 🟢

```typescript
interface MarketDataPort {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getFinancials(ticker: string, years?: number): Promise<Financials>;
  getQuote(ticker: string): Promise<StockQuote>;
  getRatios(ticker: string): Promise<FinancialRatios>;
  getPeers(ticker: string): Promise<string[]>;
}
```

### `infra/news/port.ts` 🟢

```typescript
interface NewsPort {
  getArticles(ticker: string, days?: number): Promise<NewsArticle[]>;
}
```

### `infra/llm/port.ts` 🟢

```typescript
interface LLMPort {
  streamText(params: {
    system: string;
    prompt: string;
    temperature?: number;
  }): Promise<ReadableStream<string>>;

  generateObject<T>(params: {
    system: string;
    prompt: string;
    schema: ZodSchema<T>;
    temperature?: number;
  }): Promise<T>;
}
```

### `infra/database/port.ts` 🟢

```typescript
interface DatabasePort {
  getCachedAnalysis(ticker: string): Promise<AnalysisResult | null>;
  saveAnalysis(ticker: string, data: AnalysisResult): Promise<void>;
  getCachedData(ticker: string, type: string): Promise<unknown | null>;
  saveData(ticker: string, type: string, data: unknown, ttlHours: number): Promise<void>;
}
```

---

## 2. `types/` — 공유 타입

### `types/financial.ts` 🟢

| 타입 | 주요 필드 |
|------|----------|
| `CompanyProfile` | name, ticker, exchange, sector, industry, marketCap, description |
| `StockQuote` | price, change, changePercent, volume, marketCap |
| `IncomeStatement` | date, revenue, grossProfit, operatingIncome, netIncome, eps |
| `BalanceSheet` | date, totalAssets, totalLiabilities, totalEquity, cash, totalDebt |
| `CashFlowStatement` | date, operatingCashFlow, capitalExpenditure, freeCashFlow, dividendsPaid |
| `FinancialRatios` | pe, pb, ps, roe, roa, debtToEquity, currentRatio, operatingMargin, netMargin |
| `Financials` | income[], balance[], cashFlow[] |
| `NewsArticle` | headline, summary, source, url, datetime, sentiment? |

### `types/investor.ts` 🟢

| 타입 | 주요 필드 |
|------|----------|
| `InvestorId` | `'buffett' \| 'graham' \| 'lynch' \| 'dalio' \| 'greenblatt' \| 'fisher'` |
| `InvestorVerdict` | `'강력매수' \| '매수고려' \| '관망' \| '매수부적합'` |
| `InvestorCriteria` | name, score (1-5), maxScore, evaluation |
| `InvestorAnalysis` | investorId, verdict, score, comment, criteria[], strengths[], risks[], rawText |
| `InvestorMeta` | id, name, nameKo, description, criteria names |

### `types/valuation.ts` 🟢

| 타입 | 주요 필드 |
|------|----------|
| `DCFInput` | revenueGrowthRate, operatingMargin, wacc, terminalGrowthRate, projectionYears |
| `DCFResult` | intrinsicValue, enterpriseValue, equityValue, projectedFCFs[], terminalValue |
| `RIMInput` | bookValuePerShare, roe, costOfEquity, terminalGrowthRate |
| `RIMResult` | intrinsicValue, residualIncomes[] |
| `ComparableInput` | ticker, peers, metric |
| `ComparableResult` | impliedValue, peerAverage, peerMedian, premiumDiscount |
| `ValuationRange` | low, base, high, currentPrice, safetyMarginPrice |

### `types/analysis.ts` 🟢

| 타입 | 주요 필드 |
|------|----------|
| `AnalysisStatus` | `'idle' \| 'collecting' \| 'analyzing' \| 'completed' \| 'error'` |
| `CollectedData` | profile, quote, financials, ratios, peers, news |
| `AnalysisResult` | ticker, collectedData, report, investors, valuation, createdAt |

---

## 3. `design-system/` — 디자인 토큰

### `design-system/tokens.ts` 🟢

```typescript
colors: {
  deepNavy: '#1a1a2e',      // Primary, 텍스트
  mutedGold: '#e2b857',      // Accent, 강조
  sageGreen: '#4a9079',      // Positive
  terracotta: '#c75a3a',     // Negative (빨간색 대신)
  slateGray: '#8b8fa3',      // Secondary 텍스트
  warmWhite: '#fafaf8',      // 배경
  warmGray: '#f5f3ef',       // 카드 배경
  border: '#e5e3df',         // 테두리
}
```

### `design-system/fonts.ts` 🟢

| 폰트 | 용도 | 로드 방식 |
|------|------|----------|
| Pretendard | 본문 (한국어) | CDN |
| Inter | 본문 (영문) | next/font/google |
| JetBrains Mono | 숫자, 재무 데이터 | next/font/google |

---

## 4. `components/ui/` — 구현된 컴포넌트

### shadcn/ui 프리미티브 (18개) 🟢

기본 shadcn/ui 컴포넌트. 커스터마이징 없이 설치된 상태.

### IDEO 커스텀 컴포넌트 (6개) 🟢

#### `financial-number.tsx`

| Props | Type | 설명 |
|-------|------|------|
| value | number | 표시할 수치 |
| format | `'currency' \| 'percent' \| 'ratio' \| 'plain'` | 포맷 |
| change | number? | 변화율 (▲ Sage Green / ▼ Terracotta) |
| size | `'sm' \| 'md' \| 'lg'` | 크기 |

기능: JetBrains Mono, 단위 축약 ($394B, $12.5M), 변화율 아이콘

#### `score-bar.tsx`

| Props | Type | 설명 |
|-------|------|------|
| label | string | 기준명 |
| score | number | 점수 |
| maxScore | number | 만점 (기본 5) |
| size | `'sm' \| 'md'` | 크기 |

기능: 라벨 + Gold 바 + 점수 텍스트

#### `verdict-badge.tsx`

| Props | Type | 설명 |
|-------|------|------|
| verdict | InvestorVerdict | 판정 |
| size | `'sm' \| 'md' \| 'lg'` | 크기 |

기능: 판정별 색상 (강력매수=Gold, 매수고려=Green, 관망=Gray, 매수부적합=Terracotta)

#### `stat-card.tsx`

| Props | Type | 설명 |
|-------|------|------|
| label | string | 지표명 |
| value | number | 수치 |
| format | FinancialNumber format | 포맷 |
| change | number? | 변화율 |
| subtitle | string? | 부가 정보 |

기능: FinancialNumber를 카드로 감싼 컴포넌트

#### `range-bar.tsx`

| Props | Type | 설명 |
|-------|------|------|
| low | number | 보수적 적정가 |
| base | number | 기본 적정가 |
| high | number | 낙관적 적정가 |
| current | number | 현재 주가 |
| safetyMargin | number? | 안전마진 가격 |

기능: 레인지 바 + 현재가 마커 (범위 내=Gold, 고평가=Terracotta)

#### `progress-step.tsx`

| Props | Type | 설명 |
|-------|------|------|
| label | string | 단계명 |
| status | `'pending' \| 'in_progress' \| 'completed' \| 'error'` | 상태 |
| description | string? | 완료 시 부가 정보 |

기능: 상태별 아이콘 (✅ 체크 / ⏳ 스피너 / ○ 빈 원 / ❗ 에러)

---

## 5. `app/` — 현재 라우트

### `app/layout.tsx` 🟢

- `<html lang="ko">`
- Pretendard CDN `<link>`
- Inter + JetBrains Mono (next/font)
- 메타데이터: "Vide Analyst - 미국 주식 AI 분석 플랫폼"

### `app/page.tsx` 🟢

- 홈 화면 스켈레톤 (SearchBar 컴포넌트 미연결)

### `app/analyze/[ticker]/page.tsx` 🟢

- 분석 페이지 스켈레톤 (AnalysisOrchestrator 미연결)

---

## 6. 미구현 Component 목록 (청사진 대비)

| 청사진 파일 | 용도 | 의존 |
|------------|------|------|
| `features/analysis/collect/*` | 데이터 수집 + 컨텍스트 빌드 | MarketDataPort, NewsPort |
| `features/analysis/report/*` | 종합 리포트 생성 | LLMPort |
| `features/analysis/investor/*` | 투자자 6인 분석 + 프롬프트 | LLMPort |
| `features/analysis/valuation/*` | DCF/RIM 계산 + 가정치 추론 | LLMPort |
| `features/search/*` | 티커 검색 | MarketDataPort |
| `features/cache/*` | 캐시 관리 | DatabasePort |
| `infra/*/adapter.ts` | 외부 서비스 실제 연결 | — |
| `orchestration/client/*` | 10단계 파이프라인 상태머신 | — |
| `components/analysis/*` | 분석 결과 표시 UI 8개 | types/ |
| `components/home/search-bar.tsx` | 검색바 + 자동완성 | — |
| `hooks/use-valuation-sliders.ts` | 슬라이더 실시간 재계산 | — |
| `supabase/migrations/*` | DB 스키마 + RLS | — |
