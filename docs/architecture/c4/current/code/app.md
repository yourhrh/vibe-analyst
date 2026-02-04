# Code Diagram — `src/app/`

> Next.js App Router 라우팅 레이어. 3개 페이지 스켈레톤, API route 0개.

---

## 파일 구조

```
src/app/
├── layout.tsx                  🟢 루트 레이아웃
├── page.tsx                    🟢 홈 화면 (스켈레톤)
├── globals.css                 🟢 IDEO CSS 변수 + Tailwind v4
├── favicon.ico                 🟢
│
├── analyze/[ticker]/
│   └── page.tsx                🟢 분석 페이지 (스켈레톤)
│
└── api/                        🔴 전체 미구현
```

---

## 의존 관계

```
app/layout.tsx ──import──► design-system/fonts.ts (inter, jetbrainsMono, PRETENDARD_CDN)
               ──import──► app/globals.css
```

`page.tsx`, `analyze/[ticker]/page.tsx`는 외부 import 없음.

---

## `layout.tsx`

```typescript
import type { Metadata } from 'next';
import { inter, jetbrainsMono, PRETENDARD_CDN } from '@/design-system/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Analyst — AI 주식 분석',
  description: '전설적 투자자 6인의 관점으로 미국 주식을 분석하고, DCF 밸류에이션까지 한 번에.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href={PRETENDARD_CDN} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

| 요소 | 설명 |
|------|------|
| `lang="ko"` | 한국어 사이트 |
| `PRETENDARD_CDN` | `<link>`로 Pretendard 폰트 로드 |
| `inter.variable` | `--font-inter` CSS 변수 주입 |
| `jetbrainsMono.variable` | `--font-jetbrains-mono` CSS 변수 주입 |
| `font-sans` | Tailwind 기본 sans → Pretendard가 적용됨 (globals.css에서 재정의) |

---

## `page.tsx` (홈)

```typescript
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Vibe Analyst</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        전설적 투자자 6인의 관점으로 미국 주식을 분석합니다
      </p>
      <div className="mt-8">
        {/* F-1: SearchBar will go here */}
      </div>
    </main>
  );
}
```

**라우트**: `GET /`
**다음 단계**: `{/* F-1: SearchBar will go here */}` 위치에 `components/home/search-bar.tsx` 연결

---

## `analyze/[ticker]/page.tsx`

```typescript
interface AnalyzePageProps {
  params: Promise<{ ticker: string }>;
}

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { ticker } = await params;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">{ticker.toUpperCase()}</h1>
      <p className="mt-2 text-muted-foreground">분석 페이지 준비 중</p>
    </main>
  );
}
```

**라우트**: `GET /analyze/AAPL` (동적 세그먼트)
**Next.js 16**: `params`가 `Promise`로 변경됨 → `await params` 필요
**다음 단계**: `components/analysis/analysis-orchestrator.tsx` 연결

---

## `globals.css` (주요 부분)

```css
:root {
  --background: #fafaf8;       /* Warm White */
  --foreground: #1a1a2e;       /* Deep Navy */
  --primary: #1a1a2e;
  --accent: #e2b857;           /* Muted Gold */
  --destructive: #c75a3a;      /* Terracotta */
  --ring: #e2b857;
  --chart-1: #1a1a2e;          /* Deep Navy */
  --chart-2: #e2b857;          /* Muted Gold */
  --chart-3: #4a9079;          /* Sage Green */
  --chart-4: #c75a3a;          /* Terracotta */
  --chart-5: #8b8fa3;          /* Slate Gray */
}
```

IDEO 디자인 시스템의 컬러를 shadcn/ui가 사용하는 CSS 변수에 매핑.
Recharts 차트 컬러(`--chart-1`~`--chart-5`)도 IDEO 팔레트로 설정.
