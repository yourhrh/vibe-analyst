# Vide Analyst - 모듈 아키텍처

> 설계 원칙: **응집도**, **이해용이성**, **변경가능성**
>
> "이 기능은 어디에 있지?" → 3초 안에 답할 수 있어야 한다.
> "이 API를 다른 걸로 바꾸면?" → 파일 하나만 바꾸면 된다.
> "클라이언트 오케스트레이션을 없애면?" → features/ 코드는 한 줄도 안 바뀐다.
>
> 📌 폴더 구조와 파일별 역할은 C4 문서 참고:
> - [Container Diagram](c4/container-diagram.md) — 폴더 단위 구성
> - [Component Diagram](c4/component-diagram.md) — 파일 단위 구성 + 수정 가이드

---

## 1. 핵심 설계 원칙

### 1.1 변경될 것과 안 변경될 것을 분리한다

```
안 변경되는 것 (비즈니스 로직)          변경될 것 (인프라/배포 전략)
─────────────────────────              ──────────────────────────
DCF 계산 공식                          FMP → 다른 재무 데이터 API
버핏의 투자 체크리스트                   Gemini → Claude / GPT
투자자 분석 결과 스키마                  Supabase → 다른 DB
LLM에게 보낼 프롬프트 구조              Finnhub → 다른 뉴스 API
적정주가 레인지 계산 로직               클라이언트 오케스트레이션 → 서버 Job Queue
                                       Vercel → 다른 호스팅
```

**모든 외부 서비스는 Port(인터페이스)로 추상화한다** — LLM 포함.
특정 SDK(Vercel AI SDK, Langchain 등)에 의존하지 않고, 각 provider의 REST API를 직접 호출한다.

**원칙**: 왼쪽은 `features/`에, 오른쪽은 `infra/`에 둔다.
`features/`는 `infra/`의 **인터페이스(Port)** 만 알고, 구체적인 구현(FMP, Gemini)은 모른다.

### 1.2 기능 기반 구조 (Feature-based, not Layer-based)

```
❌ 레이어 기반 (기존 계획)                  ✅ 기능 기반 (이 설계)
─────────────────────────                  ─────────────────────────

"버핏 분석"을 찾으려면:                     "버핏 분석"을 찾으려면:
  lib/ai/prompts/buffett.ts                  features/analysis/investor/
  lib/ai/schemas/investor.ts                   ├── prompts/buffett.ts
  components/analysis/investor-card.tsx         ├── schema.ts
  app/api/analyze/investor/route.ts            └── analyze-investor.ts
  hooks/use-analysis.ts                      → 한 폴더에 다 있음
→ 5군데를 돌아다녀야 함
```

### 1.3 오케스트레이션은 "교체 가능한 배포 전략"이다

현재 클라이언트 오케스트레이션은 Vercel 60초 타임아웃이라는 **인프라 제약** 때문에 존재한다.
비즈니스 로직이 아니므로 별도 레이어로 격리하고, 교체 시 비즈니스 로직에 영향 없게 한다.

```
현재 (무료 tier)                         향후 (유료 전환 시)
──────────────                           ─────────────────

Browser                                  Browser
  ↓ 10회 순차 API 호출                     ↓ 1회 API 호출
  ↓                                        ↓
API Route ×10                            API Route ×1
  ↓ 각각 features/ 호출                    ↓ 서버에서 features/ 순차 호출
features/                                features/  ← 동일, 변경 없음
```

---

## 2. 레이어 구조

