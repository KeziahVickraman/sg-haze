import React from 'react';
import { RefreshCw, Bell, Activity, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'overview' | 'map' | 'trends' | 'advisory' | 'log';
  setActiveTab: (tab: 'overview' | 'map' | 'trends' | 'advisory' | 'log') => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  isSimulation: boolean;
  onOpenSettings: () => void;
  onOpenSimulator: () => void;
  hasActiveHazard: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isRefreshing,
  onRefresh,
  isSimulation,
  onOpenSettings,
  onOpenSimulator,
  hasActiveHazard,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
            }}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
            SG HazeWatch
          </a>

          {isSimulation && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
              <Sparkles className="w-3 h-3" />
              Simulation Active
            </span>
          )}
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-white bg-slate-800/90 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'map'
                ? 'text-white bg-slate-800/90 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Regional Map
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'trends'
                ? 'text-white bg-slate-800/90 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            24h Trends
          </button>
          <button
            onClick={() => setActiveTab('advisory')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'advisory'
                ? 'text-white bg-slate-800/90 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Health Advisory
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'log'
                ? 'text-white bg-slate-800/90 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            Alert History
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Simulate Haze Spike button */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 transition-colors whitespace-nowrap"
            title="Test hazard threshold alerts with historical or custom scenarios"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Stress Test /</span> Simulate
          </button>

          {/* Alert Configuration */}
          <button
            onClick={onOpenSettings}
            className={`relative p-2 rounded-lg border transition-colors ${
              hasActiveHazard
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Configure air quality hazard thresholds and siren"
            aria-label="Alert settings"
          >
            <Bell className="w-4 h-4" />
            {hasActiveHazard && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            )}
          </button>

          {/* Live Sync / Refresh */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50 transition-colors whitespace-nowrap shadow-sm shadow-rose-900/30"
            title="Fetch live NEA Singapore data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Live Refresh</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/60 bg-slate-950/95 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-2.5 py-1 rounded ${activeTab === 'overview' ? 'text-white bg-slate-800' : 'text-slate-400'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`px-2.5 py-1 rounded ${activeTab === 'map' ? 'text-white bg-slate-800' : 'text-slate-400'}`}
        >
          Map
        </button>
        <button
          onClick={() => setActiveTab('trends')}
          className={`px-2.5 py-1 rounded ${activeTab === 'trends' ? 'text-white bg-slate-800' : 'text-slate-400'}`}
        >
          24h Trends
        </button>
        <button
          onClick={() => setActiveTab('advisory')}
          className={`px-2.5 py-1 rounded ${activeTab === 'advisory' ? 'text-white bg-slate-800' : 'text-slate-400'}`}
        >
          Advisory
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`px-2.5 py-1 rounded ${activeTab === 'log' ? 'text-white bg-slate-800' : 'text-slate-400'}`}
        >
          Alerts
        </button>
      </div>
    </header>
  );
};
