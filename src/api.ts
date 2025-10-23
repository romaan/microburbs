import type { DevData, FetchArgs } from './types';

const BASE = '/mb/report_generator/api/sandbox/property/development';

// simple in-memory cache
const cache = new Map<string, Promise<DevData>>();

function qs(obj: Record<string, unknown>) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    p.set(k, String(v));
  });
  return p.toString();
}

export function fetchDevelopment(args: FetchArgs, signal?: AbortSignal): Promise<DevData> {
  const key = qs(args);
  if (cache.has(key)) return cache.get(key)!;

  const url = key ? `${BASE}?${key}` : BASE;
  const req = fetch(url, { signal })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status} ${r.statusText}`);
      const json = (await r.json()) as DevData;
      return json ?? {};
    })
    .catch((e) => {
      // bubble up; caller handles user-friendly messaging
      throw e;
    });

  cache.set(key, req);
  return req;
}

export function loadDemo(): Promise<DevData> {
  const demo: DevData = {
    address: '123 George St, Sydney NSW',
    zoning: { code: 'B8', name: 'Metropolitan Centre', floorSpaceRatio: 10.5, maxHeightMeters: 235 },
    lot: { areaSqm: 1450, frontageM: 28.4, depthM: 51.2, corner: true },
    overlays: [
      { name: 'Heritage Conservation Area', applies: true },
      { name: 'Flood Planning', applies: false }
    ],
    nearby: { schoolsWithin1km: 4, trainStationsWithin1km: 1, walkScore: 98, transitScore: 100 },
    council: { name: 'City of Sydney', devAppsLast12m: 712, medianProcessingDays: 37 }
  };
  return Promise.resolve(demo);
}

export function prettyError(e: unknown): string {
  if (e instanceof DOMException && e.name === 'AbortError') return 'Request cancelled.';
  if (e instanceof Error) {
    // Handle common JSON parsing errors that occur when API returns HTML
    if (e.message.includes('Unexpected token') && e.message.includes('<!DOCTYPE')) {
      return 'API endpoint not available in development mode. Try the "Demo" button instead.';
    }
    return e.message;
  }
  return 'Unexpected error.';
}