```
┌─────────────────────────────────────────────────────────────────┐
│                          app/                                    │
│                     (Routing Layer)                              │
│                                                                  │
│  Next.js가 요구하는 라우팅 구조.                                   │
│  각 route는 "얇은 접착제" — 요청 파싱 → feature 호출 → 응답 반환.  │
│  비즈니스 로직 0줄.                                               │
└────────┬──────────────────────┬─────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐  ┌────────────────────────────────────────────┐
│  orchestration/  │  │              components/                    │
│  (Pipeline)      │  │              (UI Layer)                     │
│                  │  │                                             │
│  브라우저가 API를 │  │  React 컴포넌트.                            │
│  순차 호출하는    │  │  features/의 출력 타입을 렌더링.             │
│  로직.           │  │  비즈니스 로직 0줄.                          │
│                  │  │                                             │
│  ⚠️ 교체 대상    │  │                                             │
└────────┬─────────┘  └──────────────────────────────────────────┘
         │
         ▼ (HTTP를 통해 app/api → features 호출)
┌─────────────────────────────────────────────────────────────────┐
│                        features/                                 │
│                    (Business Logic)                              │
│                                                                  │
│  핵심 비즈니스 로직. 도메인별로 응집.                               │
│  infra/의 Port(인터페이스)만 의존.                                │
│  FMP, Gemini, Supabase라는 이름을 모른다.                         │
│  ⚠️ 절대 바뀌지 않는 핵심                                        │
└────────┬────────────────────────────────────────────────────────┘
         │
         ▼ (Port 인터페이스를 통해)
┌─────────────────────────────────────────────────────────────────┐
│                          infra/                                  │
│                    (Adapters Layer)                              │
│                                                                  │
│  외부 서비스별 어댑터. Port를 구현.                                │
│  FMP, Gemini, Supabase, Finnhub의 SDK/API 호출.                 │
│  ⚠️ 교체 대상                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 의존성 규칙 (Dependency Rule)

```
app/            → features/, orchestration/, components/
orchestration/  → types/ (HTTP 호출만, features 직접 import 안 함)
components/     → types/, design-system/
features/       → infra/ (Port 인터페이스만), types/
infra/          → types/ (+ 외부 SDK)
```

화살표 방향의 **역방향 의존은 금지**.
`infra/`가 `features/`를 import하면 안 되고, `features/`가 `components/`를 import하면 안 된다.

---

## 3. 핵심 레이어 코드 패턴

### 3.1 app/ — Routing Layer

Next.js App Router가 요구하는 파일 규약. 각 route 파일은 **"접착제"** 역할만 한다.

```typescript
// app/api/analyze/investor/[id]/route.ts — 예시
// 이 파일이 하는 일: 요청 파싱 → feature 호출 → 응답 반환 (비즈니스 로직 0줄)

import { analyzeInvestor } from '@/features/analysis/investor/analyze-investor';
import { createLLMAdapter } from '@/infra/llm';

export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { contextString } = await request.json();
  const llm = createLLMAdapter();
  const stream = await analyzeInvestor(params.id, contextString, llm);
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

**규칙**: route.ts 안에 `if/else` 비즈니스 로직이 들어가면 `features/`로 옮겨야 한다.

### 3.2 features/ — Business Logic

**응집도의 핵심**. "이 기능 코드 어디있지?"의 답이 항상 `features/` 안에 있다.

```
features/analysis/investor/          "투자 대가 분석" 기능의 모든 것
├── analyze-investor.ts              실행 함수 (진입점)
├── prompts/                         6명의 시스템 프롬프트
│   ├── buffett.ts                   버핏 프롬프트 + 체크리스트 정의
│   ├── graham.ts                    그레이엄 프롬프트 + 안전성 기준
│   └── ...
├── investor-registry.ts             투자자 ID → 메타데이터 매핑
└── schema.ts                        입출력 Zod 스키마
```

`features/`의 함수는 **infra Port 인터페이스**만 의존한다:

```typescript
// features/analysis/collect/collect-financial-data.ts

import type { MarketDataPort } from '@/infra/market-data/port';
import type { NewsPort } from '@/infra/news/port';

export async function collectFinancialData(
  ticker: string,
  marketData: MarketDataPort,    // FMP인지 EDGAR인지 모른다
  news: NewsPort                 // Finnhub인지 모른다
) {
  const [profile, financials, articles] = await Promise.all([
    marketData.getCompanyProfile(ticker),
    marketData.getFinancials(ticker, { years: 5 }),
    news.getArticles(ticker, { days: 30 }),
  ]);
  // ... 집계, 정규화
}
```

#### features/analysis/valuation/ — 밸류에이션의 관심사 분리

```
valuation/
├── calculate-dcf.ts           # 순수 함수. LLM 의존 없음.
│                               # (input: DCFInput) → DCFResult
│                               # 슬라이더 조정 시 이 함수만 재실행
│
├── estimate-assumptions.ts    # LLM이 가정치를 추론
│                               # (context: string, llm: LLMPort) → DCFInput
│                               # 최초 1회만 호출. 슬라이더 조정 시 호출 안 됨
│
├── prompt.ts                  # 가정치 추론 시스템 프롬프트
└── schema.ts                  # DCFInput, DCFResult, ValuationRange
```

이 분리가 중요한 이유: **슬라이더 조정 = `calculate-dcf.ts` 재실행만**. LLM 재호출 없음.

### 3.3 infra/ — Adapters Layer

**교체 가능한 외부 서비스 연결**. Port(인터페이스)와 Adapter(구현)로 구성.

