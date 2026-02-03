# Vide Analyst - C4 Component Diagram

> Container 한 단계 아래. 각 폴더 내부의 **파일 단위** 구성.
>
> 이 문서를 읽으면 "어떤 파일이 무슨 일을 하는지" 알 수 있다.
> 수정이 필요할 때 정확히 어떤 파일을 열어야 하는지 찾는 용도.

---

## 1. `features/analysis/collect/` — 데이터 수집

```
features/analysis/collect/
├── collect-financial-data.ts    3개 소스(재무, 공시, 뉴스) 병렬 수집 → 정규화
├── build-llm-context.ts         수집 데이터 → LLM 프롬프트용 문자열(~4K tokens) 변환
└── schema.ts                    CollectedData, LLMContext 타입 (Zod)
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `collect-financial-data.ts` | ticker, MarketDataPort, NewsPort | CollectedData | `infra/market-data/port`, `infra/news/port` |
| `build-llm-context.ts` | CollectedData | contextString (string) | 없음 (순수 변환) |

**호출되는 route**: `POST /api/analyze/collect` (Node.js Runtime)

---

## 2. `features/analysis/report/` — 종합 리포트

```
features/analysis/report/
├── generate-report.ts           LLM에 컨텍스트 전달 → 종합 리포트 스트리밍 생성
├── prompt.ts                    시스템 프롬프트 ("한국어 재무 애널리스트")
└── schema.ts                    ReportData 타입 (Zod)
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `generate-report.ts` | contextString, LLMPort | `ReadableStream<string>` | `infra/llm/port` |
| `prompt.ts` | — | system prompt 문자열 | 없음 |

**호출되는 route**: `POST /api/analyze/report` (Edge Runtime, 스트리밍)

**리포트 구성**: 종합 판단 → 강점/리스크 → 재무 요약 → 산업 포지셔닝 → 뉴스 영향

---

## 3. `features/analysis/investor/` — 투자 대가 분석

