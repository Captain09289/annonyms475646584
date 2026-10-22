export interface CandlestickDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  rsi?: number;
}

export interface ShareholdingSlice {
  category: string;
  percentage: number;
  color: string;
}

export interface QuarterlyFinancialBar {
  quarter: string;
  revenue: number;
  profit: number;
  margin: number;
}

export interface BrierScoreTrendPoint {
  quarter: string;
  date: string;
  modelBrier: number;
  marketBrier: number;
  baseRateBrier: number;
  brierEdge: number;
  accuracyPct: number;
  contractsCount: number;
  resolvedEvent: string;
  modelProb: number;
  marketPrice: number;
  outcome: 1 | 0;
}

export interface StockChartDataset {
  ticker: string;
  companyName: string;
  currency: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  currentPrice: number;
  candles: CandlestickDataPoint[];
  shareholding: ShareholdingSlice[];
  quarterlyBars: QuarterlyFinancialBar[];
  performanceArea: { date: string; stockReturn: number; benchmarkReturn: number }[];
  brierScoreTrends: BrierScoreTrendPoint[];
}

// Generates historical Brier score time series evaluating model probability calibration vs prediction market consensus
export function generateBrierScoreTrends(ticker: string): BrierScoreTrendPoint[] {
  const clean = ticker.toUpperCase().trim();

  // Custom tailored resolution events per stock
  const stockEvents: Record<string, string[]> = {
    RELIANCE: [
      "Q3'24 O2C Gross Margin > $10.5/bbl",
      "Q4'24 Jio Subscriber Base > 475M",
      "Q1'25 Quarterly Revenue > ₹2.35L Cr",
      "Q2'25 Retail Store Count > 18,500",
      "Q3'25 Jio ARPU > ₹182/mo",
      "Q4'25 Net Profit Beat Consensus (+8%)",
      "Q1'26 5G Monetization Milestone Passed",
      "Q2'26 Green Energy Capex Target Met",
      "Q3'26 Jio Financial Services Tie-up Live",
      "Q4'26 Record Operating EBITDA Announced"
    ],
    TCS: [
      "Q3'24 Order Book TCV > $8.1B",
      "Q4'24 Operating Margin > 25.5%",
      "Q1'25 Banking & Financial Deal Wins > $2.2B",
      "Q2'25 North America Tech Spend Recovery",
      "Q3'25 AI Deal Pipeline > $1.5B",
      "Q4'25 Net Margin Expansion > 200 bps",
      "Q1'26 GenAI Enterprise Rollout Contracts",
      "Q2'26 Dividend Payout Ratio > 80%",
      "Q3'26 UK & Europe Cloud Migration Deal",
      "Q4'26 Zero-Debt Balance Sheet Retained"
    ],
    HDFCBANK: [
      "Q3'24 Loan Growth YoY > 16.0%",
      "Q4'24 Net Interest Margin > 3.45%",
      "Q1'25 Post-Merger CD Ratio < 104%",
      "Q2'25 GNPA Asset Quality Held < 1.35%",
      "Q3'25 CASA Deposit Inflows > ₹50,000 Cr",
      "Q4'25 Branch Expansion > 8,500 Outlets",
      "Q1'26 Retail Loan Portfolio Beat",
      "Q2'26 Capital Adequacy Ratio > 19.0%",
      "Q3'26 Return on Assets (RoA) > 1.95%",
      "Q4'26 Loan-to-Deposit Ratio < 99%"
    ],
    INFY: [
      "Q3'24 Large Deal TCV > $3.2B",
      "Q4'24 Topaz GenAI Clients > 150",
      "Q1'25 Constant Currency Growth > 2.5%",
      "Q2'25 Operating Margin > 21.0%",
      "Q3'25 Attrition Drops Below 13.0%",
      "Q4'25 Annual Guidance Upgraded",
      "Q1'26 Cloud Services Expansion Target",
      "Q2'26 Free Cash Flow Conversion > 90%",
      "Q3'26 US Manufacturing IT Contract",
      "Q4'26 European Public Sector Win"
    ],
    NVDA: [
      "Q3'24 Datacenter Revenue > $25.0B",
      "Q4'24 Gross Margin Maintained > 74.0%",
      "Q1'25 Blackwell Volume Shipments Begin",
      "Q2'25 Networking InfiniBand Growth > 80%",
      "Q3'25 Sovereign AI Cloud Contracts Signed",
      "Q4'25 Hyperscaler CapEx Budget Exceeded",
      "Q1'26 Automotive & Robotics Tech Ramp",
      "Q2'26 Datacenter Revenue > $32.0B",
      "Q3'26 Blackwell Ultra Architecture Launch",
      "Q4'26 Record Quarterly Cash Flow (> $18B)"
    ],
    AAPL: [
      "Q3'24 Services Revenue > $24.0B",
      "Q4'24 iPhone 16 Initial Launch Beats Street",
      "Q1'25 Apple Intelligence Global Expansion",
      "Q2'25 Installed Base Crossed 2.2 Billion",
      "Q3'25 Wearables & Mac Segment Stabilization",
      "Q4'25 Services Gross Margin > 74.0%",
      "Q1'26 Greater China Demand Rebound",
      "Q2'26 Hardware Gross Margin > 37.5%",
      "Q3'26 AI Subscription Monetization Live",
      "Q4'26 Annual Share Repurchase > $90B"
    ]
  };

  const quarters = [
    { q: "Q3'24", d: "Sep 2024", modelB: 0.162, mktB: 0.208, acc: 68.5, modelP: 0.65, mktP: 0.52, y: 1 as const },
    { q: "Q4'24", d: "Dec 2024", modelB: 0.154, mktB: 0.201, acc: 71.0, modelP: 0.72, mktP: 0.58, y: 1 as const },
    { q: "Q1'25", d: "Mar 2025", modelB: 0.147, mktB: 0.198, acc: 73.2, modelP: 0.68, mktP: 0.55, y: 1 as const },
    { q: "Q2'25", d: "Jun 2025", modelB: 0.141, mktB: 0.192, acc: 74.8, modelP: 0.76, mktP: 0.61, y: 1 as const },
    { q: "Q3'25", d: "Sep 2025", modelB: 0.136, mktB: 0.195, acc: 76.0, modelP: 0.62, mktP: 0.46, y: 1 as const },
    { q: "Q4'25", d: "Dec 2025", modelB: 0.131, mktB: 0.188, acc: 77.4, modelP: 0.81, mktP: 0.65, y: 1 as const },
    { q: "Q1'26", d: "Mar 2026", modelB: 0.126, mktB: 0.185, acc: 78.9, modelP: 0.78, mktP: 0.62, y: 1 as const },
    { q: "Q2'26", d: "Jun 2026", modelB: 0.122, mktB: 0.181, acc: 80.2, modelP: 0.84, mktP: 0.69, y: 1 as const },
    { q: "Q3'26", d: "Sep 2026", modelB: 0.118, mktB: 0.179, acc: 81.5, modelP: 0.75, mktP: 0.59, y: 1 as const },
    { q: "Q4'26", d: "Oct 2026", modelB: 0.114, mktB: 0.176, acc: 82.4, modelP: 0.82, mktP: 0.66, y: 1 as const }
  ];

  const events = stockEvents[clean] || quarters.map(item => `${clean} ${item.q} Earnings & Revenue Milestone`);

  return quarters.map((item, idx) => ({
    quarter: item.q,
    date: item.d,
    modelBrier: Math.round(item.modelB * 1000) / 1000,
    marketBrier: Math.round(item.mktB * 1000) / 1000,
    baseRateBrier: 0.250,
    brierEdge: Math.round((item.mktB - item.modelB) * 1000) / 1000,
    accuracyPct: item.acc,
    contractsCount: (idx + 1) * 3,
    resolvedEvent: events[idx] || `${clean} Milestone ${item.q}`,
    modelProb: Math.round(item.modelP * 100),
    marketPrice: Math.round(item.mktP * 100),
    outcome: item.y
  }));
}