```typescript
// infra/market-data/port.ts — 인터페이스 정의

export interface MarketDataPort {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getFinancials(ticker: string, opts: { years: number }): Promise<Financials>;
  getQuote(ticker: string): Promise<StockQuote>;
  getRatios(ticker: string): Promise<FinancialRatios>;
  getPeers(ticker: string): Promise<string[]>;
}
```

```typescript
// infra/market-data/fmp.adapter.ts — FMP 구현

export class FmpAdapter implements MarketDataPort {
  constructor(private apiKey: string) {}

  async getCompanyProfile(ticker: string): Promise<CompanyProfile> {
    const res = await fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${this.apiKey}`);
    const data = await res.json();
    return this.normalize(data);  // FMP 응답 → 우리 타입으로 변환
  }
  // ...
}
```

```typescript
// infra/market-data/index.ts — 팩토리

import { FmpAdapter } from './fmp.adapter';
import { EdgarAdapter } from './edgar.adapter';
import type { MarketDataPort } from './port';

export function createMarketDataAdapter(): MarketDataPort {
  // 현재: FMP primary, EDGAR fallback
  return new FmpAdapter(process.env.FMP_API_KEY!);
}

// FMP → 다른 서비스로 교체 시:
// 1. new-provider.adapter.ts 작성
// 2. 이 파일의 return만 교체
// 3. features/ 코드 변경 0줄
```

#### infra/llm/ — LLM도 동일한 Port/Adapter 패턴

Vercel AI SDK 같은 프레임워크 의존 없이, **우리 인터페이스**를 정의하고 어댑터가 구현한다.
LLM도 언제든 교체 가능한 외부 서비스이므로 다른 infra와 동일하게 취급한다.

```typescript
// infra/llm/port.ts — 우리가 정의하는 LLM 인터페이스

export interface LLMPort {
  /**
   * 텍스트를 스트리밍으로 생성한다.
   * 반환되는 ReadableStream<string>은 토큰 단위로 흐른다.
   */
  streamText(params: {
    system: string;
    prompt: string;
    temperature?: number;
  }): Promise<ReadableStream<string>>;

  /**
   * 구조화된 JSON 객체를 생성한다.
   * Zod 스키마로 타입 안전성 보장.
   */
  generateObject<T>(params: {
    system: string;
    prompt: string;
    schema: ZodSchema<T>;
    temperature?: number;
  }): Promise<T>;
}
```

```typescript
// infra/llm/gemini.adapter.ts — Gemini 구현 (REST API 직접 호출)

export class GeminiAdapter implements LLMPort {
  constructor(
    private apiKey: string,
    private model: string = 'gemini-2.5-flash',
  ) {}

  async streamText(params): Promise<ReadableStream<string>> {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: params.system }] },
          contents: [{ parts: [{ text: params.prompt }] }],
          generationConfig: { temperature: params.temperature ?? 0.7 },
        }),
      }
    );
    return parseSSEStream(res.body!);  // streaming.ts의 유틸
  }

  async generateObject<T>(params): Promise<T> {
    // JSON mode로 호출 → Zod로 파싱/검증
  }
}
```

```typescript
// infra/llm/index.ts — 팩토리

import { GeminiAdapter } from './gemini.adapter';
import type { LLMPort } from './port';

export type { LLMPort } from './port';

export function createLLMAdapter(variant: 'primary' | 'light' = 'primary'): LLMPort {
  const model = variant === 'primary' ? 'gemini-2.5-flash' : 'gemini-2.5-flash-lite';
  return new GeminiAdapter(process.env.GOOGLE_API_KEY!, model);
}

// Claude로 전환 시:
// 1. claude.adapter.ts 작성 (Anthropic REST API 호출)
// 2. 이 팩토리의 return만 교체
// 3. features/ 코드 변경 0줄
```

`features/`의 함수들은 `LLMPort` 타입만 받으므로, Gemini인지 Claude인지 GPT인지 모른다.
SDK 의존 없이 각 provider의 REST API를 직접 호출 → **의존성 최소화**.

```typescript
// features/analysis/investor/analyze-investor.ts — LLMPort만 알면 된다

import type { LLMPort } from '@/infra/llm/port';
import { getInvestorPrompt } from './prompts';

export async function analyzeInvestor(
  investorId: string,
  contextString: string,
  llm: LLMPort,             // Gemini? Claude? 모른다. 관심 없다.
): Promise<ReadableStream<string>> {
  const prompt = getInvestorPrompt(investorId);
  return llm.streamText({
    system: prompt.system,
    prompt: contextString,
    temperature: 0.7,
  });
}
```

### 3.4 orchestration/ — Pipeline Layer (교체 대상)

**이 레이어가 존재하는 이유**: Vercel Hobby의 60초 서버리스 타임아웃.

```typescript
// orchestration/client/pipeline-steps.ts

