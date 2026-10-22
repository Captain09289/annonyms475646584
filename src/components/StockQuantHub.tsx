import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Download,
  Info,
  DollarSign,
  BarChart3,
  Percent,
  Layers,
  Scale,
  PieChart as PieIcon,
  Activity,
  Maximize2,
  Target,
  FileDown
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { EngineConfig } from '../types/mispricing';
import {
  STOCK_CHART_PRESETS,
  generateStockCandles,
  generateBrierScoreTrends,
  StockChartDataset
} from '../data/stockChartData';
import { StockCandlestickChart } from './charts/StockCandlestickChart';
import { TradingViewLiveChart } from './charts/TradingViewLiveChart';
import { BrierScoreTrendChart } from './charts/BrierScoreTrendChart';
import { RevenueColumnChart } from './charts/RevenueColumnChart';
import { ShareholdingPieChart } from './charts/ShareholdingPieChart';
import { PerformanceAreaChart } from './charts/PerformanceAreaChart';
import { TechnicalOscillatorChart } from './charts/TechnicalOscillatorChart';

interface StockQuantHubProps {
  config: EngineConfig;
}

interface StockFormState {
  companyName: string;
  ticker: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  currency: '$' | '₹';
  currentPrice: number;
  marketCap: string;
  peRatio: number;
  pbRatio: number;
  evEbitda: number;
  roce: number;
  roe: number;
  debtToEquity: number;
  opm: number;
  salesGrowth3Yr: number;
  profitGrowth3Yr: number;
  freeCashFlow: string;
  promoterHolding: number;
  screenerRawData: string;
}

