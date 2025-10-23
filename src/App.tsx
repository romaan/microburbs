import { useEffect, useMemo, useRef, useState } from 'react';
import type { DevData, FetchArgs } from './types';
import { fetchDevelopment, loadDemo, prettyError } from './api';

/* ---------------- Schema helpers ---------------- */

function flatten(obj: Record<string, unknown> | null | undefined, prefix = '', out: Record<string, unknown> = {}) {
  if (!obj) return out;
  Object.entries(obj).forEach(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v as Record<string, unknown>, key, out);
    else out[key] = v as unknown;
  });
  return out;
}

function prettifyKey(k: string) {
  return k
    .split(/[._]/g)
    .map(x => x.replace(/([a-z])([A-Z])/g, '$1 $2'))
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');
}

function classifyValue(v: unknown): 'num' | 'bool' | 'short' | 'json' {
  if (typeof v === 'number') return 'num';
  if (typeof v === 'boolean') return 'bool';
  if (typeof v === 'string' && v.length > 0 && v.length < 120) return 'short';
  return 'json';
}

function formatNumber(n: number) {
  if (!isFinite(n)) return String(n);
  if (Math.abs(n) >= 1000) return new Intl.NumberFormat().format(n);
  return String(n);
}

type Section = { title: string; path: string; rows: { k: string; v: unknown }[] };

function collectSections(obj: Record<string, unknown>, basePath = ''): Section[] {
  const sections: Section[] = [];
  const scalars: { k: string; v: unknown }[] = [];

  for (const [k, v] of Object.entries(obj || {})) {
    const path = basePath ? `${basePath}.${k}` : k;
    if (v && typeof v === 'object') {
      if (Array.isArray(v)) {
        const rows = v.map((item, i) => ({ k: `#${i + 1}`, v: item }));
        sections.push({ title: k, path, rows });
      } else {
        sections.push(...collectSections(v as Record<string, unknown>, path));
      }
    } else {
      scalars.push({ k, v });
    }
  }

  if (scalars.length) sections.unshift({ title: basePath || 'Overview', path: basePath, rows: scalars });
  return sections;
}

/* ---------------- UI ---------------- */

type SummaryCard = {
  label: string;
  value: string;
  hint?: string;
};

type RowData = {
  k: string;
  v: string | number | boolean;
  t: 'num' | 'bool' | 'short' | 'json';
};

type SectionWithCount = Section & { count: number; rows: RowData[] };

