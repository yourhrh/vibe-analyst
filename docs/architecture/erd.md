# Vide Analyst - ERD (Entity Relationship Diagram)

> DB 전문가 관점의 설계. **한번 배포되면 바꾸기 어려운 것은 DB 스키마다.**
>
> 설계 원칙:
> 1. **정규화**: 투자자 분석, 밸류에이션은 별도 행으로 분리 → 추가/삭제가 마이그레이션 없이 가능
> 2. **JSONB 전략**: 구조가 자주 바뀌는 데이터(재무 원본, 기준별 점수)는 JSONB, 쿼리 대상은 컬럼
> 3. **선제적 확장**: P1/P2 기능(워치리스트, 공유, 히스토리)용 테이블을 미리 설계
> 4. **느슨한 결합**: `analysis_type`으로 부분 분석 지원, nullable FK로 비로그인 사용 허용

---

## 1. ERD 다이어그램

```
┌──────────────┐
│   profiles   │
│──────────────│
│ id (PK)      │─────────────────────────────────────────────────┐
│ display_name │                                                 │
│ avatar_url   │          ┌──────────────────────┐               │
│ preferences  │          │  watchlist_items      │               │
│ created_at   │          │──────────────────────│               │
│ updated_at   │          │ id (PK)              │               │
└──────────────┘          │ user_id (FK)─────────┼───────────────┤
       │                  │ ticker               │               │
       │                  │ display_name         │               │
       │                  │ target_price         │               │
       │                  │ notes                │               │
       │                  │ notify_enabled       │               │
       │                  │ created_at           │               │
       │                  │ updated_at           │               │
       │                  └──────────────────────┘               │
       │                                                         │
       │              ┌────────────────────────────┐             │
       │              │      analyses              │             │
       │              │────────────────────────────│             │
       │              │ id (PK)                    │             │
       └──────────────┤ user_id (FK, nullable)     │             │
                      │ ticker                     │             │
                      │ analysis_type              │             │
                      │ status                     │             │
                      │ collected_data (JSONB)     │             │
                      │ context_string             │             │
                      │ price_range (JSONB)        │             │
                      │ share_token (UNIQUE)       │             │
                      │ error_message              │             │
                      │ created_at                 │             │
                      │ expires_at                 │             │
                      └──────┬─────────────────────┘             │
                             │                                   │
              ┌──────────────┼──────────────┐                    │
              │              │              │                    │
              ▼              ▼              ▼                    │
┌──────────────────┐ ┌────────────────┐ ┌───────────────────┐   │
│analysis_reports  │ │investor_       │ │valuation_results  │   │
│──────────────────│ │analyses        │ │───────────────────│   │
│ id (PK)          │ │────────────────│ │ id (PK)           │   │
│ analysis_id (FK) │ │ id (PK)        │ │ analysis_id (FK)  │   │
│ content          │ │ analysis_id(FK)│ │ method            │   │
│ summary          │ │ investor_id    │ │ assumptions(JSONB)│   │
│ score            │ │ verdict        │ │ result (JSONB)    │   │
│ strengths (JSONB)│ │ score          │ │ reasoning         │   │
│ risks (JSONB)    │ │ comment        │ │ metadata (JSONB)  │   │
│ metadata (JSONB) │ │ criteria(JSONB)│ │ created_at        │   │
│ created_at       │ │ strengths(JSON)│ └───────────────────┘   │
└──────────────────┘ │ risks (JSONB)  │                         │
                     │ raw_text       │                         │
                     │ metadata(JSONB)│                         │
                     │ created_at     │  ┌────────────────────┐ │
                     └────────────────┘  │ analysis_events    │ │
                                         │────────────────────│ │
              ┌────────────────────┐     │ id (PK)            │ │
              │financial_data_cache│     │ ticker             │ │
              │────────────────────│     │ event_type         │ │
              │ id (PK)            │     │ user_id (FK)───────┼─┘
              │ ticker             │     │ analysis_id (FK)   │
              │ data_type          │     │ metadata (JSONB)   │
              │ data (JSONB)       │     │ created_at         │
              │ fetched_at         │     └────────────────────┘
              │ expires_at         │
              └────────────────────┘
```

### 관계 요약

