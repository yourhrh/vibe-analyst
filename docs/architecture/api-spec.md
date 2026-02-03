# Vide Analyst - API 명세서

> MVP(P0) 기능에 필요한 API 엔드포인트 정의.
>
> 이 문서를 읽으면 "어떤 API가 어떤 기능을 담당하고, 요청/응답이 어떤 형태인지" 알 수 있다.
>
> 참고: [Component Diagram](c4/component-diagram.md) — 각 API가 호출하는 파일 매핑

---

## 1. 엔드포인트 전체 목록

| # | Method | Path | Runtime | 스트리밍 | MVP 기능 | Pipeline Step |
|---|--------|------|---------|---------|----------|---------------|
| 1 | GET | `/api/search` | Node.js | — | F-1 | — |
| 2 | GET | `/api/cache/[ticker]` | Node.js | — | — | Step 0 |
| 3 | POST | `/api/analyze/collect` | Node.js | — | F-4, F-6, F-11 | Step 1 |
| 4 | POST | `/api/analyze/report` | Edge | SSE | F-7, F-9, F-10 | Step 2 |
| 5 | POST | `/api/analyze/investor/[id]` | Edge | SSE | F-14, F-15 | Step 3~8 |
| 6 | POST | `/api/analyze/valuation` | Edge | SSE | F-18, F-19 | Step 9 |
| 7 | POST | `/api/analyze/save` | Node.js | — | — | Step 10 |
| 8 | GET | `/api/cron/keep-alive` | Node.js | — | — | — |

**Runtime 기준**:
- **Node.js**: 외부 API 병렬 호출, DB 접근 등 무거운 I/O → 서버리스 60초 타임아웃
- **Edge**: LLM 스트리밍 응답 → Edge 30초(스트리밍 시 300초)

---

## 2. 각 엔드포인트 상세

### 2.1 `GET /api/search` — 티커 검색

**MVP 기능**: F-1 (티커 검색 + 자동완성)

```
GET /api/search?q=aapl
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/search/search-ticker.ts` → `searchTicker(query, marketData)` |
| **외부 API** | FMP `/api/v3/search?query={q}` |
| **Rate Limit** | FMP 250 req/day (검색도 카운트됨) |

**Request**

| Param | Type | 필수 | 설명 |
|-------|------|------|------|
| `q` | string (query) | Y | 검색어. 영문 티커, 한글/영문 회사명 |

**Response** `200 OK`

