# Code Diagram — `src/infra/`

> 외부 시스템 추상화 레이어. Port 인터페이스 4개만 구현됨. Adapter 0개.

---

## 파일 구조 (현재)

```
src/infra/
├── market-data/
│   └── port.ts          🟢
├── news/
│   └── port.ts          🟢
├── llm/
│   └── port.ts          🟢
└── database/
    └── port.ts          🟢
```

---

## 의존 관계

```
infra/market-data/port.ts ──import──► types/financial.ts
                                       (CompanyProfile, StockQuote, Financials, FinancialRatios)

infra/news/port.ts ──import──► types/financial.ts
                                (NewsArticle)

infra/llm/port.ts ──import──► zod
                                (ZodSchema)

infra/database/port.ts ──import──► types/analysis.ts
                                    (AnalysisResult)
```

---

## `market-data/port.ts`

```typescript
import type { CompanyProfile, StockQuote, Financials, FinancialRatios } from '@/types/financial';

export interface MarketDataPort {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getFinancials(ticker: string, opts: { years: number }): Promise<Financials>;
  getQuote(ticker: string): Promise<StockQuote>;
  getRatios(ticker: string): Promise<FinancialRatios>;
  getPeers(ticker: string): Promise<string[]>;
}
```

| 메서드 | 반환 타입 | 청사진 adapter |
|--------|----------|---------------|
| `getCompanyProfile` | `CompanyProfile` | FMP `/api/v3/profile/{ticker}` |
| `getFinancials` | `Financials` | FMP income + balance + cashflow |
| `getQuote` | `StockQuote` | FMP `/api/v3/quote/{ticker}` |
| `getRatios` | `FinancialRatios` | FMP `/api/v3/ratios/{ticker}` |
| `getPeers` | `string[]` | FMP `/api/v4/stock_peers` |

---

## `news/port.ts`

```typescript
import type { NewsArticle } from '@/types/financial';

export interface NewsPort {
  getArticles(
    ticker: string,
    opts: { days: number },
  ): Promise<NewsArticle[]>;
}
```

| 메서드 | 반환 타입 | 청사진 adapter |
|--------|----------|---------------|
| `getArticles` | `NewsArticle[]` | Finnhub `/api/v1/company-news` |

---

## `llm/port.ts`

```typescript
import type { ZodSchema } from 'zod';

export interface LLMPort {
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

| 메서드 | 반환 타입 | 용도 |
|--------|----------|------|
| `streamText` | `ReadableStream<string>` | 리포트, 투자자 분석 (SSE 스트리밍) |
| `generateObject<T>` | `T` | 밸류에이션 가정치 (구조화 JSON) |

**특이사항**: 외부 SDK 의존 없음. `ZodSchema`만 사용하여 타입 안전한 JSON 파싱.

---

## `database/port.ts`

```typescript
import type { AnalysisResult } from '@/types/analysis';

export interface DatabasePort {
  getCachedAnalysis(ticker: string): Promise<AnalysisResult | null>;

  saveAnalysis(
    ticker: string,
    data: Omit<AnalysisResult, 'id' | 'createdAt' | 'expiresAt'>,
  ): Promise<{ id: string; expiresAt: string }>;

  getCachedData<T>(
    ticker: string,
    type: string,
  ): Promise<T | null>;

  saveData(
    ticker: string,
    type: string,
    data: unknown,
    ttlSeconds: number,
  ): Promise<void>;
}
```

| 메서드 | 용도 |
|--------|------|
| `getCachedAnalysis` | 완성된 분석 결과 조회 (24h TTL) |
| `saveAnalysis` | 분석 결과 저장 (`Omit`으로 서버 생성 필드 제외) |
| `getCachedData<T>` | 재무/뉴스/시세 캐시 조회 (제네릭) |
| `saveData` | 재무/뉴스/시세 캐시 저장 (TTL 초 단위) |

**설계 포인트**: `saveAnalysis`의 `Omit<AnalysisResult, 'id' | 'createdAt' | 'expiresAt'>`로 DB가 자동 생성하는 필드를 호출자에게 요구하지 않음.
