import React from 'react';
import { Activity, Calculator, LineChart, Database, FileText, Settings, ShieldCheck, Globe, DollarSign } from 'lucide-react';
import { EngineConfig } from '../types/mispricing';

interface NavbarProps {
  activeTab: 'scanner' | 'calculator' | 'pipeline' | 'data' | 'stockQuant';
  setActiveTab: (tab: 'scanner' | 'calculator' | 'pipeline' | 'data' | 'stockQuant') => void;
  config: EngineConfig;
  setConfig: React.Dispatch<React.SetStateAction<EngineConfig>>;
  selectedExchangeFilter: 'ALL' | 'US' | 'INDIA';
  setSelectedExchangeFilter: (filter: 'ALL' | 'US' | 'INDIA') => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  config,
  setConfig,
  selectedExchangeFilter,
  setSelectedExchangeFilter,
  onOpenReport,
  onOpenSettings
}) => {
  const toggleCurrency = () => {
    setConfig(prev => ({
      ...prev,
      currencySymbol: prev.currencySymbol === '$' ? '₹' : '$'
    }));
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md shadow-slate-900/10">
              <ShieldCheck className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-950">
                  AlphaMarket
                </span>
                <span className="text-[11px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  Quant Mispricing Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Global Prediction Arbitrage • NYSE • NASDAQ • NSE • BSE
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'scanner'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Live Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Opportunity Check</span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'pipeline'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <LineChart className="w-4 h-4 text-indigo-600" />
              <span>Backtest & Pipeline</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'data'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <Database className="w-4 h-4 text-slate-700" />
              <span>Revenues</span>
            </button>

            <button
              onClick={() => setActiveTab('stockQuant')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'stockQuant'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Quant Stock A-Z</span>
            </button>
          </nav>

          {/* Quick Action Tools & Exchange Selector */}
          <div className="flex items-center space-x-2.5">
            {/* Exchange Filter Switcher */}
            <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setSelectedExchangeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedExchangeFilter === 'ALL'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Markets
              </button>
              <button
                onClick={() => setSelectedExchangeFilter('US')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedExchangeFilter === 'US'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                NYSE/NASDAQ
              </button>
              <button
                onClick={() => setSelectedExchangeFilter('INDIA')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedExchangeFilter === 'INDIA'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                NSE/BSE
              </button>
            </div>

            {/* Currency Toggle */}
            <button
              onClick={toggleCurrency}
              title={`Switch Currency (Current: ${config.currencySymbol})`}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-extrabold flex items-center space-x-1 border border-slate-200 transition-colors shadow-xs"
            >
              <span className="text-emerald-700 font-black">{config.currencySymbol}</span>
              <span className="text-[11px] text-slate-600 font-bold">{config.currencySymbol === '$' ? 'USD' : 'INR'}</span>
            </button>

            {/* Research Report Button */}
            <button
              onClick={onOpenReport}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Research Report</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Engine Assumptions & Parameters"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
