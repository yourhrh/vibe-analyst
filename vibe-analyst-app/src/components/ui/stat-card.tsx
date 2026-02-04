import { cn } from '@/lib/utils';
import { FinancialNumber } from './financial-number';

/**
 * 재무 하이라이트 카드
 *
 * IDEO 디자인 (Screen 4):
 * ┌────────┐
 * │ 매출   │
 * │ $394B  │
 * │ +8.2%  │
 * └────────┘
 *
 * - 숫자는 JetBrains Mono
 * - 변화율 동반 표시
 * - 부정적 수치에 Terracotta + ▼
 */

interface StatCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'percent' | 'ratio' | 'plain';
  change?: number;
  subtitle?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  format = 'currency',
  change,
  subtitle,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[#e5e3df] bg-white px-4 py-3',
        className,
      )}
    >
      <p className="text-xs font-medium text-[#8b8fa3]">{label}</p>
      <div className="mt-1">
        <FinancialNumber value={value} format={format} change={change} size="lg" />
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-[#8b8fa3]">{subtitle}</p>
      )}
    </div>
  );
}
