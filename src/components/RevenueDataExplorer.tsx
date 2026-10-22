import React, { useState } from 'react';
import { Database, Upload, Download, FileSpreadsheet, Search, CheckCircle, ArrowRight, Table } from 'lucide-react';
import { ACTIVE_CONTRACTS } from '../data/marketData';
import { EngineConfig } from '../types/mispricing';

interface RevenueDataExplorerProps {
  config: EngineConfig;
  onRunCustomCsv: (csvText: string) => void;
}

export const RevenueDataExplorer: React.FC<RevenueDataExplorerProps> = ({
  config,
  onRunCustomCsv
}) => {
  const [selectedExchange, setSelectedExchange] = useState<string>('ALL');
  const [selectedTicker, setSelectedTicker] = useState<string>('ALL');
  const [customCsvText, setCustomCsvText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'historical' | 'upload'>('historical');

  // Flatten past revenues from active contracts
  const allRevenues = ACTIVE_CONTRACTS.flatMap(contract =>
    contract.pastRevenues.map(r => ({
      ticker: contract.ticker,
      company: contract.companyName,
      exchange: contract.exchange,
      currency: contract.currency,
      category: contract.category,
      quarter: r.quarter,
      revenue: r.revenue,
      consensus: r.consensusEstimate,
      beat: r.beat,
      surprisePercent: (((r.revenue - r.consensusEstimate) / r.consensusEstimate) * 100).toFixed(1)
    }))
  );

  const filteredRevenues = allRevenues.filter(r => {
    if (selectedExchange !== 'ALL') {
      if (selectedExchange === 'INDIA' && r.exchange !== 'NSE' && r.exchange !== 'BSE') return false;
      if (selectedExchange === 'US' && r.exchange !== 'NYSE' && r.exchange !== 'NASDAQ') return false;
    }
    if (selectedTicker !== 'ALL' && r.ticker !== selectedTicker) return false;
    return true;
  });

  const tickers = ['ALL', ...Array.from(new Set(ACTIVE_CONTRACTS.map(c => c.ticker)))];

  const sampleCsvTemplate = `timestamp,price,outcome,x1_qoq_rev,x2_analyst_revision
2022-Q1-01,45,1,1.25,0.85
2022-Q1-02,55,0,-0.40,-0.20
2022-Q2-01,62,1,2.10,1.40
2022-Q2-02,38,0,-1.15,-0.90
2022-Q3-01,48,1,0.80,0.50
2022-Q3-02,52,1,1.10,0.75
2022-Q4-01,70,1,2.50,1.80
2022-Q4-02,40,0,-0.90,-0.60
2023-Q1-01,65,1,1.85,1.20
2023-Q1-02,42,0,-0.50,-0.30`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <Database className="w-6 h-6 stroke-[2.5]" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">Financial & Revenue Intelligence</h1>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1.5">
            Historical quarterly revenues, beat/miss surprises across NYSE, NASDAQ, NSE & BSE, and custom CSV dataset ingestion.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'historical'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past Revenues Grid
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom CSV Ingest
          </button>
        </div>
      </div>

      {activeTab === 'historical' && (
        <div className="space-y-6">
          {/* Filter Bar with Exchange selection */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-2">Market:</span>
              <button
                onClick={() => setSelectedExchange('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExchange === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Exchanges
              </button>
              <button
                onClick={() => setSelectedExchange('INDIA')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExchange === 'INDIA'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                NSE & BSE (India)
              </button>
              <button
                onClick={() => setSelectedExchange('US')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedExchange === 'US'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                NYSE & NASDAQ (US)
              </button>
            </div>

            {/* Ticker pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 mr-1 whitespace-nowrap">Ticker:</span>
              {tickers.map(ticker => (
                <button
                  key={ticker}
                  onClick={() => setSelectedTicker(ticker)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTicker === ticker
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {ticker}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Corporate Revenue Track Record ({filteredRevenues.length} Records)
              </h3>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Beat Rate: {((filteredRevenues.filter(r => r.beat).length / (filteredRevenues.length || 1)) * 100).toFixed(0)}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200 font-mono">
                  <tr>
                    <th className="py-3 px-3.5">Exchange</th>
                    <th className="py-3 px-3.5">Ticker</th>
                    <th className="py-3 px-3.5">Company</th>
                    <th className="py-3 px-3.5">Quarter</th>
                    <th className="py-3 px-3.5">Actual Revenue</th>
                    <th className="py-3 px-3.5">Consensus</th>
                    <th className="py-3 px-3.5">Surprise %</th>
                    <th className="py-3 px-3.5">Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredRevenues.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          row.exchange === 'NSE' || row.exchange === 'BSE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {row.exchange}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">{row.ticker}</td>
                      <td className="py-3 px-3.5 text-slate-600 font-sans">{row.company}</td>
                      <td className="py-3 px-3.5 text-slate-800 font-semibold">{row.quarter}</td>
                      <td className="py-3 px-3.5 text-slate-950 font-extrabold">{row.currency}{row.revenue}{row.exchange === 'NSE' || row.exchange === 'BSE' ? 'k Cr' : 'B'}</td>
                      <td className="py-3 px-3.5 text-slate-500">{row.currency}{row.consensus}{row.exchange === 'NSE' || row.exchange === 'BSE' ? 'k Cr' : 'B'}</td>
                      <td className={`py-3 px-3.5 font-extrabold ${Number(row.surprisePercent) >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {Number(row.surprisePercent) >= 0 ? '+' : ''}{row.surprisePercent}%
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          row.beat
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {row.beat ? 'BEAT' : 'MISS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Custom CSV Data Upload & Ingestion
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Columns: <code>timestamp,price,outcome</code> followed by numeric feature columns.
              </p>
            </div>
            <button
              onClick={() => setCustomCsvText(sampleCsvTemplate)}
              className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              Load Example Template
            </button>
          </div>

          <textarea
            value={customCsvText}
            onChange={e => setCustomCsvText(e.target.value)}
            rows={10}
            placeholder={sampleCsvTemplate}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-slate-500 font-medium">
              {customCsvText.trim().split('\n').filter(Boolean).length} rows detected
            </span>
            <button
              onClick={() => onRunCustomCsv(customCsvText)}
              disabled={!customCsvText.trim()}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm disabled:opacity-40 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Ingest & Run Mispricing Engine</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
