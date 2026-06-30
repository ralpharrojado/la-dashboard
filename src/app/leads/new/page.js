'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLeads } from '@/lib/LeadsContext';
import {
  LEAD_SOURCES,
  LEAD_TYPES,
  BUDGET_BANDS,
  DISQUALIFY_BUDGET_BANDS,
  DISQUALIFY_GUEST_THRESHOLD,
} from '@/lib/constants';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  phone_given: false,
  lead_source: '',
  lead_type: '',
  event_date: '',
  guest_count: '',
  budget_band: '',
  dates_flexible: false,
  lodging_needed: false,
  spaces_requested: '',
  add_ons: '',
  wants_tour_only: false,
  notes: '',
};

// PLACEHOLDER — budget gate thresholds (under $30k + <75 guests for weddings)
// Confirm final values with Tiffany and Mike before go-live
function applyBudgetGate(data) {
  if (
    data.lead_type === 'wedding' &&
    Number(data.guest_count) < DISQUALIFY_GUEST_THRESHOLD &&
    DISQUALIFY_BUDGET_BANDS.includes(data.budget_band)
  ) {
    return 'Disqualified';
  }
  return 'New';
}

export default function NewLeadPage() {
  const router = useRouter();
  const { addLead } = useLeads();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (!form.lead_source) e.lead_source = 'Lead source is required';
    if (!form.lead_type) e.lead_type = 'Lead type is required';
    if (!form.budget_band) e.budget_band = 'Budget band is required — this replaces the freetext box';
    if (!form.event_date) e.event_date = 'Event date is required';
    if (!form.guest_count) e.guest_count = 'Guest count is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const first = document.querySelector('[data-error]');
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setSubmitting(true);
    const status = applyBudgetGate(form);
    const id = addLead({
      ...form,
      guest_count: Number(form.guest_count),
      status,
    });
    router.push(`/leads/${id}?banner=${status === 'Disqualified' ? 'disqualified' : 'qualified'}`);
  }

  const Field = ({ label, required, error, children, hint }) => (
    <div data-error={error ? true : undefined}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent ${
      err ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-14 lg:pt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Lead Intake</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete all required fields to add to the pipeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name / Company" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Sarah & James O'Brien"
                className={inputCls(errors.name)}
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="email@example.com"
                className={inputCls(errors.email)}
              />
            </Field>
            <Field label="Phone Number" error={errors.phone}>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(512) 555-0000"
                className={inputCls(errors.phone)}
              />
            </Field>
            <Field label="Lead Source" required error={errors.lead_source}>
              <select
                value={form.lead_source}
                onChange={e => set('lead_source', e.target.value)}
                className={inputCls(errors.lead_source)}
              >
                <option value="">Select source…</option>
                {Object.entries(LEAD_SOURCES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.phone_given}
                  onChange={e => set('phone_given', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-700">
                  Phone number provided
                  <span className="text-gray-400 ml-1">(enables "Call + text now" prompt on lead)</span>
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Event Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Lead Type" required error={errors.lead_type}>
              <select
                value={form.lead_type}
                onChange={e => set('lead_type', e.target.value)}
                className={inputCls(errors.lead_type)}
              >
                <option value="">Select type…</option>
                {Object.entries(LEAD_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Requested Event Date" required error={errors.event_date}>
              <input
                type="date"
                value={form.event_date}
                onChange={e => set('event_date', e.target.value)}
                className={inputCls(errors.event_date)}
              />
            </Field>
            <Field label="Guest Count" required error={errors.guest_count}>
              <input
                type="number"
                min="1"
                value={form.guest_count}
                onChange={e => set('guest_count', e.target.value)}
                placeholder="100"
                className={inputCls(errors.guest_count)}
              />
            </Field>
            <Field
              label="Budget Band"
              required
              error={errors.budget_band}
              hint="Required — replaces the old freetext budget field"
            >
              <select
                value={form.budget_band}
                onChange={e => set('budget_band', e.target.value)}
                className={inputCls(errors.budget_band)}
              >
                <option value="">Select budget band…</option>
                {Object.entries(BUDGET_BANDS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Budget gate notice — placeholder */}
          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-amber-700">
              <strong>Auto-qualify rule (placeholder):</strong> Wedding leads with under {DISQUALIFY_GUEST_THRESHOLD} guests and budget under $30k will be auto-disqualified on submit.
              Thresholds pending sign-off from Tiffany and Mike.
            </p>
          </div>
        </div>

        {/* Venue & Preferences */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-4">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Venue & Preferences</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Spaces Requested">
              <input
                type="text"
                value={form.spaces_requested}
                onChange={e => set('spaces_requested', e.target.value)}
                placeholder="e.g. Main Pavilion, Garden Terrace"
                className={inputCls()}
              />
            </Field>
            <Field label="Add-Ons">
              <input
                type="text"
                value={form.add_ons}
                onChange={e => set('add_ons', e.target.value)}
                placeholder="e.g. Catering, DJ, Florals"
                className={inputCls()}
              />
            </Field>
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.dates_flexible}
                  onChange={e => set('dates_flexible', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-700">Dates are flexible</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.lodging_needed}
                  onChange={e => set('lodging_needed', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-700">Lodging needed</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.wants_tour_only}
                  onChange={e => set('wants_tour_only', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 border-gray-300 focus:ring-amber-400"
                />
                <span className="text-sm text-gray-700">
                  Tour only (no proposal yet)
                  <span className="text-gray-400 ml-1">— routes into tour track</span>
                </span>
              </label>
            </div>
          </div>
          <div className="mt-4">
            <Field label="Initial Notes">
              <textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                rows={3}
                placeholder="Any context from the initial inquiry…"
                className={`${inputCls()} resize-none`}
              />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-stone-900 font-semibold text-sm rounded-lg transition-colors shadow-sm"
          >
            {submitting ? 'Submitting…' : 'Submit Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
