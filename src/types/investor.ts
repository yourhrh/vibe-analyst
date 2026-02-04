export type InvestorId =
  | 'buffett'
  | 'graham'
  | 'lynch'
  | 'dalio'
  | 'greenblatt'
  | 'fisher';

export type InvestorVerdict = '강력매수' | '매수고려' | '관망' | '매수부적합';

export interface InvestorCriteria {
  name: string;
  score: number;
  evaluation: string;
}

export interface InvestorAnalysis {
  investorId: InvestorId;
  verdict: InvestorVerdict;
  score: number;
  comment: string;
  criteria: InvestorCriteria[];
  strengths: string[];
  risks: string[];
  rawText: string;
}

export interface InvestorMeta {
  id: InvestorId;
  name: string;
  nameKo: string;
  description: string;
  criteria: string[];
}
