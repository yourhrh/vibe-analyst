import { cn } from '@/lib/utils';

/**
 * 점수 바 컴포넌트
 *
 * IDEO 디자인: 투자자 기준별 점수를 가로 바로 시각화
 * 예) 경제적 해자  ████████████████░░ 4/5
 */

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function ScoreBar({
  label,
  score,
  maxScore = 5,
  size = 'md',
  className,
}: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span
        className={cn(
          'shrink-0 text-[#1a1a2e]',
          size === 'sm' ? 'w-24 text-xs' : 'w-32 text-sm',
        )}
      >
        {label}
      </span>
      <div className="flex-1">
        <div
          className={cn(
            'w-full rounded-full bg-[#f5f3ef]',
            size === 'sm' ? 'h-1.5' : 'h-2',
          )}
        >
          <div
            className="h-full rounded-full bg-[#e2b857] transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <span
        className={cn(
          'shrink-0 font-mono text-[#8b8fa3]',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {score}/{maxScore}
      </span>
    </div>
  );
}
