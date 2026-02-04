import type { CompanyProfile, StockQuote, Financials, FinancialRatios, NewsArticle } from './financial';
import type { InvestorId, InvestorAnalysis } from './investor';
import type { DCFInput, DCFResult, ValuationRange } from './valuation';

export type AnalysisType = 'full' | 'report' | 'investor' | 'valuation';

export type AnalysisStatus =
  | 'pending'
  | 'collecting'
  | 'analyzing'
  | 'completed'
  | 'failed';

export interface CollectedData {
  profile: CompanyProfile;
  quote: StockQuote;
  financials: Financials;
  ratios: FinancialRatios;
  peers: string[];
  news: NewsArticle[];
}

export interface AnalysisResult {
  id: string;
  ticker: string;
  analysisType: AnalysisType;
  status: AnalysisStatus;
  collectedData: CollectedData | null;
  report: string | null;
  investors: Partial<Record<InvestorId, InvestorAnalysis>>;
  valuation: {
    assumptions: DCFInput;
    dcfResult: DCFResult;
    range: ValuationRange;
    reasoning: string;
  } | null;
  createdAt: string;
  expiresAt: string | null;
}
