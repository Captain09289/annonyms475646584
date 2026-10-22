export interface PredictionContract {
  id: string;
  ticker: string;
  companyName: string;
  exchange: 'NYSE' | 'NASDAQ' | 'NSE' | 'BSE' | 'MACRO';
  currency: '$' | '₹';
  contractTitle: string;
  category: 'Tech Titans' | 'Semiconductors' | 'Cloud & Software' | 'Indian Equities (NSE/BSE)' | 'Banking & Financials' | 'Macro & Rates';
  marketPrice: number; // 0 - 100
  payout: number; // default 100
  targetRevenueThreshold: string;
  quarter: string;
  resolutionDate: string;
  volume24h: string;
  openInterest: string;
  priceHistory: { date: string; price: number }[];
  pastRevenues: {
    quarter: string;
    revenue: number; // in billions
    consensusEstimate: number; // in billions
    beat: boolean;
  }[];
  financialFeatures: {
    qoqRevenueMomentum: number; // e.g. +14.2%
    consensusRevision: number; // e.g. +3.8%
    twelveQBeatRate: number; // e.g. 0.91 (91%)
    grossMarginTrendBps: number; // e.g. +120 bps
    supplierIndex: number; // normalized feature
  };
  modelProbability?: number;
  probabilityGap?: number;
  grossEv?: number;
  netEv?: number;
  conservativeEv?: number;
  gapCheck?: string;
  actionable?: boolean;
  reason?: string;
  kellyFraction?: number;
}

export interface EngineConfig {
  payout: number;
  transactionCost: number;
  gapThreshold: number;
  minNetEv: number;
  uncertaintyMargin: number;
  trainRatio: number;
  validationRatio: number;
  bucketCount: number;
  useCalibration: boolean;
  l2Candidates: number[];
  learningRate: number;
  epochs: number;
  bootstrapSamples: number;
  seed: number;
  currencySymbol: string;
}

export interface EvaluationResult {
  market_probability: number;
  model_probability: number;
  probability_gap: number;
  gross_ev: number;
  net_ev: number;
  conservative_ev: number;
  gap_check: string;
  possible_signal: boolean;
  actionable: boolean;
  reason: string;
}

export interface CalibrationBucket {
  bucket: number;
  count: number;
  avg_predicted: number;
  observed: number;
  calibration_gap: number;
}

export interface BacktestSummary {
  number_of_predictions: number;
  number_of_trades: number;
  total_simulated_pnl: number;
  win_rate: number | null;
  avg_net_ev_all: number;
  avg_net_ev_traded: number | null;
  avg_realized_pnl_traded: number | null;
}

export interface BootstrapDiff {
  mean_diff: number;
  ci_low: number;
  ci_high: number;
  significant: boolean;
}

export interface PipelineMetrics extends BacktestSummary {
  brier_score: number;
  raw_brier_score: number;
  baseline_brier_score: number;
  market_brier_score: number;
  bootstrap_base_rate: BootstrapDiff;
  bootstrap_market: BootstrapDiff;
}

export interface PipelineResult {
  metrics: PipelineMetrics;
  results: {
    timestamp: number | string;
    market_price: number;
    model_probability: number;
    outcome: number;
    probability_gap: number;
    gross_ev: number;
    net_ev: number;
    conservative_ev: number;
    gap_check: string;
    possible_signal: boolean;
    actionable: boolean;
    reason: string;
    traded: boolean;
    realized_pnl: number;
    cumulative_pnl?: number;
  }[];
  top_signals: any[];
  split_sizes: {
    train: number;
    validation: number;
    test: number;
  };
  test_period: {
    start: number | string;
    end: number | string;
  };
  calibration_table: CalibrationBucket[];
  weights: Record<string, number>;
  selected_l2: number;
  leakage_controls: string[];
}

export interface HistoricalDataRow {
  timestamp: number | string;
  price: number;
  outcome: number;
  features: number[];
  meta?: {
    ticker?: string;
    quarter?: string;
    revenue?: number;
    threshold?: number;
  };
}
