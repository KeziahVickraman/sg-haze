import React from 'react';
import { PRESET_SCENARIOS, REGIONS, REGION_KEYS } from '../constants/hazeConstants';
import { RegionKey } from '../types/haze';
import { Sparkles, RefreshCw, X, Flame, Shield, AlertOctagon, RotateCcw } from 'lucide-react';

interface SimulationControlsProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulating: boolean;
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onResetToLive: () => void;
  customOverrides: Partial<Record<RegionKey, number>>;
  onChangeOverride: (region: RegionKey, value: number) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isOpen,
  onClose,
  isSimulating,
  selectedScenarioId,
  onSelectScenario,
  onResetToLive,
  customOverrides,
  onChangeOverride,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Haze Stress-Testing & Simulation</h2>
              <p className="text-xs text-slate-400">
                Test hazardous alerts, sirens, and regional heatmaps without waiting for actual smog
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Live vs Simulation Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-200">Current Mode:</div>
              <div className="text-xs font-mono">
                {isSimulating ? (
                  <span className="text-amber-400 font-bold">Simulated Haze Scenario Active</span>
                ) : (
                  <span className="text-emerald-400 font-bold">Live Singapore NEA API Feed</span>
                )}
              </div>
            </div>

            {isSimulating && (
              <button
                type="button"
                onClick={onResetToLive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Return to Live Feed
              </button>
            )}
          </div>

          {/* Preset Historic Scenarios */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
              Historic & Crisis Presets
            </label>

            <div className="grid grid-cols-1 gap-2.5">
              {PRESET_SCENARIOS.map((scenario) => {
                const isSelected = isSimulating && selectedScenarioId === scenario.id;
                const isHazardous = scenario.id === 'historic_2013' || scenario.id === 'west_hotspot';

                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => onSelectScenario(scenario.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/70 text-white ring-1 ring-cyan-500/30'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isHazardous ? (
                          <Flame className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Shield className="w-4 h-4 text-emerald-400" />
                        )}
                        <span className="text-sm font-bold text-slate-100">{scenario.name}</span>
                      </div>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {scenario.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {scenario.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Manual Region Sliders */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Manual Regional PSI Overrides
              </label>
              <span className="text-[11px] text-slate-400">
                Drag to trip &gt;300 hazardous alert
              </span>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {REGION_KEYS.map((k) => {
                const currentVal = customOverrides[k] ?? (isSimulating ? 150 : 65);
                const isOverHazard = currentVal >= 301;

                return (
                  <div key={k} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">
                        {REGIONS[k].displayName} Sector
                      </span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          isOverHazard ? 'text-rose-400' : 'text-slate-300'
                        }`}
                      >
                        {currentVal} PSI {isOverHazard ? '(HAZARDOUS)' : ''}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="20"
                      max="420"
                      step="5"
                      value={currentVal}
                      onChange={(e) => onChangeOverride(k, Number(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onResetToLive}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            Clear simulation & use live data
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