```
profiles         1 ─── 0..N   analyses              (사용자 → 분석 이력)
profiles         1 ─── 0..N   watchlist_items        (사용자 → 워치리스트)
profiles         1 ─── 0..N   analysis_events        (사용자 → 이벤트)
analyses         1 ─── 0..1   analysis_reports       (분석 → 리포트, 부분 분석 시 없을 수 있음)
analyses         1 ─── 0..N   investor_analyses      (분석 → 투자자별 결과, 0~6+명)
analyses         1 ─── 0..N   valuation_results      (분석 → 밸류에이션별 결과, 0~3+개)
analyses         1 ─── 0..N   analysis_events        (분석 → 이벤트 추적)
financial_data_cache           (독립 — 외부 API 응답 캐시)
```

---

## 2. 설계 원칙

### 2.1 왜 투자자 분석을 JSONB 한 덩어리로 안 넣는가

```
❌ 비정규화 (기존 계획)                    ✅ 정규화 (이 설계)
───────────────────────                  ───────────────────────

analyses                                analyses
  investor_analyses JSONB                  │
  // 6명의 결과가 하나의 JSON              │
  // 버핏 추가 → 스키마 변경 불필요        investor_analyses (행 단위)
  // 그러나:                                 투자자 1명 = 1행
  //   - 특정 투자자 verdict 검색 불가       - 투자자 추가 = INSERT 1행
  //   - 부분 업데이트 불가                  - verdict별 집계 쿼리 가능
  //   - 개별 투자자 통계 불가               - 개별 투자자 결과만 조회 가능
  //   - 전체를 읽고 전체를 써야 함           - 부분 실패 시 성공한 것만 저장
```

**같은 이유**로 `valuation_results`도 method별 행으로 분리.
MVP에서는 DCF만 있지만, RIM/Comparable 추가 시 행만 INSERT하면 된다.

### 2.2 JSONB를 쓰는 곳 vs 컬럼을 쓰는 곳

| 기준 | JSONB | 컬럼 |
|------|-------|------|
| WHERE 절에 쓰는가? | ❌ | ✅ `ticker`, `status`, `verdict` |
| 구조가 자주 바뀌는가? | ✅ `collected_data`, `criteria` | ❌ |
| 외부 API 원본인가? | ✅ `financial_data_cache.data` | ❌ |
| 집계/통계가 필요한가? | ❌ | ✅ `score`, `verdict` |
| 확장 예비 필드인가? | ✅ `metadata` | ❌ |

### 2.3 `metadata JSONB` 컬럼의 역할

주요 테이블에 `metadata JSONB DEFAULT '{}'` 컬럼을 둔다.
마이그레이션 없이 새 필드를 추가할 수 있는 **안전망**.

```
예시: investor_analyses.metadata
  현재: {}
  향후: { "processing_time_ms": 3200, "model_version": "gemini-2.5-flash", "prompt_version": "v2" }
```

컬럼 승격 기준: metadata에서 3회 이상 쿼리 조건으로 사용되면 정식 컬럼으로 마이그레이션.

---

## 3. 테이블 상세

### 3.1 `profiles` — 사용자

> Supabase Auth의 `auth.users`를 확장. `id`가 `auth.users.id`와 동일.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK, FK → auth.users | Supabase Auth ID |
| `display_name` | `TEXT` | | 표시 이름 |
| `avatar_url` | `TEXT` | | 프로필 이미지 |
| `preferences` | `JSONB` | DEFAULT '{}' | 사용자 설정 (테마, 언어, 기본 분석 유형 등) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**향후 확장**: `preferences`에 기본 투자자 선택, 알림 설정, 대시보드 레이아웃 등을 마이그레이션 없이 추가.

---

### 3.2 `analyses` — 분석 세션

> 1회 분석 실행 = 1행. 핵심 엔티티.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK, DEFAULT gen_random_uuid() | |
| `user_id` | `UUID` | FK → profiles, **NULLABLE** | NULL = 비로그인 분석 |
| `ticker` | `VARCHAR(10)` | NOT NULL | 종목 코드 |
| `analysis_type` | `VARCHAR(20)` | NOT NULL | 분석 유형 (아래 참고) |
| `status` | `VARCHAR(20)` | NOT NULL, DEFAULT 'pending' | 진행 상태 (아래 참고) |
| `collected_data` | `JSONB` | | 수집 데이터 스냅샷 (분석 시점 고정) |
| `context_string` | `TEXT` | | LLM 컨텍스트 (collected_data에서 파생) |
| `price_range` | `JSONB` | | 집계된 적정주가 레인지 |
| `share_token` | `VARCHAR(12)` | UNIQUE | 공유 링크용 토큰 (NULL = 비공유) |
| `error_message` | `TEXT` | | 실패 시 에러 내용 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `expires_at` | `TIMESTAMPTZ` | | 캐시 만료 시각 |

