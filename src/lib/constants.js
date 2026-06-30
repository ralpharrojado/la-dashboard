export const LEAD_SOURCES = {
  tripleseat: 'TripleSeat Form',
  direct_email: 'Direct Email',
  phone_call: 'Phone Call',
  website_form: 'Website Form',
  ad: 'Advertisement',
  referral: 'Referral',
};

export const LEAD_TYPES = {
  wedding: 'Wedding',
  corporate: 'Corporate',
  other: 'Other',
};

export const BUDGET_BANDS = {
  under_10k: 'Under $10k',
  '10k_20k': '$10k–$20k',
  '20k_30k': '$20k–$30k',
  '30k_50k': '$30k–$50k',
  '50k_plus': '$50k+',
};

export const GUIDES = {
  unassigned: 'Unassigned',
  tiffany: 'Tiffany',
  sebastian: 'Sebastian',
  serena: 'Serena',
};

export const ALL_STATUSES = [
  'New',
  'Disqualified',
  'Nurturing',
  'Call Scheduled',
  'Proposal Building',
  'Proposal Sent',
  'Contract Sent',
  'Signed',
  'Lost',
  'Goes Cold',
  'Tour Requested',
  'Tour Scheduled',
  'Post-Tour Follow-up',
];

// Valid next statuses from current status — main (proposal) track
export const MAIN_TRACK_TRANSITIONS = {
  'New': ['Nurturing', 'Call Scheduled', 'Disqualified'],
  'Nurturing': ['Call Scheduled', 'Goes Cold', 'Lost'],
  'Call Scheduled': ['Proposal Building', 'Nurturing', 'Lost', 'Goes Cold'],
  'Proposal Building': ['Proposal Sent', 'Lost', 'Goes Cold'],
  'Proposal Sent': ['Contract Sent', 'Lost', 'Goes Cold'],
  'Contract Sent': ['Signed', 'Lost', 'Goes Cold'],
  'Signed': [],
  'Disqualified': [],
  'Lost': [],
  'Goes Cold': ['Nurturing'],
};

// Valid next statuses — tour track (wants_tour_only = true)
export const TOUR_TRACK_TRANSITIONS = {
  'New': ['Tour Requested'],
  'Tour Requested': ['Tour Scheduled', 'Goes Cold'],
  'Tour Scheduled': ['Post-Tour Follow-up', 'Goes Cold'],
  'Post-Tour Follow-up': ['Nurturing', 'Goes Cold'],
  'Nurturing': ['Call Scheduled', 'Goes Cold', 'Lost'],
  'Call Scheduled': ['Proposal Building', 'Nurturing', 'Lost', 'Goes Cold'],
  'Proposal Building': ['Proposal Sent', 'Lost', 'Goes Cold'],
  'Proposal Sent': ['Contract Sent', 'Lost', 'Goes Cold'],
  'Contract Sent': ['Signed', 'Lost', 'Goes Cold'],
  'Signed': [],
  'Lost': [],
  'Goes Cold': ['Nurturing'],
};

export const TERMINAL_STATUSES = ['Disqualified', 'Signed', 'Lost', 'Goes Cold'];

// Statuses that show proposal-track panels
export const PROPOSAL_STAGES = ['Proposal Building', 'Proposal Sent', 'Contract Sent'];

// Statuses excluded from stale-lead flag
export const STALE_EXCLUDED = ['Disqualified', 'Signed', 'Lost', 'Goes Cold'];

export const STALE_DAYS = 5;

// Budget bands that trigger the auto-disqualify gate (wedding + <75 guests)
// PLACEHOLDER — confirm thresholds with Tiffany and Mike before go-live
export const DISQUALIFY_BUDGET_BANDS = ['under_10k', '10k_20k', '20k_30k'];
export const DISQUALIFY_GUEST_THRESHOLD = 75;

export const STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800',
  'Disqualified': 'bg-rose-100 text-rose-800',
  'Nurturing': 'bg-purple-100 text-purple-800',
  'Call Scheduled': 'bg-indigo-100 text-indigo-800',
  'Proposal Building': 'bg-amber-100 text-amber-800',
  'Proposal Sent': 'bg-orange-100 text-orange-800',
  'Contract Sent': 'bg-yellow-100 text-yellow-800',
  'Signed': 'bg-emerald-100 text-emerald-800',
  'Lost': 'bg-red-100 text-red-800',
  'Goes Cold': 'bg-slate-100 text-slate-600',
  'Tour Requested': 'bg-cyan-100 text-cyan-800',
  'Tour Scheduled': 'bg-teal-100 text-teal-800',
  'Post-Tour Follow-up': 'bg-sky-100 text-sky-800',
};

export const LEAD_TYPE_COLORS = {
  wedding: 'bg-pink-100 text-pink-800',
  corporate: 'bg-slate-100 text-slate-700',
  other: 'bg-gray-100 text-gray-700',
};
