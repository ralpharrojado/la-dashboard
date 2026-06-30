'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeads } from '@/lib/LeadsContext';
import { StatusBadge, LeadTypeBadge, TrackBadge, StaleBadge } from '@/components/StatusBadge';
import {
  LEAD_SOURCES,
  LEAD_TYPES,
  BUDGET_BANDS,
  ALL_STATUSES,
  STALE_EXCLUDED,
  STALE_DAYS,
} from '@/lib/constants';

function isStale(lead) {
  if (STALE_EXCLUDED.includes(lead.status)) return false;
  if (!lead.last_contact_date) return true;
  const diff = (Date.now() - new Date(lead.last_contact_date).getTime()) / 86400000;
  return diff > STALE_DAYS;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function PipelinePage() {
  const { leads, initialized } = useLeads();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterType && l.lead_type !== filterType) return false;
        if (filterStatus && l.status !== filterStatus) return false;
        if (filterSource && l.lead_source !== filterSource) return false;
        return true;
      })
      .sort((a, b) => {
        let av = a[sortField] ?? '';
        let bv = b[sortField] ?? '';
        if (sortField === 'created_at' || sortField === 'event_date' || sortField === 'last_contact_date') {
          av = new Date(av || 0).getTime();
          bv = new Date(bv || 0).getTime();
        } else {
          av = String(av).toLowerCase();
          bv = String(bv).toLowerCase();
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
  }, [leads, search, filterType, filterStatus, filterSource, sortField, sortDir]);

  function toggleSort(field) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const staleCount = leads.filter(isStale).length;

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-300 ml-1">↕</span>;
    return <span className="text-amber-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Pipeline</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {leads.length} total leads
            {staleCount > 0 && (
              <span className="ml-2 text-red-600 font-medium">· {staleCount} need follow-up</span>
            )}
          </p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold text-sm rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Lead
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-700"
          >
            <option value="">All Types</option>
            {Object.entries(LEAD_TYPES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-700"
          >
            <option value="">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={e => setFilterSource(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-700"
          >
            <option value="">All Sources</option>
            {Object.entries(LEAD_SOURCES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {(search || filterType || filterStatus || filterSource) && (
            <button
              onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); setFilterSource(''); }}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => toggleSort('name')}
                >
                  Name <SortIcon field="name" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Status</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => toggleSort('budget_band')}
                >
                  Budget <SortIcon field="budget_band" />
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => toggleSort('event_date')}
                >
                  Event Date <SortIcon field="event_date" />
                </th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => toggleSort('last_contact_date')}
                >
                  Last Contact <SortIcon field="last_contact_date" />
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Flag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No leads match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  const stale = isStale(lead);
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-amber-50/40 cursor-pointer transition-colors"
                      onClick={() => window.location.href = `/leads/${lead.id}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{lead.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <LeadTypeBadge type={lead.lead_type} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={lead.status} />
                          <TrackBadge wantsTourOnly={lead.wants_tour_only} />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {BUDGET_BANDS[lead.budget_band] || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(lead.event_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(lead.last_contact_date)}
                      </td>
                      <td className="px-4 py-3">
                        {stale && <StaleBadge />}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-400">
            Showing {filtered.length} of {leads.length} leads
          </div>
        )}
      </div>
    </div>
  );
}