**`analysis_type` 값**:

| 값 | 설명 | 생성되는 하위 데이터 |
|----|------|---------------------|
| `full` | 전체 분석 (F-5 옵션 4) | report + investor×N + valuation×N |
| `report` | 종합 리포트만 | report |
| `investor` | 투자 대가만 | investor×N |
| `valuation` | 밸류에이션만 | valuation×N |

**`status` 값**:

```
pending → collecting → analyzing → completed
                                 ↘ failed
```

**`price_range` JSONB 구조**:

```jsonc
{
  "low": 180.00,
  "base": 210.00,
  "high": 250.00,
  "current_price": 237.50,
  "safety_margin_price": 178.50,
  "methods_used": ["dcf"]           // 향후: ["dcf", "rim", "comparable"]
}
```

**인덱스**:

```sql
-- 캐시 조회: "이 티커의 유효한 최신 분석이 있는가?"
CREATE INDEX idx_analyses_cache
  ON analyses (ticker, status, expires_at DESC)
  WHERE status = 'completed' AND expires_at > now();

-- 사용자 히스토리: "내 분석 목록" (F-3)
CREATE INDEX idx_analyses_user
  ON analyses (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- 공유 링크 조회
CREATE INDEX idx_analyses_share
  ON analyses (share_token)
  WHERE share_token IS NOT NULL;

-- 만료 캐시 정리 (배치)
CREATE INDEX idx_analyses_expired
  ON analyses (expires_at)
  WHERE status = 'completed';
```

---

### 3.3 `analysis_reports` — 종합 리포트

> 분석 1건당 0~1개. `analysis_type = 'investor'`일 때는 생성되지 않음.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `analysis_id` | `UUID` | FK → analyses, UNIQUE, ON DELETE CASCADE | |
| `content` | `TEXT` | NOT NULL | 전체 마크다운 |
| `summary` | `TEXT` | | 한 줄 결론 (F-9) |
| `score` | `SMALLINT` | CHECK (1~100) | 투자 매력도 점수 (F-9) |
| `strengths` | `JSONB` | | 강점 배열 (F-10) |
| `risks` | `JSONB` | | 리스크 배열 (F-10) |
| `metadata` | `JSONB` | DEFAULT '{}' | 확장 예비 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**`strengths` / `risks` 구조**:

```jsonc
["강력한 생태계와 락인 효과", "서비스 매출 비중 증가", "일관된 주주환원"]
```

---

### 3.4 `investor_analyses` — 투자 대가별 분석

> 분석 1건당 0~N개. 투자자 추가 시 행만 INSERT.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `analysis_id` | `UUID` | FK → analyses, ON DELETE CASCADE | |
| `investor_id` | `VARCHAR(30)` | NOT NULL | 투자자 식별자 |
| `verdict` | `VARCHAR(20)` | NOT NULL | 판정 |
| `score` | `SMALLINT` | NOT NULL, CHECK (1~5) | 종합 점수 |
| `comment` | `TEXT` | | 1인칭 코멘트 |
| `criteria` | `JSONB` | | 기준별 점수 배열 |
| `strengths` | `JSONB` | | 근거 배열 |
| `risks` | `JSONB` | | 리스크 배열 |
| `raw_text` | `TEXT` | | 원본 마크다운 |
| `metadata` | `JSONB` | DEFAULT '{}' | 확장 예비 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**UNIQUE**: `(analysis_id, investor_id)` — 같은 분석에서 같은 투자자 중복 방지.

**`investor_id` 현재 값**: `buffett`, `graham`, `lynch`, `dalio`, `greenblatt`, `fisher`

**`verdict` 현재 값**: `강력매수`, `매수고려`, `관망`, `매수부적합`

**`criteria` 구조**:

```jsonc
[
  { "name": "경제적 해자", "score": 5, "evaluation": "강력한 생태계 락인" },
  { "name": "경영진 품질", "score": 4, "evaluation": "팀 쿡의 운영 효율성" },
  { "name": "안전마진",    "score": 2, "evaluation": "현재가 기준 안전마진 부족" }
]
```

**인덱스**:

