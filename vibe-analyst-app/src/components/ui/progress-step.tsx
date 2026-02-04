import { cn } from '@/lib/utils';
import { Check, Loader2 } from 'lucide-react';

/**
 * 분석 진행 단계 표시
 *
 * IDEO 디자인 (Screen 3):
 * ✅ 재무제표 수집 완료
 *    매출 $394B, 영업이익률 30.7%
 *
 * ⏳ 리포트 작성 중...
 */

type StepStatus = 'pending' | 'in_progress' | 'completed' | 'error';

interface ProgressStepProps {
  label: string;
  status: StepStatus;
  description?: string;
  className?: string;
}

export function ProgressStep({
  label,
  status,
  description,
  className,
}: ProgressStepProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 transition-all',
        status === 'completed' && 'border-[#4a9079]/20 bg-[#4a9079]/5',
        status === 'in_progress' && 'border-[#e2b857]/30 bg-[#e2b857]/5',
        status === 'pending' && 'border-[#e5e3df] bg-white opacity-50',
        status === 'error' && 'border-[#c75a3a]/20 bg-[#c75a3a]/5',
        className,
      )}
    >
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {status === 'completed' && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4a9079]">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </div>
        )}
        {status === 'in_progress' && (
          <Loader2 className="h-5 w-5 animate-spin text-[#e2b857]" />
        )}
        {status === 'pending' && (
          <div className="h-5 w-5 rounded-full border-2 border-[#e5e3df]" />
        )}
        {status === 'error' && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c75a3a]">
            <span className="text-xs font-bold text-white">!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'text-sm font-medium',
            status === 'completed' && 'text-[#3a7361]',
            status === 'in_progress' && 'text-[#1a1a2e]',
            status === 'pending' && 'text-[#8b8fa3]',
            status === 'error' && 'text-[#c75a3a]',
          )}
        >
          {label}
          {status === 'in_progress' && '...'}
        </p>
        {description && status === 'completed' && (
          <p className="mt-0.5 text-xs text-[#8b8fa3]">{description}</p>
        )}
      </div>
    </div>
  );
}