```typescript
{
  results: Array<{
    ticker: string;        // "AAPL"
    name: string;          // "Apple Inc."
    exchange: string;      // "NASDAQ"
    type: string;          // "stock"
  }>;
}
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | `q` 누락 또는 빈 문자열 |
| 429 | FMP 일일 한도 초과 |

---

### 2.2 `GET /api/cache/[ticker]` — 캐시 확인

**Pipeline Step 0**: 분석 시작 전 캐시 HIT 여부 확인. HIT 시 전체 파이프라인 스킵.

```
GET /api/cache/AAPL
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/cache/analysis-cache.ts` → `getCachedAnalysis(ticker, db)` |
| **외부 서비스** | Supabase `analyses` 테이블 |
| **TTL** | 24시간 |

**Response** `200 OK` — 캐시 HIT

```typescript
{
  hit: true;
  data: {
    collectedData: CollectedData;     // 수집된 재무 데이터
    report: string;                    // 종합 리포트 전문
    investors: Record<InvestorId, {    // 투자자 6명 분석 결과
      text: string;
      verdict: InvestorVerdict;
      score: number;
    }>;
    valuation: {
      assumptions: DCFInput;           // LLM이 추론한 가정치
      dcfResult: DCFResult;            // DCF 계산 결과
      range: ValuationRange;           // 적정주가 레인지
    };
    createdAt: string;                 // ISO 8601
  };
}
```

**Response** `200 OK` — 캐시 MISS

```typescript
{
  hit: false;
  data: null;
}
```

---

### 2.3 `POST /api/analyze/collect` — 데이터 수집

**Pipeline Step 1**: 3개 소스에서 재무 데이터를 병렬 수집 → LLM 컨텍스트 문자열로 변환.

**MVP 기능**: F-4 (종목 헤더), F-6 (프로그레스 트래커 수집 미리보기), F-11 (재무 하이라이트)

```
POST /api/analyze/collect
Content-Type: application/json
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/analysis/collect/collect-financial-data.ts` → `features/analysis/collect/build-llm-context.ts` |
| **외부 API** | FMP (profile + income + balance + cashflow + quote + ratios + peers), Finnhub (news) |
| **Rate Limit** | FMP ~8 req (250/day), Finnhub 1 req (60/min) |
| **예상 소요** | 5~15초 |

**Request**

```typescript
{
  ticker: string;   // "AAPL"
}
```

**Response** `200 OK`

```typescript
{
  collectedData: {
    profile: {
      name: string;              // "Apple Inc."
      ticker: string;            // "AAPL"
      exchange: string;          // "NASDAQ"
      sector: string;            // "Technology"
      industry: string;          // "Consumer Electronics"
      marketCap: number;         // 3000000000000
      description: string;
    };
    quote: {
      price: number;             // 237.50
      change: number;            // 2.30
      changePercent: number;     // 0.98
      volume: number;
    };
    financials: {
      income: IncomeStatement[];     // 최근 5년
      balance: BalanceSheet[];       // 최근 5년
      cashFlow: CashFlowStatement[]; // 최근 5년
    };
    ratios: FinancialRatios;
    peers: string[];                 // ["MSFT", "GOOGL", ...]
    news: Array<{
      headline: string;
      summary: string;
      source: string;
      url: string;
      datetime: string;
    }>;
  };
  contextString: string;  // LLM에 보낼 정규화된 텍스트 (~4K tokens)
}
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | `ticker` 누락 |
| 404 | FMP에서 종목을 찾을 수 없음 |
| 429 | FMP 일일 한도 초과 |
| 500 | 외부 API 응답 실패 |

---

### 2.4 `POST /api/analyze/report` — 종합 리포트

**Pipeline Step 2**: LLM이 수집 데이터를 기반으로 종합 분석 리포트를 스트리밍 생성.

**MVP 기능**: F-7 (스트리밍), F-9 (결론 헤더), F-10 (강점/리스크)

```
POST /api/analyze/report
Content-Type: application/json
```

| 항목 | 내용 |
|------|------|
| **Runtime** | Edge (스트리밍) |
| **호출 함수** | `features/analysis/report/generate-report.ts` → `generateReport(contextString, llm)` |
| **프롬프트** | `features/analysis/report/prompt.ts` — "한국어 재무 애널리스트" 시스템 프롬프트 |
| **LLM** | Gemini 2.5 Flash (primary) |
| **Rate Limit** | Gemini 10 RPM, 250 RPD |

**Request**

```typescript
{
  contextString: string;   // collect 단계에서 받은 LLM 컨텍스트
}
```

**Response** `200 OK` — `text/event-stream` (SSE)

```
data: {"text": "## 종합 판단\n\n"}
data: {"text": "Apple은 "}
data: {"text": "강력한 생태계 "}
...
data: [DONE]
```

스트림 완료 후 전체 텍스트는 마크다운 형식:

