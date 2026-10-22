import React, { useState } from 'react';
import { QuarterlyFinancialBar } from '../../data/stockChartData';

interface RevenueColumnChartProps {
  data: QuarterlyFinancialBar[];
  currency: string;
  ticker: string;
}

export const RevenueColumnChart: React.FC<RevenueColumnChartProps> = ({
  data,
  currency,
  ticker
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...data.map(d => d.revenue)) * 1.15 || 1;
  const width = 640;
  const height = 260;
  const chartHeight = 200;

  const barGroupWidth = width / data.length;
  const barWidth = barGroupWidth * 0.32;

  const getRevY = (val: number) => {
    return chartHeight - (val / maxRevenue) * chartHeight + 20;
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            Quarterly Revenue & Net Profit Columns
          </h3>
          <p className="text-xs text-slate-500 font-medium">8-Quarter financial trend & margin evolution</p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-600 inline-block" />
            <span className="text-slate-700">Revenue</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
            <span className="text-slate-700">Net Profit</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-pointer"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal gridlines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = chartHeight * (1 - ratio) + 20;
            const val = maxRevenue * ratio;
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={width - 5} y={y - 4} fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="monospace">
                  {currency}{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Render Column Pairs */}
          {data.map((d, idx) => {
            const groupX = idx * barGroupWidth;
            const revX = groupX + barGroupWidth * 0.16;
            const profitX = revX + barWidth + 4;

            const revY = getRevY(d.revenue);
            const profitY = getRevY(d.profit);

            const isHovered = hoverIndex === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                className="transition-all"
              >
                {/* Background hover highlight */}
                {isHovered && (
                  <rect
                    x={groupX + 4}
                    y="10"
                    width={barGroupWidth - 8}
                    height={chartHeight + 15}
                    fill="#f8fafc"
                    rx="8"
                  />
                )}

                {/* Revenue Bar (Blue) */}
                <rect
                  x={revX}
                  y={revY}
                  width={barWidth}
                  height={chartHeight - revY + 20}
                  fill="#2563eb"
                  rx="3"
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Profit Bar (Emerald) */}
                <rect
                  x={profitX}
                  y={profitY}
                  width={barWidth}
                  height={chartHeight - profitY + 20}
                  fill="#059669"
                  rx="3"
                  opacity={isHovered ? 1 : 0.85}
                />

                {/* Quarter Label */}
                <text
                  x={groupX + barGroupWidth / 2}
                  y={chartHeight + 36}
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {d.quarter}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div className="mt-2 p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-mono animate-in fade-in duration-150">
            <div>
              <span className="font-sans font-bold text-slate-300 mr-2">{data[hoverIndex].quarter}:</span>
              <span>Revenue: <strong className="text-blue-400">{currency}{data[hoverIndex].revenue}</strong></span>
              <span className="mx-2 text-slate-600">•</span>
              <span>Profit: <strong className="text-emerald-400">{currency}{data[hoverIndex].profit}</strong></span>
            </div>
            <div className="font-bold text-emerald-300">
              Net Margin: {data[hoverIndex].margin}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
