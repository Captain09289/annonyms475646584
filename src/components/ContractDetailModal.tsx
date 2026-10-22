import React, { useState, useEffect } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, Sparkles, Brain, BarChart3, ShieldAlert, ArrowRight } from 'lucide-react';
import { PredictionContract, EngineConfig } from '../types/mispricing';

interface ContractDetailModalProps {
  contract: PredictionContract;
  config: EngineConfig;
  onClose: () => void;
  onSendToCalculator: (price: number, modelP: number) => void;
}

export const ContractDetailModal: React.FC<ContractDetailModalProps> = ({
  contract,
  config,
  onClose,
  onSendToCalculator
}) => {
  const [aiThesis, setAiThesis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenues' | 'thesis'>('overview');

  const modelP = contract.modelProbability || contract.marketPrice / 100;
  const marketP = contract.marketPrice / config.payout;
  const gap = modelP - marketP;
  const grossEv = modelP * config.payout - contract.marketPrice;
  const netEv = grossEv - config.transactionCost;
  const conservativeEv = contract.conservativeEv ?? (netEv - config.uncertaintyMargin * config.payout);

  const fetchAiThesis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai-thesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractTitle: contract.contractTitle,
          ticker: contract.ticker,
          exchange: contract.exchange,
          category: contract.category,
          marketPrice: contract.marketPrice,
          modelProbability: modelP,
          gap,
          conservativeEv,
          actionable: contract.actionable,
          financialFeatures: contract.financialFeatures
        })
      });
      const data = await res.json();
      setAiThesis(data.thesis || 'No thesis generated.');
    } catch (e: any) {
      setAiThesis('Failed to connect to AI thesis engine. Check API server status.');
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiThesis();
  }, [contract.id]);

  const maxRevenue = Math.max(...contract.pastRevenues.map(r => Math.max(r.revenue, r.consensusEstimate)), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3.5">
            <span className="px-3.5 py-1.5 text-sm font-extrabold rounded-xl bg-slate-900 text-white font-mono">
              {contract.ticker}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                  contract.exchange === 'NSE' || contract.exchange === 'BSE'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {contract.exchange}
                </span>
                <span className="text-xs font-bold text-slate-500">{contract.companyName}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">{contract.category}</span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-950 mt-1">{contract.contractTitle}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white text-slate-500 hover:text-slate-950 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Mispricing Analysis & EV</span>
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'revenues'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Past Revenues & Consensus (8 Quarters)</span>
          </button>
          <button
            onClick={() => setActiveTab('thesis')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'thesis'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Analyst Thesis</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Probability Visual Comparison */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                    Probability Spread & Calibration
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                    contract.actionable
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}>
                    {contract.actionable ? 'Actionable Trade' : 'Non-Actionable (Conservative Buffer)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">Market Price (Implied)</span>
                    <div className="text-2xl font-extrabold text-slate-950 mt-1">
                      {contract.marketPrice}¢ <span className="text-sm font-normal text-slate-500">({(marketP * 100).toFixed(1)}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Orderbook contract price</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">Calibrated Model Forecast</span>
                    <div className="text-2xl font-extrabold text-blue-600 mt-1">
                      {(modelP * 100).toFixed(1)}%
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Platt-scaled from financial features</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">Probability Gap (Edge)</span>
                    <div className={`text-2xl font-extrabold mt-1 ${gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {gap >= 0 ? '+' : ''}{(gap * 100).toFixed(1)}%
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Min threshold: +{(config.gapThreshold * 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Bar */}
                <div className="space-y-2 pt-2">
                  <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-slate-400 opacity-50 absolute left-0"
                      style={{ width: `${contract.marketPrice}%` }}
                    />
                    <div
                      className="h-full bg-blue-600 absolute left-0 opacity-80"
                      style={{ width: `${modelP * 100}%` }}
                    />
                    <div
                      className="h-full bg-amber-400/50 absolute border-l border-r border-amber-500"
                      style={{
                        left: `${Math.max(0, (modelP - config.uncertaintyMargin) * 100)}%`,
                        width: `${config.uncertaintyMargin * 100}%`
                      }}
                      title="8% Uncertainty Haircut"
                    />
                  </div>
                  <p className="text-xs text-amber-700 font-medium flex items-center space-x-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Gold band represents the {(config.uncertaintyMargin * 100).toFixed(0)}% pedagogical risk haircut (Lesson 14).</span>
                  </p>
                </div>
              </div>

              {/* EV Walk Breakdown */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Expected Value & Friction Walk
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Gross EV</div>
                    <div className={`text-xl font-extrabold mt-0.5 ${grossEv >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                      {config.currencySymbol}{grossEv.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">P_mod × Payout - Price</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Transaction Cost</div>
                    <div className="text-xl font-extrabold text-rose-600 mt-0.5">
                      -{config.currencySymbol}{config.transactionCost.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">Exchange fees</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-500">Net EV</div>
                    <div className={`text-xl font-extrabold mt-0.5 ${netEv >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {config.currencySymbol}{netEv.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">Gross EV - Cost</div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-amber-700">Conservative EV</div>
                    <div className={`text-xl font-extrabold mt-0.5 ${conservativeEv > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {conservativeEv > 0 ? '+' : ''}{config.currencySymbol}{conservativeEv.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">After 8% haircut</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <span className="text-slate-700 font-medium">
                    <strong className="text-slate-950 font-bold">Decision:</strong> {contract.reason || (contract.actionable ? 'All checks satisfied: Actionable trade opportunity.' : 'Edge insufficient under conservative risk control.')}
                  </span>
                  <button
                    onClick={() => onSendToCalculator(contract.marketPrice, modelP)}
                    className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Simulate in Check Tool</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenues' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Past 8 Quarters Revenue History vs Consensus Estimates ({contract.currency})
                  </h3>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    12Q Beat Rate: {((contract.financialFeatures.twelveQBeatRate) * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Bar chart */}
                <div className="space-y-3.5 pt-2">
                  {contract.pastRevenues.map((rev, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-900 font-bold w-16">{rev.quarter}</span>
                        <span className="text-slate-600">
                          Actual: <strong className={rev.beat ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{contract.currency}{rev.revenue}{contract.exchange === 'NSE' || contract.exchange === 'BSE' ? 'k Cr' : 'B'}</strong>
                          {' '}• Consensus: {contract.currency}{rev.consensusEstimate}{contract.exchange === 'NSE' || contract.exchange === 'BSE' ? 'k Cr' : 'B'}
                        </span>
                        <span className={`text-[11px] font-extrabold ${rev.beat ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {rev.beat ? '✓ BEAT' : '✕ MISS'}
                        </span>
                      </div>
                      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full rounded-full transition-all ${rev.beat ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${(rev.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between text-xs text-slate-600">
                  <span>Threshold required for YES resolution:</span>
                  <span className="text-sm font-extrabold text-blue-600">{contract.targetRevenueThreshold}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thesis' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 min-h-[250px] relative shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="font-extrabold text-sm text-slate-950">AI Quantitative Analyst Thesis</span>
                  </div>
                  <button
                    onClick={fetchAiThesis}
                    disabled={loadingAi}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    {loadingAi ? 'Synthesizing...' : 'Regenerate'}
                  </button>
                </div>

                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">Synthesizing revenue trends and market inefficiencies...</span>
                  </div>
                ) : (
                  <div className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-sans">
                    {aiThesis}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs text-slate-500">
          <span>Educational quantitative research model. Positive EV does not guarantee profit.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
