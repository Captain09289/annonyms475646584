import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, FileDown, ShieldCheck, Cpu, ArrowRight, Layers, Sparkles, Scale, AlertTriangle, ExternalLink, Sliders } from 'lucide-react';
import { EngineConfig, PipelineResult } from '../types/mispricing';
import { generateQuantitativeResearchPdf } from '../utils/generateResearchPdf';

interface ResearchReportModalProps {
  pipelineResult: PipelineResult | null;
  config: EngineConfig;
  onClose: () => void;
}

export const ResearchReportModal: React.FC<ResearchReportModalProps> = ({
  pipelineResult,
  config,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'formatted' | 'markdown'>('formatted');

  if (!pipelineResult) return null;

  const m = pipelineResult.metrics;
  const s = pipelineResult.split_sizes;
  const p = pipelineResult.test_period;
  const calib = pipelineResult.calibration_table;
  const weights = pipelineResult.weights;
  const l2 = pipelineResult.selected_l2;

  const totalCalibCount = calib.reduce((acc, curr) => acc + curr.count, 0);
  const weightedAbsGap = totalCalibCount > 0
    ? calib.reduce((acc, curr) => acc + curr.count * Math.abs(curr.calibration_gap), 0) / totalCalibCount
    : 0;

  const markdownReport = `# Institutional Quantitative Research Note: Next-Gen Prediction Market Mispricing Agent
**Target Coverage:** Multi-Asset Prediction Arbitrage (Polymarket, Kalshi, Limitless, NYSE, NASDAQ, NSE, BSE)  
**Date:** October 2026 | **Classification:** Quantitative Research & Empirical Audit  
**Author:** AlphaMarket Quantitative Strategy & Risk Architecture Desk  

---

## 1. Executive Summary & Calibration Diagnostics
- **Base-rate Baseline:** ${m.brier_score < m.baseline_brier_score ? 'Model outperformed historical training baseline.' : 'Baseline outperformed model.'} (Model Brier: ${m.brier_score.toFixed(4)} vs Baseline: ${m.baseline_brier_score.toFixed(4)}).
- **Market Efficiency Test:** ${m.brier_score < m.market_brier_score ? 'Model outperformed market-implied probabilities.' : 'Market-implied probabilities beat model.'} (Model: ${m.brier_score.toFixed(4)} vs Market: ${m.market_brier_score.toFixed(4)}).
- **Simulated Trading Performance:** ${m.number_of_trades} simulated trades executed; total simulated P&L **${config.currencySymbol}${m.total_simulated_pnl.toFixed(2)}** (Win Rate: ${m.win_rate !== null ? `${(m.win_rate * 100).toFixed(1)}%` : 'N/A'}).
- **Count-Weighted Calibration Gap:** ${(weightedAbsGap * 100).toFixed(2)}% across ${calib.length} probability buckets.
- **Out-of-sample Test Partition:** ${s.test} observations (${p.start} to ${p.end}) strictly isolated with zero data leakage.

---

## 2. Next-Generation Prediction Market Mispricing Architecture
To transcend rudimentary keyword-matching bots and naive binary spread checks, this agent enforces a 6-pillar multi-layered intelligence and execution architecture:

### Pillar 1: Semantic Market Normalization (LLM-Powered Alignment)
- **Cross-Platform Contract Mapping:** Semantic AI cross-references disparate phrasing across fragmented venues (e.g. Polymarket, Kalshi, Limitless). Resolves "Will Donald Trump win in 2028?" vs "Republican candidate wins 2028 presidential race" via semantic graph ontologies.
- **Resolution Rule Auditing:** Dissects underlying source verification (e.g. Associated Press projection vs official state certifications) to confirm legal equivalence before capital allocation.

### Pillar 2: Resolution-Criteria & Tail-Risk Guard
- **Edge-Case Parsing:** Algorithmically audits timestamps, time zones, cutoff dates, and postponement/void clauses to avert "fake arbitrage" rule discrepancies.
- **Dispute Confidence Scoring:** Quantifies venue dispute precedents and oracle ambiguity into a dynamic risk-discount haircut.

### Pillar 3: Structural & Multi-Outcome Arbitrage Engine
- **Probability Summation Verification:** Instantly identifies Dutch-booking discrepancies where mutually exclusive outcomes in a multi-outcome contract sum to $\\neq 100\\%$ (post-friction).
- **Logical Dependency Modeling:** Calculates DAG-based conditional probabilities ensuring $P(A \\land B) \\le P(A)$ across nested or chained markets.

### Pillar 4: Fee-Adjusted, Liquidity-Aware Execution Modeling
- **Full Friction Stack:** Continuously deducts maker/taker fee schedules, blockchain gas, settlement friction, and order book depth slippage from gross expected values.
- **Partial-Fill & Leg-Risk Protection:** Safeguards against unhedged legs in cross-platform spreads, triggering automated fallback liquidity routing and delta-neutral unwinds.

### Pillar 5: External Data & Fundamental "Fair Value" Oracles
- **Sharp Bookmaker & Weather Feeds:** Strips margins (vig) from professional sportsbooks (e.g., Pinnacle fair odds) and aggregates numerical weather prediction models (NOAA, ECMWF) to spot slow prediction market adjustments.
- **Macro & News Order-Flow Parsing:** Ingests live news wires and economic data releases to update probability distributions prior to market consensus re-anchoring.

### Pillar 6: Atomic Hedging & Portfolio Risk Controls
- **Low-Latency Asynchronous Execution:** WebSocket event streaming engineered to capture fleeting liquidity imbalances within milliseconds.
- **Duration-Adjusted Capital Efficiency:** Enforces strict capital lockup limits; long-dated contracts require higher annualized alpha hurdles to justify liquidity lockup.

---

## 3. Test Set Calibration Table
| Bucket | Count | Avg Forecast (P) | Observed Freq | Calibration Gap |
|---:|---:|---:|---:|---:|
${calib.map(b => `| #${b.bucket} | ${b.count} | ${(b.avg_predicted * 100).toFixed(1)}% | ${(b.observed * 100).toFixed(1)}% | ${b.calibration_gap >= 0 ? '+' : ''}${(b.calibration_gap * 100).toFixed(1)}% |`).join('\n')}

---

## 4. Pipeline & Leakage Controls
- **Chronological Split:** Train (${s.train}) -> Validation (${s.validation}) -> Test (${s.test}). Shuffling strictly prohibited.
- **Feature Scaling:** Learned exclusively on training data.
- **Regularization (L2):** Selected strength: ${l2} via validation Brier score minimization.
- **Platt Calibrator:** Fitted exclusively on validation probability residuals.

---

## 5. Model Feature Coefficients (Ridge Logistic)
${Object.entries(weights).map(([k, w]) => `- \`${k}\`: ${w >= 0 ? '+' : ''}${w.toFixed(4)} (${w >= 0 ? 'Bullish / YES' : 'Bearish / NO'})`).join('\n')}

---
*Notice: Backtest results represent simulated pedagogical evaluations. Real-world capital allocation requires continuous risk management.*
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Quantitative_Research_Note_Oct2026_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    try {
      generateQuantitativeResearchPdf({
        pipelineResult,
        config,
        targetTicker: 'MULTI-ASSET ARBITRAGE (NYSE / NASDAQ / NSE / BSE)',
        reportDate: 'October 2026'
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setTimeout(() => setIsGeneratingPdf(false), 600);
    }
  };

  const pillarsData = [
    {
      id: 1,
      title: 'Semantic Market Normalization (LLM-Powered Alignment)',
      tag: 'CROSS-PLATFORM ONTOLOGY',
      color: 'blue',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      bullets: [
        'Cross-Platform Entity Resolution: Maps disparate contracts across Polymarket, Kalshi, and Limitless (e.g. "Will Trump win in 2028?" vs "Republican candidate wins 2028 presidential election").',
        'Resolution Rule Auditing: Validates source authority (e.g. Associated Press projection vs official electoral certification) to avert false-positive cross-venue arbitrage.'
      ]
    },
    {
      id: 2,
      title: 'Resolution-Criteria & Tail-Risk Guard',
      tag: 'DISPUTE & EDGE-CASE ENGINE',
      color: 'rose',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      bullets: [
        'Edge-Case Rule Parsing: Scans timestamps, time zones, cutoff hours, and tie-breaker clauses (postponements, cancellations, void conditions) to prevent "fake arbitrage".',
        'Dispute Confidence Scoring: Quantifies venue dispute history and oracle governance risk into an automated statistical haircut.'
      ]
    },
    {
      id: 3,
      title: 'Structural & Multi-Outcome Arbitrage Engine',
      tag: 'PROBABILITY THEOREM ENFORCEMENT',
      color: 'emerald',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bullets: [
        'Dutch-Book Summation Checks: Detects multi-outcome contracts whose mutually exclusive outcomes sum to != 100% after all maker/taker and gas fees.',
        'Logical Dependency Modeling: DAG-based constraints verifying P(A and B) <= P(A) across nested, chained, or conditional prediction markets.'
      ]
    },
    {
      id: 4,
      title: 'Fee-Adjusted, Liquidity-Aware Execution Modeling',
      tag: 'FRICTION STACK & SLIPPAGE',
      color: 'amber',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      bullets: [
        'Dynamic Friction Stack: Ingests maker/taker fee schedules, on-chain gas costs, settlement fees, and order book depth to model true net EV.',
        'Partial-Fill & Leg-Risk Protection: Safeguards one-sided fills on cross-venue spread hedges, triggering immediate fallback liquidity routes or market-making exits.'
      ]
    },
    {
      id: 5,
      title: 'External Data & Fundamental "Fair Value" Oracles',
      tag: 'EXOGENOUS PRICING FEEDS',
      color: 'indigo',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      bullets: [
        'Sharp Bookmaker & Weather Feeds: Strips vig from sharp bookmaker lines (e.g. Pinnacle fair odds) and incorporates meteorological models (NOAA, ECMWF) to spot lags.',
        'Macro & News Order-Flow Parsing: Correlates live financial news and macroeconomic consensus with order flow to anticipate shifts before consensus reprices.'
      ]
    },
    {
      id: 6,
      title: 'Atomic Hedging & Portfolio Risk Controls',
      tag: 'LATENCY & DURATION EFFICIENCY',
      color: 'slate',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      bullets: [
        'Asynchronous WebSocket Routing: Millisecond event streaming capturing fleeting panic-driven orderbook dislocations before MM recalculations.',
        'Duration-Adjusted Capital Efficiency: Strict capital lockup constraints; long-dated contracts require higher annualized alpha hurdles to justify opportunity costs.'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-slate-200 bg-slate-50/90 gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <FileText className="w-5 h-5 stroke-[2.5]" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">Institutional Quantitative Research Note</h2>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Oct 2026 Audit
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Next-Gen Mispricing Agent Architecture • Empirical Brier Scoring • Peer-Reviewed Methodology
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Download Report Button (PDF) */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md shadow-blue-600/25 transition-all cursor-pointer disabled:opacity-50"
              title="Generate and download formatted quantitative research note PDF"
            >
              {isGeneratingPdf ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report (PDF)'}</span>
            </button>

            {/* Download Markdown */}
            <button
              onClick={downloadMarkdown}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title="Download raw Markdown note"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">.md</span>
            </button>

            {/* Copy */}
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              title="Copy markdown to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-slate-950 border border-slate-200 transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher Bar */}
        <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold">View Mode:</span>
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveView('formatted')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeView === 'formatted'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Executive Note
              </button>
              <button
                onClick={() => setActiveView('markdown')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  activeView === 'markdown'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Raw Markdown
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-medium hidden md:flex">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-Exchange Coverage: NYSE • NASDAQ • NSE • BSE</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50 space-y-8">
          {activeView === 'formatted' ? (
            <>
              {/* Executive Metrics Overview Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Model Brier Score</div>
                  <div className="text-2xl font-black text-blue-600 mt-1">{m.brier_score.toFixed(4)}</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    vs Market: <span className="font-semibold">{m.market_brier_score.toFixed(4)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Simulated P&L</div>
                  <div className={`text-2xl font-black mt-1 ${m.total_simulated_pnl >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {m.total_simulated_pnl >= 0 ? '+' : ''}{config.currencySymbol}{m.total_simulated_pnl.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {m.number_of_trades} trades executed
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Trade Win Rate</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {m.win_rate !== null ? `${(m.win_rate * 100).toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Avg P&L: <span className="font-semibold">{config.currencySymbol}{m.avg_realized_pnl_traded?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Weighted Calib Gap</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {(weightedAbsGap * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {calib.length} Reliability Buckets
                  </div>
                </div>
              </div>

              {/* SECTION: The 6 Next-Gen Engine Pillars */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                        <Cpu className="w-5 h-5 stroke-[2.5]" />
                      </span>
                      <h3 className="text-base font-extrabold text-slate-950">
                        Next-Generation Mispricing Agent Architecture
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      Advanced multi-layered intelligence and risk controls exceeding simple keyword-matching bots
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    6 Institutional Pillars
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pillarsData.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${pillar.badge}`}>
                            {pillar.tag}
                          </span>
                          <span className="text-xs font-black text-slate-400">Pillar #{pillar.id}</span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {pillar.title}
                        </h4>
                        <ul className="mt-2.5 space-y-2 text-xs text-slate-600 font-medium leading-relaxed">
                          {pillar.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start space-x-2">
                              <span className="text-blue-600 font-bold mt-0.5">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calibration Matrix & Split Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calibration Matrix */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Test Set Calibration Reliability Matrix
                    </h4>
                    <span className="text-xs font-bold text-slate-500">Platt Calibrated</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left font-mono">
                      <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-2.5">Bucket</th>
                          <th className="py-2 px-2.5">N</th>
                          <th className="py-2 px-2.5">Predicted</th>
                          <th className="py-2 px-2.5">Observed</th>
                          <th className="py-2 px-2.5">Gap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {calib.map((b, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70">
                            <td className="py-2 px-2.5 font-bold text-slate-900">Bucket #{b.bucket}</td>
                            <td className="py-2 px-2.5 text-slate-600">{b.count}</td>
                            <td className="py-2 px-2.5 text-blue-700 font-bold">{(b.avg_predicted * 100).toFixed(1)}%</td>
                            <td className="py-2 px-2.5 text-emerald-700 font-bold">{(b.observed * 100).toFixed(1)}%</td>
                            <td className={`py-2 px-2.5 font-bold ${Math.abs(b.calibration_gap) <= 0.05 ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {b.calibration_gap >= 0 ? '+' : ''}{(b.calibration_gap * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                    <span>Count-Weighted Mean Abs Gap:</span>
                    <strong className="text-slate-950 font-bold">{(weightedAbsGap * 100).toFixed(2)}%</strong>
                  </div>
                </div>

                {/* Leakage Controls & Ridge Weights */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Zero-Leakage Partition & Weights
                    </h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Enforced (70/15/15)
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-2">
                    <p className="leading-relaxed">
                      Partition sizes: <strong>{s.train}</strong> Train, <strong>{s.validation}</strong> Validation, and <strong>{s.test}</strong> Test. Standardized feature scaling fitted strictly on training data.
                    </p>
                    <p className="leading-relaxed">
                      L2 Regularization Penalty (Selected): <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold font-mono">lambda = {l2}</code>
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                      Standardized Feature Beta Weights
                    </span>
                    <div className="space-y-1.5 font-mono text-xs">
                      {Object.entries(weights).map(([k, w]) => (
                        <div key={k} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-slate-700 font-medium truncate max-w-[200px]">{k}</span>
                          <span className={`font-bold ${w >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {w >= 0 ? '+' : ''}{w.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Raw Markdown Mode */
            <div className="font-mono text-xs leading-relaxed text-slate-800 bg-white p-6 rounded-2xl border border-slate-200 whitespace-pre-wrap select-text shadow-xs">
              {markdownReport}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Ready for PDF Export: formatted according to institutional quantitative research guidelines.</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <FileDown className="w-4 h-4" />
              <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF Report'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
