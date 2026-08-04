/**
 * Minimal app-toast channel. Backend code (SupabaseRepository) emits
 * user-facing failure messages; the AppToast component subscribes and shows
 * them. Kept off the Zustand store so the data layer stays store-free and
 * nothing gets persisted.
 *
 * Carries a `tone` because the app now reports success as well as failure —
 * confirming that a delete actually happened is half of what makes the
 * delete feel safe.
 */
export type ToastTone = 'error' | 'success';

export interface AppToastMessage {
  message: string;
  tone: ToastTone;
}

type Listener = (toast: AppToastMessage) => void;

const listeners = new Set<Listener>();

export function onAppToast(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Report a failure. Keeps its own name — the data layer calls it ~10 times. */
export function emitAppError(message: string): void {
  listeners.forEach((l) => l({ message, tone: 'error' }));
}

/** Confirm that something the user asked for actually happened. */
export function emitAppSuccess(message: string): void {
  listeners.forEach((l) => l({ message, tone: 'success' }));
}
