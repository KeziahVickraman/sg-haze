import React, { useState } from 'react';
import { HourlyTrendPoint, RegionKey } from '../types/haze';
import { REGIONS, REGION_KEYS } from '../constants/hazeConstants';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

interface TrendChartProps {
  history: HourlyTrendPoint[];
  thresholdPsi: number;
}

const REGION_COLORS: Record<RegionKey | 'nationalMax', { stroke: string; label: string }> = {
  nationalMax: { stroke: '#f43f5e', label: 'National Peak' },
  central: { stroke: '#38bdf8', label: 'Central' },
  west: { stroke: '#a855f7', label: 'West' },
  south: { stroke: '#f59e0b', label: 'South' },
  east: { stroke: '#10b981', label: 'East' },
  north: { stroke: '#06b6d4', label: 'North' },
};

export const TrendChart: React.FC<TrendChartProps> = ({ history, thresholdPsi }) => {
  const [activeRegions, setActiveRegions] = useState<Record<string, boolean>>({
    nationalMax: true,
    central: true,
    west: true,
    south: true,
    east: true,
    north: true,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (history.length === 0) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-8 text-center text-slate-400">
        Loading historical 24-hour air quality trends...
      </div>
    );
  }

  // Calculate chart boundaries
  const allValues = history.flatMap((p) => [
    p.north,
    p.south,
    p.east,
    p.west,
    p.central,
    p.nationalMax,
  ]);
  const maxValue = Math.max(...allValues, thresholdPsi + 20, 120);
  const minValue = Math.max(0, Math.min(...allValues) - 10);

  // SVG chart dimensions
  const width = 800;
  const height = 320;
  const padding = { top: 30, right: 30, bottom: 40, left: 45 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const getX = (index: number) => {
    if (history.length <= 1) return padding.left;
    return padding.left + (index / (history.length - 1)) * graphWidth;
  };

  const getY = (val: number) => {
    const range = maxValue - minValue || 1;
    return padding.top + graphHeight - ((val - minValue) / range) * graphHeight;
  };

  const createPath = (key: RegionKey | 'nationalMax') => {
    return history
      .map((p, idx) => {
        const val = key === 'nationalMax' ? p.nationalMax : p[key];
        const x = getX(idx);
        const y = getY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const toggleRegion = (key: string) => {
    setActiveRegions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hoveredPoint = hoveredIndex !== null ? history[hoveredIndex] : null;

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-5 lg:p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            24-Hour Regional PSI Trends
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Hourly tracking across Singapore sectors with hazardous (&gt;300) and unhealthy (&gt;100) reference lines
          </p>
        </div>

        {/* Legend buttons with show/hide toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(REGION_COLORS).map(([key, config]) => {
            const isVisible = activeRegions[key];
            return (
              <button
                key={key}
                onClick={() => toggleRegion(key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors font-medium border ${
                  isVisible
                    ? 'bg-slate-950/80 border-slate-700 text-slate-200'
                    : 'bg-slate-950/30 border-slate-800/50 text-slate-500 opacity-60'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: config.stroke }}
                />
                <span>{config.label}</span>
                {isVisible ? (
                  <Eye className="w-3 h-3 text-slate-400 ml-0.5" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-600 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Multi-Line Chart Canvas */}
      <div className="relative w-full aspect-[21/9] min-h-[280px] bg-slate-950/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Horizontal grid lines & Y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(minValue + (maxValue - minValue) * ratio);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  className="font-mono tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Unhealthy Threshold Line (101 PSI) if in range */}
          {maxValue >= 100 && (
            <g>
              <line
                x1={padding.left}
                y1={getY(101)}
                x2={width - padding.right}
                y2={getY(101)}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4,4"
                strokeOpacity="0.8"
              />
              <text
                x={width - padding.right}
                y={getY(101) - 5}
                fill="#f59e0b"
                fontSize="10"
                textAnchor="end"
                className="font-mono font-medium"
              >
                101 PSI (Unhealthy Threshold)
              </text>
            </g>
          )}

          {/* Hazardous Threshold Line (301 PSI) if in range */}
          {maxValue >= 300 && (
            <g>
              <line
                x1={padding.left}
                y1={getY(301)}
                x2={width - padding.right}
                y2={getY(301)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="6,4"
              />
              <text
                x={width - padding.right}
                y={getY(301) - 5}
                fill="#ef4444"
                fontSize="10"
                textAnchor="end"
                className="font-mono font-bold"
              >
                301 PSI (HAZARDOUS SAFETY LIMIT)
              </text>
            </g>
          )}

          {/* Configured Alert Threshold Line if different */}
          {thresholdPsi !== 101 && thresholdPsi !== 301 && thresholdPsi <= maxValue && (
            <g>
              <line
                x1={padding.left}
                y1={getY(thresholdPsi)}
                x2={width - padding.right}
                y2={getY(thresholdPsi)}
                stroke="#ec4899"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left + 5}
                y={getY(thresholdPsi) - 4}
                fill="#ec4899"
                fontSize="9"
                className="font-mono"
              >
                Custom Alert Target ({thresholdPsi} PSI)
              </text>
            </g>
          )}

          {/* Paths for each active region */}
          {(Object.keys(REGION_COLORS) as Array<RegionKey | 'nationalMax'>).map((key) => {
            if (!activeRegions[key]) return null;
            const config = REGION_COLORS[key];
            const isNational = key === 'nationalMax';

            return (
              <path
                key={key}
                d={createPath(key)}
                fill="none"
                stroke={config.stroke}
                strokeWidth={isNational ? 2.5 : 1.8}
                strokeDasharray={isNational ? '4,2' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            );
          })}

          {/* Vertical scrub line on hover */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={padding.top}
                x2={getX(hoveredIndex)}
                y2={height - padding.bottom}
                stroke="#94a3b8"
                strokeWidth="1.5"
                strokeDasharray="2,2"
              />
              {/* Dots on each active series */}
              {(Object.keys(REGION_COLORS) as Array<RegionKey | 'nationalMax'>).map((key) => {
                if (!activeRegions[key]) return null;
                const p = history[hoveredIndex];
                const val = key === 'nationalMax' ? p.nationalMax : p[key];
                return (
                  <circle
                    key={key}
                    cx={getX(hoveredIndex)}
                    cy={getY(val)}
                    r="4"
                    fill={REGION_COLORS[key].stroke}
                    stroke="#0f172a"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* Invisible interactive vertical touch/hover columns */}
          {history.map((_, idx) => {
            const colWidth = graphWidth / Math.max(1, history.length - 1);
            return (
              <rect
                key={idx}
                x={getX(idx) - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={graphHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(idx)}
              />
            );
          })}

          {/* X Axis Time Labels */}
          {history.map((p, idx) => {
            // Show every 3rd or 4th label to prevent clutter
            if (idx % 4 !== 0 && idx !== history.length - 1) return null;
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 12}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
                className="font-mono tabular-nums"
              >
                {p.timeLabel}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip floating box */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="absolute top-3 pointer-events-none bg-slate-900/95 border border-slate-700/90 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs space-y-1.5 z-20 min-w-[210px]"
            style={{
              left: Math.min(
                Math.max(16, (getX(hoveredIndex) / width) * 100),
                70
              ) + '%',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-semibold text-slate-200">SGT {hoveredPoint.timeLabel}</span>
              <span className="text-[11px] text-slate-400 font-mono">
                Peak: <strong className="text-rose-400 font-bold">{hoveredPoint.nationalMax}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[11px] pt-1">
              {REGION_KEYS.map((k) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-400 capitalize">{REGIONS[k].displayName}:</span>
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: REGION_COLORS[k].stroke }}
                  >
                    {hoveredPoint[k]} PSI
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer explanation */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div>
          Data synchronized from Singapore NEA automated ambient telemetry sensors
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Unhealthy (&gt;100)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> Hazardous (&gt;300)
          </span>
        </div>
      </div>
    </div>
  );
};
