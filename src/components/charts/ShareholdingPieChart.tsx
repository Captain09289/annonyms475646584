import React, { useState } from 'react';
import { ShareholdingSlice } from '../../data/stockChartData';

interface ShareholdingPieChartProps {
  slices: ShareholdingSlice[];
  ticker: string;
}

export const ShareholdingPieChart: React.FC<ShareholdingPieChartProps> = ({
  slices,
  ticker
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const size = 260;
  const radius = 95;
  const innerRadius = 55;
  const center = size / 2;

  // Convert slices to SVG arcs
  let accumulatedAngle = 0;
  const arcs = slices.map((slice, idx) => {
    const angle = (slice.percentage / 100) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;

    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const x1 = center + radius * Math.cos(toRad(startAngle));
    const y1 = center + radius * Math.sin(toRad(startAngle));
    const x2 = center + radius * Math.cos(toRad(endAngle));
    const y2 = center + radius * Math.sin(toRad(endAngle));

    const x3 = center + innerRadius * Math.cos(toRad(endAngle));
    const y3 = center + innerRadius * Math.sin(toRad(endAngle));
    const x4 = center + innerRadius * Math.cos(toRad(startAngle));
    const y4 = center + innerRadius * Math.sin(toRad(startAngle));

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      pathData,
      slice,
      idx
    };
  });

  const activeSlice = hoverIndex !== null ? slices[hoverIndex] : null;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">
            Shareholding Pattern & Institutional Ownership
          </h3>
          <p className="text-xs text-slate-500 font-medium">Promoters, Foreign FIIs & Domestic Mutual Funds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG Donut / Pie */}
        <div className="md:col-span-5 flex justify-center relative">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="overflow-visible select-none cursor-pointer"
            onMouseLeave={() => setHoverIndex(null)}
          >
            {arcs.map(({ pathData, slice, idx }) => {
              const isHovered = hoverIndex === idx;
              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={slice.color}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="transition-all duration-150"
                  style={{
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                    transformOrigin: `${center}px ${center}px`,
                    opacity: hoverIndex === null || isHovered ? 1 : 0.65
                  }}
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}

            {/* Inner Center Info */}
            <circle cx={center} cy={center} r={innerRadius - 4} fill="#ffffff" />
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              fontSize="12"
              fontWeight="bold"
              fill="#64748b"
              fontFamily="sans-serif"
            >
              {activeSlice ? 'STAKE' : 'OWNERSHIP'}
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              fontSize="17"
              fontWeight="900"
              fill="#0f172a"
              fontFamily="monospace"
            >
              {activeSlice ? `${activeSlice.percentage}%` : '100%'}
            </text>
          </svg>
        </div>

        {/* Legend Table */}
        <div className="md:col-span-7 space-y-2.5">
          {slices.map((slice, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered ? 'bg-slate-50 border-slate-300 shadow-xs' : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs font-bold text-slate-800">{slice.category}</span>
                </div>
                <div className="font-mono font-black text-sm text-slate-950">
                  {slice.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