```sql
CREATE INDEX idx_investor_analyses_analysis
  ON investor_analyses (analysis_id);

-- 특정 투자자의 전체 판정 통계 (향후 대시보드)
CREATE INDEX idx_investor_analyses_verdict
  ON investor_analyses (investor_id, verdict);
```

**투자자 추가 시 영향**: `investor_id` 컬럼에 새 값을 넣으면 끝. 스키마 변경 없음.

---

### 3.5 `valuation_results` — 밸류에이션 결과

> 분석 1건당 0~N개. 밸류에이션 방법 추가 시 행만 INSERT.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `analysis_id` | `UUID` | FK → analyses, ON DELETE CASCADE | |
| `method` | `VARCHAR(20)` | NOT NULL | 밸류에이션 방법 |
| `assumptions` | `JSONB` | NOT NULL | 방법별 입력 가정치 |
| `result` | `JSONB` | NOT NULL | 방법별 계산 결과 |
| `reasoning` | `TEXT` | | LLM의 가정치 근거 설명 |
| `metadata` | `JSONB` | DEFAULT '{}' | 확장 예비 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**UNIQUE**: `(analysis_id, method)` — 같은 분석에서 같은 방법 중복 방지.

**`method` 현재/향후 값**:

| method | 시기 | 설명 |
|--------|------|------|
| `dcf` | MVP | DCF (Discounted Cash Flow) |
| `rim` | P1 (F-20) | RIM (Residual Income Model) |
| `comparable` | P1 (F-21) | 멀티플 비교 |

**`assumptions` 구조 (DCF 예시)**:

```jsonc
{
  "revenue_growth_rate": 0.085,
  "operating_margin": 0.307,
  "wacc": 0.095,
  "terminal_growth_rate": 0.025,
  "projection_years": 5
}
```

**`result` 구조 (DCF 예시)**:

```jsonc
{
  "intrinsic_value": 210.00,
  "enterprise_value": 3150000000000,
  "equity_value": 3050000000000,
  "projected_fcfs": [95.2, 103.1, 111.8, 121.2, 131.4],
  "terminal_value": 2800000000000
}
```

**밸류에이션 방법 추가 시 영향**: 새 `method` 값으로 INSERT. 스키마 변경 없음.
`assumptions`/`result` JSONB가 방법마다 다른 구조를 수용.

---

### 3.6 `financial_data_cache` — 외부 API 캐시

> 외부 API 응답 원본 캐시. Rate limit 절약 목적. 분석과 독립적.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `ticker` | `VARCHAR(10)` | NOT NULL | |
| `data_type` | `VARCHAR(30)` | NOT NULL | 데이터 종류 |
| `data` | `JSONB` | NOT NULL | API 응답 원본 |
| `fetched_at` | `TIMESTAMPTZ` | DEFAULT now() | 수집 시각 |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL | 만료 시각 |

**UNIQUE**: `(ticker, data_type)` — UPSERT 패턴 사용.

**`data_type`별 TTL 정책**:

| data_type | TTL | 근거 |
|-----------|-----|------|
| `profile` | 7일 | 회사 기본정보는 거의 안 변함 |
| `income` | 24시간 | 분기 실적 반영 주기 |
| `balance` | 24시간 | 〃 |
| `cashflow` | 24시간 | 〃 |
| `ratios` | 24시간 | 〃 |
| `quote` | 5분 | 실시간 시세 |
| `peers` | 7일 | 경쟁사 목록은 거의 안 변함 |
| `news` | 1시간 | 뉴스는 자주 갱신 |

**인덱스**:

```sql
-- 캐시 조회: "이 티커의 이 타입 유효 캐시가 있는가?"
CREATE INDEX idx_cache_lookup
  ON financial_data_cache (ticker, data_type, expires_at DESC);
```

**UPSERT 패턴**:

```sql
INSERT INTO financial_data_cache (ticker, data_type, data, expires_at)
VALUES ($1, $2, $3, now() + interval '24 hours')
ON CONFLICT (ticker, data_type)
DO UPDATE SET data = EXCLUDED.data,
              fetched_at = now(),
              expires_at = EXCLUDED.expires_at;
```

---

### 3.7 `watchlist_items` — 워치리스트

