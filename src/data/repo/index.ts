import type { Repository } from './Repository';
import { MockRepository } from './MockRepository';
import { mockDomain } from './mockDomainStore';

export type { Repository, RepositorySnapshot } from './Repository';
export { MockRepository } from './MockRepository';
export { RepositoryProvider, useRepository } from './context';
export * from './hooks';

/** Restore the demo's mutable domain data to pristine (used by Reset / Sign out). */
export const resetDemoData = () => mockDomain.reset();

/**
 * Runtime selection of the data backend. `VITE_APP_MODE=demo` (the default)
 * wires the in-memory MockRepository; `live` will wire the SupabaseRepository
 * once it lands in Phase 2. Keeping this behind one factory is what lets the
 * demo and the real app share every screen and component.
 */
export function createRepository(): Repository {
  const mode = import.meta.env.VITE_APP_MODE ?? 'demo';
  if (mode === 'live') {
    // Phase 2: return new SupabaseRepository(...)
    throw new Error('VITE_APP_MODE=live: SupabaseRepository not implemented yet');
  }
  return new MockRepository();
}
