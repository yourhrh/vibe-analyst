import { cn } from '@/lib/utils';
import type { InvestorVerdict } from '@/types/investor';

/**
 * 투자자 판정 뱃지
 *
 * IDEO 디자인: 판정별 색상 코드
 * - 강력매수: Gold 배경
 * - 매수고려: Sage Green 배경
 * - 관망: Slate Gray 배경
 * - 매수부적합: Terracotta 배경
 */

interface VerdictBadgeProps {
  verdict: InvestorVerdict;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const verdictStyles: Record<InvestorVerdict, string> = {
  '강력매수': 'bg-[#e2b857]/15 text-[#b8922e] border-[#e2b857]/30',
  '매수고려': 'bg-[#4a9079]/10 text-[#3a7361] border-[#4a9079]/30',
  '관망': 'bg-[#8b8fa3]/10 text-[#6b6f82] border-[#8b8fa3]/30',
  '매수부적합': 'bg-[#c75a3a]/10 text-[#a84a2e] border-[#c75a3a]/30',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
} as const;

export function VerdictBadge({
  verdict,
  size = 'md',
  className,
}: VerdictBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        verdictStyles[verdict],
        sizeClasses[size],
        className,
      )}
    >
      {verdict}
    </span>
  );
}
