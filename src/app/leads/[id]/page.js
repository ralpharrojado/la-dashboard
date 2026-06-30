'use client';
import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Pre-generate pages for IDs 1–100 (covers all seed leads + ~80 new leads created during demo)
export function generateStaticParams() {
  return Array.from({ length: 100 }, (_, i) => ({ id: String(i + 1) }));
}
import { useLeads } from '@/lib/LeadsContext';
import { StatusBadge, LeadTypeBadge, TrackBadge, StaleBadge } from '@/components/StatusBadge';
import {
  LEAD_SOURCES,
  LEAD_TYPES,
  BUDGET_BANDS,
  GUIDES,
  MAIN_TRACK_TRANSITIONS,
  TOUR_TRACK_TRANSITIONS,
  PROPOSAL_STAGES,
  STALE_EXCLUDED,
  STALE_DAYS,
} from '@/lib/constants';

function isStale(lead) {
  if (STALE_EXCLUDED.includes(lead.status)) return false;
  if (!lead.last_contact_date) return true;
  const diff = (Date.now() - new Date(lead.last_contact_date).getTime()) / 86400000;
  return diff > STALE_DAYS;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Section card wrapper
function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide sm:w-36 flex-shrink-0 pt-0.5">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? 'font-mono' : ''}`}>{value || '—'}</span>
    </div>
  );
}

