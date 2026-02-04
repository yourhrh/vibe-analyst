import type { AnalysisResult, CollectedData } from '@/types/analysis';

export interface DatabasePort {
  getCachedAnalysis(ticker: string): Promise<AnalysisResult | null>;

  saveAnalysis(
    ticker: string,
    data: Omit<AnalysisResult, 'id' | 'createdAt' | 'expiresAt'>,
  ): Promise<{ id: string; expiresAt: string }>;

  getCachedData<T>(
    ticker: string,
    type: string,
  ): Promise<T | null>;

  saveData(
    ticker: string,
    type: string,
    data: unknown,
    ttlSeconds: number,
  ): Promise<void>;
}
