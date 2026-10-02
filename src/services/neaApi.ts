import { HourlyTrendPoint, LatestAirQualityData, RegionKey, RegionReadings } from '../types/haze';
import { PRESET_SCENARIOS, REGION_KEYS } from '../constants/hazeConstants';

// Primary endpoint: Local Serverless Express Route -> falls back to direct v2 / v1
const SERVERLESS_PSI_URL = '/api/psi';
const DIRECT_V2_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const DIRECT_V1_URL = 'https://api.data.gov.sg/v1/environment/psi';

// Reliable default baseline data in case of complete network block
const FALLBACK_DATA: LatestAirQualityData = {
  timestamp: new Date().toISOString(),
  updateTimestamp: new Date().toISOString(),
  source: 'cached',
  regions: {
    north: { psi24h: 58, pm25_24h: 21, pm10_24h: 30, o3_sub_index: 14, co_sub_index: 8, pm10_sub_index: 30, pm25_sub_index: 21, so2_sub_index: 4, co_8h_max: 1.1, so2_24h: 6, no2_1h_max: 18 },
    south: { psi24h: 72, pm25_24h: 31, pm10_24h: 45, o3_sub_index: 12, co_sub_index: 10, pm10_sub_index: 45, pm25_sub_index: 31, so2_sub_index: 3, co_8h_max: 1.2, so2_24h: 7, no2_1h_max: 22 },
    east: { psi24h: 68, pm25_24h: 29, pm10_24h: 42, o3_sub_index: 15, co_sub_index: 9, pm10_sub_index: 42, pm25_sub_index: 29, so2_sub_index: 2, co_8h_max: 1.0, so2_24h: 5, no2_1h_max: 19 },
    west: { psi24h: 65, pm25_24h: 26, pm10_24h: 41, o3_sub_index: 10, co_sub_index: 10, pm10_sub_index: 41, pm25_sub_index: 26, so2_sub_index: 5, co_8h_max: 1.3, so2_24h: 8, no2_1h_max: 25 },
    central: { psi24h: 74, pm25_24h: 33, pm10_24h: 48, o3_sub_index: 16, co_sub_index: 10, pm10_sub_index: 48, pm25_sub_index: 33, so2_sub_index: 4, co_8h_max: 1.1, so2_24h: 6, no2_1h_max: 24 },
  },
  national: {
    psi24h: 74,
    pm25_24h: 33,
    pm10_24h: 48,
    minPsi: 58,
    maxPsi: 74,
    dominantRegion: 'central',
    o3_sub_index: 16,
    co_sub_index: 10,
    pm10_sub_index: 48,
    pm25_sub_index: 33,
    so2_sub_index: 5,
    co_8h_max: 1.3,
    so2_24h: 8,
    no2_1h_max: 25,
  },
};

interface StandardItem {
  timestamp: string;
  updateTimestamp?: string;
  readings: Record<string, Record<string, number>>;
}

/**
 * Normalizes either v2 wrapped format or legacy v1 format
 */
function extractItems(rawJson: unknown): StandardItem[] {
  if (!rawJson || typeof rawJson !== 'object') return [];

  const obj = rawJson as Record<string, unknown>;

  // v2 wrapped format: { code: 0, data: { items: [...] } }
  if (obj.data && typeof obj.data === 'object') {
    const dataObj = obj.data as { items?: Array<{ timestamp?: string; updatedTimestamp?: string; readings?: Record<string, Record<string, number>> }> };
    if (Array.isArray(dataObj.items)) {
      return dataObj.items.map((it) => ({
        timestamp: it.timestamp || new Date().toISOString(),
        updateTimestamp: it.updatedTimestamp,
        readings: it.readings || {},
      }));
    }
  }

  // v1 format: { items: [...] }
  if (Array.isArray(obj.items)) {
    return (obj.items as Array<{ timestamp?: string; update_timestamp?: string; readings?: Record<string, Record<string, number>> }>).map((it) => ({
      timestamp: it.timestamp || new Date().toISOString(),
      updateTimestamp: it.update_timestamp,
      readings: it.readings || {},
    }));
  }

  return [];
}