```
features/analysis/investor/
├── analyze-investor.ts          investorId로 프롬프트 선택 → LLM 호출
├── investor-registry.ts         투자자 ID ↔ 메타데이터(이름, 소개, 기준) 매핑
├── prompts/
│   ├── buffett.ts               경제적 해자, 경영진 품질, 안전마진, ROE
│   ├── graham.ts                Graham Number, 재무 안전성 체크리스트
│   ├── lynch.ts                 PEG, 카테고리 분류(Stalwart/Fast Grower), 스토리
│   ├── dalio.ts                 매크로 환경, 경기 사이클, 포트폴리오 역할
│   ├── greenblatt.ts            Magic Formula (ROC + Earnings Yield)
│   └── fisher.ts                정성적 15포인트 체크리스트
└── schema.ts                    InvestorAnalysis, Verdict 타입 (Zod)
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `analyze-investor.ts` | investorId, contextString, LLMPort | `ReadableStream<string>` | `infra/llm/port`, `./prompts/*` |
| `investor-registry.ts` | investorId | InvestorMeta (이름, 소개, 기준 목록) | 없음 |
| `prompts/*.ts` | — | system prompt 문자열 | 없음 |

**호출되는 route**: `POST /api/analyze/investor/[id]` (Edge Runtime, 스트리밍) × 6회 순차

**투자자 추가 시**: `prompts/` 에 파일 추가 + `investor-registry.ts`에 등록 + `orchestration/client/pipeline-steps.ts`에 스텝 추가

---

## 4. `features/analysis/valuation/` — 밸류에이션

```
features/analysis/valuation/
├── calculate-dcf.ts             순수 함수: DCFInput → DCFResult (LLM 의존 없음)
├── calculate-rim.ts             순수 함수: RIMInput → RIMResult
├── calculate-comparable.ts      순수 함수: 멀티플 비교 계산
├── estimate-assumptions.ts      LLM으로 가정치(성장률, WACC 등) 추론 (최초 1회)
├── prompt.ts                    가정치 추론 시스템 프롬프트
└── schema.ts                    DCFInput, DCFResult, ValuationRange 타입 (Zod)
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `calculate-dcf.ts` | DCFInput | DCFResult | 없음 (순수 계산) |
| `calculate-rim.ts` | RIMInput | RIMResult | 없음 (순수 계산) |
| `calculate-comparable.ts` | ComparableInput | ComparableResult | 없음 (순수 계산) |
| `estimate-assumptions.ts` | contextString, LLMPort | DCFInput + reasoning | `infra/llm/port` |

**호출되는 route**: `POST /api/analyze/valuation` (Edge Runtime, 스트리밍)

**핵심 분리**:
- `estimate-assumptions.ts` → LLM 호출. **최초 1회만**.
- `calculate-dcf.ts` → 순수 계산. **슬라이더 조정마다 재실행**. API 호출 없음.

---

## 5. `features/search/` — 티커 검색

```
features/search/
└── search-ticker.ts             티커/회사명으로 종목 검색 + 자동완성 결과 반환
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `search-ticker.ts` | query, MarketDataPort | SearchResult[] | `infra/market-data/port` |

**호출되는 route**: `GET /api/search?q=` (Node.js Runtime)

---

## 6. `features/cache/` — 분석 캐시

```
features/cache/
└── analysis-cache.ts            캐시 HIT/MISS 판정, 저장, TTL 관리
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `analysis-cache.ts` | ticker, DatabasePort | CachedAnalysis \| null | `infra/database/port` |

**호출되는 route**: `GET /api/cache/[ticker]`, `POST /api/analyze/save`

**TTL 정책**: 분석 결과 24h, 재무 데이터 24h, 뉴스 1h, 시세 5min, 프로필 7d

---

## 7. `infra/market-data/` — 재무 데이터

```
infra/market-data/
├── port.ts                      interface MarketDataPort
├── fmp.adapter.ts               FMP Free API 구현 (250 req/day)
├── edgar.adapter.ts             SEC EDGAR 구현 (무제한, 10 req/sec)
└── index.ts                     팩토리: createMarketDataAdapter()
```

| Port 메서드 | FMP 엔드포인트 | EDGAR 대응 |
|-------------|---------------|-----------|
| `getCompanyProfile(ticker)` | `/api/v3/profile/{ticker}` | Company Facts |
| `getFinancials(ticker, {years})` | income-statement + balance-sheet + cash-flow | XBRL |
| `getQuote(ticker)` | `/api/v3/quote/{ticker}` | 미지원 (FMP 전용) |
| `getRatios(ticker)` | `/api/v3/ratios/{ticker}` | XBRL에서 계산 |
| `getPeers(ticker)` | `/api/v4/stock_peers` | 미지원 |

**교체 시**: 새 adapter 파일 작성 → `index.ts` 팩토리의 return 변경 → `features/` 변경 0줄.

---

## 8. `infra/news/` — 뉴스

```
infra/news/
├── port.ts                      interface NewsPort
├── finnhub.adapter.ts           Finnhub Free API 구현 (60 calls/min)
└── index.ts                     팩토리: createNewsAdapter()
```

| Port 메서드 | 설명 |
|-------------|------|
| `getArticles(ticker, {days})` | 최근 N일간 뉴스. 헤드라인, 요약, 소스, URL 반환 |

---

## 9. `infra/llm/` — LLM

```
infra/llm/
├── port.ts                      interface LLMPort
├── gemini.adapter.ts            Google Gemini REST API 직접 호출
├── streaming.ts                 SSE 파싱 → ReadableStream<string> 변환 유틸
└── index.ts                     팩토리: createLLMAdapter(variant)
```

| Port 메서드 | 설명 |
|-------------|------|
| `streamText({system, prompt, temperature})` | 텍스트 스트리밍 생성 → `ReadableStream<string>` |
| `generateObject<T>({system, prompt, schema})` | 구조화 JSON 생성 → Zod 파싱 → `T` |

**팩토리 variant**: `'primary'` → gemini-2.5-flash, `'light'` → gemini-2.5-flash-lite

**교체 시**: `claude.adapter.ts` 작성 → `index.ts` 팩토리 변경 → `features/` 변경 0줄, SDK 추가 불필요.

---

## 10. `infra/database/` — DB

```
infra/database/
├── port.ts                      interface DatabasePort
├── supabase.adapter.ts          Supabase 구현
├── client.ts                    브라우저용 Supabase 클라이언트
├── server.ts                    서버용 Supabase 클라이언트
└── index.ts                     팩토리: createDatabaseAdapter()
```

| Port 메서드 | 설명 |
|-------------|------|
| `getCachedAnalysis(ticker)` | 캐시된 분석 결과 조회 (TTL 확인 포함) |
| `saveAnalysis(ticker, data)` | 분석 결과 저장 (expires_at 설정) |
| `getCachedData(ticker, type)` | 재무/뉴스/시세 캐시 조회 |
| `saveData(ticker, type, data, ttl)` | 재무/뉴스/시세 캐시 저장 |

---

## 11. `orchestration/client/` — 파이프라인

```
orchestration/client/
├── use-analysis-pipeline.ts     React 훅: 10단계 API 순차 호출 상태머신
├── pipeline-steps.ts            스텝 정의 (id, endpoint, method, streaming 여부)
└── types.ts                     PipelineState, StepStatus, StepResult
```

| 파일 | 역할 |
|------|------|
| `pipeline-steps.ts` | 11개 스텝 정의 (cache → collect → report → investor×6 → valuation → save) |
| `use-analysis-pipeline.ts` | 스텝을 순차 실행, 각 완료 시 상태 업데이트, 에러 시 재시도/중단 |
| `types.ts` | `idle → running → completed \| error` 상태 타입 |

**교체 대상**: 유료 전환 시 `orchestration/server/` 추가 가능. `features/` 변경 0줄.

---

## 12. `components/analysis/` — 분석 UI

```
components/analysis/
├── analysis-orchestrator.tsx     orchestration 훅 + 진행 UI 조합 (최상위 래퍼)
├── progress-tracker.tsx          단계별 체크마크/스피너 + 수집 결과 미리보기
├── streaming-text.tsx            SSE 스트림 → 실시간 마크다운 렌더
├── report-view.tsx               결론 헤더 + 강점/리스크 + 재무 하이라이트 카드
├── investor-card.tsx             투자자 1인 카드 (아바타, 판정, 점수, 코멘트)
├── investor-roundtable.tsx       6명 합의 요약 바 차트
├── valuation-panel.tsx           DCF 슬라이더 4개 + 실시간 적정가 업데이트
└── valuation-range-chart.tsx     적정주가 레인지 가로 바 + 현재가 마커
```

| 컴포넌트 | MVP 기능 | 핵심 props |
|---------|---------|-----------|
| `analysis-orchestrator.tsx` | F-6 | ticker: string |
| `progress-tracker.tsx` | F-6 | steps: StepStatus[] |
| `streaming-text.tsx` | F-7 | stream: ReadableStream |
| `report-view.tsx` | F-9, F-10, F-11 | report: ReportData |
| `investor-card.tsx` | F-15 | analysis: InvestorAnalysis |
| `investor-roundtable.tsx` | F-14 | analyses: InvestorAnalysis[] |
| `valuation-panel.tsx` | F-19 | assumptions: DCFInput, onChange |
| `valuation-range-chart.tsx` | F-18 | range: ValuationRange, currentPrice |

---

## 13. 나머지

### `components/home/`

```
components/home/
└── search-bar.tsx               티커 검색창 + 자동완성 드롭다운 (F-1)
```

### `components/ui/`

```
components/ui/                   shadcn/ui 프리미티브 (Button, Card, Tabs, Slider, Dialog...)
```

### `design-system/`

```
design-system/
├── tokens.ts                    컬러(#1a1a2e, #e2b857...), 스페이싱 상수
└── fonts.ts                     Pretendard, Inter, JetBrains Mono 설정
```

### `types/`

```
types/
├── analysis.ts                  AnalysisResult, AnalysisStatus
├── financial.ts                 CompanyProfile, IncomeStatement, BalanceSheet, CashFlow
├── investor.ts                  InvestorId, InvestorVerdict, InvestorAnalysis
└── valuation.ts                 DCFInput, DCFResult, ValuationRange, Scenario
```

### `supabase/migrations/`

```
supabase/migrations/
└── 001_initial_schema.sql       financial_data_cache, analyses, analysis_events, watchlist, profiles
```

---

## 14. 수정 가이드

| 하고 싶은 것 | 열어야 하는 파일 |
|-------------|----------------|
| 버핏 분석 프롬프트 수정 | `features/analysis/investor/prompts/buffett.ts` |
| 투자자 1명 추가 | `features/analysis/investor/prompts/신규.ts` + `investor-registry.ts` + `orchestration/client/pipeline-steps.ts` |
| DCF 계산 공식 변경 | `features/analysis/valuation/calculate-dcf.ts` |
| 종합 리포트 프롬프트 수정 | `features/analysis/report/prompt.ts` |
| Gemini → Claude 교체 | `infra/llm/claude.adapter.ts` (신규) + `infra/llm/index.ts` |
| FMP → 다른 API 교체 | `infra/market-data/신규.adapter.ts` + `infra/market-data/index.ts` |
| Supabase → 다른 DB | `infra/database/신규.adapter.ts` + `infra/database/index.ts` |
| 캐시 TTL 변경 | `features/cache/analysis-cache.ts` |
| 투자자 카드 UI 변경 | `components/analysis/investor-card.tsx` |
| 레인지 차트 UI 변경 | `components/analysis/valuation-range-chart.tsx` |
| 컬러 시스템 변경 | `design-system/tokens.ts` |
| 분석 스텝 순서 변경 | `orchestration/client/pipeline-steps.ts` |
| DB 테이블 추가 | `supabase/migrations/002_새스키마.sql` |
| API 엔드포인트 추가 | `app/api/새경로/route.ts` |
| 공유 타입 수정 | `types/해당파일.ts` |
