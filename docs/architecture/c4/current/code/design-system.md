# Code Diagram — `src/design-system/`

> IDEO 디자인 가이드 기반 토큰과 폰트 설정. 2개 파일.

---

## 파일 구조

```
src/design-system/
├── tokens.ts       🟢 컬러, 스페이싱, 라디우스 상수
└── fonts.ts        🟢 Inter, JetBrains Mono, Pretendard 설정
```

---

## 의존 관계

```
app/layout.tsx ──import──► design-system/fonts.ts
                            (inter, jetbrainsMono, PRETENDARD_CDN)

components/ui/*.tsx ──import──► lib/utils.ts (cn)
                                globals.css의 CSS 변수를 통해 간접 의존
```

`tokens.ts`는 현재 직접 import하는 파일 없음 — `globals.css`의 CSS 변수가 같은 값을 정의하고 있어 Tailwind를 통해 적용됨. 향후 JS에서 직접 참조 시 사용.

---

## `tokens.ts`

```typescript
export const colors = {
  primary: '#1a1a2e',        // Deep Navy — 텍스트, 주요 요소
  accent: '#e2b857',         // Muted Gold — 강조, 적정가 범위
  positive: '#4a9079',       // Sage Green — 긍정 수치 (빨간색 대신)
  negative: '#c75a3a',       // Terracotta — 부정 수치 (빨간색 대신)
  neutral: '#8b8fa3',        // Slate Gray — 보조 텍스트, 비활성
  bgPrimary: '#fafaf8',      // Warm White — 페이지 배경
  bgSecondary: '#f5f3ef',    // Warm Gray — 카드/섹션 배경
  textPrimary: '#1a1a2e',    // = primary
  textSecondary: '#4a4a5a',  // 중간 톤 텍스트
  textMuted: '#8b8fa3',      // = neutral
  border: '#e5e3df',         // 테두리
} as const;

export const spacing = {
  xs: '0.25rem',             // 4px
  sm: '0.5rem',              // 8px
  md: '1rem',                // 16px
  lg: '1.5rem',              // 24px
  xl: '2rem',                // 32px
  '2xl': '3rem',             // 48px
  '3xl': '4rem',             // 64px
} as const;

export const radius = {
  sm: '0.375rem',            // 6px
  md: '0.5rem',              // 8px
  lg: '0.75rem',             // 12px
  xl: '1rem',                // 16px
  full: '9999px',            // 원형
} as const;
```

**`as const` 사용**: 모든 값이 리터럴 타입으로 추론됨. `colors.primary`는 `string`이 아닌 `'#1a1a2e'`.

---

## `fonts.ts`

```typescript
import { Inter, JetBrains_Mono } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const PRETENDARD_CDN =
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
```

| export | 타입 | 용도 |
|--------|------|------|
| `inter` | `NextFont` | 영문 본문 (CSS var `--font-inter`) |
| `jetbrainsMono` | `NextFont` | 숫자, 재무 데이터 (CSS var `--font-jetbrains-mono`) |
| `PRETENDARD_CDN` | `string` | 한국어 본문 (CDN `<link>` 태그로 로드) |

**폰트 적용 흐름**:
1. `layout.tsx` → `<body className={inter.variable + jetbrainsMono.variable}>`
2. `layout.tsx` → `<link href={PRETENDARD_CDN}>`
3. `globals.css` → `font-family: 'Pretendard Variable', var(--font-inter), ...`
4. 컴포넌트에서 `font-mono` → JetBrains Mono 적용
