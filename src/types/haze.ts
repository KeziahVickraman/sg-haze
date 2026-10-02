/**
 * Singapore Haze & Air Quality Types
 */

export type RegionKey = 'north' | 'south' | 'east' | 'west' | 'central';
export type ExtendedRegionKey = RegionKey | 'national';

export type PSIBandKey = 'good' | 'moderate' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface PSIBandInfo {
  key: PSIBandKey;
  label: string;
  min: number;
  max: number;
  colorHex: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  summary: string;
  healthImpact: string;
  generalAdvisory: string;
  vulnerableAdvisory: string;
  outdoorActivity: 'normal' | 'reduce_strenuous' | 'avoid_strenuous' | 'avoid_all' | 'stay_indoors';
  maskRecommended: boolean;
}

export interface RegionMetadata {
  key: RegionKey;
  displayName: string;
  majorTowns: string[];
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface RegionReadings {
  psi24h: number;
  pm25_24h: number;
  pm10_24h: number;
  o3_sub_index?: number;
  co_sub_index?: number;
  pm10_sub_index?: number;
  pm25_sub_index?: number;
  so2_sub_index?: number;
  co_8h_max?: number;
  so2_24h?: number;
  no2_1h_max?: number;
}

export interface LatestAirQualityData {
  timestamp: string;
  updateTimestamp: string;
  source: 'live_api' | 'simulation' | 'cached';
  regions: Record<RegionKey, RegionReadings>;
  national: RegionReadings & {
    minPsi: number;
    maxPsi: number;
    dominantRegion: RegionKey;
  };
}

export interface HourlyTrendPoint {
  timeLabel: string;
  timestamp: string;
  north: number;
  south: number;
  east: number;
  west: number;
  central: number;
  nationalMax: number;
}

export interface AlertThresholdConfig {
  enabled: boolean;
  thresholdPsi: number; // e.g. 100, 150, 200, 300
  targetRegion: 'all' | RegionKey;
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  autoSnoozeMinutes: number;
}

export interface ActiveAlert {
  id: string;
  region: RegionKey;
  regionName: string;
  psi: number;
  threshold: number;
  band: PSIBandInfo;
  triggeredAt: string;
  isHazardous: boolean;
}

export interface AlertHistoryLog {
  id: string;
  timestamp: string;
  region: RegionKey;
  psi: number;
  level: PSIBandKey;
  message: string;
}