```markdown
## 종합 판단
{한 줄 결론}

## 투자 매력도
{X}/100점, {근거}

## 강점
- {강점 1}
- {강점 2}
- ...

## 리스크
- {리스크 1}
- {리스크 2}
- ...

## 재무 요약
{핵심 재무 지표 해석}

## 산업 포지셔닝
{경쟁 환경 + 해자 분석}

## 뉴스 영향
{최근 뉴스가 투자 판단에 미치는 영향}
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | `contextString` 누락 |
| 429 | Gemini RPM/RPD 초과 |
| 500 | LLM 응답 실패 |

---

### 2.5 `POST /api/analyze/investor/[id]` — 투자 대가 분석

**Pipeline Step 3~8**: 투자 대가 6명이 각각 종목을 분석. 순차 실행 (6회).

**MVP 기능**: F-14 (라운드테이블 합의 요약), F-15 (투자자 개별 카드)

```
POST /api/analyze/investor/buffett
POST /api/analyze/investor/graham
POST /api/analyze/investor/lynch
POST /api/analyze/investor/dalio
POST /api/analyze/investor/greenblatt
POST /api/analyze/investor/fisher
```

| 항목 | 내용 |
|------|------|
| **Runtime** | Edge (스트리밍) |
| **호출 함수** | `features/analysis/investor/analyze-investor.ts` → `analyzeInvestor(investorId, contextString, llm)` |
| **프롬프트** | `features/analysis/investor/prompts/{id}.ts` — 투자자별 고유 시스템 프롬프트 |
| **LLM** | Gemini 2.5 Flash (primary) |
| **Rate Limit** | Gemini 10 RPM — 6명 순차 호출 시 ~6 RPM 소모 |

**투자자별 분석 관점**

| id | 투자자 | 핵심 분석 기준 |
|----|--------|---------------|
| `buffett` | 워런 버핏 | 경제적 해자, 경영진 품질, 안전마진, ROE |
| `graham` | 벤저민 그레이엄 | Graham Number, 재무 안전성 체크리스트 |
| `lynch` | 피터 린치 | PEG, 카테고리 분류 (Stalwart/Fast Grower), 스토리 |
| `dalio` | 레이 달리오 | 매크로 환경, 경기 사이클, 포트폴리오 역할 |
| `greenblatt` | 조엘 그린블랫 | Magic Formula (ROC + Earnings Yield) |
| `fisher` | 필립 피셔 | 정성적 15포인트 체크리스트 |

**Request**

```typescript
{
  contextString: string;   // collect 단계에서 받은 LLM 컨텍스트
}
```

**Response** `200 OK` — `text/event-stream` (SSE)

```
data: {"text": "## 워런 버핏의 "}
data: {"text": "분석\n\n"}
...
data: [DONE]
```

스트림 완료 후 전체 텍스트는 구조화된 마크다운:

```markdown
## 판정
{강력매수 | 매수고려 | 관망 | 매수부적합}

## 종합 점수
{★ 개수}/5

## 종합 코멘트
{1인칭 화법 2~3문장. "나는 이 기업의 ...에 주목합니다."}

## 기준별 평가
| 기준 | 점수 | 평가 |
|------|------|------|
| {기준1} | {X}/5 | {한 줄 평가} |
| {기준2} | {X}/5 | {한 줄 평가} |
...

## 핵심 근거
- {근거 1}
- {근거 2}

## 주요 리스크
- {리스크 1}
- {리스크 2}
```

**클라이언트 파싱**: 스트림 완료 후 마크다운을 파싱하여 `InvestorAnalysis` 구조체로 변환.

```typescript
// 파싱 후 구조 (F-14 라운드테이블, F-15 카드에서 사용)
interface InvestorAnalysis {
  investorId: InvestorId;
  verdict: '강력매수' | '매수고려' | '관망' | '매수부적합';
  score: number;           // 1~5
  comment: string;         // 1인칭 코멘트
  criteria: Array<{
    name: string;
    score: number;
    evaluation: string;
  }>;
  strengths: string[];
  risks: string[];
  rawText: string;         // 원본 마크다운
}
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | `contextString` 누락 |
| 404 | 지원하지 않는 `id` |
| 429 | Gemini RPM/RPD 초과 |

---

### 2.6 `POST /api/analyze/valuation` — 밸류에이션

**Pipeline Step 9**: LLM이 가정치를 추론하고, TypeScript가 DCF를 계산.

**MVP 기능**: F-18 (적정주가 레인지 차트), F-19 (DCF 인터랙티브 슬라이더)

