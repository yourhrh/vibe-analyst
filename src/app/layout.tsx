import type { Metadata } from 'next';
import { inter, jetbrainsMono, PRETENDARD_CDN } from '@/design-system/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibe Analyst — AI 주식 분석',
  description:
    '전설적 투자자 6인의 관점으로 미국 주식을 분석하고, DCF 밸류에이션까지 한 번에.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href={PRETENDARD_CDN} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
