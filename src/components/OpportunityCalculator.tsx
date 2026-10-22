import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw, HelpCircle } from 'lucide-react';
import { EngineConfig } from '../types/mispricing';
import { evaluateOpportunity, calculateKellyFraction } from '../engine/mispricingEngine';

interface OpportunityCalculatorProps {
  config: EngineConfig;
  initialPrice?: number;
  initialModelP?: number;
}

export const OpportunityCalculator: React.FC<OpportunityCalculatorProps> = ({
  config,
  initialPrice = 40,
  initialModelP = 0.60
}) => {
  const [price, setPrice] = useState<number>(initialPrice);
  const [modelP, setModelP] = useState<number>(initialModelP);
  const [payout, setPayout] = useState<number>(config.payout);
  const [cost, setCost] = useState<number>(config.transactionCost);
  const [gapThreshold, setGapThreshold] = useState<number>(config.gapThreshold);
  const [minNetEv, setMinNetEv] = useState<number>(config.minNetEv);
  const [uncertaintyMargin, setUncertaintyMargin] = useState<number>(config.uncertaintyMargin);

  const customConfig: EngineConfig = {
    ...config,
    payout,
    transactionCost: cost,
    gapThreshold,
    minNetEv,
    uncertaintyMargin
  };

  const evalResult = evaluateOpportunity(price, modelP, customConfig);
  const kelly = calculateKellyFraction(modelP, price, payout);

  const loadPreset = (presetPrice: number, presetModelP: number, presetCost = 3, presetMargin = 0.08) => {
    setPrice(presetPrice);
    setModelP(presetModelP);
    setCost(presetCost);
    setUncertaintyMargin(presetMargin);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner - Spacious & Clean */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Opportunity Check Calculator</h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1.5">
            Simulate the mathematical mispricing pipeline: Market Price ➔ Model Forecast ➔ Gap ➔ Net EV ➔ Uncertainty Haircut ➔ Sizing.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadPreset(30, 0.50, 0, 0.08)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            Lesson 2 (Zero Cost)
          </button>
          <button
            onClick={() => loadPreset(40, 0.60, 3, 0.08)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors cursor-pointer"
          >
            Lesson 4 & 7 (Net EV)
          </button>
          <button
            onClick={() => loadPreset(50, 0.55, 3, 0.08)}
            className="px-3 py-1.5 text-xs rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition-colors cursor-pointer"
          >
            Lesson 14 (Negative Cons. EV)
          </button>
          <button
            onClick={() => loadPreset(61, 0.78, 3, 0.08)}
            className="px-3 py-1.5 text-xs rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold border border-blue-200 transition-colors cursor-pointer"
          >
            NVDA (NASDAQ)
          </button>
          <button
            onClick={() => loadPreset(58, 0.74, 3, 0.08)}
            className="px-3 py-1.5 text-xs rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer"
          >
            RELIANCE (NSE)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders & Controls */}
        <div className="lg:col-span-6 space-y-6 p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Contract & Model Parameters
            </h2>
            <button
              onClick={() => {
                setPrice(40);
                setModelP(0.60);
                setPayout(100);
                setCost(3);
                setGapThreshold(0.05);
                setMinNetEv(2.0);
                setUncertaintyMargin(0.08);
              }}
              className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Market Price */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Orderbook Contract Price (YES)</span>
              <span className="text-emerald-700 font-extrabold font-mono text-base">{price}¢ ({((price / payout) * 100).toFixed(1)}%)</span>
            </div>
            <input
              type="range"
              min="1"
              max="99"
              step="1"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="w-full accent-emerald-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>1¢ (Deep Longshot)</span>
              <span>50¢ (Coin Flip)</span>
              <span>99¢ (Near Certainty)</span>
            </div>
          </div>

          {/* Model Probability */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-800">
              <span>Model Evaluated Probability</span>
              <span className="text-blue-700 font-extrabold font-mono text-base">{(modelP * 100).toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.99"
              step="0.01"
              value={modelP}
              onChange={e => setModelP(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>1%</span>
              <span>50%</span>
              <span>99%</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Assumptions & Friction Thresholds
            </h3>

            {/* Payout & Cost */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Contract Payout</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={payout}
                    onChange={e => setPayout(Math.max(1, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Transaction Friction</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={cost}
                    onChange={e => setCost(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Gap Threshold & Min EV */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Gap Threshold</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="1"
                    value={(gapThreshold * 100).toFixed(0)}
                    onChange={e => setGapThreshold(Number(e.target.value) / 100)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 font-bold block mb-1">Min Net EV</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">{config.currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={minNetEv}
                    onChange={e => setMinNetEv(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Uncertainty Margin Slider */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Uncertainty Margin Discount (Lesson 14)</span>
                <span className="text-amber-700 font-mono font-extrabold">{(uncertaintyMargin * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.25"
                step="0.01"
                value={uncertaintyMargin}
                onChange={e => setUncertaintyMargin(Number(e.target.value))}
                className="w-full accent-amber-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 font-medium">
                Pedagogical risk haircut penalizing model optimism before capital commitment.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Decision Walk */}
        <div className="lg:col-span-6 space-y-6">
          {/* Verdict Banner */}
          <div className={`p-7 rounded-3xl border transition-all ${
            evalResult.actionable
              ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Decision Engine Verdict</span>
              <span className={`px-3.5 py-1 rounded-full text-xs font-extrabold border ${
                evalResult.actionable
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {evalResult.actionable ? 'ACTIONABLE SIGNAL' : 'REJECTED / DO NOT TRADE'}
              </span>
            </div>

            <div className="mt-3 text-xl font-extrabold text-slate-950">
              {evalResult.reason}
            </div>

            <div className="mt-5 pt-5 border-t border-slate-200/80 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Probability Gap</span>
                <div className={`text-lg font-extrabold mt-0.5 ${evalResult.probability_gap >= gapThreshold ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {evalResult.probability_gap >= 0 ? '+' : ''}{(evalResult.probability_gap * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Net EV</span>
                <div className={`text-lg font-extrabold mt-0.5 ${evalResult.net_ev >= minNetEv ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {config.currencySymbol}{evalResult.net_ev.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Conservative EV</span>
                <div className={`text-lg font-extrabold mt-0.5 ${evalResult.conservative_ev > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {evalResult.conservative_ev > 0 ? '+' : ''}{config.currencySymbol}{evalResult.conservative_ev.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stage Verification Filter Checklist */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Quantitative Signal Verification Checklist
            </h3>

            {/* Check 1 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              {evalResult.probability_gap >= gapThreshold ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">
                  Stage 1: Minimum Probability Gap ({evalResult.probability_gap >= gapThreshold ? 'Passed' : 'Failed'})
                </div>
                <div className="text-slate-600 mt-0.5">
                  Observed Gap: <strong>{evalResult.probability_gap >= 0 ? '+' : ''}{(evalResult.probability_gap * 100).toFixed(1)}%</strong> vs Threshold: <strong>{(gapThreshold * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>

            {/* Check 2 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              {evalResult.net_ev >= minNetEv ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">
                  Stage 2: Minimum Net Expected Value ({evalResult.net_ev >= minNetEv ? 'Passed' : 'Failed'})
                </div>
                <div className="text-slate-600 mt-0.5">
                  Net EV: <strong>{config.currencySymbol}{evalResult.net_ev.toFixed(2)}</strong> vs Required: <strong>{config.currencySymbol}{minNetEv.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Check 3 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              {evalResult.gap_check === 'Gap exceeds uncertainty allowance' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">
                  Stage 3: Uncertainty Allowance Check ({evalResult.gap_check === 'Gap exceeds uncertainty allowance' ? 'Passed' : 'Failed'})
                </div>
                <div className="text-slate-600 mt-0.5">
                  {evalResult.gap_check} (Haircut Margin: <strong>{(uncertaintyMargin * 100).toFixed(0)}%</strong>)
                </div>
              </div>
            </div>

            {/* Check 4 */}
            <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
              {evalResult.conservative_ev > 0 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <div className="font-bold text-slate-900">
                  Stage 4: Positive Conservative EV ({evalResult.conservative_ev > 0 ? 'Passed' : 'Failed'})
                </div>
                <div className="text-slate-600 mt-0.5">
                  Conservative EV: <strong>{evalResult.conservative_ev > 0 ? '+' : ''}{config.currencySymbol}{evalResult.conservative_ev.toFixed(2)}</strong> (&gt; {config.currencySymbol}0 to deploy capital)
                </div>
              </div>
            </div>
          </div>

          {/* Sizing Box */}
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-extrabold text-blue-900">Quarter Kelly Recommendation:</span>
              <p className="text-blue-700 mt-0.5 font-medium">
                Full Kelly: {(kelly.fullKelly * 100).toFixed(1)}% • <strong>Quarter Kelly: {(kelly.quarterKelly * 100).toFixed(1)}%</strong>
              </p>
            </div>
            <div className="text-right font-mono font-extrabold text-blue-700 text-lg">
              {evalResult.actionable ? `${(kelly.quarterKelly * 100).toFixed(1)}%` : '0.0%'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
