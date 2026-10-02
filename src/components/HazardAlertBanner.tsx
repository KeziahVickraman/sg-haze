import React from 'react';
import { ActiveAlert } from '../types/haze';
import { AlertOctagon, Volume2, VolumeX, ShieldAlert, X, Info } from 'lucide-react';

interface HazardAlertBannerProps {
  alerts: ActiveAlert[];
  isSirenPlaying: boolean;
  onToggleSiren: () => void;
  onDismiss: () => void;
  onOpenAdvisory: () => void;
}

export const HazardAlertBanner: React.FC<HazardAlertBannerProps> = ({
  alerts,
  isSirenPlaying,
  onToggleSiren,
  onDismiss,
  onOpenAdvisory,
}) => {
  if (alerts.length === 0) return null;

  const hasHazardous = alerts.some((a) => a.isHazardous);
  const highestAlert = [...alerts].sort((a, b) => b.psi - a.psi)[0];
  const affectedNames = alerts.map((a) => a.regionName).join(', ');

  const bannerBg = hasHazardous
    ? 'bg-rose-950/90 border-rose-600/70 text-rose-100 shadow-[0_0_40px_rgba(225,29,72,0.35)]'
    : 'bg-amber-950/90 border-amber-600/70 text-amber-100 shadow-[0_0_30px_rgba(245,158,11,0.25)]';

  const accentColor = hasHazardous ? 'text-rose-400' : 'text-amber-400';
  const pulseBadge = hasHazardous
    ? 'bg-rose-600 text-white animate-pulse'
    : 'bg-amber-600 text-white animate-pulse';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`w-full border-b backdrop-blur-md transition-all duration-300 ${bannerBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Main warning text */}
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-xl bg-black/30 border border-white/10 shrink-0 mt-0.5">
              {hasHazardous ? (
                <AlertOctagon className="w-5 h-5 text-rose-400 animate-bounce" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${pulseBadge}`}>
                  {hasHazardous ? 'EMERGENCY AIR HAZARD' : 'AIR QUALITY ALERT'}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide opacity-90">
                  {alerts.length === 1 ? `${highestAlert.regionName} Region` : `${alerts.length} Regions Affected`}
                </span>
                <span className="text-xs opacity-60">·</span>
                <span className="text-xs font-mono font-bold tracking-tight">
                  Peak: <span className={accentColor}>{highestAlert.psi} PSI</span> ({highestAlert.band.label})
                </span>
              </div>

              <p className="text-sm mt-1 leading-snug font-medium text-slate-100">
                {hasHazardous ? (
                  <>
                    <strong className="text-rose-300">Hazardous threshold (&gt;300 PSI) reached in {affectedNames}.</strong>{' '}
                    MOH & NEA directive: Minimise all outdoor exposure. Vulnerable groups must stay strictly indoors with air purifiers active.
                  </>
                ) : (
                  <>
                    <strong className="text-amber-300">Unhealthy air quality threshold breached in {affectedNames}.</strong>{' '}
                    Reduce prolonged or strenuous outdoor activities. Sensitive groups should minimise outdoor exertion.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            {/* Siren toggle */}
            <button
              onClick={onToggleSiren}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isSirenPlaying
                  ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-md animate-pulse'
                  : 'bg-slate-900/80 border border-slate-700 text-slate-200 hover:bg-slate-800'
              }`}
              title={isSirenPlaying ? 'Mute alert siren' : 'Sound alert siren'}
            >
              {isSirenPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isSirenPlaying ? 'Silence Siren' : 'Test Siren'}</span>
            </button>

            {/* View Advisory button */}
            <button
              onClick={onOpenAdvisory}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors whitespace-nowrap"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Advisory</span>
            </button>

            {/* Dismiss button */}
            <button
              onClick={onDismiss}
              aria-label="Dismiss alert banner"
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