> P2 (F-27) 기능이지만 테이블은 미리 생성. user_id NOT NULL — 로그인 전용.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → profiles, NOT NULL, ON DELETE CASCADE | |
| `ticker` | `VARCHAR(10)` | NOT NULL | |
| `display_name` | `TEXT` | | 사용자 지정 메모명 (예: "테슬라 - 관심") |
| `target_price` | `NUMERIC(12,2)` | | 목표가 (알림 기준) |
| `notes` | `TEXT` | | 메모 |
| `notify_enabled` | `BOOLEAN` | DEFAULT false | 가격 알림 활성화 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**UNIQUE**: `(user_id, ticker)` — 같은 사용자가 같은 종목 중복 추가 방지.

**인덱스**:

```sql
CREATE INDEX idx_watchlist_user
  ON watchlist_items (user_id, created_at DESC);
```

---

### 3.8 `analysis_events` — 이벤트 추적

> 트렌딩 종목 계산(F-2), 사용 통계, 향후 추천(F-24) 데이터 소스.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| `id` | `UUID` | PK | |
| `ticker` | `VARCHAR(10)` | NOT NULL | |
| `event_type` | `VARCHAR(30)` | NOT NULL | 이벤트 종류 |
| `user_id` | `UUID` | FK → profiles, NULLABLE | NULL = 비로그인 |
| `analysis_id` | `UUID` | FK → analyses, NULLABLE | 연관 분석 |
| `metadata` | `JSONB` | DEFAULT '{}' | 이벤트별 추가 데이터 |
| `created_at` | `TIMESTAMPTZ` | DEFAULT now() | |

**`event_type` 값**:

| event_type | 시점 | 용도 |
|------------|------|------|
| `analysis_started` | 분석 시작 | 트렌딩 계산 |
| `analysis_completed` | 분석 완료 | 트렌딩 계산 |
| `analysis_viewed` | 캐시된 분석 조회 | 인기 종목 |
| `analysis_shared` | 공유 링크 생성 | P2 통계 |
| `share_viewed` | 공유 링크 조회 | P2 통계 |

**인덱스**:

```sql
-- 트렌딩: "최근 24시간 가장 많이 분석된 종목"
CREATE INDEX idx_events_trending
  ON analysis_events (event_type, created_at DESC)
  WHERE event_type IN ('analysis_started', 'analysis_completed');

-- 종목별 이벤트 이력
CREATE INDEX idx_events_ticker
  ON analysis_events (ticker, created_at DESC);
```

**트렌딩 쿼리**:

```sql
SELECT ticker, COUNT(*) as cnt
FROM analysis_events
WHERE event_type = 'analysis_completed'
  AND created_at > now() - interval '24 hours'
GROUP BY ticker
ORDER BY cnt DESC
LIMIT 10;
```

**데이터 증가 관리**: `created_at` 기준으로 90일 이전 데이터를 주기적 삭제하거나,
향후 `pg_partman`으로 월별 파티셔닝 적용 가능.

---

## 4. RLS (Row Level Security) 정책

Supabase는 RLS가 기본 활성화. 모든 테이블에 정책을 정의해야 한다.

```sql
-- profiles: 본인만 읽기/수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- analyses: 본인 분석 + 공유된 분석 읽기 가능
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select"
  ON analyses FOR SELECT
  USING (
    user_id = auth.uid()                    -- 본인 분석
    OR user_id IS NULL                      -- 비로그인 분석 (공개)
    OR share_token IS NOT NULL              -- 공유된 분석
  );

CREATE POLICY "analyses_insert"
  ON analyses FOR INSERT
  WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
  );

-- analysis_reports, investor_analyses, valuation_results:
-- analyses의 접근 권한을 상속
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select"
  ON analysis_reports FOR SELECT
  USING (
    analysis_id IN (SELECT id FROM analyses)  -- analyses RLS를 통과한 것만
  );

-- (investor_analyses, valuation_results 동일 패턴)

-- watchlist_items: 본인만
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own"
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_insert_own"
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "watchlist_update_own"
  ON watchlist_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "watchlist_delete_own"
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- financial_data_cache: 서버 전용 (anon/authenticated 접근 불가)
ALTER TABLE financial_data_cache ENABLE ROW LEVEL SECURITY;
-- RLS 정책 없음 → service_role_key로만 접근

-- analysis_events: INSERT는 누구나, SELECT는 서버만
ALTER TABLE analysis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_insert_any"
  ON analysis_events FOR INSERT
  WITH CHECK (true);
-- SELECT 정책 없음 → 집계는 서버에서 service_role_key로
```

