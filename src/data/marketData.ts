import { PredictionContract, HistoricalDataRow } from '../types/mispricing';

// Global & Indian Market Prediction Contracts (NYSE, NASDAQ, NSE, BSE)
export const ACTIVE_CONTRACTS: PredictionContract[] = [
  // --- US MARKETS (NYSE & NASDAQ) ---
  {
    id: 'contract-nvda-q3',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    exchange: 'NASDAQ',
    currency: '$',
    contractTitle: 'Will NVIDIA Q3 Fiscal Revenue Exceed $35.0B?',
    category: 'Semiconductors',
    marketPrice: 61,
    payout: 100,
    targetRevenueThreshold: '$35.00 Billion',
    quarter: 'Q3 FY25',
    resolutionDate: 'Nov 20, 2024',
    volume24h: '$1,482,900',
    openInterest: '$4,120,000',
    priceHistory: [
      { date: 'Day -14', price: 54 },
      { date: 'Day -10', price: 56 },
      { date: 'Day -7', price: 58 },
      { date: 'Day -4', price: 59 },
      { date: 'Day -2', price: 60 },
      { date: 'Current', price: 61 }
    ],
    pastRevenues: [
      { quarter: "Q3'23", revenue: 18.12, consensusEstimate: 16.18, beat: true },
      { quarter: "Q4'23", revenue: 22.10, consensusEstimate: 20.62, beat: true },
      { quarter: "Q1'24", revenue: 26.04, consensusEstimate: 24.65, beat: true },
      { quarter: "Q2'24", revenue: 30.04, consensusEstimate: 28.70, beat: true },
      { quarter: "Q3'24", revenue: 35.08, consensusEstimate: 33.15, beat: true },
      { quarter: "Q4'24", revenue: 39.30, consensusEstimate: 37.80, beat: true },
      { quarter: "Q1'25", revenue: 44.10, consensusEstimate: 42.90, beat: true },
      { quarter: "Q2'25", revenue: 49.80, consensusEstimate: 47.60, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 15.3,
      consensusRevision: 4.8,
      twelveQBeatRate: 0.92,
      grossMarginTrendBps: 180,
      supplierIndex: 1.85
    }
  },
  {
    id: 'contract-aapl-q4',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    exchange: 'NASDAQ',
    currency: '$',
    contractTitle: 'Will Apple Q4 Revenue Exceed $95.5B?',
    category: 'Tech Titans',
    marketPrice: 48,
    payout: 100,
    targetRevenueThreshold: '$95.50 Billion',
    quarter: 'Q4 FY24',
    resolutionDate: 'Oct 31, 2024',
    volume24h: '$890,200',
    openInterest: '$2,310,000',
    priceHistory: [
      { date: 'Day -14', price: 44 },
      { date: 'Day -10', price: 46 },
      { date: 'Day -7', price: 47 },
      { date: 'Day -4', price: 49 },
      { date: 'Day -2', price: 48 },
      { date: 'Current', price: 48 }
    ],
    pastRevenues: [
      { quarter: "Q4'22", revenue: 90.15, consensusEstimate: 89.28, beat: true },
      { quarter: "Q1'23", revenue: 117.15, consensusEstimate: 121.10, beat: false },
      { quarter: "Q2'23", revenue: 94.84, consensusEstimate: 92.96, beat: true },
      { quarter: "Q3'23", revenue: 81.80, consensusEstimate: 81.69, beat: true },
      { quarter: "Q4'23", revenue: 89.50, consensusEstimate: 89.28, beat: true },
      { quarter: "Q1'24", revenue: 119.58, consensusEstimate: 117.91, beat: true },
      { quarter: "Q2'24", revenue: 90.75, consensusEstimate: 90.01, beat: true },
      { quarter: "Q3'24", revenue: 85.78, consensusEstimate: 84.53, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 5.8,
      consensusRevision: 0.6,
      twelveQBeatRate: 0.83,
      grossMarginTrendBps: 40,
      supplierIndex: 0.42
    }
  },
  {
    id: 'contract-msft-cloud',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    exchange: 'NASDAQ',
    currency: '$',
    contractTitle: 'Will Microsoft Intelligent Cloud Revenue Beat $29.0B in Q1?',
    category: 'Cloud & Software',
    marketPrice: 52,
    payout: 100,
    targetRevenueThreshold: '$29.00 Billion',
    quarter: 'Q1 FY25',
    resolutionDate: 'Oct 30, 2024',
    volume24h: '$1,120,400',
    openInterest: '$3,400,000',
    priceHistory: [
      { date: 'Day -14', price: 49 },
      { date: 'Day -10', price: 50 },
      { date: 'Day -7', price: 51 },
      { date: 'Day -4', price: 53 },
      { date: 'Day -2', price: 52 },
      { date: 'Current', price: 52 }
    ],
    pastRevenues: [
      { quarter: "Q1'23", revenue: 20.32, consensusEstimate: 20.30, beat: true },
      { quarter: "Q2'23", revenue: 21.51, consensusEstimate: 21.44, beat: true },
      { quarter: "Q3'23", revenue: 22.08, consensusEstimate: 21.94, beat: true },
      { quarter: "Q4'23", revenue: 23.99, consensusEstimate: 23.80, beat: true },
      { quarter: "Q1'24", revenue: 24.26, consensusEstimate: 23.49, beat: true },
      { quarter: "Q2'24", revenue: 25.88, consensusEstimate: 25.29, beat: true },
      { quarter: "Q3'24", revenue: 26.71, consensusEstimate: 26.25, beat: true },
      { quarter: "Q4'24", revenue: 28.52, consensusEstimate: 28.72, beat: false }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 11.2,
      consensusRevision: 3.5,
      twelveQBeatRate: 0.91,
      grossMarginTrendBps: 90,
      supplierIndex: 1.45
    }
  },

  // --- INDIAN MARKETS (NSE & BSE) ---
  {
    id: 'contract-reliance-q2',
    ticker: 'RELIANCE',
    companyName: 'Reliance Industries Limited',
    exchange: 'NSE',
    currency: '₹',
    contractTitle: 'Will Reliance Q2 Consolidated Revenue Exceed ₹2.55 Lakh Cr?',
    category: 'Indian Equities (NSE/BSE)',
    marketPrice: 58,
    payout: 100,
    targetRevenueThreshold: '₹2,55,000 Crore',
    quarter: 'Q2 FY25',
    resolutionDate: 'Oct 14, 2024',
    volume24h: '₹4,85,00,000',
    openInterest: '₹14,20,00,000',
    priceHistory: [
      { date: 'Day -14', price: 51 },
      { date: 'Day -10', price: 53 },
      { date: 'Day -7', price: 55 },
      { date: 'Day -4', price: 57 },
      { date: 'Day -2', price: 58 },
      { date: 'Current', price: 58 }
    ],
    pastRevenues: [
      { quarter: "Q2'23", revenue: 231.8, consensusEstimate: 228.5, beat: true },
      { quarter: "Q3'23", revenue: 220.5, consensusEstimate: 224.0, beat: false },
      { quarter: "Q4'23", revenue: 216.3, consensusEstimate: 219.0, beat: false },
      { quarter: "Q1'24", revenue: 210.8, consensusEstimate: 214.2, beat: false },
      { quarter: "Q2'24", revenue: 234.9, consensusEstimate: 230.1, beat: true },
      { quarter: "Q3'24", revenue: 227.9, consensusEstimate: 225.4, beat: true },
      { quarter: "Q4'24", revenue: 240.7, consensusEstimate: 238.2, beat: true },
      { quarter: "Q1'25", revenue: 236.2, consensusEstimate: 232.0, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 13.5, // Jio telecom tariff hike + retail expansion
      consensusRevision: 4.2,
      twelveQBeatRate: 0.75,
      grossMarginTrendBps: 140,
      supplierIndex: 1.50
    }
  },
  {
    id: 'contract-tcs-q2',
    ticker: 'TCS',
    companyName: 'Tata Consultancy Services',
    exchange: 'BSE',
    currency: '₹',
    contractTitle: 'Will TCS Q2 Revenue Cross ₹65,000 Crore with > 3.0% CC Growth?',
    category: 'Indian Equities (NSE/BSE)',
    marketPrice: 47,
    payout: 100,
    targetRevenueThreshold: '₹65,000 Crore ($7.8B)',
    quarter: 'Q2 FY25',
    resolutionDate: 'Oct 10, 2024',
    volume24h: '₹3,20,00,000',
    openInterest: '₹9,80,00,000',
    priceHistory: [
      { date: 'Day -14', price: 42 },
      { date: 'Day -10', price: 44 },
      { date: 'Day -7', price: 45 },
      { date: 'Day -4', price: 46 },
      { date: 'Day -2', price: 47 },
      { date: 'Current', price: 47 }
    ],
    pastRevenues: [
      { quarter: "Q2'23", revenue: 55.3, consensusEstimate: 54.8, beat: true },
      { quarter: "Q3'23", revenue: 58.2, consensusEstimate: 57.5, beat: true },
      { quarter: "Q4'23", revenue: 59.1, consensusEstimate: 59.4, beat: false },
      { quarter: "Q1'24", revenue: 59.3, consensusEstimate: 59.8, beat: false },
      { quarter: "Q2'24", revenue: 59.6, consensusEstimate: 60.1, beat: false },
      { quarter: "Q3'24", revenue: 60.5, consensusEstimate: 60.2, beat: true },
      { quarter: "Q4'24", revenue: 61.2, consensusEstimate: 61.0, beat: true },
      { quarter: "Q1'25", revenue: 62.6, consensusEstimate: 62.1, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 11.8, // Record $8.6B deal TCV win
      consensusRevision: 3.4,
      twelveQBeatRate: 0.83,
      grossMarginTrendBps: 80,
      supplierIndex: 1.35
    }
  },
  {
    id: 'contract-hdfc-nii',
    ticker: 'HDFCBANK',
    companyName: 'HDFC Bank Limited',
    exchange: 'NSE',
    currency: '₹',
    contractTitle: 'Will HDFC Bank Net Revenue Cross ₹42,500 Cr in Q2?',
    category: 'Banking & Financials',
    marketPrice: 62,
    payout: 100,
    targetRevenueThreshold: '₹42,500 Crore',
    quarter: 'Q2 FY25',
    resolutionDate: 'Oct 19, 2024',
    volume24h: '₹5,60,00,000',
    openInterest: '₹18,50,00,000',
    priceHistory: [
      { date: 'Day -14', price: 58 },
      { date: 'Day -10', price: 59 },
      { date: 'Day -7', price: 60 },
      { date: 'Day -4', price: 61 },
      { date: 'Day -2', price: 62 },
      { date: 'Current', price: 62 }
    ],
    pastRevenues: [
      { quarter: "Q2'23", revenue: 28.3, consensusEstimate: 27.9, beat: true },
      { quarter: "Q3'23", revenue: 31.4, consensusEstimate: 30.8, beat: true },
      { quarter: "Q4'23", revenue: 32.5, consensusEstimate: 32.1, beat: true },
      { quarter: "Q1'24", revenue: 35.1, consensusEstimate: 34.6, beat: true },
      { quarter: "Q2'24", revenue: 38.0, consensusEstimate: 37.4, beat: true },
      { quarter: "Q3'24", revenue: 39.6, consensusEstimate: 39.8, beat: false },
      { quarter: "Q4'24", revenue: 40.8, consensusEstimate: 40.5, beat: true },
      { quarter: "Q1'25", revenue: 41.5, consensusEstimate: 41.2, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 12.4, // Deposit mobilization and net interest margin stabilization
      consensusRevision: 3.8,
      twelveQBeatRate: 0.90,
      grossMarginTrendBps: 110,
      supplierIndex: 1.40
    }
  },
  {
    id: 'contract-infy-q2',
    ticker: 'INFY',
    companyName: 'Infosys Limited',
    exchange: 'NSE',
    currency: '₹',
    contractTitle: 'Will Infosys Q2 Revenue Exceed ₹40,800 Cr ($4.9B)?',
    category: 'Indian Equities (NSE/BSE)',
    marketPrice: 53,
    payout: 100,
    targetRevenueThreshold: '₹40,800 Crore',
    quarter: 'Q2 FY25',
    resolutionDate: 'Oct 17, 2024',
    volume24h: '₹2,90,00,000',
    openInterest: '₹8,40,00,000',
    priceHistory: [
      { date: 'Day -14', price: 48 },
      { date: 'Day -10', price: 50 },
      { date: 'Day -7', price: 51 },
      { date: 'Day -4', price: 52 },
      { date: 'Day -2', price: 53 },
      { date: 'Current', price: 53 }
    ],
    pastRevenues: [
      { quarter: "Q2'23", revenue: 36.5, consensusEstimate: 36.1, beat: true },
      { quarter: "Q3'23", revenue: 38.3, consensusEstimate: 38.0, beat: true },
      { quarter: "Q4'23", revenue: 37.4, consensusEstimate: 37.9, beat: false },
      { quarter: "Q1'24", revenue: 37.9, consensusEstimate: 38.2, beat: false },
      { quarter: "Q2'24", revenue: 38.9, consensusEstimate: 39.1, beat: false },
      { quarter: "Q3'24", revenue: 38.8, consensusEstimate: 38.6, beat: true },
      { quarter: "Q4'24", revenue: 37.9, consensusEstimate: 38.1, beat: false },
      { quarter: "Q1'25", revenue: 39.3, consensusEstimate: 38.9, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 12.9,
      consensusRevision: 3.9,
      twelveQBeatRate: 0.70,
      grossMarginTrendBps: 90,
      supplierIndex: 1.30
    }
  },

  // --- GLOBAL US TECH & HARDWARE ---
  {
    id: 'contract-googl-cloud',
    ticker: 'GOOGL',
    companyName: 'Alphabet Inc.',
    exchange: 'NASDAQ',
    currency: '$',
    contractTitle: 'Will Google Cloud Quarterly Revenue Cross $11.0B in Q3?',
    category: 'Cloud & Software',
    marketPrice: 43,
    payout: 100,
    targetRevenueThreshold: '$11.00 Billion',
    quarter: 'Q3 2024',
    resolutionDate: 'Oct 29, 2024',
    volume24h: '$745,000',
    openInterest: '$1,980,000',
    priceHistory: [
      { date: 'Day -14', price: 39 },
      { date: 'Day -10', price: 41 },
      { date: 'Day -7', price: 42 },
      { date: 'Day -4', price: 44 },
      { date: 'Day -2', price: 43 },
      { date: 'Current', price: 43 }
    ],
    pastRevenues: [
      { quarter: "Q3'22", revenue: 6.87, consensusEstimate: 6.69, beat: true },
      { quarter: "Q4'22", revenue: 7.32, consensusEstimate: 7.43, beat: false },
      { quarter: "Q1'23", revenue: 7.45, consensusEstimate: 7.49, beat: false },
      { quarter: "Q2'23", revenue: 8.03, consensusEstimate: 7.87, beat: true },
      { quarter: "Q3'23", revenue: 8.41, consensusEstimate: 8.64, beat: false },
      { quarter: "Q4'23", revenue: 9.19, consensusEstimate: 8.94, beat: true },
      { quarter: "Q1'24", revenue: 9.57, consensusEstimate: 9.35, beat: true },
      { quarter: "Q2'24", revenue: 10.35, consensusEstimate: 10.20, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 13.8,
      consensusRevision: 4.1,
      twelveQBeatRate: 0.75,
      grossMarginTrendBps: 210,
      supplierIndex: 1.62
    }
  },
  {
    id: 'contract-tsm-rev',
    ticker: 'TSM',
    companyName: 'Taiwan Semiconductor Manufacturing Co.',
    exchange: 'NYSE',
    currency: '$',
    contractTitle: 'Will TSMC Q3 Revenue Cross $23.5B (NT$ 750B)?',
    category: 'Semiconductors',
    marketPrice: 50,
    payout: 100,
    targetRevenueThreshold: '$23.50 Billion',
    quarter: 'Q3 2024',
    resolutionDate: 'Oct 17, 2024',
    volume24h: '$670,000',
    openInterest: '$2,100,000',
    priceHistory: [
      { date: 'Day -14', price: 46 },
      { date: 'Day -10', price: 48 },
      { date: 'Day -7', price: 49 },
      { date: 'Day -4', price: 51 },
      { date: 'Day -2', price: 50 },
      { date: 'Current', price: 50 }
    ],
    pastRevenues: [
      { quarter: "Q3'22", revenue: 20.23, consensusEstimate: 20.08, beat: true },
      { quarter: "Q4'22", revenue: 19.93, consensusEstimate: 20.56, beat: false },
      { quarter: "Q1'23", revenue: 16.72, consensusEstimate: 16.70, beat: true },
      { quarter: "Q2'23", revenue: 15.68, consensusEstimate: 15.44, beat: true },
      { quarter: "Q3'23", revenue: 17.28, consensusEstimate: 17.05, beat: true },
      { quarter: "Q4'23", revenue: 19.62, consensusEstimate: 19.45, beat: true },
      { quarter: "Q1'24", revenue: 18.87, consensusEstimate: 18.40, beat: true },
      { quarter: "Q2'24", revenue: 20.82, consensusEstimate: 20.25, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 14.1,
      consensusRevision: 3.9,
      twelveQBeatRate: 0.88,
      grossMarginTrendBps: 220,
      supplierIndex: 1.70
    }
  },
  {
    id: 'contract-tatamotors-q2',
    ticker: 'TATAMOTORS',
    companyName: 'Tata Motors Limited',
    exchange: 'BSE',
    currency: '₹',
    contractTitle: 'Will Tata Motors Q2 Revenue Beat ₹1,05,000 Cr ($12.6B)?',
    category: 'Indian Equities (NSE/BSE)',
    marketPrice: 51,
    payout: 100,
    targetRevenueThreshold: '₹1,05,000 Crore',
    quarter: 'Q2 FY25',
    resolutionDate: 'Nov 08, 2024',
    volume24h: '₹3,75,00,000',
    openInterest: '₹11,50,00,000',
    priceHistory: [
      { date: 'Day -14', price: 46 },
      { date: 'Day -10', price: 48 },
      { date: 'Day -7', price: 49 },
      { date: 'Day -4', price: 50 },
      { date: 'Day -2', price: 51 },
      { date: 'Current', price: 51 }
    ],
    pastRevenues: [
      { quarter: "Q2'23", revenue: 79.6, consensusEstimate: 78.5, beat: true },
      { quarter: "Q3'23", revenue: 88.5, consensusEstimate: 87.2, beat: true },
      { quarter: "Q4'23", revenue: 105.9, consensusEstimate: 104.0, beat: true },
      { quarter: "Q1'24", revenue: 102.2, consensusEstimate: 100.8, beat: true },
      { quarter: "Q2'24", revenue: 105.1, consensusEstimate: 103.5, beat: true },
      { quarter: "Q3'24", revenue: 110.6, consensusEstimate: 109.0, beat: true },
      { quarter: "Q4'24", revenue: 119.9, consensusEstimate: 118.0, beat: true },
      { quarter: "Q1'25", revenue: 108.0, consensusEstimate: 106.5, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 13.0,
      consensusRevision: 3.7,
      twelveQBeatRate: 0.88,
      grossMarginTrendBps: 150,
      supplierIndex: 1.45
    }
  },
  {
    id: 'contract-pltr-comm',
    ticker: 'PLTR',
    companyName: 'Palantir Technologies',
    exchange: 'NYSE',
    currency: '$',
    contractTitle: 'Will US Commercial Revenue Grow > 50% YoY in Q3?',
    category: 'Cloud & Software',
    marketPrice: 54,
    payout: 100,
    targetRevenueThreshold: '50.0% YoY ($180M+)',
    quarter: 'Q3 2024',
    resolutionDate: 'Nov 04, 2024',
    volume24h: '$1,290,000',
    openInterest: '$3,250,000',
    priceHistory: [
      { date: 'Day -14', price: 48 },
      { date: 'Day -10', price: 50 },
      { date: 'Day -7', price: 52 },
      { date: 'Day -4', price: 55 },
      { date: 'Day -2', price: 54 },
      { date: 'Current', price: 54 }
    ],
    pastRevenues: [
      { quarter: "Q3'22", revenue: 0.478, consensusEstimate: 0.475, beat: true },
      { quarter: "Q4'22", revenue: 0.509, consensusEstimate: 0.505, beat: true },
      { quarter: "Q1'23", revenue: 0.525, consensusEstimate: 0.506, beat: true },
      { quarter: "Q2'23", revenue: 0.533, consensusEstimate: 0.533, beat: true },
      { quarter: "Q3'23", revenue: 0.558, consensusEstimate: 0.556, beat: true },
      { quarter: "Q4'23", revenue: 0.608, consensusEstimate: 0.603, beat: true },
      { quarter: "Q1'24", revenue: 0.634, consensusEstimate: 0.615, beat: true },
      { quarter: "Q2'24", revenue: 0.678, consensusEstimate: 0.653, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 12.8,
      consensusRevision: 3.6,
      twelveQBeatRate: 0.88,
      grossMarginTrendBps: 130,
      supplierIndex: 1.25
    }
  },
  {
    id: 'contract-macro-cpi',
    ticker: 'US-CPI',
    companyName: 'Bureau of Labor Statistics',
    exchange: 'MACRO',
    currency: '$',
    contractTitle: 'Will US Headline CPI YoY Print Below 2.4%?',
    category: 'Macro & Rates',
    marketPrice: 34,
    payout: 100,
    targetRevenueThreshold: '< 2.4% YoY',
    quarter: 'Oct 2024',
    resolutionDate: 'Nov 13, 2024',
    volume24h: '$2,450,000',
    openInterest: '$6,200,000',
    priceHistory: [
      { date: 'Day -14', price: 38 },
      { date: 'Day -10', price: 36 },
      { date: 'Day -7', price: 35 },
      { date: 'Day -4', price: 33 },
      { date: 'Day -2', price: 34 },
      { date: 'Current', price: 34 }
    ],
    pastRevenues: [
      { quarter: 'Mar 24', revenue: 3.5, consensusEstimate: 3.4, beat: false },
      { quarter: 'Apr 24', revenue: 3.4, consensusEstimate: 3.4, beat: true },
      { quarter: 'May 24', revenue: 3.3, consensusEstimate: 3.4, beat: true },
      { quarter: 'Jun 24', revenue: 3.0, consensusEstimate: 3.1, beat: true },
      { quarter: 'Jul 24', revenue: 2.9, consensusEstimate: 3.0, beat: true },
      { quarter: 'Aug 24', revenue: 2.5, consensusEstimate: 2.6, beat: true },
      { quarter: 'Sep 24', revenue: 2.4, consensusEstimate: 2.3, beat: false },
      { quarter: 'Oct 24', revenue: 2.6, consensusEstimate: 2.6, beat: true }
    ],
    financialFeatures: {
      qoqRevenueMomentum: 8.5,
      consensusRevision: 2.1,
      twelveQBeatRate: 0.60,
      grossMarginTrendBps: 70,
      supplierIndex: 0.90
    }
  }
];

// Helper to generate chronological historical dataset across 450 events
export function generateCuratedHistoricalDataset(n = 450, scenario: 'edge' | 'no_edge' = 'edge', seed = 42): { rows: HistoricalDataRow[]; featureNames: string[] } {
  const featureNames = [
    'QoQ Revenue Momentum',
    'Analyst Revision Spread',
    '12Q Historical Beat Rate',
    'Gross Margin Trend',
    'Supply Chain Lead Index'
  ];

  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const randn = () => {
    const u = 1 - rand();
    const v = rand();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };
  const sigmoid = (z: number) => 1.0 / (1.0 + Math.exp(-Math.max(-50, Math.min(50, z))));

  const tickers = ['NVDA', 'RELIANCE', 'TCS', 'MSFT', 'HDFCBANK', 'AAPL', 'INFY', 'TATAMOTORS', 'GOOGL', 'TSM', 'AMZN', 'META', 'PLTR'];
  const rows: HistoricalDataRow[] = [];

  for (let t = 0; t < n; t++) {
    const x1 = randn();
    const x2 = randn();
    const x3 = randn();
    const x4 = randn();
    const x5 = randn();

    const trueLogit = 0.85 * x1 + 0.65 * x2 + 0.50 * x3 + 0.35 * x4 + 0.25 * x5 - 0.15;
    const pTrue = sigmoid(trueLogit);

    let marketLogit = trueLogit;
    if (scenario === 'edge') {
      marketLogit = 0.85 * x1 + 0.18 * x2 + 0.45 * x3 + 0.30 * x4 + 0.05 * x5 - 0.15 + randn() * 0.22;
    }

    let price = Math.round(sigmoid(marketLogit) * 100);
    price = Math.min(Math.max(price, 1), 99);
    const outcome = rand() < pTrue ? 1 : 0;

    const ticker = tickers[t % tickers.length];
    const year = 2021 + Math.floor(t / 90);
    const quarterNum = (Math.floor(t / 22) % 4) + 1;

    rows.push({
      timestamp: `202${1 + Math.floor(t / 90)}-Q${quarterNum}-E${t + 1}`,
      price,
      outcome,
      features: [
        parseFloat(x1.toFixed(3)),
        parseFloat(x2.toFixed(3)),
        parseFloat(x3.toFixed(3)),
        parseFloat(x4.toFixed(3)),
        parseFloat(x5.toFixed(3))
      ],
      meta: {
        ticker,
        quarter: `Q${quarterNum} ${year}`,
        threshold: 10 + (t % 80)
      }
    });
  }

  return { rows, featureNames };
}
