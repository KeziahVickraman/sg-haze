import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();

  let upstreamStatus = 'unknown';
  let latencyMs = 0;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const upstreamRes = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    latencyMs = Date.now() - startTime;
    upstreamStatus = upstreamRes.ok ? 'connected' : `upstream_error_${upstreamRes.status}`;
  } catch (err: unknown) {
    latencyMs = Date.now() - startTime;
    upstreamStatus = err instanceof Error ? `disconnected: ${err.message}` : 'disconnected';
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'LTA DataMall & data.gov.sg Environment PSI Proxy',
    endpoints: {
      health: '/api/health',
      psi: '/api/psi',
    },
    upstream: {
      endpoint: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
      status: upstreamStatus,
      latencyMs,
    },
  });
}
