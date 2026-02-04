export interface CompanyProfile {
  ticker: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  description: string;
  country: string;
  website: string;
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  previousClose: number;
}

export interface IncomeStatement {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  operatingMargin: number;
  netMargin: number;
}

export interface BalanceSheet {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalDebt: number;
  cashAndEquivalents: number;
}

export interface CashFlowStatement {
  date: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  dividendsPaid: number;
}

export interface FinancialRatios {
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  dividendYield: number;
}

export interface Financials {
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashFlow: CashFlowStatement[];
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: string;
}