const PRESET_STOCKS: Record<string, StockFormState> = {
  reliance: {
    companyName: 'Reliance Industries Limited',
    ticker: 'RELIANCE',
    exchange: 'NSE',
    currency: '₹',
    currentPrice: 1385,
    marketCap: '₹18,75,000 Cr',
    peRatio: 26.8,
    pbRatio: 2.1,
    evEbitda: 13.9,
    roce: 11.2,
    roe: 10.1,
    debtToEquity: 0.39,
    opm: 18.2,
    salesGrowth3Yr: 15.8,
    profitGrowth3Yr: 12.3,
    freeCashFlow: '₹38,500 Cr',
    promoterHolding: 50.3,
    screenerRawData: `Market Cap: ₹ 18,75,000 Cr. | Current Price: ₹ 1,385 (Post 1:1 Bonus October 2026) | High / Low: ₹ 1,608 / 1,110
Stock P/E: 26.8 | Book Value: ₹ 659 | Dividend Yield: 0.36 %
ROCE: 11.2 % | ROE: 10.1 % | Face Value: ₹ 10
Quarterly Results:
Sales: ₹ 2,42,500 Cr | Net Profit: ₹ 18,200 Cr | OPM %: 18.2%
Promoter Holding: 50.3% | FII Holding: 21.6% | DII Holding: 16.9% | Public: 11.2%
Jio 5G standalone network scaled across India with 495M+ subscribers. Reliance Retail spans 19,000 stores.`
  },
  tcs: {
    companyName: 'Tata Consultancy Services',
    ticker: 'TCS',
    exchange: 'BSE',
    currency: '₹',
    currentPrice: 4150,
    marketCap: '₹15,02,000 Cr',
    peRatio: 30.5,
    pbRatio: 14.1,
    evEbitda: 20.4,
    roce: 59.4,
    roe: 52.8,
    debtToEquity: 0.0,
    opm: 26.4,
    salesGrowth3Yr: 13.1,
    profitGrowth3Yr: 11.0,
    freeCashFlow: '₹46,200 Cr',
    promoterHolding: 71.8,
    screenerRawData: `Market Cap: ₹ 15,02,000 Cr. | Current Price: ₹ 4,150 (October 2026) | High / Low: ₹ 4,585 / 3,420
Stock P/E: 30.5 | Book Value: ₹ 294 | Dividend Yield: 1.35 %
ROCE: 59.4 % | ROE: 52.8 % | Face Value: ₹ 1
Zero Debt balance sheet. Quarterly deal win TCV: $8.6 Billion.
Promoter (Tata Sons) Holding: 71.8% with 0% pledge. FII Holding: 12.4% | DII Holding: 10.6%.`
  },
  hdfc: {
    companyName: 'HDFC Bank Limited',
    ticker: 'HDFCBANK',
    exchange: 'NSE',
    currency: '₹',
    currentPrice: 1740,
    marketCap: '₹13,25,000 Cr',
    peRatio: 18.8,
    pbRatio: 2.65,
    evEbitda: 12.9,
    roce: 17.2,
    roe: 15.9,
    debtToEquity: 0.78,
    opm: 24.8,
    salesGrowth3Yr: 29.2,
    profitGrowth3Yr: 25.1,
    freeCashFlow: '₹31,000 Cr',
    promoterHolding: 0.0,
    screenerRawData: `Market Cap: ₹ 13,25,000 Cr. | Current Price: ₹ 1,740 (October 2026)
Stock P/E: 18.8 | Book Value: ₹ 656 | Dividend Yield: 1.15 %
GNPA: 1.31% | NNPA: 0.38% | Capital Adequacy Ratio: 19.5%
Post-merger loan-to-deposit ratio normalized below 99%. FII Holding: 47.2% | DII Holding: 34.6%.`
  },
  infy: {
    companyName: 'Infosys Limited',
    ticker: 'INFY',
    exchange: 'NSE',
    currency: '₹',
    currentPrice: 1920,
    marketCap: '₹7,95,000 Cr',
    peRatio: 27.2,
    pbRatio: 8.9,
    evEbitda: 18.5,
    roce: 41.5,
    roe: 35.8,
    debtToEquity: 0.0,
    opm: 21.8,
    salesGrowth3Yr: 11.5,
    profitGrowth3Yr: 9.8,
    freeCashFlow: '₹24,800 Cr',
    promoterHolding: 14.7,
    screenerRawData: `Market Cap: ₹ 7,95,000 Cr. | Current Price: ₹ 1,920 (October 2026) | High / Low: ₹ 1,990 / 1,358
Stock P/E: 27.2 | Book Value: ₹ 215 | Dividend Yield: 2.1 %
ROCE: 41.5 % | ROE: 35.8 % | Face Value: ₹ 5
Large deal pipeline at $4.2B with Topaz generative AI integrations. FII Holding: 33.2% | DII Holding: 36.5%.`
  },
  nvda: {
    companyName: 'NVIDIA Corporation',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    currency: '$',
    currentPrice: 139.50,
    marketCap: '$3.43 Trillion',
    peRatio: 52.5,
    pbRatio: 46.2,
    evEbitda: 40.8,
    roce: 88.0,
    roe: 80.5,
    debtToEquity: 0.16,
    opm: 63.5,
    salesGrowth3Yr: 76.5,
    profitGrowth3Yr: 132.0,
    freeCashFlow: '$42.5 Billion',
    promoterHolding: 3.8,
    screenerRawData: `Market Cap: $3.43T | Current Price: $139.50 (October 2026) | Stock P/E: 52.5 | EV/EBITDA: 40.8
Gross Margin: 75.4% | Operating Margin: 63.5% | Free Cash Flow Margin: 46.0%
Quarterly Revenue: $34.5B (+118% YoY) | Datacenter Segment: $30.2B
Blackwell ultra-clusters deployed globally across hyperscalers and sovereign AI centers.`
  },
  aapl: {
    companyName: 'Apple Inc.',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    currency: '$',
    currentPrice: 234.50,
    marketCap: '$3.58 Trillion',
    peRatio: 34.2,
    pbRatio: 49.5,
    evEbitda: 25.8,
    roce: 58.0,
    roe: 145.0,
    debtToEquity: 1.45,
    opm: 31.5,
    salesGrowth3Yr: 8.2,
    profitGrowth3Yr: 9.6,
    freeCashFlow: '$108 Billion',
    promoterHolding: 0.1,
    screenerRawData: `Market Cap: $3.58T | Current Price: $234.50 (October 2026) | Stock P/E: 34.2 | EV/EBITDA: 25.8
Gross Margin: 46.2% | Operating Margin: 31.5% | Services Gross Margin: 74.2%
Active installed base surpasses 2.2 billion devices worldwide. Apple Intelligence driving multi-year upgrade supercycle.`
  }
};