/**
 * Fetches latest air quality from serverless endpoint, with automated fallbacks
 */
export async function fetchLiveAirQualityData(): Promise<LatestAirQualityData> {
  const endpoints = [SERVERLESS_PSI_URL, DIRECT_V2_URL, DIRECT_V1_URL];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const raw = await response.json();
      const items = extractItems(raw);

      if (items.length === 0) continue;

      const latestItem = items[items.length - 1];
      const readings = latestItem.readings;

      const psiReadings = readings['psi_twenty_four_hourly'] || {};
      const pm25Readings = readings['pm25_twenty_four_hourly'] || {};
      const pm10Readings = readings['pm10_twenty_four_hourly'] || {};
      const o3Readings = readings['o3_sub_index'] || {};
      const coReadings = readings['co_sub_index'] || {};
      const pm10Sub = readings['pm10_sub_index'] || {};
      const pm25Sub = readings['pm25_sub_index'] || {};
      const so2Sub = readings['so2_sub_index'] || {};
      const co8h = readings['co_eight_hour_max'] || {};
      const so224h = readings['so2_twenty_four_hourly'] || {};
      const no21h = readings['no2_one_hour_max'] || {};

      const regionData: Record<RegionKey, RegionReadings> = {} as Record<RegionKey, RegionReadings>;

      let minPsi = Infinity;
      let maxPsi = -Infinity;
      let dominantRegion: RegionKey = 'central';

      for (const key of REGION_KEYS) {
        const psi = psiReadings[key] ?? 50;
        if (psi < minPsi) minPsi = psi;
        if (psi > maxPsi) {
          maxPsi = psi;
          dominantRegion = key;
        }

        regionData[key] = {
          psi24h: psi,
          pm25_24h: pm25Readings[key] ?? Math.round(psi * 0.42),
          pm10_24h: pm10Readings[key] ?? Math.round(psi * 0.65),
          o3_sub_index: o3Readings[key],
          co_sub_index: coReadings[key],
          pm10_sub_index: pm10Sub[key],
          pm25_sub_index: pm25Sub[key],
          so2_sub_index: so2Sub[key],
          co_8h_max: co8h[key],
          so2_24h: so224h[key],
          no2_1h_max: no21h[key],
        };
      }

      if (minPsi === Infinity) minPsi = 50;
      if (maxPsi === -Infinity) maxPsi = 50;

      const nationalPsi = psiReadings['national'] ?? maxPsi;

      return {
        timestamp: latestItem.timestamp,
        updateTimestamp: latestItem.updateTimestamp || latestItem.timestamp,
        source: 'live_api',
        regions: regionData,
        national: {
          psi24h: nationalPsi,
          pm25_24h: regionData[dominantRegion]?.pm25_24h ?? 30,
          pm10_24h: regionData[dominantRegion]?.pm10_24h ?? 45,
          minPsi,
          maxPsi,
          dominantRegion,
          o3_sub_index: regionData[dominantRegion]?.o3_sub_index,
          co_sub_index: regionData[dominantRegion]?.co_sub_index,
          pm10_sub_index: regionData[dominantRegion]?.pm10_sub_index,
          pm25_sub_index: regionData[dominantRegion]?.pm25_sub_index,
          so2_sub_index: regionData[dominantRegion]?.so2_sub_index,
          co_8h_max: regionData[dominantRegion]?.co_8h_max,
          so2_24h: regionData[dominantRegion]?.so2_24h,
          no2_1h_max: regionData[dominantRegion]?.no2_1h_max,
        },
      };
    } catch {
      // Continue to next endpoint in list
    }
  }

  // Fallback to baseline
  const now = new Date();
  return {
    ...FALLBACK_DATA,
    timestamp: now.toISOString(),
    updateTimestamp: now.toISOString(),
    source: 'cached',
  };
}

/**
 * Fetches 24-hour historical readings for the regional trend chart
 */
