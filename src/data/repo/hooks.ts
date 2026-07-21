import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRepository } from './context';
import { hasSnapshot, type Repository, type RepositorySnapshot } from './Repository';
import type { ChatSeed, QA } from '../types';

/** Reactive read of mutable domain state — re-renders when the repo mutates. */
export function useReservation() {
  const repo = useRepository();
  return useSyncExternalStore(repo.subscribe, () => repo.getReservation());
}

export function useComments() {
  const repo = useRepository();
  return useSyncExternalStore(repo.subscribe, () => repo.getComments());
}

export function useChats() {
  const repo = useRepository();
  return useSyncExternalStore(repo.subscribe, () => repo.getChats());
}

export function useGroups() {
  const repo = useRepository();
  return useSyncExternalStore(repo.subscribe, () => repo.getGroups());
}

/** The signed-in member's identity/community. null until resolved (live mode). */
export function useMember() {
  const repo = useRepository();
  return useSyncExternalStore(repo.subscribe, () => repo.getMember());
}

/**
 * Reads a domain slice through the repository. Seeds initial state from the
 * synchronous snapshot when the backend offers one (the mock → no loading
 * flicker in the demo), then reconciles with the async result. When the
 * Supabase backend lands, only this file changes — screens keep calling the
 * same hooks. `select` maps the snapshot key to the matching async method.
 */
function useRepoRead<T>(
  key: keyof RepositorySnapshot,
  fetch: (repo: Repository) => Promise<T>,
  fallback: T,
): T {
  const repo = useRepository();
  const [data, setData] = useState<T>(() =>
    hasSnapshot(repo) ? (repo.snapshot()[key] as unknown as T) : fallback,
  );
  useEffect(() => {
    let alive = true;
    fetch(repo).then((d) => { if (alive) setData(d); });
    return () => { alive = false; };
  }, [repo, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return data;
}

// Reservations
export const useAmenities = () => useRepoRead('amenities', (r) => r.listAmenities(), []);
export const useReservationSlots = () => useRepoRead('reservationSlots', (r) => r.getReservationSlots(), []);
export const useReservationDays = () => useRepoRead('reservationDays', (r) => r.getReservationDays(), []);

// Community / people
export const useDirectory = () => useRepoRead('directory', (r) => r.listDirectory(), []);
export const useCircles = () => useRepoRead('circles', (r) => r.listCircles(), []);
export const useFreeItems = () => useRepoRead('freeItems', (r) => r.listFreeItems(), []);
export const useChatSeed = () => useRepoRead<ChatSeed>('chatSeed', (r) => r.getChatSeed(), {});

// HOA / board
export const useVendors = () => useRepoRead('vendors', (r) => r.listVendors(), []);
export const useDocuments = () => useRepoRead('documents', (r) => r.listDocuments(), []);
export const useDocSections = () => useRepoRead('docSections', (r) => r.listDocSections(), []);
export const useArcTypes = () => useRepoRead('arcTypes', (r) => r.listArcTypes(), []);
export const usePortfolio = () => useRepoRead('portfolio', (r) => r.listPortfolio(), []);
export const useAging = () => useRepoRead('aging', (r) => r.listAging(), []);

// Cross-cutting
export const useNotifications = () => useRepoRead('notifications', (r) => r.listNotifications(), []);
export const useNotifCategories = () => useRepoRead('notifCategories', (r) => r.listNotifCategories(), []);
export const useMapPins = () => useRepoRead('mapPins', (r) => r.listMapPins(), []);
export const useMapLayers = () => useRepoRead('mapLayers', (r) => r.listMapLayers(), []);
export const useSearchIndex = () => useRepoRead('searchIndex', (r) => r.getSearchIndex(), []);
export const useAiQA = () => useRepoRead<QA>('aiQA', (r) => r.getAiQA(), {});

// Onboarding config
export const useHouseholdOptions = () => useRepoRead('householdOptions', (r) => r.listHouseholdOptions(), []);
export const useOnboardCircles = () => useRepoRead('onboardCircles', (r) => r.listOnboardCircles(), []);
