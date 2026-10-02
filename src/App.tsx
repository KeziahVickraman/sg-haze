/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActiveAlert,
  AlertHistoryLog,
  AlertThresholdConfig,
  HourlyTrendPoint,
  LatestAirQualityData,
  PSIBandInfo,
  RegionKey,
} from './types/haze';
import { REGIONS, REGION_KEYS, getPSIBand } from './constants/hazeConstants';
import {
  fetchLiveAirQualityData,
  fetchHourlyHistory,
  createSimulatedData,
} from './services/neaApi';
import { audioAlert } from './services/audioAlert';
import { TopNav } from './components/TopNav';
import { HazardAlertBanner } from './components/HazardAlertBanner';
import { SingaporeMap } from './components/SingaporeMap';
import { RegionCardGrid } from './components/RegionCardGrid';
import { TrendChart } from './components/TrendChart';
import { RegionDetailModal } from './components/RegionDetailModal';
import { AlertSettingsModal } from './components/AlertSettingsModal';
import { SimulationControls } from './components/SimulationControls';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { AlertHistoryLogSection } from './components/AlertHistoryLog';
import {
  ShieldAlert,
  AlertOctagon,
  Clock,
  Sparkles,
  Wind,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Navigation & View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'trends' | 'advisory' | 'log'>('overview');

  // Selected Region for Deep Inspection ('national' or one of the 5 regions)
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | 'national'>('national');

  // Live Data State
  const [data, setData] = useState<LatestAirQualityData | null>(null);
  const [history, setHistory] = useState<HourlyTrendPoint[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('historic_2013');
  const [customOverrides, setCustomOverrides] = useState<Partial<Record<RegionKey, number>>>({});

  // Alert Settings
  const [alertConfig, setAlertConfig] = useState<AlertThresholdConfig>({
    enabled: true,
    thresholdPsi: 101, // Alerts for Unhealthy & Hazardous
    targetRegion: 'all',
    soundEnabled: true,
    browserNotificationsEnabled: false,
    autoSnoozeMinutes: 15,
  });

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);

  // Audio Siren & Notification State
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [alertLogs, setAlertLogs] = useState<AlertHistoryLog[]>([]);

  // 1. Initial Load & Background Auto-Polling
  const loadLiveData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [liveData, hourlyPoints] = await Promise.all([
        fetchLiveAirQualityData(),
        fetchHourlyHistory(),
      ]);
      setData(liveData);
      setHistory(hourlyPoints);
      setLastRefreshedAt(new Date());
      setIsBannerDismissed(false);
    } catch {
      // Handled inside fetch service
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData();

    // Auto-refresh every 5 minutes if not in simulation mode
    const interval = setInterval(() => {
      if (!isSimulating) {
        loadLiveData();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [loadLiveData, isSimulating]);

  // 2. Handle Simulation Updates
  const applySimulation = useCallback(
    (scenarioId: string, overrides?: Partial<Record<RegionKey, number>>) => {
      setIsSimulating(true);
      setSelectedScenarioId(scenarioId);
      const simulated = createSimulatedData(scenarioId, overrides);
      setData(simulated);
      setIsBannerDismissed(false);
    },
    []
  );

  const handleResetToLive = () => {
    setIsSimulating(false);
    setCustomOverrides({});
    loadLiveData();
  };

  const handleOverrideChange = (region: RegionKey, val: number) => {
    const updated = { ...customOverrides, [region]: val };
    setCustomOverrides(updated);
    applySimulation(selectedScenarioId, updated);
  };

  // 3. Compute Regional Bands & Status
  const regionBands = useMemo(() => {
    if (!data) return {} as Record<RegionKey, { psi: number; pm25: number; band: PSIBandInfo; isAlertTriggered: boolean }>;

    const map: Record<RegionKey, { psi: number; pm25: number; band: PSIBandInfo; isAlertTriggered: boolean }> = {} as Record<
      RegionKey,
      { psi: number; pm25: number; band: PSIBandInfo; isAlertTriggered: boolean }
    >;

    for (const key of REGION_KEYS) {
      const readings = data.regions[key];
      const band = getPSIBand(readings.psi24h);
      const isTargeted = alertConfig.targetRegion === 'all' || alertConfig.targetRegion === key;
      const isAlertTriggered = alertConfig.enabled && isTargeted && readings.psi24h >= alertConfig.thresholdPsi;

      map[key] = {
        psi: readings.psi24h,
        pm25: readings.pm25_24h,
        band,
        isAlertTriggered,
      };
    }
    return map;
  }, [data, alertConfig]);

  const nationalBand = useMemo(() => {
    if (!data) return getPSIBand(50);
    return getPSIBand(data.national.psi24h);
  }, [data]);

  // 4. Calculate Active Threshold Alerts
  const activeAlerts = useMemo<ActiveAlert[]>(() => {
    if (!data || !alertConfig.enabled) return [];

    const alerts: ActiveAlert[] = [];
    for (const key of REGION_KEYS) {
      const isTargeted = alertConfig.targetRegion === 'all' || alertConfig.targetRegion === key;
      const readings = data.regions[key];

      if (isTargeted && readings.psi24h >= alertConfig.thresholdPsi) {
        const band = getPSIBand(readings.psi24h);
        alerts.push({
          id: `${key}-${readings.psi24h}`,
          region: key,
          regionName: REGIONS[key].displayName,
          psi: readings.psi24h,
          threshold: alertConfig.thresholdPsi,
          band,
          triggeredAt: data.updateTimestamp,
          isHazardous: readings.psi24h >= 301,
        });
      }
    }
    return alerts;
  }, [data, alertConfig]);

  // 5. Sound Alarm & Log Triggers when alert activates
  useEffect(() => {
    if (activeAlerts.length > 0 && !isBannerDismissed) {
      // Add to alert history log if not already logged
      const nowIso = new Date().toISOString();
      activeAlerts.forEach((alert) => {
        setAlertLogs((prev) => {
          const exists = prev.some(
            (p) => p.region === alert.region && Math.abs(p.psi - alert.psi) < 3 && Date.now() - new Date(p.timestamp).getTime() < 60000
          );
          if (exists) return prev;
          return [
            {
              id: `${alert.region}-${Date.now()}`,
              timestamp: nowIso,
              region: alert.region,
              psi: alert.psi,
              level: alert.band.key,
              message: alert.isHazardous
                ? `Hazardous PSI ${alert.psi} breached emergency 300 threshold in ${alert.regionName}.`
                : `Unhealthy PSI ${alert.psi} detected in ${alert.regionName}.`,
            },
            ...prev.slice(0, 49),
          ];
        });
      });

      // Play sound if enabled and not already playing
      if (alertConfig.soundEnabled && !isSirenPlaying) {
        if (activeAlerts.some((a) => a.isHazardous)) {
          audioAlert.playHazardEmergencyTone();
        } else {
          audioAlert.playAlertChime();
        }
      }

      // Browser Push Notification if allowed
      if (alertConfig.browserNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          const maxAlert = [...activeAlerts].sort((a, b) => b.psi - a.psi)[0];
          new Notification(`SG HazeWatch: ${maxAlert.band.label} Air Alert`, {
            body: `${maxAlert.regionName} sector reached ${maxAlert.psi} PSI (exceeded >${alertConfig.thresholdPsi} safety threshold).`,
            icon: '/favicon.ico',
          });
        }
      }
    }
  }, [activeAlerts, alertConfig, isBannerDismissed, isSirenPlaying]);

  const toggleSiren = () => {
    if (isSirenPlaying) {
      audioAlert.stopEmergencySiren();
      setIsSirenPlaying(false);
    } else {
      audioAlert.startEmergencySiren();
      setIsSirenPlaying(true);
    }
  };

  const handleCardClick = (region: RegionKey | 'national') => {
    setSelectedRegion(region);
    setIsDetailModalOpen(true);
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Connecting to Singapore NEA Air Quality Sensor Network...</span>
        </div>
      </div>
    );
  }

  const selectedBandInfo =
    selectedRegion === 'national' ? nationalBand : regionBands[selectedRegion]?.band || getPSIBand(50);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-200">
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
        onRefresh={loadLiveData}
        isSimulation={isSimulating}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSimulator={() => setIsSimulationModalOpen(true)}
        hasActiveHazard={activeAlerts.length > 0}
      />

      {/* Emergency Hazard Banner */}
      {!isBannerDismissed && (
        <HazardAlertBanner
          alerts={activeAlerts}
          isSirenPlaying={isSirenPlaying}
          onToggleSiren={toggleSiren}
          onDismiss={() => {
            setIsBannerDismissed(true);
            if (isSirenPlaying) {
              audioAlert.stopEmergencySiren();
              setIsSirenPlaying(false);
            }
          }}
          onOpenAdvisory={() => setActiveTab('advisory')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status Kicker & Fast Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              NEA Air Quality Telemetry
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 font-mono tabular-nums">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              SGT{' '}
              {new Date(data.updateTimestamp).toLocaleTimeString('en-SG', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Singapore',
              })}
            </span>
            <span>·</span>
            <span className="font-mono text-slate-400">
              {data.source === 'live_api' ? 'Official NEA Live Feed' : data.source === 'simulation' ? 'Simulation Scenario' : 'Cached Baseline'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isSimulating ? (
              <button
                onClick={handleResetToLive}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20"
              >
                <Sparkles className="w-3 h-3" />
                Simulation Active (Click to Reset)
              </button>
            ) : (
              <span className="text-xs text-slate-400">
                Peak Sector:{' '}
                <strong className="text-slate-200 uppercase">
                  {REGIONS[data.national.dominantRegion].displayName} ({data.national.maxPsi} PSI)
                </strong>
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: Overview (Hero Map + Regional Grid) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Visual Map Anchor */}
            <SingaporeMap
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) => {
                setSelectedRegion(reg);
                setIsDetailModalOpen(true);
              }}
              regionBands={regionBands}
            />

            {/* Regional Card Breakdown */}
            <RegionCardGrid
              data={data}
              selectedRegion={selectedRegion}
              onSelectRegion={handleCardClick}
              regionBands={regionBands}
              nationalBand={nationalBand}
              thresholdPsi={alertConfig.thresholdPsi}
            />

            {/* 24-Hour Trend Preview */}
            <TrendChart history={history} thresholdPsi={alertConfig.thresholdPsi} />
          </div>
        )}

        {/* Tab 2: Map Focus View */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <SingaporeMap
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) => {
                setSelectedRegion(reg);
                setIsDetailModalOpen(true);
              }}
              regionBands={regionBands}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
                <h3 className="text-sm font-semibold text-slate-100 mb-2">Regional Monitoring Station Coordinates</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Singapore's air quality monitoring network comprises 5 regional continuous ambient telemetry stations deployed across planning zones.
                </p>
                <div className="space-y-2 text-xs font-mono">
                  {REGION_KEYS.map((k) => (
                    <div key={k} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                      <span className="text-slate-300 font-sans font-medium">{REGIONS[k].displayName} Sector:</span>
                      <span className="text-slate-400">
                        Lat {REGIONS[k].labelLocation.latitude}°N, Lon {REGIONS[k].labelLocation.longitude}°E
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3">
                <h3 className="text-sm font-semibold text-slate-100">NEA Sector Coverage Towns</h3>
                <p className="text-xs text-slate-400">
                  Each sector covers adjacent residential estates and industrial hubs. Click to inspect sector pollutant readings:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {REGION_KEYS.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleCardClick(k)}
                      className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors"
                    >
                      {REGIONS[k].displayName} ({REGIONS[k].majorTowns.slice(0, 3).join(', ')})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: 24h Trends Full View */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <TrendChart history={history} thresholdPsi={alertConfig.thresholdPsi} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1.5">
                <div className="text-xs text-slate-400 uppercase font-mono">24h Peak Value</div>
                <div className="text-3xl font-extrabold font-mono text-rose-400 tabular-nums">
                  {Math.max(...history.map((h) => h.nationalMax), data.national.maxPsi)} PSI
                </div>
                <div className="text-xs text-slate-400">Recorded across the 5 monitoring stations</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1.5">
                <div className="text-xs text-slate-400 uppercase font-mono">Islandwide Baseline</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400 tabular-nums">
                  {Math.min(...history.map((h) => Math.min(h.north, h.south, h.east, h.west, h.central)), data.national.minPsi)} PSI
                </div>
                <div className="text-xs text-slate-400">Lowest regional reading in 24 hours</div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-1.5">
                <div className="text-xs text-slate-400 uppercase font-mono">Dominant Pollutant</div>
                <div className="text-3xl font-extrabold font-mono text-sky-400">
                  PM2.5
                </div>
                <div className="text-xs text-slate-400">Fine particulate matter from transboundary smoke</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Health Advisory & Action Plan */}
        {activeTab === 'advisory' && <HealthAdvisorySection />}

        {/* Tab 5: Alert Incident Log */}
        {activeTab === 'log' && (
          <AlertHistoryLogSection
            logs={alertLogs}
            onClearLogs={() => setAlertLogs([])}
          />
        )}
      </main>

      {/* Regional Detail Modal */}
      <RegionDetailModal
        regionKey={selectedRegion}
        data={data}
        bandInfo={selectedBandInfo}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSetRegionAlert={(reg) => {
          setAlertConfig((prev) => ({ ...prev, targetRegion: reg, enabled: true }));
          setIsDetailModalOpen(false);
          setIsSettingsModalOpen(true);
        }}
      />

      {/* Alert Settings Modal */}
      <AlertSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={alertConfig}
        onSaveConfig={(newConfig) => {
          setAlertConfig(newConfig);
          setIsBannerDismissed(false);
        }}
        activeHazardCount={activeAlerts.length}
      />

      {/* Simulation Controls Modal */}
      <SimulationControls
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        isSimulating={isSimulating}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => applySimulation(id, customOverrides)}
        onResetToLive={handleResetToLive}
        customOverrides={customOverrides}
        onChangeOverride={handleOverrideChange}
      />

      {/* Clean Footer adhering to Anti-slop rules (no fake engines or ornamental tickers) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SG HazeWatch</span>
            <span>·</span>
            <span>Singapore Ambient Air Quality & PSI Monitoring</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Data: Singapore National Environment Agency (NEA)</span>
            <span>·</span>
            <span>Singapore Time (SGT UTC+8)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
