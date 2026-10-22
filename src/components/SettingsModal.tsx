import React from 'react';
import { X, Settings, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { EngineConfig } from '../types/mispricing';
import { DEFAULT_CONFIG } from '../engine/mispricingEngine';

interface SettingsModalProps {
  config: EngineConfig;
  setConfig: React.Dispatch<React.SetStateAction<EngineConfig>>;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  setConfig,
  onClose
}) => {
  const updateField = (key: keyof EngineConfig, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const resetDefaults = () => {
    setConfig(DEFAULT_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-2xl bg-slate-900 text-white">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-950">Engine Assumptions & Calibration Settings</h2>
              <p className="text-xs text-slate-500 font-medium">Quantitative risk assumptions & parameter tuning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white text-slate-500 hover:text-slate-950 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-5 text-xs text-slate-700">
          {/* Currency & Payout */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Contract Payout ({config.currencySymbol})</label>
              <input
                type="number"
                min="1"
                value={config.payout}
                onChange={e => updateField('payout', Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Transaction Friction ({config.currencySymbol})</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={config.transactionCost}
                onChange={e => updateField('transactionCost', Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Gap & Min Net EV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-slate-600 font-bold block mb-1">Probability Gap Threshold (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={(config.gapThreshold * 100).toFixed(0)}
                onChange={e => updateField('gapThreshold', Number(e.target.value) / 100)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="text-slate-600 font-bold block mb-1">Minimum Net EV ({config.currencySymbol})</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={config.minNetEv}
                onChange={e => updateField('minNetEv', Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Uncertainty Margin */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-700 font-bold">Illustrative Uncertainty Margin (Lesson 14)</label>
              <span className="text-amber-700 font-mono font-extrabold">{(config.uncertaintyMargin * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.25"
              step="0.01"
              value={config.uncertaintyMargin}
              onChange={e => updateField('uncertaintyMargin', Number(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 h-2.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 font-medium">
              Conservative buffer applied to model forecasts before checking positive conservative EV.
            </p>
          </div>

          {/* Calibration toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-extrabold text-slate-900 block">Use Platt Probability Calibration</span>
              <span className="text-[11px] text-slate-500 font-medium">Fits logistic scaling on validation log-odds</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.useCalibration}
                onChange={e => updateField('useCalibration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex justify-between items-center">
          <button
            onClick={resetDefaults}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-slate-600 hover:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-sm cursor-pointer"
          >
            Save Assumptions
          </button>
        </div>
      </div>
    </div>
  );
};