export default function App() {
  const [q, setQ] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<DevData | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  function toArgs(): FetchArgs {
    const args: FetchArgs = {};
    if (q.trim()) args.q = q.trim();
    if (lat !== '') args.lat = Number(lat);
    if (lng !== '') args.lng = Number(lng);
    return args;
  }

  const summaryCards = useMemo((): SummaryCard[] => {
    if (!raw) return [];
    const flat = flatten(raw);
    const numericEntries = Object.entries(flat).filter(([, v]) => typeof v === 'number') as [string, number][];
    const shortText = Object.entries(flat).filter(([, v]) => typeof v === 'string' && (v as string).length < 80) as [string, string][];

    const topNums: SummaryCard[] = numericEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => ({ label: prettifyKey(k), value: formatNumber(v) }));

    const topText: SummaryCard[] = shortText.slice(0, 2).map(([k, v]) => ({ label: prettifyKey(k), value: v, hint: 'text field' }));

    return [...topNums, ...topText];
  }, [raw]);

  const sections = useMemo((): SectionWithCount[] => {
    if (!raw) return [];
    const groups = collectSections(raw as Record<string, unknown>);
    return groups.map(g => ({
      title: prettifyKey(g.title),
      path: g.path,
      count: g.rows.length,
      rows: g.rows.map(r => {
        const t = classifyValue(r.v);
        const displayValue = t === 'num' ? formatNumber(r.v as number) : String(r.v);
        return { k: prettifyKey(r.k), v: displayValue, t };
      })
    }));
  }, [raw]);

  function cancelInFlight() {
    abortRef.current?.abort();
    abortRef.current = null;
  }

  async function onSearch() {
    setError(null);
    setLoading(true);
    setRaw(null);
    cancelInFlight();

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const data = await fetchDevelopment(toArgs(), ac.signal);
      setRaw(data);
    } catch (e) {
      setError(prettyError(e));
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  async function onDemo() {
    setError(null);
    setLoading(true);
    setRaw(null);
    cancelInFlight();

    try {
      const data = await loadDemo();
      setRaw(data);
    } catch {
      setError('Could not load demo payload.');
    } finally {
      setLoading(false);
    }
  }

  // clean up on unmount
  useEffect(() => () => cancelInFlight(), []);

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/75 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-lg font-semibold">Microburbs Development Explorer</div>
          <div className="ml-auto">
            <a
              className="text-sm text-indigo-600 hover:underline"
              href="https://www.microburbs.com.au/report_generator/api/sandbox/property/development"
              target="_blank" rel="noreferrer"
            >
              API Sandbox ↗
            </a>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="card p-4">
          <div className="grid md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-6">
              <label className="block text-sm text-slate-600 mb-1">Address / Query (free-form)</label>
              <input
                className="w-full rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 123 George St, Sydney NSW"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Latitude (optional)</label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="-33.86"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-600 mb-1">Longitude (optional)</label>
              <input
                type="number"
                className="w-full rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="151.21"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                onClick={onSearch}
                className="w-full h-10 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
              >
                Search
              </button>
              <button
                onClick={onDemo}
                className="h-10 rounded-xl border border-indigo-300 text-indigo-700 font-medium px-4 hover:bg-indigo-50 transition"
                title="Load a safe demo payload"
              >
                Demo
              </button>
            </div>
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="mt-4">
            <div className="h-1 w-full bg-indigo-100 rounded overflow-hidden">
              <div className="h-full bg-indigo-600 animate-[indeterminate_1.2s_linear_infinite]" />
            </div>
            <style>
              {`@keyframes indeterminate {
                  0% { transform: translateX(-100%); width: 40%; }
                  50% { transform: translateX(40%); width: 60%; }
                  100% { transform: translateX(100%); width: 40%; }
               }`}
            </style>
          </div>
        )}

        {error && (
          <div className="card mt-4 border-red-200 bg-red-50">
            <div className="p-4">
              <div className="text-red-800 font-medium mb-1">Could not load data.</div>
              <div className="text-sm opacity-80">{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && !raw && (
          <div className="card mt-4">
            <div className="p-4 text-slate-600">
              <p className="mb-2">Enter a search or click <b>Demo</b> to see how the dashboard works.</p>
              <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-3">
                <strong>Development Mode:</strong> The live API is not available locally. 
                Use the "Demo" button to explore the interface with sample data.
              </div>
            </div>
          </div>
        )}

        {/* KPIs */}
        {!!summaryCards.length && (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {summaryCards.map((c, idx) => (
              <div key={idx} className="card p-4">
                <div className="text-xs uppercase tracking-wide text-slate-500">{c.label}</div>
                <div className="text-2xl font-semibold leading-7">{c.value}</div>
                {c.hint && (
                  <div className="text-xs text-slate-500">{c.hint}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sections */}
        {!!sections.length && (
          <div className="mt-4 space-y-3">
            {sections.map((s, i) => (
              <details key={i} className="card">
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
                  <div className="font-medium">
                    {s.title} {s.count ? <span className="text-slate-500 text-xs ml-2">({s.count})</span> : null}
                  </div>
                  <div className="text-slate-400 text-sm">{s.path}</div>
                </summary>
                <div className="divide-y">
                  {s.rows.map((row: RowData, rIdx: number) => (
                    <div key={rIdx} className="grid grid-cols-12 py-2 px-4">
                      <div className="col-span-5 pr-4 text-slate-600">{row.k}</div>
                      <div className="col-span-7 font-medium break-words">
                        {row.t === 'num' && <span>{row.v}</span>}
                        {row.t === 'bool' && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${
                              row.v ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {row.v ? 'Yes' : 'No'}
                          </span>
                        )}
                        {row.t === 'short' && <span>{row.v}</span>}
                        {row.t === 'json' && (
                          <pre className="text-xs bg-slate-50 p-2 rounded border overflow-auto max-h-48">
                            {JSON.stringify(row.v, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}

        {/* JSON inspector */}
        {raw && (
          <div className="card mt-4 bg-slate-50">
            <div className="p-3 text-sm text-slate-600 border-b">Raw JSON (always available):</div>
            <pre className="p-3 overflow-auto max-h-[40rem] text-sm">{JSON.stringify(raw, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
