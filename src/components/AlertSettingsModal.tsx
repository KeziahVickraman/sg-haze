import React, { useState } from 'react';
import { AlertThresholdConfig, RegionKey } from '../types/haze';
import { REGIONS, REGION_KEYS } from '../constants/hazeConstants';
import { audioAlert } from '../services/audioAlert';
import { Bell, Volume2, ShieldAlert, Check, X, Sliders, Smartphone, VolumeX } from 'lucide-react';

interface AlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertThresholdConfig;
  onSaveConfig: (newConfig: AlertThresholdConfig) => void;
  activeHazardCount: number;
}

export const AlertSettingsModal: React.FC<AlertSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  activeHazardCount,
}) => {
  const [localConfig, setLocalConfig] = useState<AlertThresholdConfig>(config);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const handleTestSound = () => {
    setIsPlayingTestSound(true);
    audioAlert.playHazardEmergencyTone();
    setTimeout(() => setIsPlayingTestSound(false), 800);
  };

  const handleRequestNotification = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported on this browser.');
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setLocalConfig((prev) => ({ ...prev, browserNotificationsEnabled: true }));
        new Notification('SG HazeWatch Active', {
          body: `Alerts armed for PSI > ${localConfig.thresholdPsi}`,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // Ignore
    }
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const thresholdPresets = [
    { label: 'Unhealthy', value: 101, note: 'Early warning when general outdoor activity should be curtailed.' },
    { label: 'Elevated Unhealthy', value: 150, note: 'Recommended trigger for schools and sports training.' },
    { label: 'Very Unhealthy', value: 201, note: 'Aggressive haze warning; high respiratory irritation risk.' },
    { label: 'Hazardous (NEA Emergency)', value: 301, note: 'Life-safety emergency threshold; stay indoors.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Hazardous Threshold Alerts</h2>
              <p className="text-xs text-slate-400">Configure real-time sirens and region filters</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Master Enable Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-sm font-semibold text-white">Enable Real-Time Air Alerts</div>
              <div className="text-xs text-slate-400">Trigger warnings when readings exceed safety threshold</div>
            </div>
            <button
              type="button"
              onClick={() => setLocalConfig((p) => ({ ...p, enabled: !p.enabled }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                localConfig.enabled ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                  localConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Threshold Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Trigger Threshold Level
              </label>
              <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
                &gt; {localConfig.thresholdPsi} PSI
              </span>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
              {thresholdPresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setLocalConfig((p) => ({ ...p, thresholdPsi: preset.value }))}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    localConfig.thresholdPsi === preset.value
                      ? 'bg-rose-950/40 border-rose-500/70 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{preset.label}</span>
                    <span className="text-xs font-mono font-semibold text-rose-400">
                      {preset.value}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                    {preset.note}
                  </div>
                </button>
              ))}
            </div>

            {/* Slider */}
            <div className="pt-2">
              <input
                type="range"
                min="50"
                max="400"
                step="5"
                value={localConfig.thresholdPsi}
                onChange={(e) =>
                  setLocalConfig((p) => ({ ...p, thresholdPsi: Number(e.target.value) }))
                }
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>50 (Good)</span>
                <span>100 (Unhealthy)</span>
                <span>200 (Very Unhealthy)</span>
                <span>300 (Hazardous)</span>
                <span>400 (Crisis)</span>
              </div>
            </div>
          </div>

          {/* Target Region Scope */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Region Monitoring Scope
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setLocalConfig((p) => ({ ...p, targetRegion: 'all' }))}
                className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                  localConfig.targetRegion === 'all'
                    ? 'bg-slate-800 border-white/40 text-white'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                All Regions (Islandwide)
              </button>
              {REGION_KEYS.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setLocalConfig((p) => ({ ...p, targetRegion: k }))}
                  className={`py-2 px-3 rounded-lg border text-center font-medium transition-colors ${
                    localConfig.targetRegion === k
                      ? 'bg-slate-800 border-white/40 text-white'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {REGIONS[k].displayName} Sector
                </button>
              ))}
            </div>
          </div>

          {/* Sound Alarm Controls */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Synthesized Audio Siren</div>
                  <div className="text-[11px] text-slate-400">
                    Two-tone Web Audio alarm for emergency hazardous spikes
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLocalConfig((p) => ({ ...p, soundEnabled: !p.soundEnabled }))}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  localConfig.soundEnabled ? 'bg-sky-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                    localConfig.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">Audition alarm chime:</span>
              <button
                type="button"
                onClick={handleTestSound}
                disabled={isPlayingTestSound}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {isPlayingTestSound ? <Volume2 className="w-3.5 h-3.5 text-rose-400 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingTestSound ? 'Playing Tone...' : 'Play Test Tone'}</span>
              </button>
            </div>
          </div>

          {/* Browser Notification Permissions */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">Browser Push Notifications</div>
                <div className="text-[11px] text-slate-400">
                  Status:{' '}
                  <span className="font-mono text-slate-300">
                    {notificationPermission === 'granted' ? 'Allowed' : notificationPermission}
                  </span>
                </div>
              </div>
            </div>

            {notificationPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Enable
              </button>
            ) : (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Armed
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {activeHazardCount > 0 ? (
              <span className="text-rose-400 font-medium">
                {activeHazardCount} region(s) currently above threshold
              </span>
            ) : (
              <span className="text-emerald-400">All regions currently within safety limits</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-colors"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
