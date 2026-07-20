import type { ReservationState } from './Repository';

/**
 * The MockRepository's mutable domain state — the data that used to live in the
 * Zustand UI store. Kept here (out of usePavStore) with a tiny subscribe/set
 * store + localStorage persistence so the demo survives refresh, and so React
 * can subscribe via useSyncExternalStore. Domain slices are added here as each
 * moves off the god-store; the app's store keeps only ephemeral UI state.
 *
 * When the Supabase backend lands, this module is replaced wholesale — screens
 * and hooks are unaffected because they only see the Repository.
 */
export interface MockDomainState {
  reservation: ReservationState;
}

const STORAGE_KEY = 'pavilion-demo-data';

const initialState: MockDomainState = {
  reservation: { booked: false, summary: null },
};

function load(): MockDomainState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch { /* ignore corrupt/absent storage */ }
  return initialState;
}

let state: MockDomainState = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

export const mockDomain = {
  get: (): MockDomainState => state,
  set(patch: Partial<MockDomainState>) {
    state = { ...state, ...patch };
    persist();
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
  /** Restore the pristine demo state (used by Reset / Sign out). */
  reset() {
    state = initialState;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  },
};
