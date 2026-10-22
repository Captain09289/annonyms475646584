import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, Sparkles, AlertCircle, ArrowUpRight, BarChart2, ShieldCheck, DollarSign, Globe2 } from 'lucide-react';
import { PredictionContract, EngineConfig } from '../types/mispricing';
import { evaluateOpportunity, calculateKellyFraction } from '../engine/mispricingEngine';

interface ScannerViewProps {
  contracts: PredictionContract[];
  config: EngineConfig;
  selectedExchangeFilter: 'ALL' | 'US' | 'INDIA';
  setSelectedExchangeFilter: (filter: 'ALL' | 'US' | 'INDIA') => void;
  onSelectContract: (contract: PredictionContract) => void;
  onSendToCalculator: (price: number, modelP: number) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({
  contracts,
  config,
  selectedExchangeFilter,
  setSelectedExchangeFilter,
  onSelectContract,
  onSendToCalculator
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyActionable, setOnlyActionable] = useState<boolean>(false);

  // Evaluate each contract through the mispricing engine using active config
  const evaluatedContracts = useMemo(() => {
    return contracts.map(contract => {
      const f = contract.financialFeatures;
      const z = (f.qoqRevenueMomentum * 0.08) + (f.consensusRevision * 0.15) + (f.twelveQBeatRate * 1.5) + (f.grossMarginTrendBps * 0.003) + (f.supplierIndex * 0.4) - 0.9;
      const rawP = 1.0 / (1.0 + Math.exp(-z));
      const modelP = Math.min(Math.max(rawP, 0.05), 0.95);

      const evalRes = evaluateOpportunity(contract.marketPrice, modelP, config);
      const kelly = calculateKellyFraction(modelP, contract.marketPrice, config.payout);

      return {
        ...contract,
        modelProbability: modelP,
        probabilityGap: evalRes.probability_gap,
        grossEv: evalRes.gross_ev,
        netEv: evalRes.net_ev,
        conservativeEv: evalRes.conservative_ev,
        gapCheck: evalRes.gap_check,
        actionable: evalRes.actionable,
        reason: evalRes.reason,
        kellyFraction: kelly.quarterKelly
      };
    });
  }, [contracts, config]);

  // Filtering
  const filteredContracts = useMemo(() => {
    return evaluatedContracts.filter(c => {
      // Exchange filter
      if (selectedExchangeFilter === 'US' && c.exchange !== 'NYSE' && c.exchange !== 'NASDAQ') return false;
      if (selectedExchangeFilter === 'INDIA' && c.exchange !== 'NSE' && c.exchange !== 'BSE') return false;

      // Category filter
      if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;

      // Actionable filter
      if (onlyActionable && !c.actionable) return false;

      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.contractTitle.toLowerCase().includes(query);
        const matchesTicker = c.ticker.toLowerCase().includes(query);
        const matchesCompany = c.companyName.toLowerCase().includes(query);
        const matchesExchange = c.exchange.toLowerCase().includes(query);
        if (!matchesTitle && !matchesTicker && !matchesCompany && !matchesExchange) return false;
      }
      return true;
    }).sort((a, b) => (b.conservativeEv || 0) - (a.conservativeEv || 0));
  }, [evaluatedContracts, selectedExchangeFilter, selectedCategory, onlyActionable, searchQuery]);

  // Summary statistics
  const totalScanned = evaluatedContracts.length;
  const actionableCount = evaluatedContracts.filter(c => c.actionable).length;
  const topSignal = evaluatedContracts.reduce((prev, curr) => (curr.conservativeEv || 0) > (prev.conservativeEv || 0) ? curr : prev, evaluatedContracts[0]);
  const avgConservativeEv = evaluatedContracts.reduce((acc, curr) => acc + (curr.conservativeEv || 0), 0) / (totalScanned || 1);

  const categories = ['All', 'Indian Equities (NSE/BSE)', 'Tech Titans', 'Semiconductors', 'Cloud & Software', 'Banking & Financials', 'Macro & Rates'];

