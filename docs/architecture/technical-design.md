# Vide Analyst - 무료 배포 기술 설계서

## 핵심 제약: 월 $0 운영 (모든 서비스 Free Tier)

---

## 1. Free Tier 기술 스택

| 레이어 | 서비스 | Free Tier 한도 |
|--------|--------|---------------|
| **프론트+백엔드** | Next.js 15 → Vercel Hobby | 100GB BW, 서버리스 60s, Edge 30s(스트리밍시 300s) |
| **DB + Auth** | Supabase Free | 500MB DB, 50K MAU, 1GB storage |
| **LLM (메인)** | Google Gemini 2.5 Flash | 10 RPM, 250 RPD, 250K TPM |
| **LLM (경량)** | Gemini 2.5 Flash-Lite | 15 RPM, 1K RPD (뉴스요약 등) |
| **재무 데이터** | FMP Free + SEC EDGAR | 250 req/day + 무제한 |
| **뉴스** | Finnhub Free | 60 calls/min |
| **UI** | shadcn/ui + Recharts | 무료 MIT |
| **Keep-alive** | Vercel Cron (1개 무료) | Supabase 자동정지 방지 |

### 왜 Gemini인가?

- 무료 tier가 가장 넉넉 (일 250회 호출, 분당 10회)
- 한국어 품질 양호
- LLMPort 추상화로 **provider-agnostic** 설계 → Claude/GPT로 어댑터 교체만으로 전환 가능
- 외부 SDK 없이 REST API 직접 호출 → 의존성 최소화
- Gemini 2.0 Flash는 2026.03 폐기 예정 → **2.5 Flash** 사용

### 일일 용량 계산

- 1회 분석 = 7 LLM 호출 (리포트1 + 투자자6) + 밸류에이션1 = **8회**
- 250 RPD / 8 = **일 ~31회 전체 분석** 가능
- FMP 250 req/day / 8 endpoints = **일 ~31 종목** (캐싱 시 무제한 반복)

---

## 2. 핵심 아키텍처: 클라이언트 오케스트레이션

### 문제

분석 전체(데이터수집 + LLM 7회)는 2~3분 소요. Vercel 서버리스 60초 타임아웃에 걸림.

### 해법: 브라우저가 지휘자 역할

```
Browser (Client) ← 오케스트레이터
  │
  ├─ Step 0: GET  /api/cache/[ticker]           ← 캐시 확인 (<2s)
  │   └─ HIT → 즉시 표시, MISS → 아래 진행
  │
  ├─ Step 1: POST /api/analyze/collect           ← 데이터 수집 (5~15s, Node.js)
  │   └─ FMP + EDGAR + Finnhub 병렬 호출
  │
  ├─ Step 2: POST /api/analyze/report            ← 종합 리포트 (스트리밍, Edge)
  ├─ Step 3: POST /api/analyze/investor/buffett   ← 버핏 분석 (스트리밍, Edge)
  ├─ Step 4: POST /api/analyze/investor/graham    ← 그레이엄 (스트리밍, Edge)
  ├─ Step 5: POST /api/analyze/investor/lynch     ← 린치 (스트리밍, Edge)
  ├─ Step 6: POST /api/analyze/investor/dalio     ← 달리오 (스트리밍, Edge)
  ├─ Step 7: POST /api/analyze/investor/greenblatt← 그린블랫 (스트리밍, Edge)
  ├─ Step 8: POST /api/analyze/investor/fisher    ← 피셔 (스트리밍, Edge)
  ├─ Step 9: POST /api/analyze/valuation          ← 밸류에이션 (스트리밍+계산, Edge)
  │
  └─ Step 10: POST /api/analyze/save              ← 결과 캐싱 (<3s, Node.js)
```

**왜 이 방식인가:**

- 각 스텝이 독립적 API 호출 → 개별 30초 미만으로 타임아웃 회피
- 순차 실행 → 자연스럽게 Gemini 10 RPM 준수
- IDEO 디자인의 "살아있는 기다림" UX와 완벽 일치 (각 단계 완료 시 UI 업데이트)

---