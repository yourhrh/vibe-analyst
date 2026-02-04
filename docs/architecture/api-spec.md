# Vide Analyst - API 명세서

> 이 문서는 **청사진과 현재 상태**를 함께 관리합니다.
> 각 엔드포인트의 구현 상태를 확인하세요.
>
> 참고: [C4 Blueprint](c4/blueprint/) | [구현 현황](c4/current/implementation-status.md)

---

## 구현 상태 범례

| 상태 | 의미 |
|------|------|
| 🟢 구현됨 | route.ts + feature 코드 모두 존재 |
| 🟡 부분 | route.ts만 존재하거나 스켈레톤만 |
| 🔴 미구현 | 코드 없음 (청사진만) |

---

## 1. 엔드포인트 전체 목록

| # | Method | Path | Runtime | 스트리밍 | 상태 | Pipeline Step |
|---|--------|------|---------|---------|------|---------------|
| 1 | GET | `/api/search` | Node.js | — | 🔴 | — |
| 2 | GET | `/api/cache/[ticker]` | Node.js | — | 🔴 | Step 0 |
| 3 | POST | `/api/analyze/collect` | Node.js | — | 🔴 | Step 1 |
| 4 | POST | `/api/analyze/report` | Edge | SSE | 🔴 | Step 2 |
| 5 | POST | `/api/analyze/investor/[id]` | Edge | SSE | 🔴 | Step 3~8 |
| 6 | POST | `/api/analyze/valuation` | Edge | SSE | 🔴 | Step 9 |
| 7 | POST | `/api/analyze/save` | Node.js | — | 🔴 | Step 10 |
| 8 | GET | `/api/cron/keep-alive` | Node.js | — | 🔴 | — |

**현재 구현된 API: 0/8**

---

## 2. 각 엔드포인트 상세

### 2.1 `GET /api/search` — 티커 검색 🔴

**MVP 기능**: F-1 (티커 검색 + 자동완성)

```
GET /api/search?q=aapl
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/search/search-ticker.ts` → `searchTicker(query, marketData)` |
| **외부 API** | FMP `/api/v3/search?query={q}` |
| **의존** | MarketDataPort (🟢 port 정의됨, 🔴 adapter 미구현) |

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

---

### 2.2 `GET /api/cache/[ticker]` — 캐시 확인 🔴

**Pipeline Step 0**: 캐시 HIT 시 전체 파이프라인 스킵.

