import { PSIBandInfo, PSIBandKey, RegionKey, RegionMetadata } from '../types/haze';

export const PSI_BANDS: Record<PSIBandKey, PSIBandInfo> = {
  good: {
    key: 'good',
    label: 'Good',
    min: 0,
    max: 50,
    colorHex: '#10b981', // emerald-500
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/15 text-emerald-300',
    summary: 'Air quality is satisfactory and poses little to no health risk.',
    healthImpact: 'Air pollution poses little or no risk to the general public.',
    generalAdvisory: 'Normal outdoor activities can be continued for everyone.',
    vulnerableAdvisory: 'Normal outdoor activities can be continued.',
    outdoorActivity: 'normal',
    maskRecommended: false,
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    min: 51,
    max: 100,
    colorHex: '#0284c7', // sky-600
    textColor: 'text-sky-400',
    bgColor: 'bg-sky-950/40',
    borderColor: 'border-sky-500/30',
    badgeBg: 'bg-sky-500/15 text-sky-300',
    summary: 'Air quality is acceptable for most people.',
    healthImpact: 'A small number of unusually sensitive individuals may experience slight respiratory irritation.',
    generalAdvisory: 'Normal outdoor activities can be continued.',
    vulnerableAdvisory: 'Persons with respiratory ailments should monitor personal comfort levels.',
    outdoorActivity: 'normal',
    maskRecommended: false,
  },
  unhealthy: {
    key: 'unhealthy',
    label: 'Unhealthy',
    min: 101,
    max: 200,
    colorHex: '#f59e0b', // amber-500
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/30',
    badgeBg: 'bg-amber-500/15 text-amber-300',
    summary: 'Increased likelihood of adverse respiratory symptoms in the general population.',
    healthImpact: 'Noticeable throat irritation, cough, and discomfort during prolonged exertion.',
    generalAdvisory: 'Healthy persons should reduce prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Elderly, pregnant women, and children should minimise outdoor exertion. Persons with chronic lung/heart disease should avoid outdoor activity.',
    outdoorActivity: 'reduce_strenuous',
    maskRecommended: false,
  },
  very_unhealthy: {
    key: 'very_unhealthy',
    label: 'Very Unhealthy',
    min: 201,
    max: 300,
    colorHex: '#f97316', // orange-500
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-950/40',
    borderColor: 'border-orange-500/30',
    badgeBg: 'bg-orange-500/15 text-orange-300',
    summary: 'Significant aggravation of symptoms; general population may feel irritation.',
    healthImpact: 'Widespread irritation of eyes and throat. Worsening symptoms for asthmatics.',
    generalAdvisory: 'Healthy persons should avoid prolonged or strenuous outdoor exertion.',
    vulnerableAdvisory: 'Elderly, pregnant women, and children should avoid outdoor exertion. Chronic disease patients should stay indoors.',
    outdoorActivity: 'avoid_strenuous',
    maskRecommended: true,
  },
  hazardous: {
    key: 'hazardous',
    label: 'Hazardous',
    min: 301,
    max: 1000,
    colorHex: '#ef4444', // red-500
    textColor: 'text-rose-400',
    bgColor: 'bg-rose-950/50',
    borderColor: 'border-rose-500/50',
    badgeBg: 'bg-rose-500/20 text-rose-300',
    summary: 'HEALTH WARNING: Emergency air quality conditions affecting the entire population.',
    healthImpact: 'Premature mortality risk, severe aggravation of cardiopulmonary disease, widespread acute respiratory symptoms.',
    generalAdvisory: 'Healthy persons should minimise outdoor activity and avoid all outdoor physical exertion.',
    vulnerableAdvisory: 'Vulnerable persons (elderly, pregnant, children, heart/lung disease) MUST stay indoors, keep windows closed, and run HEPA air purifiers.',
    outdoorActivity: 'stay_indoors',
    maskRecommended: true,
  },
};

export function getPSIBand(psi: number): PSIBandInfo {
  if (psi <= 50) return PSI_BANDS.good;
  if (psi <= 100) return PSI_BANDS.moderate;
  if (psi <= 200) return PSI_BANDS.unhealthy;
  if (psi <= 300) return PSI_BANDS.very_unhealthy;
  return PSI_BANDS.hazardous;
}

