import React from 'react';
import { LatestAirQualityData, PSIBandInfo, RegionKey } from '../types/haze';
import { REGIONS, REGION_KEYS } from '../constants/hazeConstants';
import { AlertCircle, ChevronRight, Wind, ShieldCheck, AlertTriangle } from 'lucide-react';

interface RegionCardGridProps {
  data: LatestAirQualityData;
  selectedRegion: RegionKey | 'national';
  onSelectRegion: (region: RegionKey | 'national') => void;
  regionBands: Record<RegionKey, { psi: number; pm25: number; band: PSIBandInfo; isAlertTriggered: boolean }>;
  nationalBand: PSIBandInfo;
  thresholdPsi: number;
}

export const RegionCardGrid: React.FC<RegionCardGridProps> = ({
  data,
  selectedRegion,
  onSelectRegion,
  regionBands,
  nationalBand,
  thresholdPsi,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
            Singapore Regional Air Quality Breakdown
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time pollutant sub-indices calibrated to Singapore National Environment Agency (NEA) standards
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span>Alert threshold:</span>
          <span className="font-mono font-semibold text-rose-400 tabular-nums">&gt; {thresholdPsi} PSI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* National Islandwide Composite Card */}
        <div
          onClick={() => onSelectRegion('national')}
          className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
            selectedRegion === 'national'
              ? 'bg-slate-900 border-white/40 ring-1 ring-white/20'
              : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Subtle top indicator bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: nationalBand.colorHex }}
          />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Composite Summary
              </span>
              <h3 className="text-xl font-bold text-white mt-0.5">Singapore Islandwide</h3>
            </div>

            {/* Unboxed status text */}
            <div className="text-right">
              <span className={`text-xs font-semibold ${nationalBand.textColor}`}>
                {nationalBand.label}
              </span>
              <div className="text-[11px] text-slate-400 font-mono">
                Range {data.national.minPsi} – {data.national.maxPsi}
              </div>
            </div>
          </div>

          {/* Primary Metric */}
          <div className="mt-4 flex items-baseline gap-3">
            <span
              className="text-4xl font-extrabold tracking-tight font-mono tabular-nums"
              style={{ color: nationalBand.colorHex }}
            >
              {data.national.psi24h}
            </span>
            <div className="text-xs text-slate-400 font-mono">
              <div>24-HR PSI PEAK</div>
              <div className="text-slate-300">
                Highest in {REGIONS[data.national.dominantRegion].displayName}
              </div>
            </div>
          </div>

          {/* Sub-readings tabular grid */}
          <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 uppercase font-mono">PM2.5 (24h)</div>
              <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                {data.national.pm25_24h} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
              </div>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 uppercase font-mono">PM10 (24h)</div>
              <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                {data.national.pm10_24h} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
              </div>
            </div>
            <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
              <div className="text-[10px] text-slate-400 uppercase font-mono">O3 Sub-Index</div>
              <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                {data.national.o3_sub_index ?? '--'}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-slate-500" />
              All 5 Sectors Active
            </span>
            <span className="text-sky-400 flex items-center gap-0.5 font-medium group">
              View all telemetry
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* 5 Individual Singapore Regions */}
        {REGION_KEYS.map((key) => {
          const region = REGIONS[key];
          const readings = data.regions[key];
          const bandInfo = regionBands[key]?.band;
          const isTriggered = regionBands[key]?.isAlertTriggered;
          const isSelected = selectedRegion === key;
          const isHazardous = bandInfo?.key === 'hazardous';

          return (
            <div
              key={key}
              onClick={() => onSelectRegion(key)}
              className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 border-white/50 ring-1 ring-white/20 shadow-lg'
                  : isHazardous
                  ? 'bg-rose-950/30 border-rose-600/70 hover:bg-rose-950/40'
                  : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top indicator stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1 transition-all"
                style={{ backgroundColor: bandInfo?.colorHex }}
              />

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Region
                    </span>
                    {isTriggered && (
                      <span className="text-[10px] font-bold text-rose-400 flex items-center gap-0.5 font-mono">
                        <AlertTriangle className="w-3 h-3" />
                        ALERT TRIGGERED
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {region.displayName}
                  </h3>
                </div>

                {/* Status label without pills */}
                <div className="text-right">
                  <span
                    className="text-xs font-semibold block"
                    style={{ color: bandInfo?.colorHex }}
                  >
                    {bandInfo?.label}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {readings.pm25_24h > 55 ? 'Elevated PM2.5' : 'Normal PM2.5'}
                  </span>
                </div>
              </div>

              {/* Big PSI Number */}
              <div className="mt-4 flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-4xl font-extrabold tracking-tight font-mono tabular-nums"
                    style={{ color: bandInfo?.colorHex }}
                  >
                    {readings.psi24h}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">24-HR PSI</span>
                </div>

                {/* Mask advisory indicator */}
                {bandInfo?.maskRecommended && (
                  <span className="text-[11px] text-rose-300 font-medium flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    N95 Advised
                  </span>
                )}
              </div>

              {/* Major Towns served */}
              <div className="mt-2 text-[11px] text-slate-400 truncate">
                {region.majorTowns.slice(0, 4).join(' · ')}
              </div>

              {/* Pollutant metrics grid */}
              <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">PM2.5</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                    {readings.pm25_24h} <span className="text-[10px] text-slate-500 font-normal">µg</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">PM10</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                    {readings.pm10_24h} <span className="text-[10px] text-slate-500 font-normal">µg</span>
                  </div>
                </div>
                <div className="bg-slate-950/40 rounded-lg p-1.5 border border-slate-800/60">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">CO 8h</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono tabular-nums mt-0.5">
                    {readings.co_8h_max ?? '--'} <span className="text-[10px] text-slate-500 font-normal">mg</span>
                  </div>
                </div>
              </div>

              {/* Health Advisory preview line */}
              <div className="mt-3 pt-2 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
                <span className="truncate max-w-[200px]">
                  {bandInfo?.generalAdvisory}
                </span>
                <span className="text-sky-400 flex items-center gap-0.5 font-medium shrink-0 ml-2">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