export const ANALYSIS_STEPS = [
  { id: 'cache',      endpoint: '/api/cache/{ticker}',             method: 'GET'  },
  { id: 'collect',    endpoint: '/api/analyze/collect',            method: 'POST' },
  { id: 'report',     endpoint: '/api/analyze/report',            method: 'POST', streaming: true },
  { id: 'buffett',    endpoint: '/api/analyze/investor/buffett',   method: 'POST', streaming: true },
  { id: 'graham',     endpoint: '/api/analyze/investor/graham',    method: 'POST', streaming: true },
  { id: 'lynch',      endpoint: '/api/analyze/investor/lynch',     method: 'POST', streaming: true },
  { id: 'dalio',      endpoint: '/api/analyze/investor/dalio',     method: 'POST', streaming: true },
  { id: 'greenblatt', endpoint: '/api/analyze/investor/greenblatt',method: 'POST', streaming: true },
  { id: 'fisher',     endpoint: '/api/analyze/investor/fisher',    method: 'POST', streaming: true },
  { id: 'valuation',  endpoint: '/api/analyze/valuation',         method: 'POST', streaming: true },
  { id: 'save',       endpoint: '/api/analyze/save',              method: 'POST' },
] as const;
```

```typescript
// orchestration/client/use-analysis-pipeline.ts

export function useAnalysisPipeline(ticker: string) {
  // 상태: 현재 스텝, 각 스텝 결과, 에러
  // 로직: ANALYSIS_STEPS를 순차 실행, 각 완료 시 UI 업데이트
  // 캐시 HIT 시 즉시 완료
}
```

#### 향후 서버 오케스트레이션으로 교체 시

```
orchestration/
├── client/                    # 현재 사용 중 (유지하거나 삭제)
│   └── ...
└── server/                    # 새로 추가
    └── analysis-job.ts        # features/ 함수를 서버에서 순차 호출
```

교체 영향 범위:
- `orchestration/server/` 새로 작성
- `app/api/analyze/` 라우트 통합 (10개 → 1~2개)
- `components/analysis/analysis-orchestrator.tsx` 수정 (SSE로 진행상태 수신)
- **`features/` 변경 0줄** ← 핵심

---

## 4. 데이터 흐름

### 4.1 분석 요청 1회의 데이터 흐름

```
[Browser]
    │
    │ useAnalysisPipeline() ← orchestration/client/
    │
    ▼
[app/api/analyze/collect/route.ts]     ← app/ (얇은 접착제)
    │
    │ collectFinancialData(ticker, marketData, news)
    │
    ▼
[features/analysis/collect/]           ← features/ (비즈니스 로직)
    │
    │ marketData.getFinancials(ticker)
    │ news.getArticles(ticker)
    │
    ▼
[infra/market-data/fmp.adapter.ts]     ← infra/ (외부 API 호출)
[infra/news/finnhub.adapter.ts]
    │
    ▼
[FMP API, SEC EDGAR, Finnhub API]      ← 외부 서비스
```

### 4.2 슬라이더 조정의 데이터 흐름 (LLM 호출 없음)

```
[Browser]
    │
    │ 슬라이더 onChange → useValuationSliders()
    │
    ▼
[features/analysis/valuation/calculate-dcf.ts]   ← 순수 함수 호출
    │
    │ (input: DCFInput) → DCFResult
    │ 네트워크 호출 없음, LLM 호출 없음
    │
    ▼
[components/analysis/valuation-range-chart.tsx]   ← UI 업데이트
```

---

## 5. 변경 시나리오별 영향 범위

### 시나리오 1: FMP → Alpha Vantage로 교체

```
변경 파일:
  infra/market-data/alpha-vantage.adapter.ts   ← 새로 작성
  infra/market-data/index.ts                    ← 팩토리 return 변경

