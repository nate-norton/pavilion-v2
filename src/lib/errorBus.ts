/**
 * Minimal app-error channel. Backend code (SupabaseRepository) emits
 * user-facing failure messages; the AppToast component subscribes and shows
 * them. Kept off the Zustand store so the data layer stays store-free and
 * nothing gets persisted.
 */
type Listener = (message: string) => void;

const listeners = new Set<Listener>();

export function onAppError(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function emitAppError(message: string): void {
  listeners.forEach((l) => l(message));
}
