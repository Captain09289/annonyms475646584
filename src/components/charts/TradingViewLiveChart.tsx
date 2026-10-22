import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, BarChart2, Search, CheckCircle2, TrendingUp } from 'lucide-react';

interface TradingViewLiveChartProps {
  ticker: string;
  exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ';
  onSelectStock?: (ticker: string, exchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ') => void;
}

// Convert any ticker and exchange to valid TradingView canonical symbol
export const formatTradingViewSymbol = (tick: string, ex?: string): string => {
  if (!tick) return 'NSE:RELIANCE';

  const clean = tick.trim().toUpperCase();

  // If already prefixed with exchange, return as is
  if (clean.includes(':')) {
    return clean;
  }

  // NYSE specific tickers
  const nyseTickers = ['TSM', 'BRK.A', 'BRK.B', 'JPM', 'V', 'WMT', 'UNH', 'DIS', 'BABA', 'NVO'];
  if (nyseTickers.includes(clean) || ex === 'NYSE') {
    return `NYSE:${clean}`;
  }

  // US Tech & NASDAQ tickers
  const nasdaqTickers = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'AVGO', 'AMD', 'INTC', 'QCOM', 'NFLX', 'COST'];
  if (nasdaqTickers.includes(clean) || ex === 'NASDAQ') {
    return `NASDAQ:${clean}`;
  }

  // Indian stocks (NSE / BSE): TradingView indexes all major Indian tickers under NSE:
  // e.g. NSE:RELIANCE, NSE:TCS, NSE:HDFCBANK, NSE:INFY, NSE:TATAMOTORS, etc.
  if (ex === 'BSE' && /^\d+$/.test(clean)) {
    return `BSE:${clean}`;
  }

  return `NSE:${clean}`;
};

const POPULAR_WATCHLIST = [
  { label: 'Reliance', ticker: 'RELIANCE', exchange: 'NSE' as const, flag: '🇮🇳' },
  { label: 'TCS', ticker: 'TCS', exchange: 'NSE' as const, flag: '🇮🇳' },
  { label: 'HDFC Bank', ticker: 'HDFCBANK', exchange: 'NSE' as const, flag: '🇮🇳' },
  { label: 'Infosys', ticker: 'INFY', exchange: 'NSE' as const, flag: '🇮🇳' },
  { label: 'NVIDIA', ticker: 'NVDA', exchange: 'NASDAQ' as const, flag: '🇺🇸' },
  { label: 'Apple', ticker: 'AAPL', exchange: 'NASDAQ' as const, flag: '🇺🇸' },
  { label: 'Microsoft', ticker: 'MSFT', exchange: 'NASDAQ' as const, flag: '🇺🇸' },
  { label: 'Alphabet', ticker: 'GOOGL', exchange: 'NASDAQ' as const, flag: '🇺🇸' },
];

export const TradingViewLiveChart: React.FC<TradingViewLiveChartProps> = ({
  ticker,
  exchange,
  onSelectStock
}) => {
  const [activeSymbol, setActiveSymbol] = useState<string>(() =>
    formatTradingViewSymbol(ticker, exchange)
  );
  const [searchInput, setSearchInput] = useState<string>('');
  const [key, setKey] = useState<number>(0);

  // Sync when prop ticker or exchange changes from outside
  useEffect(() => {
    const canonical = formatTradingViewSymbol(ticker, exchange);
    setActiveSymbol(canonical);
  }, [ticker, exchange]);

  const handleSelectChip = (chipTicker: string, chipExchange: 'NSE' | 'BSE' | 'NYSE' | 'NASDAQ') => {
    const canonical = formatTradingViewSymbol(chipTicker, chipExchange);
    setActiveSymbol(canonical);
    setKey(prev => prev + 1);
    if (onSelectStock) {
      onSelectStock(chipTicker, chipExchange);
    }
  };

  const handleCustomSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    let target = searchInput.trim().toUpperCase();
    if (!target.includes(':')) {
      target = formatTradingViewSymbol(target, exchange);
    }
    setActiveSymbol(target);
    setKey(prev => prev + 1);
    setSearchInput('');
  };

  // Construct official, reliable TradingView embed URL
  const widgetUrl = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${encodeURIComponent(
    activeSymbol
  )}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%22STD%3BSMA%22%2C%22STD%3BRSI%22%5D&theme=light&style=1&timezone=Asia%2FKolkata&locale=en`;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-3 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <BarChart2 className="w-5 h-5 stroke-[2.5]" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-black text-slate-950">
                Official TradingView Live Chart Feed
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Symbol: {activeSymbol}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time candlestick price feed, 20/50 SMA, RSI, volume, and indicators directly from TradingView
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search Form */}
          <form onSubmit={handleCustomSearch} className="flex items-center space-x-1.5">
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search symbol (e.g. NSE:SBIN)"
                className="w-48 pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Load
            </button>
          </form>

          <button
            onClick={() => setKey(prev => prev + 1)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Reload live chart"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          <a
            href={`https://www.tradingview.com/symbols/${activeSymbol.replace(':', '-')}/`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <span>Open in TradingView</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stock Quick-Switcher Chips (NSE, BSE, NASDAQ) */}
      <div className="flex flex-wrap items-center gap-1.5 py-1">
        <span className="text-[11px] font-black uppercase text-slate-400 mr-1 flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-slate-400" />
          <span>Quick Switch:</span>
        </span>
        {POPULAR_WATCHLIST.map(stock => {
          const canonical = formatTradingViewSymbol(stock.ticker, stock.exchange);
          const isSelected = activeSymbol === canonical;
          return (
            <button
              key={canonical}
              onClick={() => handleSelectChip(stock.ticker, stock.exchange)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/90'
              }`}
            >
              <span>{stock.flag}</span>
              <span>{stock.label}</span>
              <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                ({stock.exchange})
              </span>
              {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
            </button>
          );
        })}
      </div>

      {/* TradingView Widget Mount Container via Secure & Reactive Iframe */}
      <div className="w-full h-[580px] rounded-2xl overflow-hidden border border-slate-200/90 bg-slate-50 relative shadow-inner">
        <iframe
          key={`${activeSymbol}-${key}`}
          src={widgetUrl}
          title={`TradingView Live Chart - ${activeSymbol}`}
          className="w-full h-full border-0"
          allow="fullscreen; clipboard-write"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            Displaying live chart for <strong className="text-slate-900 font-mono">{activeSymbol}</strong>. Supports candlestick patterns, volume profile, interval switching, and full indicator overlays.
          </span>
        </div>
        <span className="font-semibold text-slate-700">Source: TradingView Live Data Gateway</span>
      </div>
    </div>
  );
};