변경 안 되는 파일:
  features/**                                   ← 0줄 변경
  components/**                                 ← 0줄 변경
  app/api/**                                    ← 0줄 변경
```

### 시나리오 2: Gemini → Claude로 교체

```
변경 파일:
  infra/llm/claude.adapter.ts                   ← 새로 작성 (Anthropic REST API)
  infra/llm/index.ts                            ← 팩토리 return 변경

변경 안 되는 파일:
  features/**                                   ← 0줄 (LLMPort만 사용)
  orchestration/**                              ← 0줄
  app/api/**                                    ← 0줄
  package.json                                  ← SDK 추가 불필요 (REST 직접 호출)
```

### 시나리오 3: 클라이언트 오케스트레이션 → 서버 Job Queue

```
변경 파일:
  orchestration/server/analysis-job.ts          ← 새로 작성
  app/api/analyze/ 라우트들                      ← 통합 (10개 → 1~2개)
  components/analysis/analysis-orchestrator.tsx  ← SSE 수신으로 변경

변경 안 되는 파일:
  features/**                                   ← 0줄 변경 ⭐
  infra/**                                      ← 0줄 변경
  design-system/**                              ← 0줄 변경
```

### 시나리오 4: 투자자 1명 추가 (예: 캐시 우드)

```
변경 파일:
  features/analysis/investor/prompts/wood.ts     ← 프롬프트 작성
  features/analysis/investor/investor-registry.ts← 목록에 추가
  orchestration/client/pipeline-steps.ts         ← 스텝 1개 추가
  app/api/analyze/investor/[id]/route.ts         ← 변경 없음 (동적 라우트)

변경 안 되는 파일:
  infra/**                                      ← 0줄
  features/analysis/valuation/**                ← 0줄
```

### 시나리오 5: Supabase → 다른 DB로 교체

```
변경 파일:
  infra/database/new-db.adapter.ts              ← 새로 작성
  infra/database/index.ts                       ← 팩토리 변경

변경 안 되는 파일:
  features/**                                   ← 0줄 (Port 인터페이스만 사용)
```

---

## 6. Port 인터페이스 목록

이 프로젝트에서 정의하는 Port(인터페이스)는 4개:

| Port | 위치 | 현재 Adapter | 핵심 메서드 |
|------|------|-------------|------------|
| **MarketDataPort** | `infra/market-data/port.ts` | FmpAdapter + EdgarAdapter | `getCompanyProfile`, `getFinancials`, `getQuote`, `getRatios`, `getPeers` |
| **NewsPort** | `infra/news/port.ts` | FinnhubAdapter | `getArticles` |
| **LLMPort** | `infra/llm/port.ts` | GeminiAdapter | `streamText`, `generateObject` |
| **DatabasePort** | `infra/database/port.ts` | SupabaseAdapter | `getCachedAnalysis`, `saveAnalysis`, `getCachedData`, `saveData` |

4개 Port 모두 동일한 패턴: **인터페이스(port.ts) + 구현(*.adapter.ts) + 팩토리(index.ts)**.
외부 SDK 의존 없이 각 서비스의 REST API를 직접 호출한다.

---

## 7. 문서 관계

```
docs/
├── product-design/
│   ├── ux-analysis.md              ← "왜 이 기능이 필요한가" (사용자 관점)
│   ├── ideo-design.md              ← "어떻게 보여야 하는가" (디자인)
│   ├── feature-list.md             ← "무엇을 만드는가" (전체 기능)
│   └── mvp-feature-list.md         ← "처음에 무엇을 만드는가" (MVP)
│
├── architecture/
│   ├── c4/
│   │   ├── context-diagram.md      ← Level 1: 외부 시스템 관계
│   │   ├── container-diagram.md    ← Level 2: 폴더 단위 구성 (어떤 폴더가 무슨 역할인가)
│   │   └── component-diagram.md    ← Level 3: 파일 단위 구성 (어떤 파일이 무슨 일을 하는가)
│   ├── module-architecture.md      ← 설계 원칙 + Port/Adapter + 변경 시나리오 (이 문서) ⭐
│   ├── api-spec.md                 ← API 엔드포인트 명세 (요청/응답/에러/파이프라인)
│   ├── erd.md                      ← DB 스키마 + RLS + 확장 가이드
│   └── technical-design.md         ← 기술 스택 + 제약 + 개발 페이즈
```

| 문서 | 관점 | 핵심 질문 |
|------|------|----------|
| context-diagram | C4 Level 1 | "어떤 서비스에 의존하는가?" |
| container-diagram | C4 Level 2 | "어떤 폴더가 무슨 역할인가?" |
| component-diagram | C4 Level 3 | "어떤 파일이 무슨 일을 하고, 수정은 어디서 하는가?" |
| **module-architecture** | **설계 원칙** | **"왜 이렇게 나누었고, 바꿀 때 어디를 건드리는가?"** |
| api-spec | API 명세 | "어떤 요청을 보내고, 어떤 응답이 오는가?" |
| erd | DB 스키마 | "어떤 테이블이 있고, 확장 시 어디를 건드리는가?" |
| technical-design | 기술 스택 | "무료로 어떻게 운영하는가?" |
