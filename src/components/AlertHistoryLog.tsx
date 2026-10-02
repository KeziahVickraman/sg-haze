import React from 'react';
import { AlertHistoryLog } from '../types/haze';
import { REGIONS } from '../constants/hazeConstants';
import { History, Trash2, AlertOctagon, ShieldAlert, CheckCircle } from 'lucide-react';

interface AlertHistoryLogProps {
  logs: AlertHistoryLog[];
  onClearLogs: () => void;
}

export const AlertHistoryLogSection: React.FC<AlertHistoryLogProps> = ({ logs, onClearLogs }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <History className="w-5 h-5 text-rose-400" />
            Hazard Alert Incident Log
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Timestamped record of regional air quality threshold breaches and hazard alarms
          </p>
        </div>

        {logs.length > 0 && (
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
        {logs.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="text-sm font-semibold text-slate-300">No Hazardous Threshold Breaches Logged</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Air quality has remained within your safety threshold limits. Use the "Stress Test / Simulate" button in the top navigation to test alert triggers.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Timestamp (SGT)</th>
                  <th className="py-3 px-4 font-semibold">Region</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold text-right">Recorded PSI</th>
                  <th className="py-3 px-4 font-semibold">Advisory Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => {
                  const isHazardous = log.level === 'hazardous';
                  const dateStr = new Date(log.timestamp).toLocaleTimeString('en-SG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZone: 'Asia/Singapore',
                  });

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isHazardous ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-slate-300 tabular-nums">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {REGIONS[log.region]?.displayName ?? log.region}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-semibold uppercase text-[10px] ${
                            isHazardous ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {isHazardous ? (
                            <AlertOctagon className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                          {log.level.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-rose-300">
                        {log.psi} PSI
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-sm truncate">
                        {log.message}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