```
POST /api/analyze/valuation
Content-Type: application/json
```

| 항목 | 내용 |
|------|------|
| **Runtime** | Edge (스트리밍) |
| **호출 함수** | `features/analysis/valuation/estimate-assumptions.ts` → `features/analysis/valuation/calculate-dcf.ts` |
| **프롬프트** | `features/analysis/valuation/prompt.ts` — 가정치 추론 시스템 프롬프트 |
| **LLM** | Gemini 2.5 Flash (primary) — `generateObject` (구조화 JSON) |
| **Rate Limit** | Gemini 10 RPM |

**Request**

```typescript
{
  contextString: string;   // collect 단계에서 받은 LLM 컨텍스트
}
```

**Response** `200 OK` — `text/event-stream` (SSE)

```
data: {"type": "assumptions", "data": { ... }}
data: {"type": "reasoning", "text": "매출성장률 8.5%: ..."}
data: {"type": "dcfResult", "data": { ... }}
data: {"type": "range", "data": { ... }}
data: [DONE]
```

**Response 구조 상세**

```typescript
// assumptions (LLM이 추론한 초기 가정치 — F-19 슬라이더 초기값)
{
  type: 'assumptions';
  data: {
    revenueGrowthRate: number;     // 예: 0.085 (8.5%)
    operatingMargin: number;       // 예: 0.307 (30.7%)
    wacc: number;                  // 예: 0.095 (9.5%)
    terminalGrowthRate: number;    // 예: 0.025 (2.5%)
  };
}

// reasoning (각 가정치에 대한 LLM 설명 — F-19 슬라이더 옆에 표시)
{
  type: 'reasoning';
  text: string;   // 마크다운. "매출성장률 8.5%: 최근 3년 CAGR 8.1% 기반..."
}

// dcfResult (TypeScript 순수 계산 결과)
{
  type: 'dcfResult';
  data: {
    intrinsicValue: number;        // 적정 주당 가치
    enterpriseValue: number;       // 기업가치
    equityValue: number;           // 주주가치
    projectedFCFs: number[];       // 향후 5년 FCF 추정
    terminalValue: number;         // 영구가치
  };
}

// range (적정주가 레인지 — F-18 차트)
{
  type: 'range';
  data: {
    low: number;                   // 보수적 시나리오
    base: number;                  // 기본 시나리오
    high: number;                  // 낙관적 시나리오
    currentPrice: number;          // 현재 주가
    safetyMarginPrice: number;     // 안전마진 적용 매수가
  };
}
```

**슬라이더 조정 시 (F-19)**: API 재호출 없음. 브라우저에서 `calculate-dcf.ts` 순수 함수 직접 실행.

```typescript
// 클라이언트에서 직접 import하여 실행
import { calculateDCF } from '@/features/analysis/valuation/calculate-dcf';

const newResult = calculateDCF({
  ...assumptions,
  revenueGrowthRate: sliderValue,  // 사용자가 조정한 값
});
// → 즉시 UI 업데이트. 네트워크 호출 0회.
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | `contextString` 누락 |
| 429 | Gemini RPM/RPD 초과 |
| 500 | LLM JSON 파싱 실패 (Zod 검증 에러) |

---

### 2.7 `POST /api/analyze/save` — 결과 저장

**Pipeline Step 10**: 전체 분석 결과를 캐시 저장.

```
POST /api/analyze/save
Content-Type: application/json
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/cache/analysis-cache.ts` → `saveAnalysis(ticker, data, db)` |
| **외부 서비스** | Supabase `analyses` 테이블 INSERT |
| **TTL** | 24시간 (`expires_at` 설정) |

**Request**

```typescript
{
  ticker: string;
  results: {
    collectedData: CollectedData;
    report: string;
    investors: Record<InvestorId, InvestorAnalysis>;
    valuation: {
      assumptions: DCFInput;
      dcfResult: DCFResult;
      range: ValuationRange;
      reasoning: string;
    };
  };
}
```

**Response** `200 OK`

```typescript
{
  success: true;
  expiresAt: string;   // ISO 8601 (24시간 후)
}
```

**에러**

| Status | 조건 |
|--------|------|
| 400 | 필수 필드 누락 |
| 500 | Supabase 저장 실패 |

---

### 2.8 `GET /api/cron/keep-alive` — Supabase 유지

Supabase Free Tier는 7일간 요청 없으면 자동 정지. Vercel Cron으로 매일 호출.

```
GET /api/cron/keep-alive
Authorization: Bearer {CRON_SECRET}
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `infra/database/` — 간단한 SELECT 쿼리 |
| **Cron 스케줄** | 매일 1회 (`vercel.json`에 설정) |

