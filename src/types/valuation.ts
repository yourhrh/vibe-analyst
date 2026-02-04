export interface DCFInput {
  revenueGrowthRate: number;
  operatingMargin: number;
  wacc: number;
  terminalGrowthRate: number;
  projectionYears?: number;
}

export interface DCFResult {
  intrinsicValue: number;
  enterpriseValue: number;
  equityValue: number;
  projectedFCFs: number[];
  terminalValue: number;
}

export interface RIMInput {
  roe: number;
  costOfEquity: number;
  bookValuePerShare: number;
  projectionYears?: number;
}

export interface RIMResult {
  intrinsicValue: number;
  residualIncomes: number[];
}

export interface ComparableInput {
  ticker: string;
  peers: string[];
  multiples: {
    pe: number;
    pb: number;
    evEbitda: number;
  };
}

export interface ComparableResult {
  impliedValues: {
    byPE: number;
    byPB: number;
    byEvEbitda: number;
  };
  averageImpliedValue: number;
}

export interface ValuationRange {
  low: number;
  base: number;
  high: number;
  currentPrice: number;
  safetyMarginPrice: number;
  methodsUsed: string[];
}
