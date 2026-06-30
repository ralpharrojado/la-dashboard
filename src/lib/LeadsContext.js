'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateSeedLeads } from './seedData';

const LeadsContext = createContext(null);
const STORAGE_KEY = 'la_dashboard_leads_v3';

export function LeadsProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLeads(JSON.parse(stored));
      } else {
        const seed = generateSeedLeads();
        setLeads(seed);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      }
    } catch {
      setLeads(generateSeedLeads());
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (initialized && leads.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    }
  }, [leads, initialized]);

  const updateLead = useCallback((id, changes) => {
    setLeads(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        const updated = { ...l, ...changes };
        // Auto-initialize checklist when transitioning to Signed
        if (changes.status === 'Signed' && !updated.checklist) {
          updated.checklist = {
            invoice_sent: false,
            coordinator_notified: false,
            catering_notified: false,
            front_desk_notified: false,
            confirmation_email: false,
            exclusivity_calendar: false,
            exclusivity_cloudbeds: false,
          };
        }
        return updated;
      })
    );
  }, []);

  const updateChecklist = useCallback((id, key, value) => {
    setLeads(prev =>
      prev.map(l => {
        if (l.id !== id) return l;
        return {
          ...l,
          checklist: { ...(l.checklist || {}), [key]: value },
        };
      })
    );
  }, []);

  const addLead = useCallback((leadData) => {
    const newLead = {
      ...leadData,
      id: String(Math.max(0, ...leads.map(l => parseInt(l.id) || 0)) + 1),
      created_at: new Date().toISOString(),
      notes: [],
      proposal_edit_count: 0,
      exclusivity_chosen: false,
      exclusivity_marked: false,
      checklist: null,
      guide_assigned: leadData.guide_assigned || 'unassigned',
      tour_date: leadData.tour_date || null,
      availability_confirmed: false,
      last_contact_date: new Date().toISOString().split('T')[0],
    };
    setLeads(prev => [newLead, ...prev]);
    return newLead.id;
  }, []);

  const resetToSeed = useCallback(() => {
    const seed = generateSeedLeads();
    setLeads(seed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  }, []);

  const addNote = useCallback((leadId, text) => {
    const newNote = {
      id: `${leadId}_${Date.now()}`,
      text: text.trim(),
      created_at: new Date().toISOString(),
    };
    setLeads(prev =>
      prev.map(l => {
        if (l.id !== leadId) return l;
        const existing = Array.isArray(l.notes) ? l.notes : [];
        return { ...l, notes: [...existing, newNote] };
      })
    );
  }, []);

  const getLead = useCallback((id) => leads.find(l => l.id === id), [leads]);

  return (
    <LeadsContext.Provider
      value={{ leads, updateLead, updateChecklist, addLead, addNote, resetToSeed, getLead, initialized }}
    >
      {children}
    </LeadsContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}
