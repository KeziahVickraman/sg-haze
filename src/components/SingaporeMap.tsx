import React from 'react';
import { PSIBandInfo, RegionKey } from '../types/haze';
import { REGIONS } from '../constants/hazeConstants';
import { AlertTriangle, MapPin } from 'lucide-react';

interface SingaporeMapProps {
  selectedRegion: RegionKey | 'national';
  onSelectRegion: (region: RegionKey) => void;
  regionBands: Record<RegionKey, { psi: number; pm25: number; band: PSIBandInfo; isAlertTriggered: boolean }>;
}

export const SingaporeMap: React.FC<SingaporeMapProps> = ({
  selectedRegion,
  onSelectRegion,
  regionBands,
}) => {
  // SVG paths custom-shaped to represent Singapore's 5 planning haze regions and key islands
  // ViewBox: 0 0 800 480
  const regionPaths: Record<RegionKey, { path: string; labelX: number; labelY: number }> = {
    north: {
      // Northern sector: Woodlands, Sembawang, Yishun, Kranji, Mandai, Simpang
      path: 'M 280 90 C 310 75, 380 65, 450 70 C 490 73, 510 90, 500 130 C 490 160, 460 175, 420 180 C 370 185, 340 180, 305 170 C 275 160, 265 120, 280 90 Z',
      labelX: 395,
      labelY: 125,
    },
    west: {
      // Western sector: Tuas, Jurong West, Jurong East, Clementi, Bukit Batok, Lim Chu Kang, Choa Chu Kang
      path: 'M 80 280 C 70 230, 110 180, 180 145 C 230 120, 275 140, 285 170 C 295 200, 300 240, 280 270 C 260 300, 210 320, 160 340 C 110 350, 90 320, 80 280 Z',
      labelX: 200,
      labelY: 235,
    },
    central: {
      // Central sector: Bishan, Ang Mo Kio, Bukit Timah, Novena, Toa Payoh, Central Catchment
      path: 'M 305 170 C 340 180, 370 185, 420 180 C 430 205, 440 230, 425 255 C 410 275, 375 285, 335 280 C 295 275, 285 240, 285 205 C 285 185, 295 175, 305 170 Z',
      labelX: 355,
      labelY: 228,
    },
    east: {
      // Eastern sector: Tampines, Bedok, Pasir Ris, Changi, Paya Lebar, Loyang
      path: 'M 500 130 C 530 125, 590 140, 670 170 C 730 195, 740 220, 715 245 C 685 270, 620 280, 560 275 C 500 270, 450 250, 440 220 C 435 180, 470 145, 500 130 Z',
      labelX: 585,
      labelY: 205,
    },
    south: {
      // Southern sector: Downtown Core, Marina South, Bukit Merah, Queenstown, Telok Blangah, Kallang
      path: 'M 280 270 C 310 275, 360 285, 425 255 C 450 250, 490 265, 530 275 C 510 310, 460 335, 400 345 C 340 355, 290 330, 270 300 C 265 285, 270 275, 280 270 Z',
      labelX: 385,
      labelY: 310,
    },
  };

  // Surrounding islands (Sentosa, Pulau Ubin, Pulau Tekong, Jurong Island)
  const islands = [
    { name: 'Sentosa', path: 'M 350 365 C 380 360, 420 365, 410 380 C 390 395, 360 385, 350 365 Z', region: 'south' as RegionKey },
    { name: 'Jurong Island', path: 'M 170 360 C 210 355, 230 380, 205 395 C 175 400, 160 380, 170 360 Z', region: 'west' as RegionKey },
    { name: 'Pulau Ubin', path: 'M 605 115 C 640 110, 665 125, 645 135 C 620 140, 595 125, 605 115 Z', region: 'east' as RegionKey },
    { name: 'Pulau Tekong', path: 'M 690 120 C 730 115, 755 140, 735 160 C 705 165, 680 140, 690 120 Z', region: 'east' as RegionKey },
  ];

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/90 border border-slate-800/80 p-4 lg:p-6 overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Regional Haze Heatmap
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any region on the map to inspect live pollutant levels and localized advisories
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-300 font-mono">0-50 Good</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span className="text-slate-300 font-mono">51-100 Mod</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-300 font-mono">101-200 Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
            <span className="text-slate-300 font-mono">201-300 Very Unhealthy</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block"></span>
            <span className="text-rose-300 font-mono font-semibold">&gt;300 Hazardous</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[460px] bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-center justify-center p-2">
        {/* Subtle grid and radar coordinates background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px]"></div>

        {/* Ambient glow behind map */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/10 via-transparent to-transparent pointer-events-none"></div>

        <svg
          viewBox="0 0 800 440"
          className="w-full h-full max-w-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] select-none"
        >
          {/* Surrounding Straits & Water labels */}
          <text x="420" y="40" fill="#475569" fontSize="11" letterSpacing="0.15em" textAnchor="middle" className="font-mono">
            STRAITS OF JOHOR (MALAYSIA)
          </text>
          <text x="400" y="425" fill="#475569" fontSize="11" letterSpacing="0.15em" textAnchor="middle" className="font-mono">
            SINGAPORE STRAIT
          </text>

          {/* Region Paths */}
          {(Object.keys(regionPaths) as RegionKey[]).map((key) => {
            const data = regionBands[key];
            const isSelected = selectedRegion === key;
            const isHazardous = data?.band.key === 'hazardous';
            const colorHex = data?.band.colorHex || '#10b981';

            return (
              <g key={key} className="cursor-pointer group" onClick={() => onSelectRegion(key)}>
                {/* Region Polygon Path */}
                <path
                  d={regionPaths[key].path}
                  fill={colorHex}
                  fillOpacity={isSelected ? 0.45 : 0.22}
                  stroke={isSelected ? '#ffffff' : colorHex}
                  strokeWidth={isSelected ? 2.5 : isHazardous ? 2.2 : 1.5}
                  strokeDasharray={isHazardous ? '6,3' : undefined}
                  className="transition-all duration-300 group-hover:fill-opacity-40 group-hover:stroke-white"
                />

                {/* Pulsing beacon if hazardous threshold exceeded */}
                {isHazardous && (
                  <circle
                    cx={regionPaths[key].labelX}
                    cy={regionPaths[key].labelY - 15}
                    r="24"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-ping origin-center opacity-75"
                  />
                )}
              </g>
            );
          })}

          {/* Offshore Islands */}
          {islands.map((island) => {
            const data = regionBands[island.region];
            const colorHex = data?.band.colorHex || '#10b981';
            return (
              <path
                key={island.name}
                d={island.path}
                fill={colorHex}
                fillOpacity={0.3}
                stroke={colorHex}
                strokeWidth="1.2"
                className="cursor-pointer hover:fill-opacity-60 transition-colors"
                onClick={() => onSelectRegion(island.region)}
              >
                <title>{`${island.name} (${REGIONS[island.region].displayName} sector)`}</title>
              </path>
            );
          })}

          {/* Island Labels */}
          <text x="380" y="380" fill="#94a3b8" fontSize="9" textAnchor="middle" className="font-sans font-medium pointer-events-none">
            Sentosa
          </text>
          <text x="630" y="128" fill="#94a3b8" fontSize="9" textAnchor="middle" className="font-sans font-medium pointer-events-none">
            P. Ubin
          </text>
          <text x="720" y="142" fill="#94a3b8" fontSize="9" textAnchor="middle" className="font-sans font-medium pointer-events-none">
            P. Tekong
          </text>
          <text x="195" y="380" fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-sans font-medium pointer-events-none">
            Jurong Is.
          </text>

          {/* Regional Interactive Badges & Pins */}
          {(Object.keys(regionPaths) as RegionKey[]).map((key) => {
            const info = regionPaths[key];
            const data = regionBands[key];
            const isSelected = selectedRegion === key;
            const isHazardous = data?.band.key === 'hazardous';
            const psi = data?.psi ?? 0;
            const pm25 = data?.pm25 ?? 0;
            const colorHex = data?.band.colorHex || '#10b981';

            return (
              <g
                key={`badge-${key}`}
                transform={`translate(${info.labelX}, ${info.labelY})`}
                className="cursor-pointer select-none"
                onClick={() => onSelectRegion(key)}
              >
                {/* Background Card Pill */}
                <rect
                  x="-52"
                  y="-26"
                  width="104"
                  height="52"
                  rx="10"
                  fill="#090d16"
                  fillOpacity="0.94"
                  stroke={isSelected ? '#ffffff' : isHazardous ? '#ef4444' : '#334155'}
                  strokeWidth={isSelected ? 2 : isHazardous ? 2 : 1}
                  className="transition-all duration-200"
                />

                {/* Status Indicator Dot / Alert Icon */}
                {isHazardous ? (
                  <g transform="translate(-40, -18)">
                    <circle cx="6" cy="6" r="6" fill="#ef4444" className="animate-pulse" />
                  </g>
                ) : (
                  <circle cx="-34" cy="-12" r="4.5" fill={colorHex} />
                )}

                {/* Region Name */}
                <text
                  x="-24"
                  y="-9"
                  fill="#f1f5f9"
                  fontSize="12"
                  fontWeight="700"
                  className="font-sans tracking-wide"
                >
                  {REGIONS[key].displayName.toUpperCase()}
                </text>

                {/* PSI Big Number */}
                <text
                  x="-42"
                  y="14"
                  fill={isHazardous ? '#f87171' : colorHex}
                  fontSize="18"
                  fontWeight="800"
                  className="font-mono tabular-nums"
                >
                  {psi}
                </text>

                <text x="-4" y="8" fill="#94a3b8" fontSize="9" className="font-mono">
                  PSI
                </text>

                {/* PM2.5 Micro Stat */}
                <text x="-4" y="19" fill="#cbd5e1" fontSize="9" className="font-mono tabular-nums">
                  PM2.5: {pm25}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Region Floating Indicator */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2 backdrop-blur-md">
          <span className="text-slate-400">Inspecting:</span>
          <span className="font-semibold text-slate-100 uppercase">
            {selectedRegion === 'national' ? 'Islandwide (National)' : `${REGIONS[selectedRegion].displayName} Singapore`}
          </span>
          {selectedRegion !== 'national' && (
            <button
              onClick={() => onSelectRegion('national' as unknown as RegionKey)}
              className="text-xs text-sky-400 hover:text-sky-300 underline ml-1"
            >
              Reset to All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
