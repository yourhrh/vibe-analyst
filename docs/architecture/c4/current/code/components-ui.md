# Code Diagram — `src/components/ui/`

> 기초 UI 컴포넌트. shadcn/ui 프리미티브 18개 + IDEO 커스텀 6개.
> 모든 컴포넌트는 `lib/utils.ts`의 `cn()` 함수로 클래스를 조합.

---

## 공통 의존

```
components/ui/*.tsx ──import──► lib/utils.ts → cn()
                    ──import──► lucide-react (아이콘, 일부 컴포넌트)
                    ──import──► radix-ui (shadcn/ui 내부 의존)
```

## `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

`clsx` + `tailwind-merge` 조합. Tailwind 클래스 충돌 시 뒤에 오는 클래스가 우선.

---

## shadcn/ui 프리미티브 (18개)

Radix UI 기반. 커스터마이징 없이 설치된 상태.

| 파일 | Radix 의존 | 용도 |
|------|-----------|------|
| `button.tsx` | Slot | 버튼 (variant: default/destructive/outline/secondary/ghost/link) |
| `card.tsx` | — | 카드 컨테이너 (Header, Title, Description, Content, Footer) |
| `tabs.tsx` | Tabs | 탭 전환 (분석 결과 탭) |
| `input.tsx` | — | 텍스트 입력 (검색바) |
| `slider.tsx` | Slider | 범위 슬라이더 (DCF 가정치 조정) |
| `badge.tsx` | — | 뱃지/태그 |
| `skeleton.tsx` | — | 로딩 스켈레톤 |
| `scroll-area.tsx` | ScrollArea | 스크롤 영역 |
| `separator.tsx` | Separator | 구분선 |
| `tooltip.tsx` | Tooltip | 툴팁 |
| `avatar.tsx` | Avatar | 아바타 (투자자 프로필) |
| `progress.tsx` | Progress | 프로그레스 바 |
| `accordion.tsx` | Accordion | 접기/펼치기 |
| `switch.tsx` | Switch | 토글 스위치 |
| `table.tsx` | — | 테이블 (Header, Body, Row, Head, Cell, Caption, Footer) |
| `alert.tsx` | — | 알림 박스 (variant: default/destructive) |
| `dialog.tsx` | Dialog | 모달 다이얼로그 |
| `sheet.tsx` | Dialog | 슬라이드 패널 (모바일 메뉴) |

---

## IDEO 커스텀 컴포넌트 (6개)

### `financial-number.tsx`

```
의존: cn (lib/utils)
export: FinancialNumber
```

```typescript
interface FinancialNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'ratio' | 'plain';  // default: 'plain'
  change?: number;
  size?: 'sm' | 'md' | 'lg';                             // default: 'md'
  className?: string;
}
```

**내부 함수:**

| 함수 | 입력 → 출력 | 예시 |
|------|------------|------|
| `abbreviateNumber(num)` | `number → string` | `394_000_000_000 → "394.0B"` |
| `formatValue(value, format)` | `number, format → string` | `(394e9, 'currency') → "$394.0B"` |
| `formatChange(change)` | `number → string` | `8.2 → "+8.2%"`, `-3.1 → "-3.1%"` |

**렌더링 규칙:**
- `font-mono` (JetBrains Mono)
- `change > 0` → Sage Green `#4a9079` + `▲`
- `change < 0` → Terracotta `#c75a3a` + `▼`
- `change === 0` → Slate Gray `#8b8fa3`

---

### `score-bar.tsx`

```
의존: cn (lib/utils)
export: ScoreBar
```

```typescript
interface ScoreBarProps {
  label: string;           // "경제적 해자"
  score: number;           // 4
  maxScore?: number;       // default: 5
  size?: 'sm' | 'md';     // default: 'md'
  className?: string;
}
```

**렌더링**: `라벨 [████████████░░░░░░] 4/5`
- 바 색상: Gold `#e2b857`
- 배경: Warm Gray `#f5f3ef`
- 점수 텍스트: `font-mono`, Slate Gray

---

### `verdict-badge.tsx`

```
의존: cn (lib/utils), types/investor.ts (InvestorVerdict)
export: VerdictBadge
```

```typescript
interface VerdictBadgeProps {
  verdict: InvestorVerdict;
  size?: 'sm' | 'md' | 'lg';  // default: 'md'
  className?: string;
}

const verdictStyles: Record<InvestorVerdict, string> = {
  '강력매수': 'bg-[#e2b857]/15 text-[#b8922e] border-[#e2b857]/30',
  '매수고려': 'bg-[#4a9079]/10 text-[#3a7361] border-[#4a9079]/30',
  '관망':     'bg-[#8b8fa3]/10 text-[#6b6f82] border-[#8b8fa3]/30',
  '매수부적합': 'bg-[#c75a3a]/10 text-[#a84a2e] border-[#c75a3a]/30',
};
```

---

### `stat-card.tsx`

```
의존: cn (lib/utils), FinancialNumber (./financial-number)
export: StatCard
```

```typescript
interface StatCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'percent' | 'ratio' | 'plain';  // default: 'currency'
  change?: number;
  subtitle?: string;
  className?: string;
}
```

**구조**: Card 테두리 → 라벨(xs) → `<FinancialNumber size="lg">` → subtitle(xs, optional)

---

### `range-bar.tsx`

```
의존: cn (lib/utils)
export: RangeBar
```

```typescript
interface RangeBarProps {
  low: number;               // 보수적 적정가
  base: number;              // 기본 적정가
  high: number;              // 낙관적 적정가
  current: number;           // 현재 주가
  safetyMargin?: number;     // 안전마진 가격
  className?: string;
}
```

**내부 계산:**
```typescript
const min = Math.min(low, current) * 0.95;
const max = Math.max(high, current) * 1.05;
const toPercent = (v: number) => ((v - min) / (max - min)) * 100;
const isOvervalued = current > high;
```

**렌더링 규칙:**
- 현재가 마커: `isOvervalued ? Terracotta : Gold`
- 적정가 범위: Gold 반투명 배경
- base 마커: Gold 실선
- safetyMargin 마커: Slate Gray 반투명 (optional)
- 라벨: `font-mono`, `$189`, `$215`, `$235`
- 현재가 라벨: `▲ 현재 $228`

---

### `progress-step.tsx`

```
의존: cn (lib/utils), lucide-react (Check, Loader2)
export: ProgressStep
```

```typescript
type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface ProgressStepProps {
  label: string;
  status: StepStatus;
  description?: string;      // completed 상태에서만 표시
  className?: string;
}
```

**상태별 아이콘:**

| status | 아이콘 | 색상 |
|--------|--------|------|
| `completed` | `✅` Check (흰색, 녹색 원) | Sage Green `#4a9079` |
| `in_progress` | `⏳` Loader2 (회전) | Gold `#e2b857` |
| `pending` | `○` 빈 원 (테두리만) | Border `#e5e3df`, opacity 50% |
| `error` | `❗` "!" (흰색, 빨간 원) | Terracotta `#c75a3a` |

**상태별 배경:**
- `completed` → Green 5% 배경 + Green 20% 테두리
- `in_progress` → Gold 5% 배경 + Gold 30% 테두리
- `pending` → 흰 배경 + 기본 테두리 + 50% 투명도
- `error` → Terracotta 5% 배경 + Terracotta 20% 테두리

**label 뒤 "..."**: `in_progress` 상태에서만 자동 추가
**description**: `completed` 상태에서만 표시 (`text-xs text-[#8b8fa3]`)
