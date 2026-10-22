import React, { useState, useMemo } from 'react';
import { CandlestickDataPoint } from '../../data/stockChartData';
import { Maximize2, Eye, EyeOff, BarChart2, TrendingUp } from 'lucide-react';

interface StockCandlestickChartProps {
  candles: CandlestickDataPoint[];
  ticker: string;
  currency: string;
  exchange: string;
}

export const StockCandlestickChart: React.FC<StockCandlestickChartProps> = ({
  candles,
  ticker,
  currency,
  exchange
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [showMA, setShowMA] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'candle' | 'line'>('candle');
  const [range, setRange] = useState<'1M' | '3M' | 'ALL'>('ALL');

  // Filter candles based on range
  const visibleCandles = useMemo(() => {
    if (range === '1M') return candles.slice(-22);
    if (range === '3M') return candles.slice(-66);
    return candles;
  }, [candles, range]);

  const activeCandle = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < visibleCandles.length
    ? visibleCandles[hoverIndex]
    : visibleCandles[visibleCandles.length - 1];

  // Price bounds
  const minPrice = Math.min(...visibleCandles.map(c => c.low));
  const maxPrice = Math.max(...visibleCandles.map(c => c.high));
  const priceRange = maxPrice - minPrice || 1;
  const padding = priceRange * 0.06;
  const chartMin = minPrice - padding;
  const chartMax = maxPrice + padding;
  const chartRange = chartMax - chartMin;

  // Max volume for bottom chart
  const maxVolume = Math.max(...visibleCandles.map(c => c.volume)) || 1;

  // SVG dimensions
  const width = 800;
  const height = 360;
  const volumeHeight = 70;
  const mainHeight = height - volumeHeight - 30;

  const getX = (index: number) => {
    const step = width / visibleCandles.length;
    return index * step + step / 2;
  };

  const getY = (val: number) => {
    return mainHeight - ((val - chartMin) / chartRange) * mainHeight + 15;
  };

  const getVolY = (vol: number) => {
    const fraction = vol / maxVolume;
    return height - fraction * volumeHeight;
  };

  // Generate MA paths
  const ma20Path = useMemo(() => {
    const points: string[] = [];
    visibleCandles.forEach((c, idx) => {
      if (c.ma20) {
        const x = getX(idx);
        const y = getY(c.ma20);
        points.push(`${idx === 0 || points.length === 0 ? 'M' : 'L'} ${x} ${y}`);
      }
    });
    return points.join(' ');
  }, [visibleCandles, chartMin, chartRange]);

  const ma50Path = useMemo(() => {
    const points: string[] = [];
    visibleCandles.forEach((c, idx) => {
      if (c.ma50) {
        const x = getX(idx);
        const y = getY(c.ma50);
        points.push(`${points.length === 0 ? 'M' : 'L'} ${x} ${y}`);
      }
    });
    return points.join(' ');
  }, [visibleCandles, chartMin, chartRange]);

  const linePath = useMemo(() => {
    return visibleCandles.map((c, idx) => {
      const x = getX(idx);
      const y = getY(c.close);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [visibleCandles, chartMin, chartRange]);

  const candleWidth = Math.max(3, Math.min(14, (width / visibleCandles.length) * 0.65));

  const change = activeCandle ? activeCandle.close - activeCandle.open : 0;
  const changePercent = activeCandle && activeCandle.open > 0 ? (change / activeCandle.open) * 100 : 0;

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
      {/* Chart Top Bar with Live OHLC */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg text-slate-950 font-mono">{ticker}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {exchange}
              </span>
              <span className="text-xs font-extrabold text-slate-400">• TradingView Engine</span>
            </div>
            {/* Live OHLC numbers */}
            {activeCandle && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono mt-1">
                <span className="text-slate-500">
                  O: <strong className="text-slate-900">{currency}{activeCandle.open.toFixed(2)}</strong>
                </span>
                <span className="text-slate-500">
                  H: <strong className="text-slate-900">{currency}{activeCandle.high.toFixed(2)}</strong>
                </span>
                <span className="text-slate-500">
                  L: <strong className="text-slate-900">{currency}{activeCandle.low.toFixed(2)}</strong>
                </span>
                <span className="text-slate-500">
                  C: <strong className={change >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    {currency}{activeCandle.close.toFixed(2)}
                  </strong>
                </span>
                <span className={`font-bold ${change >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {change >= 0 ? '+' : ''}{change.toFixed(2)} ({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
                <span className="text-slate-400 text-[11px] font-sans">
                  Date: {activeCandle.date}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls: Chart Type, MA toggle, Range */}
        <div className="flex items-center space-x-2">
          {/* Chart Mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setChartMode('candle')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartMode === 'candle' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                chartMode === 'line' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Line
            </button>
          </div>

          {/* Toggle Moving Averages */}
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
              showMA
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title="Toggle Moving Averages (20 SMA & 50 SMA)"
          >
            <span>MA (20/50)</span>
          </button>

          {/* Range */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            {(['1M', '3M', 'ALL'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  range === r ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible font-mono"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const step = width / visibleCandles.length;
            const idx = Math.floor(relX / step);
            if (idx >= 0 && idx < visibleCandles.length) {
              setHoverIndex(idx);
            }
          }}
        >
          {/* Subtle Gridlines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
            const y = mainHeight * ratio + 15;
            const price = chartMax - ratio * chartRange;
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={width} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <text x={width - 5} y={y - 3} fill="#94a3b8" fontSize="10" textAnchor="end">
                  {currency}{price.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Volume separator */}
          <line
            x1="0"
            y1={height - volumeHeight - 5}
            x2={width}
            y2={height - volumeHeight - 5}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <text x="5" y={height - volumeHeight + 12} fill="#94a3b8" fontSize="9" fontWeight="bold">
            VOLUME
          </text>

          {/* Volume Bars */}
          {visibleCandles.map((c, idx) => {
            const x = getX(idx);
            const isBull = c.close >= c.open;
            const volY = getVolY(c.volume);
            const volHeight = height - volY;

            return (
              <rect
                key={`vol-${idx}`}
                x={x - candleWidth / 2}
                y={volY}
                width={candleWidth}
                height={Math.max(1, volHeight)}
                fill={isBull ? '#10b981' : '#f43f5e'}
                opacity={hoverIndex === idx ? 0.9 : 0.4}
              />
            );
          })}

          {/* Line Mode or Candlestick Mode */}
          {chartMode === 'line' ? (
            <path
              d={linePath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            /* Candlesticks */
            visibleCandles.map((c, idx) => {
              const x = getX(idx);
              const isBull = c.close >= c.open;
              const openY = getY(c.open);
              const closeY = getY(c.close);
              const highY = getY(c.high);
              const lowY = getY(c.low);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));

              const color = isBull ? '#059669' : '#e11d48';

              return (
                <g key={`candle-${idx}`}>
                  {/* Upper and Lower Wick */}
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  {/* Candle Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={color}
                    rx="1"
                  />
                </g>
              );
            })
          )}

          {/* 20 SMA Line */}
          {showMA && ma20Path && (
            <path
              d={ma20Path}
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* 50 SMA Line */}
          {showMA && ma50Path && (
            <path
              d={ma50Path}
              fill="none"
              stroke="#d97706"
              strokeWidth="1.8"
              opacity="0.85"
            />
          )}

          {/* Hover Crosshair */}
          {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < visibleCandles.length && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(hoverIndex)}
                y1="0"
                x2={getX(hoverIndex)}
                y2={height}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Horizontal Crosshair Line */}
              <line
                x1="0"
                y1={getY(visibleCandles[hoverIndex].close)}
                x2={width}
                y2={getY(visibleCandles[hoverIndex].close)}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Price Callout Box */}
              <rect
                x={width - 65}
                y={getY(visibleCandles[hoverIndex].close) - 10}
                width="65"
                height="20"
                fill="#0f172a"
                rx="4"
              />
              <text
                x={width - 5}
                y={getY(visibleCandles[hoverIndex].close) + 4}
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                textAnchor="end"
              >
                {currency}{visibleCandles[hoverIndex].close.toFixed(1)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Legend & MA Indicators */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-slate-700">Bullish Session</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
            <span className="font-semibold text-slate-700">Bearish Session</span>
          </div>
          {showMA && (
            <>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-0.5 bg-blue-600 inline-block" />
                <span className="font-semibold text-blue-700">MA 20</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-4 h-0.5 bg-amber-600 inline-block" />
                <span className="font-semibold text-amber-700">MA 50</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400">
          Move cursor across the chart for interactive OHLC crosshair inspections
        </div>
      </div>
    </div>
  );
};