export async function fetchHourlyHistory(): Promise<HourlyTrendPoint[]> {
  const today = new Date().toISOString().split('T')[0];
  const endpoints = [
    `${SERVERLESS_PSI_URL}?date=${today}`,
    `${DIRECT_V2_URL}?date=${today}`,
    `${DIRECT_V1_URL}?date=${today}`,
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const raw = await res.json();
      const items = extractItems(raw);

      if (items.length === 0) continue;

      return items.map((item) => {
        const readings = item.readings?.psi_twenty_four_hourly || {};
        const d = new Date(item.timestamp);
        const timeLabel = d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });

        const n = readings.north ?? 50;
        const s = readings.south ?? 50;
        const e = readings.east ?? 50;
        const w = readings.west ?? 50;
        const c = readings.central ?? 50;
        const maxVal = Math.max(n, s, e, w, c);

        return {
          timeLabel,
          timestamp: item.timestamp,
          north: n,
          south: s,
          east: e,
          west: w,
          central: c,
          nationalMax: readings.national ?? maxVal,
        };
      });
    } catch {
      // Continue to next fallback
    }
  }

  // Generate synthetic 24-hr historical arc based on current baseline
  const points: HourlyTrendPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const hourStr = t.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
    const variance = Math.sin((i / 24) * Math.PI * 2) * 8;

    const north = Math.round(55 + variance + (i % 3));
    const south = Math.round(68 + variance * 1.2 - (i % 2));
    const east = Math.round(64 + variance * 0.9);
    const west = Math.round(62 + variance * 1.1 + (i % 4));
    const central = Math.round(71 + variance * 1.3);

    points.push({
      timeLabel: hourStr,
      timestamp: t.toISOString(),
      north,
      south,
      east,
      west,
      central,
      nationalMax: Math.max(north, south, east, west, central),
    });
  }
  return points;
}

/**
 * Creates simulated air quality data for preset scenarios or custom values
 */
export function createSimulatedData(scenarioId: string, customOverrides?: Partial<Record<RegionKey, number>>): LatestAirQualityData {
  const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId) || PRESET_SCENARIOS[0];
  const now = new Date().toISOString();

  const regions: Record<RegionKey, RegionReadings> = {} as Record<RegionKey, RegionReadings>;
  let minPsi = Infinity;
  let maxPsi = -Infinity;
  let dominantRegion: RegionKey = 'west';

  for (const key of REGION_KEYS) {
    const baseVal = scenario.values[key];
    const psi = customOverrides && customOverrides[key] !== undefined ? customOverrides[key]! : baseVal.psi;
    const pm25 = Math.round(psi * 0.88);
    const pm10 = Math.round(psi * 1.05);

    if (psi < minPsi) minPsi = psi;
    if (psi > maxPsi) {
      maxPsi = psi;
      dominantRegion = key;
    }

    regions[key] = {
      psi24h: psi,
      pm25_24h: pm25,
      pm10_24h: pm10,
      o3_sub_index: Math.min(100, Math.round(psi * 0.25)),
      co_sub_index: Math.min(50, Math.round(psi * 0.12)),
      pm10_sub_index: pm10,
      pm25_sub_index: pm25,
      so2_sub_index: Math.min(80, Math.round(psi * 0.18)),
      co_8h_max: Number((psi * 0.02).toFixed(1)),
      so2_24h: Math.round(psi * 0.15),
      no2_1h_max: Math.min(120, Math.round(psi * 0.35)),
    };
  }

  return {
    timestamp: now,
    updateTimestamp: now,
    source: 'simulation',
    regions,
    national: {
      psi24h: maxPsi,
      pm25_24h: regions[dominantRegion].pm25_24h,
      pm10_24h: regions[dominantRegion].pm10_24h,
      minPsi,
      maxPsi,
      dominantRegion,
      o3_sub_index: regions[dominantRegion].o3_sub_index,
      co_sub_index: regions[dominantRegion].co_sub_index,
      pm10_sub_index: regions[dominantRegion].pm10_sub_index,
      pm25_sub_index: regions[dominantRegion].pm25_sub_index,
      so2_sub_index: regions[dominantRegion].so2_sub_index,
      co_8h_max: regions[dominantRegion].co_8h_max,
      so2_24h: regions[dominantRegion].so2_24h,
      no2_1h_max: regions[dominantRegion].no2_1h_max,
    },
  };
}
