'use client';
import { useMemo, useState } from 'react';
import { useLeads } from '@/lib/LeadsContext';
import { StatusBadge, LeadTypeBadge } from '@/components/StatusBadge';
import { BUDGET_BANDS, LEAD_TYPES, STATUS_COLORS } from '@/lib/constants';

const DATE_RANGES = [
  { key: 'all', label: 'All time' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'month', label: 'This month' },
];

function inRange(lead, range) {
  if (range === 'all') return true;
  const created = new Date(lead.created_at).getTime();
  const now = Date.now();
  if (range === '30d') return now - created <= 30 * 86400000;
  if (range === 'month') {
    const d = new Date();
    return new Date(lead.created_at).getMonth() === d.getMonth() &&
           new Date(lead.created_at).getFullYear() === d.getFullYear();
  }
  return true;
}

function StatCard({ label, value, sub, color = 'amber' }) {
  const bg = { amber: 'bg-amber-50 border-amber-200', emerald: 'bg-emerald-50 border-emerald-200', blue: 'bg-blue-50 border-blue-200', rose: 'bg-rose-50 border-rose-200' };
  const text = { amber: 'text-amber-700', emerald: 'text-emerald-700', blue: 'text-blue-700', rose: 'text-rose-700' };
  return (
    <div className={`rounded-xl border p-5 ${bg[color]}`}>
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const { leads, initialized } = useLeads();
  const [range, setRange] = useState('all');

  const filtered = useMemo(() => leads.filter(l => inRange(l, range)), [leads, range]);

  const byType = useMemo(() => {
    const m = { wedding: 0, corporate: 0, other: 0 };
    filtered.forEach(l => { if (m[l.lead_type] !== undefined) m[l.lead_type]++; });
    return m;
  }, [filtered]);

  const byStatus = useMemo(() => {
    const m = {};
    filtered.forEach(l => { m[l.status] = (m[l.status] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  const byBudget = useMemo(() => {
    const order = ['under_10k', '10k_20k', '20k_30k', '30k_50k', '50k_plus'];
    const m = {};
    filtered.forEach(l => { m[l.budget_band] = (m[l.budget_band] || 0) + 1; });
    return order.map(k => ({ key: k, label: BUDGET_BANDS[k], count: m[k] || 0 }));
  }, [filtered]);

  const signedCount = filtered.filter(l => l.status === 'Signed').length;
  const disqualCount = filtered.filter(l => l.status === 'Disqualified').length;
  const activeCount = filtered.filter(l => !['Disqualified', 'Lost', 'Goes Cold', 'Signed'].includes(l.status)).length;
  const staleCount = filtered.filter(l => {
    if (['Disqualified', 'Signed', 'Lost', 'Goes Cold'].includes(l.status)) return false;
    if (!l.last_contact_date) return true;
    return (Date.now() - new Date(l.last_contact_date).getTime()) / 86400000 > 5;
  }).length;

  const maxStatus = byStatus[0]?.[1] || 1;

  if (!initialized) {
    return <div className="flex items-center justify-center h-full"><div className="text-gray-400 text-sm">Loading…</div></div>;
  }

  return (
    <div className="px-4 lg:px-8 py-8 pt-14 lg:pt-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Pipeline summary and lead distribution</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {DATE_RANGES.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                range === r.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Leads" value={filtered.length} sub="in selected range" color="blue" />
        <StatCard label="Active" value={activeCount} sub="in open stages" color="amber" />
        <StatCard label="Signed" value={signedCount} sub="closed won" color="emerald" />
        <StatCard label="Need Follow-up" value={staleCount} sub="stale ≥ 5 days" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* By Lead Type */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Type</h3>
          <div className="space-y-3">
            {Object.entries(LEAD_TYPES).map(([key, label]) => {
              const count = byType[key] || 0;
              const pct = filtered.length > 0 ? (count / filtered.length) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <LeadTypeBadge type={key} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        key === 'wedding' ? 'bg-pink-400' : key === 'corporate' ? 'bg-slate-400' : 'bg-gray-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{Math.round(pct)}% of total</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Budget Band */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Budget Band</h3>
          <div className="space-y-3">
            {byBudget.map(({ key, label, count }) => {
              const pct = filtered.length > 0 ? (count / filtered.length) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{label}</span>
                    <span className="text-sm font-semibold text-gray-700">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* By Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Leads by Status</h3>
        {byStatus.length === 0 ? (
          <p className="text-sm text-gray-400">No leads in selected range.</p>
        ) : (
          <div className="space-y-2.5">
            {byStatus.map(([status, count]) => {
              const pct = (count / maxStatus) * 100;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-36 flex-shrink-0">
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-stone-400 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6 text-right">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Disqualified note */}
      {disqualCount > 0 && (
        <div className="mt-4 flex items-start gap-2 p-3.5 bg-amber-50 rounded-lg border border-amber-200">
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-amber-700">
            <strong>{disqualCount} lead{disqualCount > 1 ? 's' : ''} auto-disqualified</strong> by the budget gate rule
            (wedding + under 75 guests + budget &lt; $30k). Thresholds are placeholders — confirm with Tiffany and Mike.
          </p>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