export const REGIONS: Record<RegionKey, RegionMetadata> = {
  north: {
    key: 'north',
    displayName: 'North',
    majorTowns: ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty', 'Marsiling'],
    labelLocation: { latitude: 1.41803, longitude: 103.82 },
  },
  south: {
    key: 'south',
    displayName: 'South',
    majorTowns: ['Marina Bay', 'Bukit Merah', 'Sentosa', 'Telok Blangah', 'Queenstown'],
    labelLocation: { latitude: 1.29587, longitude: 103.82 },
  },
  east: {
    key: 'east',
    displayName: 'East',
    majorTowns: ['Tampines', 'Bedok', 'Pasir Ris', 'Changi', 'Paya Lebar'],
    labelLocation: { latitude: 1.35735, longitude: 103.94 },
  },
  west: {
    key: 'west',
    displayName: 'West',
    majorTowns: ['Jurong', 'Tuas', 'Clementi', 'Bukit Batok', 'Boon Lay'],
    labelLocation: { latitude: 1.35735, longitude: 103.7 },
  },
  central: {
    key: 'central',
    displayName: 'Central',
    majorTowns: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Novena', 'Orchard'],
    labelLocation: { latitude: 1.35735, longitude: 103.82 },
  },
};

export const REGION_KEYS: RegionKey[] = ['north', 'south', 'east', 'west', 'central'];

export interface PresetScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  values: Record<RegionKey, { psi: number; pm25: number; pm10: number }>;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'historic_2013',
    name: 'Historic 2013 Haze Peak',
    badge: 'Hazardous (PSI 401)',
    description: 'Replicates the record-breaking transboundary haze crisis in June 2013 when PSI reached all-time high of 401 in Singapore.',
    values: {
      west: { psi: 401, pm25: 380, pm10: 420 },
      central: { psi: 325, pm25: 310, pm10: 345 },
      south: { psi: 310, pm25: 290, pm10: 330 },
      north: { psi: 285, pm25: 260, pm10: 295 },
      east: { psi: 265, pm25: 240, pm10: 280 },
    },
  },
  {
    id: 'west_hotspot',
    name: 'West Industrial Hotspot Surge',
    badge: 'Hazardous (PSI 318)',
    description: 'Simulates a localized hazardous spike in the Western industrial sector crossing the 300 hazardous threshold while others remain elevated.',
    values: {
      west: { psi: 318, pm25: 295, pm10: 335 },
      north: { psi: 175, pm25: 145, pm10: 190 },
      central: { psi: 160, pm25: 130, pm10: 175 },
      south: { psi: 140, pm25: 115, pm10: 150 },
      east: { psi: 88, pm25: 65, pm10: 95 },
    },
  },
  {
    id: 'southwest_monsoon',
    name: 'South-West Monsoon Haze',
    badge: 'Unhealthy (PSI 165)',
    description: 'Typical regional transboundary haze during dry season with widespread unhealthy levels across southern and western regions.',
    values: {
      south: { psi: 165, pm25: 135, pm10: 180 },
      west: { psi: 155, pm25: 125, pm10: 170 },
      central: { psi: 140, pm25: 110, pm10: 155 },
      east: { psi: 115, pm25: 88, pm10: 125 },
      north: { psi: 95, pm25: 72, pm10: 105 },
    },
  },
  {
    id: 'clean_baseline',
    name: 'Clear Coastal Baseline',
    badge: 'Good (PSI 32)',
    description: 'Tropical clear skies after heavy islandwide monsoon rain. All regions well within healthy ambient limits.',
    values: {
      north: { psi: 28, pm25: 12, pm10: 22 },
      south: { psi: 35, pm25: 16, pm10: 28 },
      east: { psi: 24, pm25: 10, pm10: 19 },
      west: { psi: 38, pm25: 18, pm10: 32 },
      central: { psi: 32, pm25: 14, pm10: 26 },
    },
  },
];
