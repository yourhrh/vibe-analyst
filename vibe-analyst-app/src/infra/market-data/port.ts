import type {
  CompanyProfile,
  StockQuote,
  Financials,
  FinancialRatios,
} from '@/types/financial';

export interface MarketDataPort {
  getCompanyProfile(ticker: string): Promise<CompanyProfile>;
  getFinancials(ticker: string, opts: { years: number }): Promise<Financials>;
  getQuote(ticker: string): Promise<StockQuote>;
  getRatios(ticker: string): Promise<FinancialRatios>;
  getPeers(ticker: string): Promise<string[]>;
}
