import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ScannerView } from './components/ScannerView';
import { OpportunityCalculator } from './components/OpportunityCalculator';
import { PipelineBacktestView } from './components/PipelineBacktestView';
import { RevenueDataExplorer } from './components/RevenueDataExplorer';
import { StockQuantHub } from './components/StockQuantHub';
import { ContractDetailModal } from './components/ContractDetailModal';
import { ResearchReportModal } from './components/ResearchReportModal';
import { SettingsModal } from './components/SettingsModal';
import { ACTIVE_CONTRACTS, generateCuratedHistoricalDataset } from './data/marketData';
import { DEFAULT_CONFIG, runPipeline } from './engine/mispricingEngine';
import { EngineConfig, PredictionContract, PipelineResult } from './types/mispricing';
import { AlertCircle, ShieldCheck, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'calculator' | 'pipeline' | 'data' | 'stockQuant'>('scanner');
  const [config, setConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
  const [selectedExchangeFilter, setSelectedExchangeFilter] = useState<'ALL' | 'US' | 'INDIA'>('ALL');
  const [selectedContract, setSelectedContract] = useState<PredictionContract | null>(null);
  const [calculatorInputs, setCalculatorInputs] = useState<{ price: number; modelP: number }>({ price: 40, modelP: 0.60 });
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [cachedPipelineResult, setCachedPipelineResult] = useState<PipelineResult | null>(null);

  // Initialize pipeline baseline
  useEffect(() => {
    try {
      const { rows, featureNames } = generateCuratedHistoricalDataset(450, 'edge', 42);
      const res = runPipeline(rows, featureNames, config);
      setCachedPipelineResult(res);
    } catch (e) {
      console.error('Initial pipeline error:', e);
    }
  }, [config]);

  const handleSendToCalculator = (price: number, modelP: number) => {
    setCalculatorInputs({ price, modelP });
    setActiveTab('calculator');
    if (selectedContract) {
      setSelectedContract(null);
    }
  };

  const handleRunCustomCsv = (csvText: string) => {
    setActiveTab('pipeline');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        setConfig={setConfig}
        selectedExchangeFilter={selectedExchangeFilter}
        setSelectedExchangeFilter={setSelectedExchangeFilter}
        onOpenReport={() => setShowReportModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      {/* Financial Mission & Exchange Notice Banner */}
      <div className="bg-white border-b border-slate-200/90 py-2.5 px-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-medium gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong className="text-slate-950 font-bold">AlphaMarket Engine:</strong> Active monitoring across <strong>NYSE</strong>, <strong>NASDAQ</strong>, <strong>NSE (National Stock Exchange of India)</strong> & <strong>BSE (Bombay Stock Exchange)</strong>.
            </span>
          </div>
          <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
            <span>Pedagogical Quantitative Framework (Lessons 1–20)</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">Platt Calibration Active</span>
          </div>
        </div>
      </div>

      {/* Main Content Area - Generous, spacious padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'scanner' && (
          <ScannerView
            contracts={ACTIVE_CONTRACTS}
            config={config}
            selectedExchangeFilter={selectedExchangeFilter}
            setSelectedExchangeFilter={setSelectedExchangeFilter}
            onSelectContract={contract => setSelectedContract(contract)}
            onSendToCalculator={handleSendToCalculator}
          />
        )}

        {activeTab === 'calculator' && (
          <OpportunityCalculator
            config={config}
            initialPrice={calculatorInputs.price}
            initialModelP={calculatorInputs.modelP}
          />
        )}

        {activeTab === 'pipeline' && (
          <PipelineBacktestView
            config={config}
            onOpenReport={() => setShowReportModal(true)}
          />
        )}

        {activeTab === 'data' && (
          <RevenueDataExplorer
            config={config}
            onRunCustomCsv={handleRunCustomCsv}
          />
        )}

        {activeTab === 'stockQuant' && (
          <StockQuantHub
            config={config}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-slate-900">AlphaMarket Engine</span>
            <span>•</span>
            <span>Prediction Market Mispricing & Alpha Screener</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-600 font-semibold text-[11px]">
            <span>Contract Payout: {config.currencySymbol}{config.payout}</span>
            <span>•</span>
            <span>Transaction Friction: {config.currencySymbol}{config.transactionCost}</span>
            <span>•</span>
            <span>Conservative Haircut: {(config.uncertaintyMargin * 100).toFixed(0)}%</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedContract && (
        <ContractDetailModal
          contract={selectedContract}
          config={config}
          onClose={() => setSelectedContract(null)}
          onSendToCalculator={handleSendToCalculator}
        />
      )}

      {showReportModal && (
        <ResearchReportModal
          pipelineResult={cachedPipelineResult}
          config={config}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          config={config}
          setConfig={setConfig}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
