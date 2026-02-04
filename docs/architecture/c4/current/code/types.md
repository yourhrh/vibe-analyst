# Code Diagram — `src/types/`

> 모든 Container가 공유하는 타입 정의. 4개 파일, 순수 타입만 존재 (런타임 코드 없음).

---

## 파일 의존 관계

```
analysis.ts ──import──► financial.ts
            ──import──► investor.ts
            ──import──► valuation.ts
```

`analysis.ts`가 나머지 3개를 조합하는 최상위 타입.

---

## `financial.ts`

```typescript
export interface CompanyProfile {
  ticker: string;
  name: string;
  exchange: string;          // "NASDAQ"
  sector: string;            // "Technology"
  industry: string;          // "Consumer Electronics"
  marketCap: number;
  description: string;
  country: string;
  website: string;
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
}

export interface IncomeStatement {
  date: string;              // "2024-09-28"
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  operatingMargin: number;
  netMargin: number;
}

export interface BalanceSheet {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalDebt: number;
  cashAndEquivalents: number;
}

export interface CashFlowStatement {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number;
}

export interface FinancialRatios {
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  dividendYield: number;
}

export interface Financials {
  income: IncomeStatement[];   // 최근 5년
  balance: BalanceSheet[];
  cashFlow: CashFlowStatement[];
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: string;
}
```

**export 수**: 9 interfaces

---

## `investor.ts`

```typescript
export type InvestorId =
  | 'buffett' | 'graham' | 'lynch'
  | 'dalio' | 'greenblatt' | 'fisher';

export type InvestorVerdict =
  '강력매수' | '매수고려' | '관망' | '매수부적합';

export interface InvestorCriteria {
  name: string;              // "경제적 해자"
  score: number;             // 1~5
  evaluation: string;        // "강력한 브랜드 파워와..."
}

export interface InvestorAnalysis {
  investorId: InvestorId;
  verdict: InvestorVerdict;
  score: number;             // 종합 1~5
  comment: string;           // 1인칭 코멘트
  criteria: InvestorCriteria[];
  strengths: string[];
  risks: string[];
  rawText: string;           // 원본 마크다운
}

export interface InvestorMeta {
  id: InvestorId;
  name: string;              // "Warren Buffett"
  nameKo: string;            // "워런 버핏"
  description: string;
  criteria: string[];        // ["경제적 해자", "경영진 품질", ...]
}
```

**export 수**: 2 types + 4 interfaces

---

## `valuation.ts`

```typescript
export interface DCFInput {
  revenueGrowthRate: number;     // 0.085 = 8.5%
  operatingMargin: number;       // 0.307 = 30.7%
  wacc: number;                  // 0.095 = 9.5%
  terminalGrowthRate: number;    // 0.025 = 2.5%
  projectionYears?: number;      // default 5
}

export interface DCFResult {
  intrinsicValue: number;        // 적정 주당 가치
  enterpriseValue: number;
  equityValue: number;
  projectedFCFs: number[];       // 향후 N년 FCF
  terminalValue: number;
}

export interface RIMInput {
  roe: number;
  costOfEquity: number;
  bookValuePerShare: number;
  projectionYears?: number;
}

export interface RIMResult {
  intrinsicValue: number;
  residualIncomes: number[];
}

export interface ComparableInput {
  ticker: string;
  peers: string[];
  multiples: {
    pe: number;
    pb: number;
    evEbitda: number;
  };
}

export interface ComparableResult {
  impliedValues: {
    byPE: number;
    byPB: number;
    byEvEbitda: number;
  };
  averageImpliedValue: number;
}

export interface ValuationRange {
  low: number;                   // 보수적 시나리오
  base: number;                  // 기본 시나리오
  high: number;                  // 낙관적 시나리오
  currentPrice: number;
  safetyMarginPrice: number;
  methodsUsed: string[];         // ["DCF", "RIM", "Comparable"]
}
```

**export 수**: 7 interfaces

---

## `analysis.ts`

```typescript
import type { CompanyProfile, StockQuote, Financials, FinancialRatios, NewsArticle } from './financial';
import type { InvestorId, InvestorAnalysis } from './investor';
import type { DCFInput, DCFResult, ValuationRange } from './valuation';

export type AnalysisType = 'full' | 'report' | 'investor' | 'valuation';

export type AnalysisStatus =
  'pending' | 'collecting' | 'analyzing' | 'completed' | 'failed';

export interface CollectedData {
  profile: CompanyProfile;
  quote: StockQuote;
  financials: Financials;
  ratios: FinancialRatios;
  peers: string[];
  news: NewsArticle[];
}

export interface AnalysisResult {
  id: string;
  ticker: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  collectedData: CollectedData | null;
  report: string | null;
  investors: Partial<Record<InvestorId, InvestorAnalysis>>;
  valuation: {
    assumptions: DCFInput;
    dcfResult: DCFResult;
    range: ValuationRange;
    reasoning: string;
  } | null;
  createdAt: string;           // ISO 8601
  expiresAt: string | null;
}
```

**export 수**: 2 types + 2 interfaces
**import 의존**: financial.ts (5), investor.ts (2), valuation.ts (3)