```
GET /api/cache/AAPL
```

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/cache/analysis-cache.ts` |
| **외부 서비스** | Supabase `analyses` 테이블 |
| **의존** | DatabasePort (🟢 port 정의됨, 🔴 adapter 미구현) |

**Response** `200 OK` — 캐시 HIT

```typescript
{
  hit: true;
  data: {
    collectedData: CollectedData;
    report: string;
    investors: Record<InvestorId, { text: string; verdict: InvestorVerdict; score: number; }>;
    valuation: { assumptions: DCFInput; dcfResult: DCFResult; range: ValuationRange; };
    createdAt: string;
  };
}
```

**Response** `200 OK` — 캐시 MISS

```typescript
{ hit: false; data: null; }
```

---

### 2.3 `POST /api/analyze/collect` — 데이터 수집 🔴

**Pipeline Step 1**: 3개 소스에서 재무 데이터를 병렬 수집.

| 항목 | 내용 |
|------|------|
| **호출 함수** | `features/analysis/collect/collect-financial-data.ts` + `build-llm-context.ts` |
| **외부 API** | FMP (~8 req), Finnhub (1 req) |
| **의존** | MarketDataPort + NewsPort (🟢 port 정의됨, 🔴 adapter 미구현) |

**Request**: `{ ticker: string }`

**Response**: `{ collectedData: CollectedData; contextString: string; }`

---

### 2.4 `POST /api/analyze/report` — 종합 리포트 🔴

**Pipeline Step 2**: LLM 종합 분석 리포트 스트리밍.

| 항목 | 내용 |
|------|------|
| **Runtime** | Edge (스트리밍) |
| **호출 함수** | `features/analysis/report/generate-report.ts` |
| **의존** | LLMPort (🟢 port 정의됨, 🔴 adapter 미구현) |

**Request**: `{ contextString: string }`

**Response**: `text/event-stream` (SSE)

```
data: {"text": "## 종합 판단\n\n"}
data: {"text": "Apple은 "}
...
data: [DONE]
```

---

### 2.5 `POST /api/analyze/investor/[id]` — 투자 대가 분석 🔴

**Pipeline Step 3~8**: 투자 대가 6명 순차 분석.

| id | 투자자 | 핵심 기준 |
|----|--------|----------|
| `buffett` | 워런 버핏 | 경제적 해자, 경영진, 안전마진, ROE |
| `graham` | 벤저민 그레이엄 | Graham Number, 재무 안전성 |
| `lynch` | 피터 린치 | PEG, 카테고리 분류, 스토리 |
| `dalio` | 레이 달리오 | 매크로 환경, 경기 사이클 |
| `greenblatt` | 조엘 그린블랫 | Magic Formula (ROC + EY) |
| `fisher` | 필립 피셔 | 정성적 15포인트 체크리스트 |

**Request**: `{ contextString: string }`

**Response**: `text/event-stream` (SSE) → 파싱 후 `InvestorAnalysis` (🟢 타입 정의됨)

---

### 2.6 `POST /api/analyze/valuation` — 밸류에이션 🔴

**Pipeline Step 9**: LLM 가정치 추론 + TypeScript DCF 계산.

| 항목 | 내용 |
|------|------|
| **Runtime** | Edge (스트리밍) |
| **의존** | LLMPort (🟢 port 정의됨, 🔴 adapter 미구현) |

**Request**: `{ contextString: string }`

**Response**: `text/event-stream` (구조화 SSE)

```
data: {"type": "assumptions", "data": { ... }}
data: {"type": "reasoning", "text": "..."}
data: {"type": "dcfResult", "data": { ... }}
data: {"type": "range", "data": { ... }}
data: [DONE]
```

슬라이더 조정 시 API 재호출 없음 — 브라우저에서 `calculateDCF()` 순수 함수 직접 실행.

---

### 2.7 `POST /api/analyze/save` — 결과 저장 🔴

**Pipeline Step 10**: 전체 분석 결과를 Supabase에 캐시 (24h TTL).

---

### 2.8 `GET /api/cron/keep-alive` — Supabase 유지 🔴

Vercel Cron으로 매일 1회 호출. Supabase 7일 자동정지 방지.

---

## 3. 파이프라인 실행 순서

```
Step 0  GET  /api/cache/[ticker]          🔴
Step 1  POST /api/analyze/collect          🔴
Step 2  POST /api/analyze/report           🔴
Step 3  POST /api/analyze/investor/buffett 🔴
Step 4  POST /api/analyze/investor/graham  🔴
Step 5  POST /api/analyze/investor/lynch   🔴
Step 6  POST /api/analyze/investor/dalio   🔴
Step 7  POST /api/analyze/investor/greenblatt 🔴
Step 8  POST /api/analyze/investor/fisher  🔴
Step 9  POST /api/analyze/valuation        🔴
Step 10 POST /api/analyze/save             🔴
```

---

## 4. SSE 스트리밍 규격

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

### 구조화 스트리밍 (valuation)

```
data: {"type": "assumptions", "data": {...}}

data: {"type": "reasoning", "text": "..."}

data: {"type": "dcfResult", "data": {...}}

data: {"type": "range", "data": {...}}

data: [DONE]
```

---

## 5. 에러 처리 규격

### 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_REQUEST` | 400 | 필수 파라미터 누락 |
| `TICKER_NOT_FOUND` | 404 | 종목을 찾을 수 없음 |
| `RATE_LIMIT_EXCEEDED` | 429 | 외부 API 한도 초과 |
| `LLM_ERROR` | 500 | LLM 응답/파싱 실패 |
| `EXTERNAL_API_ERROR` | 502 | 외부 API 장애 |
| `UNAUTHORIZED_CRON` | 401 | Cron 인증 실패 |

### 파이프라인 에러 전략

```
Step 0 (cache) 실패   → 무시, Step 1부터 진행
Step 1 (collect) 실패 → 전체 중단, 에러 표시
Step 2~9 실패         → 1회 재시도 → 실패 시 스킵
Step 10 (save) 실패   → 무시 (결과는 이미 표시됨)
```

---

## 6. 파일 매핑

| 라우트 파일 | feature | Port 의존 | 구현 |
|------------|---------|-----------|------|
| `app/api/search/route.ts` | `features/search/search-ticker.ts` | MarketDataPort | 🔴 |
| `app/api/cache/[ticker]/route.ts` | `features/cache/analysis-cache.ts` | DatabasePort | 🔴 |
| `app/api/analyze/collect/route.ts` | `features/analysis/collect/*` | MarketDataPort, NewsPort | 🔴 |
| `app/api/analyze/report/route.ts` | `features/analysis/report/*` | LLMPort | 🔴 |
| `app/api/analyze/investor/[id]/route.ts` | `features/analysis/investor/*` | LLMPort | 🔴 |
| `app/api/analyze/valuation/route.ts` | `features/analysis/valuation/*` | LLMPort | 🔴 |
| `app/api/analyze/save/route.ts` | `features/cache/analysis-cache.ts` | DatabasePort | 🔴 |
| `app/api/cron/keep-alive/route.ts` | — | DatabasePort | 🔴 |
