# Vide Analyst - C4 Component Diagram (Blueprint)

> **이 문서는 청사진(목표 아키텍처)입니다.**
> 현재 구현 상태는 [current/implementation-status.md](../current/implementation-status.md)를 참고하세요.

---

> Container 한 단계 아래. 각 폴더 내부의 **파일 단위** 구성.
> 수정이 필요할 때 정확히 어떤 파일을 열어야 하는지 찾는 용도.

---

## 1. `features/analysis/collect/` — 데이터 수집

```
features/analysis/collect/
├── collect-financial-data.ts    3개 소스 병렬 수집 → 정규화
├── build-llm-context.ts         수집 데이터 → LLM 프롬프트용 문자열 변환
└── schema.ts                    CollectedData, LLMContext 타입 (Zod)
```

| 파일 | 입력 | 출력 | 의존 |
|------|------|------|------|
| `collect-financial-data.ts` | ticker, MarketDataPort, NewsPort | CollectedData | `infra/market-data/port`, `infra/news/port` |
| `build-llm-context.ts` | CollectedData | contextString (string) | 없음 (순수 변환) |

---

## 2. `features/analysis/report/` — 종합 리포트

```
features/analysis/report/
├── generate-report.ts           LLM에 컨텍스트 전달 → 리포트 스트리밍 생성
├── prompt.ts                    시스템 프롬프트
└── schema.ts                    ReportData 타입 (Zod)
```

---

## 3. `features/analysis/investor/` — 투자 대가 분석

```
features/analysis/investor/
├── analyze-investor.ts          investorId로 프롬프트 선택 → LLM 호출
├── investor-registry.ts         투자자 ID ↔ 메타데이터 매핑
├── prompts/
│   ├── buffett.ts               경제적 해자, 경영진 품질, 안전마진, ROE
│   ├── graham.ts                Graham Number, 재무 안전성 체크리스트
│   ├── lynch.ts                 PEG, 카테고리 분류, 스토리
│   ├── dalio.ts                 매크로 환경, 경기 사이클
│   ├── greenblatt.ts            Magic Formula (ROC + Earnings Yield)
│   └── fisher.ts                정성적 15포인트 체크리스트
└── schema.ts                    InvestorAnalysis, Verdict 타입 (Zod)
```

**투자자 추가 시**: `prompts/`에 파일 추가 + `investor-registry.ts`에 등록 + `orchestration/client/pipeline-steps.ts`에 스텝 추가

---

## 4. `features/analysis/valuation/` — 밸류에이션

```
features/analysis/valuation/
├── calculate-dcf.ts             순수 함수: DCFInput → DCFResult
├── calculate-rim.ts             순수 함수: RIMInput → RIMResult
├── calculate-comparable.ts      순수 함수: 멀티플 비교 계산
├── estimate-assumptions.ts      LLM으로 가정치 추론 (최초 1회)
├── prompt.ts                    가정치 추론 시스템 프롬프트
└── schema.ts                    DCFInput, DCFResult, ValuationRange 타입 (Zod)
```

**핵심 분리**: `estimate-assumptions.ts` → LLM (최초 1회). `calculate-dcf.ts` → 순수 계산 (슬라이더마다 재실행).

---

## 5. `features/search/` + `features/cache/`

```
features/search/
└── search-ticker.ts             티커/회사명 검색 + 자동완성

features/cache/
└── analysis-cache.ts            캐시 HIT/MISS 판정, 저장, TTL 관리
```

---

## 6. `infra/` — Adapters

```
infra/market-data/
├── port.ts                      interface MarketDataPort
├── fmp.adapter.ts               FMP Free API 구현
├── edgar.adapter.ts             SEC EDGAR 구현
└── index.ts                     팩토리: createMarketDataAdapter()

infra/news/
├── port.ts                      interface NewsPort
├── finnhub.adapter.ts           Finnhub Free API 구현
└── index.ts                     팩토리

infra/llm/
├── port.ts                      interface LLMPort
├── gemini.adapter.ts            Gemini REST API 직접 호출
├── streaming.ts                 SSE 파싱 유틸
└── index.ts                     팩토리

infra/database/
├── port.ts                      interface DatabasePort
├── supabase.adapter.ts          Supabase 구현
├── client.ts                    브라우저용 클라이언트
├── server.ts                    서버용 클라이언트
└── index.ts                     팩토리
```

---

## 7. `orchestration/client/` — 파이프라인

```
orchestration/client/
├── use-analysis-pipeline.ts     React 훅: 10단계 API 순차 호출 상태머신
├── pipeline-steps.ts            스텝 정의 (id, endpoint, method, streaming 여부)
└── types.ts                     PipelineState, StepStatus, StepResult
```

---

## 8. `components/analysis/` — 분석 UI

```
components/analysis/
├── analysis-orchestrator.tsx     orchestration 훅 + 진행 UI 조합
├── progress-tracker.tsx          단계별 체크마크/스피너
├── streaming-text.tsx            SSE 스트림 → 실시간 마크다운 렌더
├── report-view.tsx               종합 리포트 뷰
├── investor-card.tsx             투자자 개별 카드
├── investor-roundtable.tsx       라운드테이블 합의 요약
├── valuation-panel.tsx           DCF 슬라이더 패널
└── valuation-range-chart.tsx     적정주가 레인지 차트
```

---

## 9. 수정 가이드

| 하고 싶은 것 | 열어야 하는 파일 |
|-------------|----------------|
| 버핏 분석 프롬프트 수정 | `features/analysis/investor/prompts/buffett.ts` |
| 투자자 1명 추가 | `prompts/신규.ts` + `investor-registry.ts` + `pipeline-steps.ts` |
| DCF 계산 공식 변경 | `features/analysis/valuation/calculate-dcf.ts` |
| Gemini → Claude 교체 | `infra/llm/claude.adapter.ts` (신규) + `infra/llm/index.ts` |
| FMP → 다른 API 교체 | `infra/market-data/신규.adapter.ts` + `index.ts` |
| 컬러 시스템 변경 | `design-system/tokens.ts` |
| 분석 스텝 순서 변경 | `orchestration/client/pipeline-steps.ts` |