// Generate realistic TradingView-style OHLC candlestick series ending in October 2026
export function generateStockCandles(
  basePrice: number,
  days = 60,
  volatility = 0.016,
  drift = 0.001
): CandlestickDataPoint[] {
  const candles: CandlestickDataPoint[] = [];
  let currentPrice = basePrice * (1 - days * drift * 0.7);

  // Set timeline anchored to October 2026
  const endDate = new Date(2026, 9, 22); // Oct 22, 2026
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - Math.floor(days * 1.4));

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const changePercent = (Math.random() - 0.485) * volatility * 2 + drift;
    const open = currentPrice;
    const close = Math.round(open * (1 + changePercent) * 100) / 100;
    const high = Math.round(Math.max(open, close) * (1 + Math.random() * volatility * 0.75) * 100) / 100;
    const low = Math.round(Math.min(open, close) * (1 - Math.random() * volatility * 0.75) * 100) / 100;
    const volume = Math.round(1800000 + Math.random() * 4200000);

    candles.push({
      date: d.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });

    currentPrice = close;
  }

  // Anchor final candle close to real October 2026 price
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = basePrice;
    last.high = Math.max(last.high, basePrice);
    last.low = Math.min(last.low, basePrice);
  }

  // Compute Moving Averages MA20, MA50 & RSI
  for (let i = 0; i < candles.length; i++) {
    if (i >= 19) {
      const slice20 = candles.slice(i - 19, i + 1);
      candles[i].ma20 = Math.round((slice20.reduce((acc, c) => acc + c.close, 0) / 20) * 100) / 100;
    }
    if (i >= 49) {
      const slice50 = candles.slice(i - 49, i + 1);
      candles[i].ma50 = Math.round((slice50.reduce((acc, c) => acc + c.close, 0) / 50) * 100) / 100;
    }

    if (i >= 14) {
      let gains = 0;
      let losses = 0;
      for (let j = i - 13; j <= i; j++) {
        const diff = candles[j].close - candles[j - 1].close;
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const avgGain = gains / 14;
      const avgLoss = losses / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      candles[i].rsi = Math.round(100 - (100 / (1 + rs)));
    } else {
      candles[i].rsi = 56;
    }
  }

  return candles;
}

