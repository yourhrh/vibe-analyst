import { cn } from '@/lib/utils';

/**
 * 적정주가 레인지 바
 *
 * IDEO 디자인 (Screen 4, 6):
 * $189 ────── $215 ═══ $235
 *                    ▲ 현재 $228
 *
 * - 현재가 위치에 따라 색상 변화
 * - 적정가 내 = Gold, 초과 = Terracotta
 */

interface RangeBarProps {
  low: number;
  base: number;
  high: number;
  current: number;
  safetyMargin?: number;
  className?: string;
}

export function RangeBar({
  low,
  base,
  high,
  current,
  safetyMargin,
  className,
}: RangeBarProps) {
  const min = Math.min(low, current) * 0.95;
  const max = Math.max(high, current) * 1.05;
  const range = max - min;

  const toPercent = (v: number) => ((v - min) / range) * 100;

  const currentPercent = toPercent(current);
  const lowPercent = toPercent(low);
  const highPercent = toPercent(high);
  const isOvervalued = current > high;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Range bar */}
      <div className="relative h-3 w-full rounded-full bg-[#f5f3ef]">
        {/* Fair value range */}
        <div
          className="absolute top-0 h-full rounded-full bg-[#e2b857]/25"
          style={{
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
          }}
        />
        {/* Base value marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-[#e2b857]"
          style={{ left: `${toPercent(base)}%` }}
        />
        {/* Safety margin marker */}
        {safetyMargin !== undefined && (
          <div
            className="absolute top-0 h-full w-0.5 bg-[#8b8fa3]/50"
            style={{ left: `${toPercent(safetyMargin)}%` }}
          />
        )}
        {/* Current price marker */}
        <div
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md',
            isOvervalued ? 'bg-[#c75a3a]' : 'bg-[#e2b857]',
          )}
          style={{ left: `${currentPercent}%` }}
        />
      </div>

      {/* Labels */}
      <div className="relative h-5 text-xs">
        <span
          className="absolute -translate-x-1/2 font-mono text-[#8b8fa3]"
          style={{ left: `${lowPercent}%` }}
        >
          ${low}
        </span>
        <span
          className="absolute -translate-x-1/2 font-mono font-semibold text-[#1a1a2e]"
          style={{ left: `${toPercent(base)}%` }}
        >
          ${base}
        </span>
        <span
          className="absolute -translate-x-1/2 font-mono text-[#8b8fa3]"
          style={{ left: `${highPercent}%` }}
        >
          ${high}
        </span>
      </div>

      {/* Current price label */}
      <div className="relative h-4">
        <span
          className={cn(
            'absolute -translate-x-1/2 text-xs font-medium',
            isOvervalued ? 'text-[#c75a3a]' : 'text-[#e2b857]',
          )}
          style={{ left: `${currentPercent}%` }}
        >
          ▲ 현재 ${current}
        </span>
      </div>
    </div>
  );
}
