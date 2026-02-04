import { cn } from '@/lib/utils';

/**
 * 재무 수치 표시 컴포넌트
 *
 * IDEO 디자인 원칙:
 * - JetBrains Mono 폰트로 자릿수 정렬
 * - 큰 숫자는 단위 축약: $394,000M → $394B
 * - 변화율은 항상 동반: $394B (+8.2%)
 * - 부정적 수치에 빨간색 안 씀 → Terracotta + ▼
 */

interface FinancialNumberProps {
  value: number;
  format?: 'currency' | 'percent' | 'ratio' | 'plain';
  change?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function abbreviateNumber(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
  if (abs >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
  if (abs >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (abs >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toFixed(2);
}

function formatValue(value: number, format: FinancialNumberProps['format']): string {
  switch (format) {
    case 'currency':
      return `$${abbreviateNumber(value)}`;
    case 'percent':
      return `${value.toFixed(1)}%`;
    case 'ratio':
      return `${value.toFixed(2)}x`;
    case 'plain':
    default:
      return abbreviateNumber(value);
  }
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
} as const;

export function FinancialNumber({
  value,
  format = 'plain',
  change,
  size = 'md',
  className,
}: FinancialNumberProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 font-mono', sizeClasses[size], className)}>
      <span className="font-semibold">{formatValue(value, format)}</span>
      {change !== undefined && (
        <span
          className={cn(
            'text-[0.75em] font-medium',
            change > 0 && 'text-[#4a9079]',
            change < 0 && 'text-[#c75a3a]',
            change === 0 && 'text-[#8b8fa3]',
          )}
        >
          {change < 0 ? '▼' : change > 0 ? '▲' : ''}
          {formatChange(change)}
        </span>
      )}
    </span>
  );
}
