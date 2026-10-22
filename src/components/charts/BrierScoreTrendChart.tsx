import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  Target,
  TrendingDown,
  TrendingUp,
  Award,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Scale
} from 'lucide-react';
import { BrierScoreTrendPoint } from '../../data/stockChartData';

interface BrierScoreTrendChartProps {
  data: BrierScoreTrendPoint[];
  ticker: string;
  exchange: string;
}

export const BrierScoreTrendChart: React.FC<BrierScoreTrendChartProps> = ({
  data,
  ticker,
  exchange
}) => {
  const [viewMode, setViewMode] = useState<'brier' | 'edge' | 'accuracy'>('brier');
  const [showLedger, setShowLedger] = useState<boolean>(false);

  if (!data || data.length === 0) {
    return null;
  }

  const latest = data[data.length - 1];
  const earliest = data[0];
  const brierImprovement = Math.round((earliest.modelBrier - latest.modelBrier) * 1000) / 1000;
  const pctBetterThanMarket = Math.round(
    ((latest.marketBrier - latest.modelBrier) / latest.marketBrier) * 100
  );

  // Custom rich tooltip
  const CustomBrierTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point: BrierScoreTrendPoint = payload[0].payload;
      return (
        <div className="p-4 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xl text-xs space-y-2.5 max-w-xs z-50">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <span className="font-extrabold text-slate-900 text-sm">{point.quarter}</span>
              <span className="text-slate-400 font-medium ml-1.5">({point.date})</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase">
              {point.accuracyPct}% Acc
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            <div className="flex justify-between items-center text-emerald-700">
              <span className="font-sans font-semibold text-slate-600">Model Brier Score:</span>
              <span className="font-black">{point.modelBrier.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center text-blue-700">
              <span className="font-sans font-semibold text-slate-600">Market Brier Score:</span>
              <span className="font-black">{point.marketBrier.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="font-sans font-semibold text-slate-500">Uninformative Prior:</span>
              <span>0.250</span>
            </div>
            <div className="flex justify-between items-center text-slate-900 pt-1 border-t border-slate-100">
              <span className="font-sans font-semibold text-slate-600">Quant Calibration Edge:</span>
              <span className="font-black text-emerald-700">+{point.brierEdge.toFixed(3)}</span>
            </div>
          </div>

          {point.resolvedEvent && (
            <div className="pt-2 border-t border-slate-100 font-sans">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Evaluated Prediction Market Contract:
              </span>
              <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                {point.resolvedEvent}
              </p>
              <div className="flex items-center space-x-2 mt-1 text-[10px] font-mono">
                <span className="text-emerald-700 font-bold">Model: {point.modelProb}%</span>
                <span className="text-slate-300">•</span>
                <span className="text-blue-700 font-bold">Market: {point.marketPrice}¢</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-bold">
                  Result: {point.outcome === 1 ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-xs">
            <Target className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-slate-950 tracking-tight">
                Historical Brier Score Prediction Calibration
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {ticker} ({exchange})
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Empirical mean-squared probability error: BS = (1/N) &times; &Sigma;(p - y)&sup2;. Lower score signifies strictly superior forecasting accuracy.
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-2xl self-start lg:self-center">
          <button
            onClick={() => setViewMode('brier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'brier'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brier Curves
          </button>
          <button
            onClick={() => setViewMode('edge')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'edge'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alpha Edge Spread
          </button>
          <button
            onClick={() => setViewMode('accuracy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'accuracy'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Directional Accuracy %
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Model Brier Score</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 tracking-tight">
            {latest.modelBrier.toFixed(3)}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Improved by {brierImprovement.toFixed(3)} pts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80">
          <div className="flex items-center justify-between text-blue-800 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Market Brier Score</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black font-mono text-blue-700 tracking-tight">
            {latest.marketBrier.toFixed(3)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            Consensus market quote error
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Model Edge vs Market</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
            +{latest.brierEdge.toFixed(3)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {pctBetterThanMarket}% lower error variance
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between text-slate-700 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Hit Rate (Direction)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
            {latest.accuracyPct}%
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Across {latest.contractsCount} resolved predictions
          </div>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full h-[360px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'brier' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="modelBrierGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="marketBrierGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="quarter"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                domain={[0.08, 0.28]}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickFormatter={val => val.toFixed(2)}
              />
              <Tooltip content={<CustomBrierTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
              />
              {/* Uninformative prior threshold (0.250) */}
              <ReferenceLine
                y={0.25}
                stroke="#94a3b8"
                strokeDasharray="4 4"
                label={{
                  value: 'Base-Rate Prior (0.250)',
                  position: 'insideTopRight',
                  fill: '#94a3b8',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />
              <Area
                type="monotone"
                dataKey="marketBrier"
                name="Market Consensus Brier"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#marketBrierGradient)"
              />
              <Area
                type="monotone"
                dataKey="modelBrier"
                name="Model Calibrated Brier (Lower = Better)"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#modelBrierGradient)"
              />
            </AreaChart>
          ) : viewMode === 'edge' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="edgeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="quarter"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                domain={[0, 0.08]}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickFormatter={val => `+${val.toFixed(2)}`}
              />
              <Tooltip content={<CustomBrierTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px', fontWeight: 700 }}
              />
              <Area
                type="monotone"
                dataKey="brierEdge"
                name="Predictive Alpha Edge (Market Brier - Model Brier)"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#edgeGradient)"
              />
            </AreaChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="quarter"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
              />
              <YAxis
                domain={[50, 95]}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickFormatter={val => `${val}%`}
              />
              <Tooltip content={<CustomBrierTooltip />} />
              <ReferenceLine
                y={50}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Coin Flip (50%)', fill: '#ef4444', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="accuracyPct"
                name="Cumulative Directional Accuracy %"
                stroke="#2563eb"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#accGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Explanatory Context Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>
            Brier Score Range: <strong>0.00</strong> (perfect calibration) to <strong>0.25</strong> (uninformative coin toss). Model consistently beats market consensus quotes.
          </span>
        </div>

        <button
          onClick={() => setShowLedger(prev => !prev)}
          className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
        >
          <span>{showLedger ? 'Hide Prediction Ledger' : 'View Resolved Predictions Ledger'}</span>
          {showLedger ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Collapsible Historical Events Ledger */}
      {showLedger && (
        <div className="pt-2 animate-in fade-in duration-200">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Quarter</th>
                  <th className="py-2.5 px-3.5">Resolved Prediction Contract</th>
                  <th className="py-2.5 px-3.5 text-center">Model Prob</th>
                  <th className="py-2.5 px-3.5 text-center">Market Price</th>
                  <th className="py-2.5 px-3.5 text-center">Outcome</th>
                  <th className="py-2.5 px-3.5 text-right">Model Brier</th>
                  <th className="py-2.5 px-3.5 text-right">Market Brier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900">{item.quarter}</td>
                    <td className="py-2.5 px-3.5 font-sans font-medium text-slate-800">
                      {item.resolvedEvent}
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-bold text-emerald-700">
                      {item.modelProb}%
                    </td>
                    <td className="py-2.5 px-3.5 text-center font-bold text-blue-700">
                      {item.marketPrice}¢
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${
                          item.outcome === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.outcome === 1 ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-emerald-700">
                      {item.modelBrier.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-blue-700">
                      {item.marketBrier.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
