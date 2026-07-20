import type { ReservationState } from './Repository';
import type { Comment, ChatMsg, GroupData } from '../types';
import { GROUPS_SEED } from '../groups';

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
  comments: Comment[];
  chats: Record<string, ChatMsg[]>;
  groups: Record<string, GroupData>;
}

const STORAGE_KEY = 'pavilion-demo-data';

const freshState = (): MockDomainState => ({
  reservation: { booked: false, summary: null },
  comments: [
    { who: 'Tom B.', color: '#4A90E2', text: 'Anytime, Maria!' },
    { who: 'Priya S.', color: '#2A9D5C', text: 'This is what the Ridge is about.' },
  ],
  chats: {},
  groups: structuredClone(GROUPS_SEED),
});

function load(): MockDomainState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...freshState(), ...JSON.parse(raw) };
  } catch { /* ignore corrupt/absent storage */ }
  return freshState();
}

let state: MockDomainState = load();
let generation = 0;
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
  /** Bumps on reset; scripted auto-replies capture it to cancel if stale. */
  generation: () => generation,
  /** Restore the pristine demo state (used by Reset / Sign out). */
  reset() {
    generation += 1;
    state = freshState();
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    listeners.forEach((l) => l());
  },
};