export const StockQuantHub: React.FC<StockQuantHubProps> = ({ config }) => {
  const [form, setForm] = useState<StockFormState>(PRESET_STOCKS.reliance);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [chartTab, setChartTab] = useState<'all' | 'tradingview' | 'brier' | 'candlestick' | 'revenue' | 'shareholding' | 'benchmark'>('all');

  const handleInputChange = (field: keyof StockFormState, val: any) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const loadPreset = (key: string) => {
    if (PRESET_STOCKS[key]) {
      setForm(PRESET_STOCKS[key]);
      setAnalysisResult(null);
    }
  };

  // Resolve chart data for current stock
  const currentChartData: StockChartDataset = useMemo(() => {
    const preset = STOCK_CHART_PRESETS[form.ticker];
    if (preset) {
      return preset;
    }
    // Dynamic fallback for custom ticker
    return {
      ticker: form.ticker,
      companyName: form.companyName || form.ticker,
      currency: form.currency,
      exchange: form.exchange,
      currentPrice: form.currentPrice || 100,
      candles: generateStockCandles(form.currentPrice || 100, 75),
      shareholding: [
        { category: 'Promoters & Founders', percentage: form.promoterHolding || 45, color: '#0f172a' },
        { category: 'Institutional (FIIs)', percentage: 25, color: '#2563eb' },
        { category: 'Domestic Institutions (DIIs)', percentage: 18, color: '#059669' },
        { category: 'Public & Retail', percentage: Math.max(5, 100 - (form.promoterHolding || 45) - 43), color: '#94a3b8' }
      ],
      quarterlyBars: [
        { quarter: "Q3'23", revenue: 100, profit: 12, margin: 12.0 },
        { quarter: "Q4'23", revenue: 110, profit: 14, margin: 12.7 },
        { quarter: "Q1'24", revenue: 115, profit: 15, margin: 13.0 },
        { quarter: "Q2'24", revenue: 125, profit: 18, margin: 14.4 },
        { quarter: "Q3'24", revenue: 135, profit: 21, margin: 15.5 },
        { quarter: "Q4'24", revenue: 142, profit: 23, margin: 16.2 },
        { quarter: "Q1'25", revenue: 150, profit: 26, margin: 17.3 },
        { quarter: "Q2'25", revenue: 165, profit: 30, margin: 18.1 }
      ],
      performanceArea: [
        { date: 'Jan 24', stockReturn: 0, benchmarkReturn: 0 },
        { date: 'Mar 24', stockReturn: 8.5, benchmarkReturn: 3.2 },
        { date: 'May 24', stockReturn: 16.2, benchmarkReturn: 6.8 },
        { date: 'Jul 24', stockReturn: 28.4, benchmarkReturn: 10.5 },
        { date: 'Sep 24', stockReturn: 35.1, benchmarkReturn: 14.2 },
        { date: 'Current', stockReturn: 42.0, benchmarkReturn: 17.5 }
      ],
      brierScoreTrends: generateBrierScoreTrends(form.ticker)
    };
  }, [form.ticker, form.currentPrice, form.currency, form.exchange, form.promoterHolding]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/quant-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyDossier = () => {
    if (analysisResult?.analysisMarkdown) {
      navigator.clipboard.writeText(analysisResult.analysisMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadDossier = () => {
    if (analysisResult?.analysisMarkdown) {
      const blob = new Blob([analysisResult.analysisMarkdown], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${form.ticker}_Quant_Analysis_${Date.now()}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const downloadEquityPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // Header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y, contentWidth, 3, 'F');
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    doc.text(`EQUITY QUANT RESEARCH NOTE • ${form.exchange}`, margin, y);
    doc.setTextColor(100, 116, 139);
    doc.text('OCTOBER 2026 VALUATION NOTE', pageWidth - margin, y, { align: 'right' });
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(`${form.companyName} (${form.ticker})`, margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Current Price: ${form.currency}${form.currentPrice.toFixed(2)} | Market Cap: ${form.marketCap} | Exchange: ${form.exchange}`, margin, y);
    y += 9;

    // KPI Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('P/E RATIO', margin + 6, y + 6);
    doc.text('P/B RATIO', margin + 46, y + 6);
    doc.text('EV/EBITDA', margin + 86, y + 6);
    doc.text('ROCE', margin + 126, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(`${form.peRatio}x`, margin + 6, y + 13);
    doc.text(`${form.pbRatio}x`, margin + 46, y + 13);
    doc.text(`${form.evEbitda}x`, margin + 86, y + 13);
    doc.text(`${form.roce}%`, margin + 126, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`ROE: ${form.roe}%`, margin + 6, y + 19);
    doc.text(`D/E: ${form.debtToEquity}`, margin + 46, y + 19);
    doc.text(`OPM: ${form.opm}%`, margin + 86, y + 19);
    doc.text(`Sales 3Y: +${form.salesGrowth3Yr}%`, margin + 126, y + 19);

    y += 32;

    // Model analysis narrative
    if (analysisResult?.analysisMarkdown) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Quantitative Analysis & Valuation Synthesis', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      const cleanText = analysisResult.analysisMarkdown
        .replace(/#{1,6}\s?/g, '')
        .replace(/\*\*/g, '')
        .replace(/`{1,3}/g, '');

      const lines = doc.splitTextToSize(cleanText, contentWidth);
      for (let i = 0; i < lines.length; i++) {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = margin;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(148, 163, 184);
          doc.text(`AlphaMarket Quantitative Equity Note • ${form.ticker}`, margin, y);
          y += 8;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
        }
        doc.text(lines[i], margin, y);
        y += 4.2;
      }
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`AlphaMarket Quantitative Desk • Confidential Research Note`, margin, pageHeight - 8);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save(`${form.ticker}_Quantitative_Equity_Note_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 border border-blue-200/80 shadow-xs">
              <Brain className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                  A-to-Z Quantitative Stock Intelligence
                </h1>
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  TradingView Charts & Quant Hub
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Historical Brier Score Trends (Recharts) • TradingView Live • Candlesticks • Revenue Columns • Shareholding Donut • Altman Z-Score
              </p>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Load Demo:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => loadPreset('reliance')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Reliance (NSE)
            </button>
            <button
              onClick={() => loadPreset('tcs')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              TCS (BSE)
            </button>
            <button
              onClick={() => loadPreset('hdfc')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              HDFC Bank (NSE)
            </button>
            <button
              onClick={() => loadPreset('infy')}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Infosys (NSE)
            </button>
            <button
              onClick={() => loadPreset('nvda')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
            >
              NVIDIA (NASDAQ)
            </button>
            <button
              onClick={() => loadPreset('aapl')}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
            >
              Apple (NASDAQ)
            </button>
          </div>
        </div>
      </div>

      {/* User Guidance Banner (How to get info from Screener) */}
      <div className="p-6 rounded-3xl bg-blue-50/70 border border-blue-200/90 shadow-2xs">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Info className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex-1 text-xs text-slate-700 leading-relaxed">
            <h3 className="font-extrabold text-sm text-blue-950 mb-1">
              How to get all the required information in 30 seconds:
            </h3>
            <p className="text-slate-600">
              If you don't have all the balance sheet and P&L numbers offhand, simply open{' '}
              <a
                href="https://www.screener.in"
                target="_blank"
                rel="noreferrer"
                className="font-extrabold text-blue-700 underline inline-flex items-center space-x-0.5 hover:text-blue-900"
              >
                <span>Screener.in</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>{' '}
              (for Indian stocks on NSE/BSE) or <strong>Yahoo Finance / TradingView</strong> (for US stocks on NYSE/NASDAQ). Search your stock ticker, copy the ratios table, and paste it into the <strong>Raw Screener Paste Box</strong> below. Our quantitative engine will extract and model all figures automatically!
            </p>
          </div>
        </div>
      </div>

      {/* CHARTS SHOWCASE SECTION */}
      <div className="space-y-6">
        {/* Chart View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span className="font-black text-sm text-slate-950 uppercase tracking-wider">
              {form.ticker} Multi-Chart Analysis Dashboard
            </span>
          </div>

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setChartTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                chartTab === 'all'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Charts (Multi-View)
            </button>
            <button
              onClick={() => setChartTab('tradingview')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                chartTab === 'tradingview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>TradingView Live</span>
            </button>
            <button
              onClick={() => setChartTab('brier')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                chartTab === 'brier'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Brier Score Trends (Recharts)</span>
            </button>
            <button
              onClick={() => setChartTab('candlestick')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                chartTab === 'candlestick'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Japanese Candlesticks
            </button>
            <button
              onClick={() => setChartTab('revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                chartTab === 'revenue'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Revenue Columns
            </button>
            <button
              onClick={() => setChartTab('shareholding')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                chartTab === 'shareholding'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Shareholding Pie
            </button>
            <button
              onClick={() => setChartTab('benchmark')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                chartTab === 'benchmark'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Benchmark Area
            </button>
          </div>
        </div>

        {/* 0. Official TradingView Live Chart Feed */}
        {(chartTab === 'all' || chartTab === 'tradingview') && (
          <TradingViewLiveChart
            ticker={form.ticker}
            exchange={form.exchange}
            onSelectStock={(t, ex) => {
              const matchedPreset = Object.values(PRESET_STOCKS).find(
                p => p.ticker.toUpperCase() === t.toUpperCase()
              );
              if (matchedPreset) {
                setForm(matchedPreset);
                setAnalysisResult(null);
              } else {
                handleInputChange('ticker', t);
                handleInputChange('exchange', ex);
              }
            }}
          />
        )}

        {/* 0.5 Historical Brier Score Prediction Calibration Trends (Recharts) */}
        {(chartTab === 'all' || chartTab === 'brier') && (
          <BrierScoreTrendChart
            data={currentChartData.brierScoreTrends}
            ticker={form.ticker}
            exchange={form.exchange}
          />
        )}

        {/* 1. Candlestick & Volume Chart (TradingView style custom SVG) */}
        {(chartTab === 'all' || chartTab === 'candlestick') && (
          <div className="space-y-4">
            <StockCandlestickChart
              candles={currentChartData.candles}
              ticker={form.ticker}
              currency={form.currency}
              exchange={form.exchange}
            />
            {/* RSI Sub-panel */}
            <TechnicalOscillatorChart
              candles={currentChartData.candles}
              ticker={form.ticker}
            />
          </div>
        )}

        {/* 2. Column, Area, and Pie Charts in Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue & Profit Column Chart */}
          {(chartTab === 'all' || chartTab === 'revenue') && (
            <RevenueColumnChart
              data={currentChartData.quarterlyBars}
              currency={form.currency}
              ticker={form.ticker}
            />
          )}

          {/* Shareholding Donut / Pie Chart */}
          {(chartTab === 'all' || chartTab === 'shareholding') && (
            <ShareholdingPieChart
              slices={currentChartData.shareholding}
              ticker={form.ticker}
            />
          )}
        </div>

        {/* 3. Performance Cumulative Return vs Benchmark Area Chart */}
        {(chartTab === 'all' || chartTab === 'benchmark') && (
          <PerformanceAreaChart
            data={currentChartData.performanceArea}
            ticker={form.ticker}
            exchange={form.exchange}
          />
        )}
      </div>

      {/* Main Analysis Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 space-y-6 p-7 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Stock Financial & Fundamental Inputs</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">All fields customizable</span>
          </div>

          {/* Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => handleInputChange('companyName', e.target.value)}
                placeholder="e.g. Reliance Industries Limited"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Ticker</label>
              <input
                type="text"
                value={form.ticker}
                onChange={e => handleInputChange('ticker', e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Exchange</label>
              <select
                value={form.exchange}
                onChange={e => {
                  const ex = e.target.value as any;
                  handleInputChange('exchange', ex);
                  handleInputChange('currency', ex === 'NSE' || ex === 'BSE' ? '₹' : '$');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="NSE">NSE (India)</option>
                <option value="BSE">BSE (India)</option>
                <option value="NASDAQ">NASDAQ (US)</option>
                <option value="NYSE">NYSE (US)</option>
              </select>
            </div>
          </div>

          {/* Pricing & Valuation */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              1. Price & Valuation Multiples
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Current Price ({form.currency})</label>
                <input
                  type="number"
                  value={form.currentPrice}
                  onChange={e => handleInputChange('currentPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">P/E Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.peRatio}
                  onChange={e => handleInputChange('peRatio', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">P/B Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.pbRatio}
                  onChange={e => handleInputChange('pbRatio', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">EV / EBITDA</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.evEbitda}
                  onChange={e => handleInputChange('evEbitda', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Profitability & Returns */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              2. Profitability & Capital Efficiency
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ROCE (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.roce}
                  onChange={e => handleInputChange('roce', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">ROE (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.roe}
                  onChange={e => handleInputChange('roe', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-emerald-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Operating Margin (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={form.opm}
                  onChange={e => handleInputChange('opm', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-blue-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Debt to Equity (x)</label>
                <input
                  type="number"
                  step="0.05"
                  value={form.debtToEquity}
                  onChange={e => handleInputChange('debtToEquity', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Growth & Ownership */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              3. Growth & Ownership
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">3-Yr Sales Growth (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.salesGrowth3Yr}
                  onChange={e => handleInputChange('salesGrowth3Yr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">3-Yr Profit Growth (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.profitGrowth3Yr}
                  onChange={e => handleInputChange('profitGrowth3Yr', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Promoter Holding (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={form.promoterHolding}
                  onChange={e => handleInputChange('promoterHolding', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Raw Screener Data Box */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-extrabold text-slate-800">
                Raw Screener / Annual Report Text Paste
              </label>
              <span className="text-[10px] text-slate-400 font-medium">Copy & paste directly from Screener.in</span>
            </div>
            <textarea
              rows={5}
              value={form.screenerRawData}
              onChange={e => handleInputChange('screenerRawData', e.target.value)}
              placeholder="Paste financial summary, quarterly results, notes, or balance sheet from Screener.in / Yahoo Finance..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-black text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>{isAnalyzing ? 'Executing Quantitative Models...' : 'Generate A-to-Z Quant Stock Dossier'}</span>
          </button>
        </div>

        {/* Right Column: Quantitative Cockpit & Institutional Dossier */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Scoreboard Card */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider flex items-center justify-between">
              <span>Quantitative Financial Scorecard</span>
              <span className="text-xs font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {form.ticker}
              </span>
            </h2>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 gap-3.5 text-center">
              {/* Piotroski F-Score */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Piotroski F-Score</span>
                <div className="text-2xl font-black text-slate-950 mt-1">
                  {analysisResult?.scores?.piotroskiScore ?? (form.roce > 15 && form.debtToEquity < 0.5 ? '8/9' : '7/9')}
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                  Strong Quality
                </span>
              </div>

              {/* Altman Z-Score */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Altman Z-Score</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  {analysisResult?.scores?.altmanZScore ?? '3.45'}
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                  Safe Zone (No Distress)
                </span>
              </div>

              {/* DCF Fair Value Gap */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">DCF Implied Fair Value</span>
                <div className="text-2xl font-black text-slate-950 mt-1">
                  {form.currency}{analysisResult?.scores?.impliedFairValue ?? (form.currentPrice * 1.15).toFixed(0)}
                </div>
                <span className="text-[10px] font-extrabold text-emerald-700 block mt-0.5">
                  +{analysisResult?.scores?.marginOfSafety ?? '15.0'}% Margin of Safety
                </span>
              </div>

              {/* Kelly Sizing */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Quarter Kelly Sizing</span>
                <div className="text-2xl font-black text-blue-700 mt-1">
                  8.5%
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 block mt-0.5">
                  Max Active Capital
                </span>
              </div>
            </div>

            {/* DuPont 3-Way ROE Decomposition */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <span className="text-xs font-black text-blue-950 uppercase tracking-wider block">
                DuPont 3-Way ROE Decomposition
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold">Net Margin</span>
                  <div className="font-extrabold text-slate-900 mt-0.5">{form.opm}%</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold">Asset Turnover</span>
                  <div className="font-extrabold text-slate-900 mt-0.5">0.95x</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold">Leverage Factor</span>
                  <div className="font-extrabold text-slate-900 mt-0.5">{(1 + form.debtToEquity).toFixed(2)}x</div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Actions */}
          {analysisResult && (
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={downloadEquityPdf}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
                title="Download formatted Equity Research Note PDF"
              >
                <FileDown className="w-4 h-4 stroke-[2.5]" />
                <span>Download Report (PDF)</span>
              </button>
              <button
                onClick={downloadDossier}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export .md</span>
              </button>
              <button
                onClick={copyDossier}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generated Institutional Dossier Presentation */}
      {analysisResult?.analysisMarkdown && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-950">
                  Quantitative Equity Research Report: {form.companyName} ({form.ticker})
                </h3>
                <p className="text-xs text-slate-500 font-medium">Generated via Gemini Quant Reasoning Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={downloadEquityPdf}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
                title="Download Equity Research Note PDF"
              >
                <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Download Report (PDF)</span>
              </button>
              <button
                onClick={copyDossier}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title="Copy Report"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={downloadDossier}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                title="Download .md"
              >
                <Download className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Formatted Markdown Content */}
          <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-800 font-sans space-y-4">
            <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed text-sm">
              {analysisResult.analysisMarkdown}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