---

## 5. 향후 확장 가이드

### 5.1 투자자 추가 (예: 캐시 우드)

```
DB 변경: 없음
코드 변경:
  features/analysis/investor/prompts/wood.ts    ← 프롬프트 작성
  features/analysis/investor/investor-registry.ts ← 목록 추가
  orchestration/client/pipeline-steps.ts        ← 스텝 추가
DB 결과:
  investor_analyses에 investor_id = 'wood' 행이 INSERT됨
```

### 5.2 밸류에이션 방법 추가 (RIM, Comparable)

```
DB 변경: 없음
코드 변경:
  features/analysis/valuation/calculate-rim.ts  ← 계산 함수
  features/analysis/valuation/schema.ts         ← RIMInput 타입 추가
DB 결과:
  valuation_results에 method = 'rim' 행이 INSERT됨
  analyses.price_range.methods_used에 "rim" 추가
```

### 5.3 공유 기능 (F-26)

```
DB 변경: 없음 (share_token 컬럼 이미 존재)
코드 변경:
  share_token 생성 로직 (nanoid 12자리)
  /shared/[token] 페이지
쿼리:
  SELECT * FROM analyses WHERE share_token = $1
```

### 5.4 사용자별 분석 히스토리 (F-3)

```
DB 변경: 없음 (user_id + created_at 인덱스 이미 존재)
코드 변경:
  분석 시작 시 user_id 저장
  /my/history 페이지
쿼리:
  SELECT * FROM analyses
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT 20;
```

### 5.5 커스텀 투자자 프로필 (향후)

```
DB 변경: 마이그레이션 필요
  CREATE TABLE custom_investors (
    id UUID PK,
    user_id UUID FK → profiles,
    investor_id VARCHAR(30) UNIQUE,
    name TEXT,
    description TEXT,
    system_prompt TEXT,
    criteria JSONB,
    created_at TIMESTAMPTZ
  );

investor_analyses.investor_id가 custom_investors.investor_id를 참조하게 됨.
기존 내장 투자자는 코드에, 커스텀은 DB에 프롬프트 저장.
```

### 5.6 가격 알림 (향후)

```
DB 변경: 마이그레이션 필요
  CREATE TABLE price_alerts (
    id UUID PK,
    user_id UUID FK → profiles,
    ticker VARCHAR(10),
    condition VARCHAR(10),    -- 'above', 'below'
    target_price NUMERIC(12,2),
    triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ
  );

watchlist_items.notify_enabled + target_price가 이미 기본 구조를 잡아두고 있음.
price_alerts 테이블은 세밀한 알림 규칙이 필요할 때 추가.
```

---

## 6. 용량 추정

| 테이블 | 1건 크기 | 500종목 기준 | 비고 |
|--------|:--------:|:-----------:|------|
| analyses | ~50KB | ~25MB | collected_data JSONB가 대부분 |
| analysis_reports | ~5KB | ~2.5MB | |
| investor_analyses | ~2KB × 6 | ~6MB | 6명 × 500건 |
| valuation_results | ~1KB | ~0.5MB | MVP는 DCF만 |
| financial_data_cache | ~20KB | ~10MB | 타입별 8종 |
| analysis_events | ~0.2KB | ~5MB | 일 100건 × 365일 |
| **합계** | | **~49MB** | 500MB 한도의 10% |

Supabase Free 500MB 한도 내에서 **~5,000건 분석**까지 여유 있음.

---

## 7. 마이그레이션 SQL