// Tour track panel (rule 4)
function TourPanel({ lead, onUpdate }) {
  return (
    <Card title="Tour Track">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Guide Assigned</label>
          <select
            value={lead.guide_assigned || 'unassigned'}
            onChange={e => onUpdate({ guide_assigned: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {Object.entries(GUIDES).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Tour Date</label>
          <input
            type="date"
            value={lead.tour_date || ''}
            onChange={e => onUpdate({ tour_date: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 p-3 bg-teal-50 rounded-lg border border-teal-100">
        <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-xs text-teal-700">
          <strong>Send calendar invite</strong> — action label only (not wired in demo)
        </span>
      </div>
    </Card>
  );
}

// Proposal panels (rule 6)
function ProposalPanels({ lead, onUpdate }) {
  const isWedding = lead.lead_type === 'wedding';
  const isCorporate = lead.lead_type === 'corporate';

  return (
    <Card title="Proposal Track">
      {/* Wedding: property tour reminder when Proposal Sent */}
      {isWedding && lead.status === 'Proposal Sent' && (
        <div className="mb-4 flex items-start gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-lg">
          <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-orange-800">Property tour required before close</p>
            <p className="text-xs text-orange-600 mt-0.5">Wedding leads must complete an in-person venue tour prior to contract signing.</p>
          </div>
        </div>
      )}

      {/* All leads: Availability + Exclusivity checkboxes */}
      <div className="space-y-3 mb-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!lead.availability_confirmed}
            onChange={e => onUpdate({ availability_confirmed: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
          />
          <div>
            <span className="text-sm font-medium text-gray-800">Date availability confirmed</span>
            <span className="block text-xs text-gray-400">Represents Cloudbeds date check</span>
          </div>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={!!lead.exclusivity_chosen}
            onChange={e => onUpdate({ exclusivity_chosen: e.target.checked })}
            className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
          />
          <span className="text-sm font-medium text-gray-800">Exclusivity outlined in proposal?</span>
        </label>
      </div>

      {/* Wedding: revise proposal checklist */}
      {isWedding && (
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Revise Proposal Checklist</p>
          <div className="space-y-2">
            {['Lodging package reviewed', 'Beverage package reviewed', 'Event package reviewed'].map(item => (
              <label key={item} className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400" />
                <span className="text-sm text-gray-700">{item}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Corporate: edit counter */}
      {isCorporate && (
        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Proposal Edit Counter</p>
              <p className="text-sm text-gray-700">
                <span className="text-2xl font-bold text-gray-900">{lead.proposal_edit_count}</span>
                <span className="text-gray-400 ml-1.5">of ~5–6 typical edits</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">3–6 week timeline is normal for corporate.</p>
            </div>
            <button
              onClick={() => onUpdate({ proposal_edit_count: (lead.proposal_edit_count || 0) + 1 })}
              className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-lg transition-colors"
            >
              +1 Edit
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Post-signature checklist (rule 7)
function PostSigChecklist({ lead, onChecklistUpdate }) {
  const checklist = lead.checklist || {};
  const isExcl = lead.exclusivity_chosen;

  const items = [
    { key: 'invoice_sent', label: 'Invoice created and sent to Accounting' },
    { key: 'coordinator_notified', label: 'Event Coordinator notified' },
    { key: 'catering_notified', label: 'Catering team notified' },
    { key: 'front_desk_notified', label: 'Front desk notified' },
    { key: 'confirmation_email', label: 'Confirmation email sent to client' },
    ...(isExcl ? [
      { key: 'exclusivity_calendar', label: 'Mark exclusive in Google Calendar', conditional: true },
      { key: 'exclusivity_cloudbeds', label: 'Mark exclusive in Cloudbeds', conditional: true },
    ] : []),
  ];

  const completed = items.filter(i => !!checklist[i.key]).length;
  const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;

  return (
    <Card title="Post-Signature Checklist">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">{completed}/{items.length} complete</span>
          <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-600' : 'text-gray-600'}`}>{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {items.map(item => (
          <label key={item.key} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={!!checklist[item.key]}
              onChange={e => onChecklistUpdate(item.key, e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-emerald-500 border-gray-300 focus:ring-emerald-400"
            />
            <div className="flex-1">
              <span className={`text-sm ${checklist[item.key] ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {item.label}
              </span>
              {item.conditional && (
                <span className="ml-2 text-xs text-amber-600 font-medium">(exclusivity)</span>
              )}
            </div>
          </label>
        ))}
      </div>

      {pct === 100 && (
        <div className="mt-4 flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-emerald-700">All post-signature tasks complete!</span>
        </div>
      )}
    </Card>
  );
}

// Nurture cadence label (rule 5)
function NurtureCadenceLabel({ leadType }) {
  if (leadType === 'wedding') {
    return (
      <div className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg border border-pink-100">
        <svg className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide mb-0.5">Wedding Nurture Cadence</p>
          <p className="text-sm text-pink-800">Engage immediately → value touchpoint at 3 days → sunset at 30 days</p>
        </div>
      </div>
    );
  }
  if (leadType === 'corporate') {
    return (
      <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <svg className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v1H4v-1h1v-2a1 1 0 011-1h8a1 1 0 011 1z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-0.5">Corporate Nurture Cadence</p>
          <p className="text-sm text-slate-700">Evergreen — stay top of mind year-round, referral-focused</p>
        </div>
      </div>
    );
  }
  return null;
}

export default function LeadDetailPage({ params }) {
  const { id } = use(params);
  const { getLead, updateLead, updateChecklist, addNote, initialized } = useLeads();
  const [banner, setBanner] = useState(null);
  const [saved, setSaved] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [postingNote, setPostingNote] = useState(false);
  const notesEndRef = useRef(null);

  const lead = getLead(id);

  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get('banner');
    if (b) setBanner(b);
  }, []);

  if (!initialized) {
    return <div className="flex items-center justify-center h-full"><div className="text-gray-400 text-sm">Loading…</div></div>;
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">Lead not found.</p>
        <Link href="/" className="text-amber-600 text-sm hover:underline">← Back to pipeline</Link>
      </div>
    );
  }

  const stale = isStale(lead);
  const transitions = lead.wants_tour_only
    ? (TOUR_TRACK_TRANSITIONS[lead.status] || [])
    : (MAIN_TRACK_TRANSITIONS[lead.status] || []);
  const showProposalPanels = PROPOSAL_STAGES.includes(lead.status);
  const showTourPanel = lead.wants_tour_only;

  function patch(changes) {
    updateLead(id, changes);
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleStatusChange(e) {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === lead.status) return;
    patch({ status: newStatus });
  }

  function logContactToday() {
    const today = new Date().toISOString().split('T')[0];
    patch({ last_contact_date: today });
  }

  function handlePostNote(e) {
    e.preventDefault();
    const text = newNoteText.trim();
    if (!text) return;
    setPostingNote(true);
    addNote(id, text);
    setNewNoteText('');
    setPostingNote(false);
    setTimeout(() => notesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-14 lg:pt-8">
      {/* Banner after intake form redirect */}
      {banner === 'disqualified' && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-800">Lead auto-disqualified</p>
            <p className="text-xs text-red-600 mt-0.5">
              Wedding with fewer than {75} guests and budget under $30k was automatically set to Disqualified.
              Threshold is a placeholder — confirm with Tiffany and Mike.
            </p>
          </div>
          <button onClick={() => setBanner(null)} className="ml-auto text-red-400 hover:text-red-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {banner === 'qualified' && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Lead added to pipeline</p>
            <p className="text-xs text-emerald-600 mt-0.5">Lead passed the budget gate and is set to New.</p>
          </div>
          <button onClick={() => setBanner(null)} className="ml-auto text-emerald-400 hover:text-emerald-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Back + saved indicator */}
      <div className="flex items-center justify-between mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Pipeline
        </Link>
        {saved && (
          <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved
          </span>
        )}
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <LeadTypeBadge type={lead.lead_type} size="md" />
              <TrackBadge wantsTourOnly={lead.wants_tour_only} />
              {stale && <StaleBadge />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">{lead.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Added {formatDateTime(lead.created_at)} · {LEAD_SOURCES[lead.lead_source] || lead.lead_source}
            </p>
          </div>

          {/* Status dropdown */}
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <StatusBadge status={lead.status} size="md" />
            {transitions.length > 0 && (
              <div>
                <label className="block text-xs text-gray-400 mb-1">Move to:</label>
                <select
                  onChange={handleStatusChange}
                  value=""
                  className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white text-gray-700"
                >
                  <option value="">Select next status…</option>
                  {transitions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Phone-given action badge (rule 3) */}
        {lead.phone_given && lead.status === 'New' && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Call + text now</p>
              <p className="text-xs text-amber-600">Phone number provided — new lead, reach out immediately</p>
            </div>
            {lead.phone && (
              <span className="ml-auto text-sm font-medium text-amber-800">{lead.phone}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contact & Event Info */}
        <Card title="Contact & Event Info">
          <InfoRow label="Email" value={lead.email} />
          <InfoRow label="Phone" value={lead.phone || 'Not provided'} />
          <InfoRow label="Event Date" value={formatDate(lead.event_date)} />
          <InfoRow label="Guest Count" value={lead.guest_count ? `${lead.guest_count} guests` : null} />
          <InfoRow label="Budget Band" value={BUDGET_BANDS[lead.budget_band]} />
          <InfoRow label="Dates Flexible" value={lead.dates_flexible ? 'Yes' : 'No'} />
          <InfoRow label="Lodging Needed" value={lead.lodging_needed ? 'Yes' : 'No'} />
          <InfoRow label="Spaces" value={lead.spaces_requested} />
          <InfoRow label="Add-Ons" value={lead.add_ons} />
        </Card>

        {/* Assignment & Meta */}
        <div className="space-y-4">
          <Card title="Assignment">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Guide Assigned</label>
              <select
                value={lead.guide_assigned || 'unassigned'}
                onChange={e => patch({ guide_assigned: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {Object.entries(GUIDES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </Card>

          {/* Nurture cadence (rule 5) */}
          <Card title="Nurture Cadence">
            <NurtureCadenceLabel leadType={lead.lead_type} />
            {!['wedding', 'corporate'].includes(lead.lead_type) && (
              <p className="text-sm text-gray-400">No specific cadence configured for this lead type.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Track panels */}
      {(showTourPanel || showProposalPanels) && (
        <div className="mt-4">
          {showTourPanel && (
            <TourPanel lead={lead} onUpdate={patch} />
          )}
          {showProposalPanels && (
            <ProposalPanels lead={lead} onUpdate={patch} />
          )}
        </div>
      )}

      {/* Notes history */}
      <div className="mt-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
            {Array.isArray(lead.notes) && lead.notes.length > 0 && (
              <span className="text-xs text-gray-400">{lead.notes.length} {lead.notes.length === 1 ? 'entry' : 'entries'}</span>
            )}
          </div>

          {/* History feed */}
          <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto scrollbar-thin">
            {(!Array.isArray(lead.notes) || lead.notes.length === 0) ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No notes yet — post one below.</p>
            ) : (
              lead.notes.map((entry) => (
                <div key={entry.id} className="px-5 py-3.5">
                  <p className="text-xs text-gray-400 mb-1.5">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {' · '}
                    {new Date(entry.created_at).toLocaleTimeString('en-US', {
                      hour: 'numeric', minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                </div>
              ))
            )}
            <div ref={notesEndRef} />
          </div>

          {/* Post new note */}
          <form onSubmit={handlePostNote} className="border-t border-gray-100 p-4 bg-gray-50/30">
            <textarea
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePostNote(e); }}
              rows={3}
              placeholder="Write a note… (Ctrl+Enter to post)"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-400">Ctrl+Enter to post</p>
              <button
                type="submit"
                disabled={!newNoteText.trim() || postingNote}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-stone-900 text-xs font-semibold rounded-lg transition-colors"
              >
                Post Note
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Last Contact */}
      <div className="mt-4">
        <Card title="Last Contact">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-800 font-medium">
                {lead.last_contact_date ? formatDate(lead.last_contact_date) : 'Not recorded'}
              </p>
              {stale && (
                <p className="text-xs text-red-600 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  More than 5 days since last contact
                </p>
              )}
            </div>
            {!STALE_EXCLUDED.includes(lead.status) && (
              <button
                onClick={logContactToday}
                className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-lg transition-colors"
              >
                Log contact today
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Post-signature checklist (rule 7) */}
      {lead.status === 'Signed' && (
        <div className="mt-4">
          <PostSigChecklist
            lead={lead}
            onChecklistUpdate={(key, val) => updateChecklist(id, key, val)}
          />
        </div>
      )}

      {/* Spacer */}
      <div className="h-8" />
    </div>
  );
}