  return (
    <div className="space-y-8">
      {/* Top Metric Cards - Spacious and high contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contracts Monitored</span>
            <div className="text-3xl font-extrabold text-slate-950 mt-1">{totalScanned}</div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>NYSE • NASDAQ • NSE • BSE</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Globe2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actionable Mispricings</span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">{actionableCount}</div>
            <span className="text-xs text-slate-500 mt-1 font-medium block">
              Passes {(config.uncertaintyMargin * 100).toFixed(0)}% uncertainty haircut
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Alpha Gap</span>
            <div className="text-3xl font-extrabold text-blue-600 mt-1">
              +{((topSignal?.probabilityGap || 0) * 100).toFixed(1)}%
            </div>
            <span className="text-xs text-slate-500 mt-1 font-medium block">
              {topSignal?.ticker} ({topSignal?.exchange}) • Cons. EV +{config.currencySymbol}{topSignal?.conservativeEv?.toFixed(2)}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Conservative EV</span>
            <div className={`text-3xl font-extrabold mt-1 ${avgConservativeEv >= 0 ? 'text-slate-950' : 'text-amber-600'}`}>
              {avgConservativeEv >= 0 ? '+' : ''}{config.currencySymbol}{avgConservativeEv.toFixed(2)}
            </div>
            <span className="text-xs text-slate-500 mt-1 font-medium block">
              Net of {config.currencySymbol}{config.transactionCost} transaction friction
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
        {/* Exchange and Category Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Category selection */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 lg:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search & Actionable Toggle */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs text-slate-700 font-bold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyActionable}
                onChange={e => setOnlyActionable(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-white border-slate-300"
              />
              <span className="whitespace-nowrap">Actionable Only</span>
            </label>

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search contract, ticker, NSE/BSE..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contract Cards Grid - Spacious, Comfy, High Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map(contract => (
          <div
            key={contract.id}
            className={`p-6 rounded-3xl bg-white border transition-all hover:shadow-md flex flex-col justify-between ${
              contract.actionable
                ? 'border-emerald-300 shadow-sm ring-1 ring-emerald-400/20'
                : 'border-slate-200 shadow-xs'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg font-mono font-extrabold text-xs bg-slate-900 text-white">
                      {contract.ticker}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                      contract.exchange === 'NSE' || contract.exchange === 'BSE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {contract.exchange}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">{contract.category}</span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-950 mt-2.5 leading-snug">
                    {contract.contractTitle}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shrink-0 border ${
                  contract.actionable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {contract.actionable ? 'Actionable' : 'Cushioned'}
                </span>
              </div>

              {/* Target & Resolution details */}
              <div className="flex items-center justify-between text-xs text-slate-500 mt-3.5 pt-3 border-t border-slate-100 font-medium">
                <span>Target: <strong className="text-slate-900 font-bold">{contract.targetRevenueThreshold}</strong></span>
                <span>Resolves: <strong className="text-slate-700 font-semibold">{contract.resolutionDate}</strong></span>
              </div>

              {/* Probability Visual Bar */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">
                    Orderbook: <strong className="text-slate-950 font-bold">{contract.marketPrice}¢</strong>
                  </span>
                  <span className="text-blue-600 font-bold">
                    Model: {((contract.modelProbability || 0) * 100).toFixed(1)}%
                  </span>
                  <span className={`font-extrabold text-sm ${
                    (contract.probabilityGap || 0) >= config.gapThreshold ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {(contract.probabilityGap || 0) >= 0 ? '+' : ''}{((contract.probabilityGap || 0) * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Visual Bar */}
                <div className="h-3.5 bg-slate-200 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-slate-400 opacity-50 absolute left-0"
                    style={{ width: `${contract.marketPrice}%` }}
                    title={`Market Price: ${contract.marketPrice}%`}
                  />
                  <div
                    className="h-full bg-blue-600 absolute left-0 opacity-85"
                    style={{ width: `${(contract.modelProbability || 0) * 100}%` }}
                    title={`Calibrated Forecast: ${((contract.modelProbability || 0) * 100).toFixed(1)}%`}
                  />
                  <div
                    className="h-full bg-amber-400/50 absolute border-l border-r border-amber-500"
                    style={{
                      left: `${Math.max(0, ((contract.modelProbability || 0) - config.uncertaintyMargin) * 100)}%`,
                      width: `${config.uncertaintyMargin * 100}%`
                    }}
                    title="8% Uncertainty Haircut"
                  />
                </div>
              </div>

              {/* Financial Metrics Indicators */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">QoQ Rev</span>
                  <span className="text-xs font-extrabold text-slate-900">+{contract.financialFeatures.qoqRevenueMomentum}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Revision</span>
                  <span className="text-xs font-extrabold text-slate-900">+{contract.financialFeatures.consensusRevision}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Beat Rate</span>
                  <span className="text-xs font-extrabold text-emerald-600">{((contract.financialFeatures.twelveQBeatRate) * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* EV Metrics */}
              <div className="flex items-center justify-between text-xs mt-3.5 pt-3 border-t border-slate-100 font-medium">
                <div className="text-slate-600">
                  Net EV: <strong className={contract.netEv && contract.netEv >= 0 ? 'text-slate-950 font-bold' : 'text-rose-600 font-bold'}>
                    {config.currencySymbol}{contract.netEv?.toFixed(2)}
                  </strong>
                </div>
                <div className="text-slate-600">
                  Cons. EV: <strong className={contract.conservativeEv && contract.conservativeEv > 0 ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-bold'}>
                    {contract.conservativeEv && contract.conservativeEv > 0 ? '+' : ''}{config.currencySymbol}{contract.conservativeEv?.toFixed(2)}
                  </strong>
                </div>
                {contract.actionable && (
                  <div className="text-blue-700 font-extrabold">
                    Kelly: {((contract.kellyFraction || 0) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-5 pt-3.5 border-t border-slate-100">
              <button
                onClick={() => onSelectContract(contract)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Revenues & Thesis</span>
              </button>

              <button
                onClick={() => onSendToCalculator(contract.marketPrice, contract.modelProbability || 0.5)}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <span>Check Tool</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No prediction contracts match criteria</h3>
          <p className="text-xs text-slate-500">Try switching exchange filters or selecting "All Markets".</p>
        </div>
      )}
    </div>
  );
};
