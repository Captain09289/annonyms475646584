import React, { useState, useMemo } from 'react';
import { Play, CheckCircle, TrendingUp, BarChart3, LineChart as ChartIcon, ShieldAlert, Cpu, FileDown } from 'lucide-react';
import { EngineConfig, HistoricalDataRow, PipelineResult } from '../types/mispricing';
import { runPipeline } from '../engine/mispricingEngine';
import { generateCuratedHistoricalDataset } from '../data/marketData';

interface PipelineBacktestViewProps {
  config: EngineConfig;
  onOpenReport: () => void;
}

export const PipelineBacktestView: React.FC<PipelineBacktestViewProps> = ({
  config,
  onOpenReport
}) => {
  const [scenario, setScenario] = useState<'tech_earnings' | 'synthetic_edge' | 'synthetic_no_edge'>('tech_earnings');
  const [rowCount, setRowCount] = useState<number>(450);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);

  const { datasetRows, featureNames } = useMemo(() => {
    if (scenario === 'tech_earnings') {
      const res = generateCuratedHistoricalDataset(rowCount, 'edge', 42);
      return { datasetRows: res.rows, featureNames: res.featureNames };
    } else if (scenario === 'synthetic_edge') {
      const res = generateCuratedHistoricalDataset(rowCount, 'edge', 99);
      return { datasetRows: res.rows, featureNames: ['Feature x1 (Consensus)', 'Feature x2 (Momentum)'] };
    } else {
      const res = generateCuratedHistoricalDataset(rowCount, 'no_edge', 77);
      return { datasetRows: res.rows, featureNames: ['Feature x1', 'Feature x2'] };
    }
  }, [scenario, rowCount]);

  const executePipeline = () => {
    setIsRunning(true);
    setTimeout(() => {
      try {
        const result = runPipeline(datasetRows, featureNames, config);
        setPipelineResult(result);
      } catch (err: any) {
        console.error(err);
      } finally {
        setIsRunning(false);
      }
    }, 150);
  };

  React.useEffect(() => {
    executePipeline();
  }, [scenario, rowCount]);

  const metrics = pipelineResult?.metrics;
  const calib = pipelineResult?.calibration_table || [];

  return (
    <div className="space-y-8">
      {/* Header and Controls */}
      <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
              <Cpu className="w-6 h-6 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Quantitative Pipeline & Backtest</h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1.5">
            Zero data-leakage chronological split (70/15/15) • L2 regularization sweep • Platt probability calibrator • Brier score baselines.
          </p>
        </div>

        {/* Scenario Selector & Run Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold">
            <span className="text-slate-500 font-semibold">Dataset:</span>
            <select
              value={scenario}
              onChange={e => setScenario(e.target.value as any)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
            >
              <option value="tech_earnings">Global & Indian Earnings (450 Qtrs)</option>
              <option value="synthetic_edge">Synthetic Edge (Market Under-reacts)</option>
              <option value="synthetic_no_edge">Synthetic No-Edge (Efficient Market)</option>
            </select>
          </div>

          <button
            onClick={executePipeline}
            disabled={isRunning}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current text-emerald-400" />
            <span>{isRunning ? 'Fitting Engine...' : 'Run Full Pipeline'}</span>
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            title="Open and Download Quantitative Research Report (PDF)"
          >
            <FileDown className="w-4 h-4 stroke-[2.5]" />
            <span>Research Report & PDF</span>
          </button>
        </div>
      </div>

      {pipelineResult && metrics && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Split Timeline & Leakage Controls */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Chronological Partitioning & Leakage Controls (Lesson 5)
              </span>
              <span className="text-xs text-emerald-700 font-extrabold flex items-center space-x-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <CheckCircle className="w-4 h-4" />
                <span>Zero Data Leakage Enforced</span>
              </span>
            </div>

            {/* Split Progress Bars */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold">Training Phase (70%)</span>
                <div className="text-xl font-extrabold text-slate-950 mt-1">{pipelineResult.split_sizes.train} Observations</div>
                <p className="text-[11px] text-slate-500 mt-1">Feature standardization & model weight learning</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold">Validation Phase (15%)</span>
                <div className="text-xl font-extrabold text-blue-700 mt-1">{pipelineResult.split_sizes.validation} Observations</div>
                <p className="text-[11px] text-slate-500 mt-1">L2 sweep (L2={pipelineResult.selected_l2}) & Platt calibrator fit</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-slate-500 font-bold">Final Test Phase (15%)</span>
                <div className="text-xl font-extrabold text-emerald-700 mt-1">{pipelineResult.split_sizes.test} Observations</div>
                <p className="text-[11px] text-slate-500 mt-1">Untouched evaluation & realistic simulated P&L</p>
              </div>
            </div>
          </div>

          {/* Brier Scoreboard & Baseline Benchmark */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">Model Brier Score</span>
              <div className="text-3xl font-black text-blue-700 mt-1.5">
                {metrics.brier_score.toFixed(4)}
              </div>
              <p className="text-xs text-slate-600 font-medium mt-2">
                Raw: {metrics.raw_brier_score.toFixed(4)} ➔ Calibrated: {metrics.brier_score.toFixed(4)}
              </p>
              <div className="mt-3 text-[11px] text-slate-400">
                Lower score is superior (0.0 = perfect prescience).
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">Base-Rate Baseline Brier</span>
              <div className="text-3xl font-black text-slate-900 mt-1.5">
                {metrics.baseline_brier_score.toFixed(4)}
              </div>
              <div className="mt-2 text-xs font-bold text-emerald-700">
                {metrics.brier_score < metrics.baseline_brier_score
                  ? '✓ Model outperformed Base-Rate Baseline'
                  : '✕ Baseline outperformed Model'}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                Constant forecast based on training set historical frequency.
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-extrabold tracking-wider">Market-Implied Brier</span>
              <div className="text-3xl font-black text-slate-900 mt-1.5">
                {metrics.market_brier_score.toFixed(4)}
              </div>
              <div className="mt-2 text-xs font-bold">
                {metrics.brier_score < metrics.market_brier_score ? (
                  <span className="text-emerald-700">✓ Model beat Market-Implied probabilities</span>
                ) : (
                  <span className="text-amber-700">Market-Implied beats Model (Noise regime)</span>
                )}
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                Forecast from observed orderbook contract price.
              </div>
            </div>
          </div>

          {/* Reliability Diagram & Backtest Results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calibration Table */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Test Set Calibration Table (Lesson 9)
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {config.bucketCount} Probability Buckets
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Bucket</th>
                      <th className="py-2.5 px-3">Count</th>
                      <th className="py-2.5 px-3">Avg Forecast</th>
                      <th className="py-2.5 px-3">Observed</th>
                      <th className="py-2.5 px-3">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {calib.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-bold text-slate-900">Bucket #{b.bucket}</td>
                        <td className="py-2.5 px-3 text-slate-600">{b.count}</td>
                        <td className="py-2.5 px-3 text-blue-700 font-bold">{(b.avg_predicted * 100).toFixed(1)}%</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{(b.observed * 100).toFixed(1)}%</td>
                        <td className={`py-2.5 px-3 font-extrabold ${b.calibration_gap >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {b.calibration_gap >= 0 ? '+' : ''}{(b.calibration_gap * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {calib.length > 0 && (
                <div className="text-xs text-slate-600 pt-3 border-t border-slate-100 flex justify-between font-medium">
                  <span>Count-weighted Mean Absolute Gap:</span>
                  <strong className="text-slate-950 font-bold">
                    {((calib.reduce((acc, curr) => acc + curr.count * Math.abs(curr.calibration_gap), 0) / (calib.reduce((a, b) => a + b.count, 0) || 1)) * 100).toFixed(1)}%
                  </strong>
                </div>
              )}
            </div>

            {/* Backtest Results */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Simulated Backtest Performance
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  Fixed 1 YES Contract
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Trades Taken</span>
                  <div className="text-2xl font-extrabold text-slate-950 mt-1">{metrics.number_of_trades}</div>
                  <span className="text-[10px] text-slate-500">Out of {metrics.number_of_predictions} events</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Total Realized P&L</span>
                  <div className={`text-2xl font-black mt-1 ${metrics.total_simulated_pnl >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {metrics.total_simulated_pnl >= 0 ? '+' : ''}{config.currencySymbol}{metrics.total_simulated_pnl.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Net of {config.currencySymbol}{config.transactionCost} fees</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Win Rate on Trades</span>
                  <div className="text-2xl font-extrabold text-blue-700 mt-1">
                    {metrics.win_rate !== null ? `${(metrics.win_rate * 100).toFixed(1)}%` : 'n/a'}
                  </div>
                  <span className="text-[10px] text-slate-500">Contract resolution = YES</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Avg Realized P&L</span>
                  <div className={`text-2xl font-extrabold mt-1 ${metrics.avg_realized_pnl_traded && metrics.avg_realized_pnl_traded >= 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {metrics.avg_realized_pnl_traded !== null ? `${config.currencySymbol}${metrics.avg_realized_pnl_traded.toFixed(2)}` : 'n/a'}
                  </div>
                  <span className="text-[10px] text-slate-500">Per simulated trade</span>
                </div>
              </div>

              {/* Cumulative P&L Equity Curve */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Cumulative P&L Trajectory
                </span>
                <div className="h-16 w-full bg-slate-50 rounded-2xl p-2 flex items-end space-x-1 border border-slate-200">
                  {pipelineResult.results.filter(r => r.traded).map((r, i) => {
                    const pnl = r.cumulative_pnl || 0;
                    const heightPercent = Math.min(100, Math.max(12, Math.abs(pnl) * 2));
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t transition-all ${pnl >= 0 ? 'bg-emerald-600' : 'bg-rose-500'}`}
                        style={{ height: `${heightPercent}%` }}
                        title={`Trade #${i + 1}: ${config.currencySymbol}${pnl.toFixed(2)}`}
                      />
                    );
                  })}
                  {pipelineResult.results.filter(r => r.traded).length === 0 && (
                    <div className="w-full text-center text-xs text-slate-400 py-3 font-medium">
                      Zero trades executed under current conservative risk thresholds.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
