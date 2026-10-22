import React from 'react';
import { CandlestickDataPoint } from '../../data/stockChartData';

interface TechnicalOscillatorChartProps {
  candles: CandlestickDataPoint[];
  ticker: string;
}

export const TechnicalOscillatorChart: React.FC<TechnicalOscillatorChartProps> = ({
  candles,
  ticker
}) => {
  const visible = candles.slice(-40);
  const currentRsi = visible[visible.length - 1]?.rsi ?? 54;

  const width = 640;
  const height = 140;

  const getX = (idx: number) => {
    return (idx / (visible.length - 1)) * (width - 40) + 20;
  };

  const getY = (val: number) => {
    // RSI 0-100
    return height - (val / 100) * (height - 30) - 15;
  };

  const rsiPath = visible
    .map((c, idx) => {
      const x = getX(idx);
      const y = getY(c.rsi || 50);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  let rsiZone = 'Neutral (40 - 60)';
  let rsiColor = 'text-slate-800';
  if (currentRsi > 70) {
    rsiZone = 'Overbought (> 70)';
    rsiColor = 'text-rose-600';
  } else if (currentRsi < 30) {
    rsiZone = 'Oversold (< 30)';
    rsiColor = 'text-emerald-700';
  } else if (currentRsi >= 60) {
    rsiZone = 'Bullish Momentum (60 - 70)';
    rsiColor = 'text-blue-700';
  }

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            RSI (14) Technical Momentum Oscillator
          </h3>
          <p className="text-xs text-slate-500 font-medium">Overbought & Oversold mean-reversion bands</p>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-slate-500">Current RSI:</div>
          <div className={`text-base font-black font-mono ${rsiColor}`}>
            {currentRsi} <span className="text-[11px] font-sans font-extrabold">({rsiZone})</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto font-mono">
          {/* Overbought Band (70) */}
          <line
            x1="20"
            y1={getY(70)}
            x2={width - 20}
            y2={getY(70)}
            stroke="#f43f5e"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={width - 15} y={getY(70) + 3} fill="#f43f5e" fontSize="9" fontWeight="bold">
            70 OB
          </text>

          {/* Neutral Band (50) */}
          <line
            x1="20"
            y1={getY(50)}
            x2={width - 20}
            y2={getY(50)}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="2 2"
          />

          {/* Oversold Band (30) */}
          <line
            x1="20"
            y1={getY(30)}
            x2={width - 20}
            y2={getY(30)}
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x={width - 15} y={getY(30) + 3} fill="#10b981" fontSize="9" fontWeight="bold">
            30 OS
          </text>

          {/* RSI Path */}
          <path
            d={rsiPath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Latest point */}
          <circle
            cx={getX(visible.length - 1)}
            cy={getY(currentRsi)}
            r="4"
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
};