```sql
-- supabase/migrations/001_initial_schema.sql

-- ============================================================
-- 0. Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()

-- ============================================================
-- 1. profiles
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- auth.users 생성 시 자동으로 profiles 행 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. analyses
-- ============================================================
CREATE TABLE analyses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ticker          VARCHAR(10) NOT NULL,
  analysis_type   VARCHAR(20) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  collected_data  JSONB,
  context_string  TEXT,
  price_range     JSONB,
  share_token     VARCHAR(12) UNIQUE,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ,

  CONSTRAINT chk_analysis_type CHECK (analysis_type IN ('full', 'report', 'investor', 'valuation')),
  CONSTRAINT chk_status CHECK (status IN ('pending', 'collecting', 'analyzing', 'completed', 'failed'))
);

CREATE INDEX idx_analyses_cache ON analyses (ticker, status, expires_at DESC)
  WHERE status = 'completed';
CREATE INDEX idx_analyses_user ON analyses (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;
CREATE INDEX idx_analyses_share ON analyses (share_token)
  WHERE share_token IS NOT NULL;
CREATE INDEX idx_analyses_expired ON analyses (expires_at)
  WHERE status = 'completed';

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyses_select" ON analyses
  FOR SELECT USING (
    user_id = auth.uid()
    OR user_id IS NULL
    OR share_token IS NOT NULL
  );
CREATE POLICY "analyses_insert" ON analyses
  FOR INSERT WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================
-- 3. analysis_reports
-- ============================================================
CREATE TABLE analysis_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL UNIQUE REFERENCES analyses(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  summary     TEXT,
  score       SMALLINT CHECK (score BETWEEN 1 AND 100),
  strengths   JSONB,
  risks       JSONB,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_select" ON analysis_reports
  FOR SELECT USING (analysis_id IN (SELECT id FROM analyses));
CREATE POLICY "reports_insert" ON analysis_reports
  FOR INSERT WITH CHECK (analysis_id IN (SELECT id FROM analyses));

-- ============================================================
-- 4. investor_analyses
-- ============================================================
CREATE TABLE investor_analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  investor_id VARCHAR(30) NOT NULL,
  verdict     VARCHAR(20) NOT NULL,
  score       SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment     TEXT,
  criteria    JSONB,
  strengths   JSONB,
  risks       JSONB,
  raw_text    TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (analysis_id, investor_id)
);

CREATE INDEX idx_investor_analyses_analysis ON investor_analyses (analysis_id);
CREATE INDEX idx_investor_analyses_verdict ON investor_analyses (investor_id, verdict);

ALTER TABLE investor_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "investor_analyses_select" ON investor_analyses
  FOR SELECT USING (analysis_id IN (SELECT id FROM analyses));
CREATE POLICY "investor_analyses_insert" ON investor_analyses
  FOR INSERT WITH CHECK (analysis_id IN (SELECT id FROM analyses));

-- ============================================================
-- 5. valuation_results
-- ============================================================
CREATE TABLE valuation_results (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  method      VARCHAR(20) NOT NULL,
  assumptions JSONB NOT NULL,
  result      JSONB NOT NULL,
  reasoning   TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (analysis_id, method)
);

CREATE INDEX idx_valuation_results_analysis ON valuation_results (analysis_id);

ALTER TABLE valuation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "valuation_results_select" ON valuation_results
  FOR SELECT USING (analysis_id IN (SELECT id FROM analyses));
CREATE POLICY "valuation_results_insert" ON valuation_results
  FOR INSERT WITH CHECK (analysis_id IN (SELECT id FROM analyses));

-- ============================================================
-- 6. financial_data_cache
-- ============================================================
CREATE TABLE financial_data_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker      VARCHAR(10) NOT NULL,
  data_type   VARCHAR(30) NOT NULL,
  data        JSONB NOT NULL,
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,

  UNIQUE (ticker, data_type)
);

CREATE INDEX idx_cache_lookup
  ON financial_data_cache (ticker, data_type, expires_at DESC);

-- 서버 전용: RLS 정책 없음 → service_role_key만 접근 가능
ALTER TABLE financial_data_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 7. watchlist_items
-- ============================================================
CREATE TABLE watchlist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker          VARCHAR(10) NOT NULL,
  display_name    TEXT,
  target_price    NUMERIC(12, 2),
  notes           TEXT,
  notify_enabled  BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (user_id, ticker)
);

CREATE INDEX idx_watchlist_user ON watchlist_items (user_id, created_at DESC);

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist_select_own" ON watchlist_items
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "watchlist_insert_own" ON watchlist_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "watchlist_update_own" ON watchlist_items
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "watchlist_delete_own" ON watchlist_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 8. analysis_events
-- ============================================================
CREATE TABLE analysis_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker      VARCHAR(10) NOT NULL,
  event_type  VARCHAR(30) NOT NULL,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES analyses(id) ON DELETE SET NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_trending ON analysis_events (event_type, created_at DESC)
  WHERE event_type IN ('analysis_started', 'analysis_completed');
CREATE INDEX idx_events_ticker ON analysis_events (ticker, created_at DESC);

ALTER TABLE analysis_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_insert_any" ON analysis_events
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 9. 공통 유틸리티
-- ============================================================

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON watchlist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