**Response** `200 OK`

```typescript
{
  ok: true;
  timestamp: string;
}
```

**에러**

| Status | 조건 |
|--------|------|
| 401 | `CRON_SECRET` 불일치 |

---

## 3. 파이프라인 실행 순서

클라이언트(`orchestration/client/use-analysis-pipeline.ts`)가 아래 순서로 순차 호출:

```
Step 0  GET  /api/cache/[ticker]          ──→ HIT: 즉시 완료, MISS: 계속
Step 1  POST /api/analyze/collect          ──→ collectedData + contextString 획득
Step 2  POST /api/analyze/report           ──→ contextString 전달, 스트리밍 수신
Step 3  POST /api/analyze/investor/buffett ──→ contextString 전달, 스트리밍 수신
Step 4  POST /api/analyze/investor/graham  ──→ 〃
Step 5  POST /api/analyze/investor/lynch   ──→ 〃
Step 6  POST /api/analyze/investor/dalio   ──→ 〃
Step 7  POST /api/analyze/investor/greenblatt ──→ 〃
Step 8  POST /api/analyze/investor/fisher  ──→ 〃
Step 9  POST /api/analyze/valuation        ──→ contextString 전달, 스트리밍 수신
Step 10 POST /api/analyze/save             ──→ 전체 결과 저장
```

**데이터 의존 관계**:

```
Step 0 (cache)
  │
  └─ MISS → Step 1 (collect)
               │
               └─ contextString → Step 2~9 (모두 contextString 의존)
                                    │
                                    └─ 전체 결과 → Step 10 (save)
```

**핵심**: Step 2~9는 모두 `contextString`만 받으면 독립 실행 가능.
현재는 Gemini 10 RPM 제한 때문에 순차 실행하지만, RPM 제한이 풀리면 병렬화 가능.

---

## 4. Rate Limit 제약

### 외부 API 호출 횟수 (1회 분석당)

| 서비스 | 호출 수 | 일일 한도 | 1회 분석 소모율 |
|--------|:------:|:--------:|:-------------:|
| **FMP** | ~8 | 250/day | 3.2% |
| **Finnhub** | 1 | 60/min | 무시 가능 |
| **Gemini** | 8 | 250/day, 10/min | 3.2% |
| **Supabase** | 2 | 무제한 | — |

### 일일 최대 분석 횟수

```
FMP:    250 ÷ 8 = 31회
Gemini: 250 ÷ 8 = 31회
→ 병목: FMP와 Gemini 동시 (일 ~31회)
→ 캐시 HIT 시 API 호출 0회이므로 동일 종목 반복은 무제한
```

### RPM 관리

```
Gemini 10 RPM 제약:
  Step 2  report     → 1 RPM
  Step 3  buffett    → 1 RPM
  Step 4  graham     → 1 RPM
  Step 5  lynch      → 1 RPM
  Step 6  dalio      → 1 RPM
  Step 7  greenblatt → 1 RPM
  Step 8  fisher     → 1 RPM
  Step 9  valuation  → 1 RPM
  ──────────────────────────
  합계: 8 RPM (10 RPM 이내)

각 스텝이 10~20초 소요되므로 순차 실행 시 자연스럽게 RPM 준수.
```

---

## 5. SSE 스트리밍 규격

