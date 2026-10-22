import React, { useState } from 'react';

interface PerformanceAreaChartProps {
  data: { date: string; stockReturn: number; benchmarkReturn: number }[];
  ticker: string;
  exchange: string;
}

export const PerformanceAreaChart: React.FC<PerformanceAreaChartProps> = ({
  data,
  ticker,
  exchange
}) => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const benchmarkName = exchange === 'NSE' || exchange === 'BSE' ? 'NIFTY 50' : 'S&P 500';

  const maxVal = Math.max(...data.map(d => Math.max(d.stockReturn, d.benchmarkReturn)), 10) * 1.15;
  const minVal = Math.min(...data.map(d => Math.min(d.stockReturn, d.benchmarkReturn)), -5) * 1.15;
  const valRange = maxVal - minVal || 1;

  const width = 640;
  const height = 230;

  const getX = (idx: number) => {
    return (idx / (data.length - 1)) * (width - 40) + 20;
  };

  const getY = (val: number) => {
    return height - ((val - minVal) / valRange) * (height - 40) - 20;
  };

  // Stock area & line
  const stockPoints = data.map((d, i) => `${getX(i)},${getY(d.stockReturn)}`).join(' ');
  const stockAreaPath = `M ${getX(0)},${getY(minVal)} L ${stockPoints} L ${getX(data.length - 1)},${getY(minVal)} Z`;
  const stockLinePath = `M ${stockPoints.split(' ').join(' L ')}`;

  // Benchmark line
  const benchLinePath = `M ${data.map((d, i) => `${getX(i)},${getY(d.benchmarkReturn)}`).join(' L ')}`;

  const active = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];
  const alpha = active ? active.stockReturn - active.benchmarkReturn : 0;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            Cumulative Return vs Benchmark Index
          </h3>
          <p className="text-xs text-slate-500 font-medium">{ticker} vs {benchmarkName} Relative Alpha</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block" />
            <span className="text-blue-700">{ticker}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-1 bg-slate-400 rounded-full inline-block" />
            <span className="text-slate-600">{benchmarkName}</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair font-mono"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * (width - 40);
            const step = (width - 40) / (data.length - 1);
            const idx = Math.round(relX / step);
            if (idx >= 0 && idx < data.length) {
              setHoverIdx(idx);
            }
          }}
        >
          <defs>
            <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Zero baseline */}
          <line
            x1="20"
            y1={getY(0)}
            x2={width - 20}
            y2={getY(0)}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={stockAreaPath} fill="url(#stockAreaGrad)" />

          {/* Benchmark line */}
          <path
            d={benchLinePath}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Stock line */}
          <path
            d={stockLinePath}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Date labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 4}
              fontSize="10"
              fontWeight="bold"
              fill="#64748b"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {d.date}
            </text>
          ))}

          {/* Hover highlight circle */}
          {hoverIdx !== null && (
            <g>
              <line
                x1={getX(hoverIdx)}
                y1="10"
                x2={getX(hoverIdx)}
                y2={height - 20}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIdx)}
                cy={getY(data[hoverIdx].stockReturn)}
                r="5"
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {active && (
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs font-mono">
            <span className="font-sans font-bold text-slate-700">{active.date}:</span>
            <span>{ticker}: <strong className="text-blue-700">{active.stockReturn > 0 ? '+' : ''}{active.stockReturn}%</strong></span>
            <span>{benchmarkName}: <strong className="text-slate-700">{active.benchmarkReturn > 0 ? '+' : ''}{active.benchmarkReturn}%</strong></span>
            <span className={`font-bold ${alpha >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              Alpha Gap: {alpha >= 0 ? '+' : ''}{alpha.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