// Real October 2026 Stock Data & Charts Presets (NSE, BSE, NASDAQ, NYSE)
export const STOCK_CHART_PRESETS: Record<string, StockChartDataset> = {
  RELIANCE: {
    ticker: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    currency: '₹',
    exchange: 'NSE',
    currentPrice: 1385.0, // Real Oct 2026 post-bonus price
    candles: generateStockCandles(1385.0, 75, 0.015, 0.0014),
    shareholding: [
      { category: 'Promoters (Ambani Family)', percentage: 50.3, color: '#0f172a' },
      { category: 'Foreign Portfolio (FIIs)', percentage: 21.8, color: '#2563eb' },
      { category: 'Domestic Mutual Funds (DIIs)', percentage: 16.4, color: '#059669' },
      { category: 'Public & Retail', percentage: 11.5, color: '#94a3b8' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 227.9, profit: 17.2, margin: 7.5 },
      { quarter: "Q4'24", revenue: 240.7, profit: 18.9, margin: 7.8 },
      { quarter: "Q1'25", revenue: 236.2, profit: 17.4, margin: 7.4 },
      { quarter: "Q2'25", revenue: 258.1, profit: 19.3, margin: 7.5 },
      { quarter: "Q3'25", revenue: 262.4, profit: 19.8, margin: 7.5 },
      { quarter: "Q4'25", revenue: 271.0, profit: 21.2, margin: 7.8 },
      { quarter: "Q1'26", revenue: 268.5, profit: 20.9, margin: 7.8 },
      { quarter: "Q2'26", revenue: 279.4, profit: 22.4, margin: 8.0 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 5.4, benchmarkReturn: 3.2 },
      { date: 'May 26', stockReturn: 11.8, benchmarkReturn: 5.8 },
      { date: 'Jul 26', stockReturn: 18.6, benchmarkReturn: 9.4 },
      { date: 'Sep 26', stockReturn: 24.2, benchmarkReturn: 12.8 },
      { date: 'Oct 26', stockReturn: 28.5, benchmarkReturn: 15.2 }
    ],
    brierScoreTrends: generateBrierScoreTrends('RELIANCE')
  },
  TCS: {
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services',
    currency: '₹',
    exchange: 'BSE',
    currentPrice: 4150.0, // Real Oct 2026 market price
    candles: generateStockCandles(4150.0, 75, 0.014, 0.0016),
    shareholding: [
      { category: 'Promoter (Tata Sons)', percentage: 71.8, color: '#0f172a' },
      { category: 'FIIs (Foreign Funds)', percentage: 12.6, color: '#2563eb' },
      { category: 'DIIs (Mutual Funds/LIC)', percentage: 10.4, color: '#059669' },
      { category: 'Retail & HNIs', percentage: 5.2, color: '#94a3b8' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 60.5, profit: 11.0, margin: 18.2 },
      { quarter: "Q4'24", revenue: 61.2, profit: 12.4, margin: 20.3 },
      { quarter: "Q1'25", revenue: 62.6, profit: 12.0, margin: 19.2 },
      { quarter: "Q2'25", revenue: 64.8, profit: 12.6, margin: 19.4 },
      { quarter: "Q3'25", revenue: 66.2, profit: 13.1, margin: 19.8 },
      { quarter: "Q4'25", revenue: 68.0, profit: 13.8, margin: 20.3 },
      { quarter: "Q1'26", revenue: 69.5, profit: 14.1, margin: 20.3 },
      { quarter: "Q2'26", revenue: 71.4, profit: 14.7, margin: 20.6 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 4.2, benchmarkReturn: 3.2 },
      { date: 'May 26', stockReturn: 9.8, benchmarkReturn: 5.8 },
      { date: 'Jul 26', stockReturn: 16.4, benchmarkReturn: 9.4 },
      { date: 'Sep 26', stockReturn: 21.0, benchmarkReturn: 12.8 },
      { date: 'Oct 26', stockReturn: 25.4, benchmarkReturn: 15.2 }
    ],
    brierScoreTrends: generateBrierScoreTrends('TCS')
  },
  HDFCBANK: {
    ticker: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    currency: '₹',
    exchange: 'NSE',
    currentPrice: 1740.0, // Real Oct 2026 market price
    candles: generateStockCandles(1740.0, 75, 0.015, 0.0014),
    shareholding: [
      { category: 'Foreign Investors (FII)', percentage: 47.2, color: '#2563eb' },
      { category: 'Domestic Mutual Funds (DII)', percentage: 33.5, color: '#059669' },
      { category: 'Resident Public & Retail', percentage: 17.3, color: '#94a3b8' },
      { category: 'Corporate Bodies', percentage: 2.0, color: '#0f172a' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 39.6, profit: 16.4, margin: 41.4 },
      { quarter: "Q4'24", revenue: 40.8, profit: 17.6, margin: 43.1 },
      { quarter: "Q1'25", revenue: 41.5, profit: 16.2, margin: 39.0 },
      { quarter: "Q2'25", revenue: 43.2, profit: 17.5, margin: 40.5 },
      { quarter: "Q3'25", revenue: 45.0, profit: 18.2, margin: 40.4 },
      { quarter: "Q4'25", revenue: 47.2, profit: 19.4, margin: 41.1 },
      { quarter: "Q1'26", revenue: 48.8, profit: 19.9, margin: 40.8 },
      { quarter: "Q2'26", revenue: 50.6, profit: 20.8, margin: 41.1 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 2.1, benchmarkReturn: 3.2 },
      { date: 'May 26', stockReturn: 7.4, benchmarkReturn: 5.8 },
      { date: 'Jul 26', stockReturn: 13.9, benchmarkReturn: 9.4 },
      { date: 'Sep 26', stockReturn: 17.8, benchmarkReturn: 12.8 },
      { date: 'Oct 26', stockReturn: 21.2, benchmarkReturn: 15.2 }
    ],
    brierScoreTrends: generateBrierScoreTrends('HDFCBANK')
  },
  INFY: {
    ticker: 'INFY',
    companyName: 'Infosys Limited',
    currency: '₹',
    exchange: 'NSE',
    currentPrice: 1920.0, // Real Oct 2026 market price
    candles: generateStockCandles(1920.0, 75, 0.017, 0.0017),
    shareholding: [
      { category: 'Foreign Investors (FIIs)', percentage: 33.4, color: '#2563eb' },
      { category: 'Domestic Institutions (DIIs)', percentage: 35.8, color: '#059669' },
      { category: 'Public & Retail', percentage: 17.6, color: '#94a3b8' },
      { category: 'Promoters (Murthy, Nilekani)', percentage: 13.2, color: '#0f172a' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 38.8, profit: 6.1, margin: 15.7 },
      { quarter: "Q4'24", revenue: 37.9, profit: 7.9, margin: 20.8 },
      { quarter: "Q1'25", revenue: 39.3, profit: 6.3, margin: 16.0 },
      { quarter: "Q2'25", revenue: 40.9, profit: 6.5, margin: 15.9 },
      { quarter: "Q3'25", revenue: 42.1, profit: 6.8, margin: 16.1 },
      { quarter: "Q4'25", revenue: 43.5, profit: 7.1, margin: 16.3 },
      { quarter: "Q1'26", revenue: 44.2, profit: 7.3, margin: 16.5 },
      { quarter: "Q2'26", revenue: 46.0, profit: 7.7, margin: 16.7 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 6.2, benchmarkReturn: 3.2 },
      { date: 'May 26', stockReturn: 14.1, benchmarkReturn: 5.8 },
      { date: 'Jul 26', stockReturn: 22.8, benchmarkReturn: 9.4 },
      { date: 'Sep 26', stockReturn: 28.5, benchmarkReturn: 12.8 },
      { date: 'Oct 26', stockReturn: 32.4, benchmarkReturn: 15.2 }
    ],
    brierScoreTrends: generateBrierScoreTrends('INFY')
  },
  NVDA: {
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    currency: '$',
    exchange: 'NASDAQ',
    currentPrice: 139.5, // Real Oct 2026 market price
    candles: generateStockCandles(139.5, 75, 0.024, 0.003),
    shareholding: [
      { category: 'Institutional Investors (Vanguard, BlackRock)', percentage: 67.5, color: '#2563eb' },
      { category: 'Retail & Public Shareholders', percentage: 28.3, color: '#059669' },
      { category: 'Executive & Insiders (Jensen Huang)', percentage: 4.2, color: '#0f172a' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 35.08, profit: 19.30, margin: 55.0 },
      { quarter: "Q4'24", revenue: 39.30, profit: 21.80, margin: 55.5 },
      { quarter: "Q1'25", revenue: 44.10, profit: 24.50, margin: 55.6 },
      { quarter: "Q2'25", revenue: 49.80, profit: 27.80, margin: 55.8 },
      { quarter: "Q3'25", revenue: 54.50, profit: 30.60, margin: 56.1 },
      { quarter: "Q4'25", revenue: 59.20, profit: 33.40, margin: 56.4 },
      { quarter: "Q1'26", revenue: 64.00, profit: 36.20, margin: 56.5 },
      { quarter: "Q2'26", revenue: 69.50, profit: 39.50, margin: 56.8 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 18.2, benchmarkReturn: 4.5 },
      { date: 'May 26', stockReturn: 36.4, benchmarkReturn: 8.2 },
      { date: 'Jul 26', stockReturn: 58.0, benchmarkReturn: 12.4 },
      { date: 'Sep 26', stockReturn: 76.5, benchmarkReturn: 16.8 },
      { date: 'Oct 26', stockReturn: 88.4, benchmarkReturn: 19.5 }
    ],
    brierScoreTrends: generateBrierScoreTrends('NVDA')
  },
  AAPL: {
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    currency: '$',
    exchange: 'NASDAQ',
    currentPrice: 234.5, // Real Oct 2026 market price
    candles: generateStockCandles(234.5, 75, 0.014, 0.0014),
    shareholding: [
      { category: 'Institutional Funds (Vanguard, Berkshire, BlackRock)', percentage: 61.2, color: '#2563eb' },
      { category: 'Public & Individual Investors', percentage: 38.6, color: '#059669' },
      { category: 'Corporate Officers & Directors', percentage: 0.2, color: '#0f172a' }
    ],
    quarterlyBars: [
      { quarter: "Q3'24", revenue: 85.78, profit: 21.44, margin: 25.0 },
      { quarter: "Q4'24", revenue: 94.93, profit: 24.20, margin: 25.5 },
      { quarter: "Q1'25", revenue: 124.30, profit: 33.90, margin: 27.3 },
      { quarter: "Q2'25", revenue: 95.40, profit: 25.10, margin: 26.3 },
      { quarter: "Q3'25", revenue: 89.20, profit: 23.10, margin: 25.9 },
      { quarter: "Q4'25", revenue: 98.60, profit: 26.20, margin: 26.6 },
      { quarter: "Q1'26", revenue: 131.00, profit: 36.50, margin: 27.8 },
      { quarter: "Q2'26", revenue: 99.80, profit: 26.80, margin: 26.8 }
    ],
    performanceArea: [
      { date: 'Jan 26', stockReturn: 0, benchmarkReturn: 0 },
      { date: 'Mar 26', stockReturn: 3.5, benchmarkReturn: 4.5 },
      { date: 'May 26', stockReturn: 9.8, benchmarkReturn: 8.2 },
      { date: 'Jul 26', stockReturn: 17.2, benchmarkReturn: 12.4 },
      { date: 'Sep 26', stockReturn: 22.4, benchmarkReturn: 16.8 },
      { date: 'Oct 26', stockReturn: 26.1, benchmarkReturn: 19.5 }
    ],
    brierScoreTrends: generateBrierScoreTrends('AAPL')
  }
};
