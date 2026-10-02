import React from 'react';
import { PSI_BANDS } from '../constants/hazeConstants';
import { PSIBandKey } from '../types/haze';
import { ShieldCheck, HeartPulse, AlertTriangle, Wind, CheckCircle2, XCircle, Info, Stethoscope } from 'lucide-react';

export const HealthAdvisorySection: React.FC = () => {
  const bands: PSIBandKey[] = ['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-rose-400" />
          Singapore NEA & MOH Haze Health Advisories
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Official guidance issued jointly by the Singapore Ministry of Health (MOH) and National Environment Agency (NEA)
        </p>
      </div>

      {/* 5-Band Activity Advisory Matrix */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 overflow-hidden shadow-xl backdrop-blur-md">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <ActivityMatrixIcon className="w-4 h-4 text-sky-400" />
          Recommended Actions by 24-hr PSI Reading Band
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">PSI Band</th>
                <th className="py-3 px-4 font-semibold">Healthy Persons</th>
                <th className="py-3 px-4 font-semibold">Elderly, Pregnant & Children</th>
                <th className="py-3 px-4 font-semibold">Chronic Lung/Heart Disease</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bands.map((key) => {
                const band = PSI_BANDS[key];
                const isHazardous = key === 'hazardous';
                return (
                  <tr
                    key={key}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isHazardous ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: band.colorHex }}
                        />
                        <div>
                          <div className="font-bold text-slate-200">{band.label}</div>
                          <div className="font-mono text-[11px] text-slate-400">
                            {band.min} – {band.max >= 1000 ? '>300' : band.max} PSI
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {band.generalAdvisory}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {band.vulnerableAdvisory}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300 max-w-xs leading-relaxed">
                      {isHazardous ? (
                        <strong className="text-rose-400">
                          Stay indoors strictly. Close all windows. Seek urgent medical attention if breathless.
                        </strong>
                      ) : key === 'very_unhealthy' ? (
                        <span className="text-amber-300">
                          Stay indoors, minimise physical exertion, keep reliever medication handy.
                        </span>
                      ) : key === 'unhealthy' ? (
                        'Avoid outdoor physical exertion.'
                      ) : (
                        'Normal outdoor activity.'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical Protection Guidelines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* N95 Masks */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4" />
            N95 Respirator Guidance
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard surgical masks and paper masks do NOT filter fine PM2.5 haze particles. Only fitted N95 respirators provide certified protection.
          </p>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Ensure snug seal around nose bridge and chin without gaps.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Recommended when outdoor exposure is unavoidable during PSI &gt; 200.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>Pregnant women in 3rd trimester and persons with severe lung impairment should consult physicians before wearing N95 for long periods.</span>
            </li>
          </ul>
        </div>

        {/* Indoor Air Measures */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <Wind className="w-4 h-4" />
            Indoor Air Protection
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Most Singapore residents spend over 90% of their time indoors. Maintaining clean indoor air is paramount during transboundary haze episodes.
          </p>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Run air purifiers with true HEPA filtration rated for your room size.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Keep windows and balcony doors sealed tightly during haze spikes.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Set air conditioning units to internal air recirculation mode (not drawing fresh outdoor air).</span>
            </li>
          </ul>
        </div>

        {/* Schools & Workplace MOM Guidelines */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <HeartPulse className="w-4 h-4" />
            Workplace & Schools (MOM/MOE)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Singapore Ministry of Manpower (MOM) and Ministry of Education (MOE) directives for outdoor workers and students:
          </p>
          <ul className="text-xs space-y-1.5 text-slate-300">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>MOE schools suspend strenuous outdoor physical education when 24-hr PSI &gt; 100.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Employers must provide N95 masks and rotate outdoor workers to indoor duties when PSI &gt; 200.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Drink plenty of water to flush out irritants from throat and eyes.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

function ActivityMatrixIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}
