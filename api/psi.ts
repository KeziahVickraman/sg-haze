import type { Request, Response } from 'express';

const UPSTREAM_V2_PSI_URL = 'https://api-open.data.gov.sg/v2/real-time/api/psi';

export interface V2PsiResponse {
  code: number;
  data: {
    regionMetadata?: Array<{
      name: string;
      labelLocation: {
        latitude: number;
        longitude: number;
      };
    }>;
    items?: Array<{
      date?: string;
      updatedTimestamp?: string;
      timestamp: string;
      readings: Record<string, Record<string, number>>;
    }>;
  };
  errorMsg: string;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  // Allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ code: 405, errorMsg: 'Method Not Allowed. Use GET.', data: {} });
    return;
  }

  try {
    // Construct upstream URL with optional query parameters (e.g., ?date=YYYY-MM-DD or ?date_time=...)
    const url = new URL(UPSTREAM_V2_PSI_URL);
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string' && value.trim()) {
          url.searchParams.set(key, value.trim());
        }
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const upstreamResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'SGHazeWatch/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstreamResponse.ok) {
      throw new Error(`Upstream API returned status ${upstreamResponse.status}`);
    }

    const json: V2PsiResponse = await upstreamResponse.json();

    // Cache responses for 60 seconds (Singapore NEA refreshes every hour/half-hour)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

    res.status(200).json(json);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown upstream error';

    // Fallback: If v2 fails or times out, try v1 fallback or return clean error response
    try {
      const v1Res = await fetch('https://api.data.gov.sg/v1/environment/psi', {
        headers: { Accept: 'application/json' },
      });
      if (v1Res.ok) {
        const v1Data = await v1Res.json();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).json({
          code: 0,
          data: {
            regionMetadata: v1Data.region_metadata?.map((rm: { name: string; label_location: { latitude: number; longitude: number } }) => ({
              name: rm.name,
              labelLocation: rm.label_location,
            })),
            items: v1Data.items?.map((item: { timestamp: string; update_timestamp: string; readings: Record<string, Record<string, number>> }) => ({
              date: item.timestamp.split('T')[0],
              updatedTimestamp: item.update_timestamp,
              timestamp: item.timestamp,
              readings: item.readings,
            })),
          },
          errorMsg: `v2 fallback: ${errorMsg}`,
        });
        return;
      }
    } catch {
      // Ignore fallback error
    }

    res.status(502).json({
      code: 502,
      errorMsg: `Failed to fetch live PSI data from LTA/data.gov.sg: ${errorMsg}`,
      data: {
        regionMetadata: [],
        items: [],
      },
    });
  }
}