스트리밍 API(report, investor, valuation)는 동일한 SSE 형식을 따른다.

### 공통 형식

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### 텍스트 스트리밍 (report, investor)

```
data: {"text": "토큰1"}

data: {"text": "토큰2"}

data: [DONE]
```

- 각 `data:` 뒤에 JSON 객체. `text` 필드에 토큰 문자열.
- 빈 줄(`\n\n`)로 이벤트 구분.
- `[DONE]` 수신 시 스트림 종료.

### 구조화 스트리밍 (valuation)

```
data: {"type": "assumptions", "data": {...}}

data: {"type": "reasoning", "text": "..."}

data: {"type": "dcfResult", "data": {...}}

data: {"type": "range", "data": {...}}

data: [DONE]
```

- `type` 필드로 메시지 종류 구분.
- 클라이언트는 `type`에 따라 다른 상태에 저장.

### 클라이언트 수신 패턴

```typescript
const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify({ contextString }) });
const reader = response.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (!line.startsWith('data: ')) continue;
    const data = line.slice(6);
    if (data === '[DONE]') return;

    const parsed = JSON.parse(data);
    // 텍스트 스트리밍: parsed.text
    // 구조화 스트리밍: parsed.type + parsed.data
  }
}
```

---

## 6. 에러 처리 규격

### 공통 에러 응답

```typescript
{
  error: {
    code: string;        // "RATE_LIMIT_EXCEEDED", "TICKER_NOT_FOUND", etc.
    message: string;     // 사용자에게 표시 가능한 한국어 메시지
  };
}
```

### 에러 코드 목록

| 코드 | HTTP | 설명 | 클라이언트 대응 |
|------|------|------|----------------|
| `INVALID_REQUEST` | 400 | 필수 파라미터 누락 | 입력값 검증 |
| `TICKER_NOT_FOUND` | 404 | 종목을 찾을 수 없음 | 검색 재시도 안내 |
| `RATE_LIMIT_EXCEEDED` | 429 | 외부 API 한도 초과 | 재시도 안내 + 대기 시간 표시 |
| `LLM_ERROR` | 500 | LLM 응답 실패/파싱 실패 | 해당 스텝 재시도 |
| `EXTERNAL_API_ERROR` | 502 | 외부 API 장애 | 잠시 후 재시도 안내 |
| `UNAUTHORIZED_CRON` | 401 | Cron 인증 실패 | — |

### 파이프라인 에러 전략

```
Step 실패 시 클라이언트 동작:
  Step 0 (cache) 실패   → 무시, Step 1부터 진행
  Step 1 (collect) 실패 → 전체 중단, 에러 표시
  Step 2~9 실패         → 해당 스텝 1회 재시도 → 실패 시 스킵하고 다음 스텝 진행
  Step 10 (save) 실패   → 무시 (결과는 이미 화면에 표시됨)
```

---

## 7. 파일 매핑

| 라우트 파일 | 호출하는 feature | Port 의존 |
|------------|-----------------|-----------|
| `app/api/search/route.ts` | `features/search/search-ticker.ts` | MarketDataPort |
| `app/api/cache/[ticker]/route.ts` | `features/cache/analysis-cache.ts` | DatabasePort |
| `app/api/analyze/collect/route.ts` | `features/analysis/collect/collect-financial-data.ts` + `build-llm-context.ts` | MarketDataPort, NewsPort |
| `app/api/analyze/report/route.ts` | `features/analysis/report/generate-report.ts` | LLMPort |
| `app/api/analyze/investor/[id]/route.ts` | `features/analysis/investor/analyze-investor.ts` | LLMPort |
| `app/api/analyze/valuation/route.ts` | `features/analysis/valuation/estimate-assumptions.ts` + `calculate-dcf.ts` | LLMPort |
| `app/api/analyze/save/route.ts` | `features/cache/analysis-cache.ts` | DatabasePort |
| `app/api/cron/keep-alive/route.ts` | — | DatabasePort |
