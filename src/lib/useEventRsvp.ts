import { useEffect, useState } from 'react';
import { useRepository } from '../data/repo';
import type { CommunityEvent } from '../data/repo';
import { emitAppError } from './errorBus';

/*
 * Optimistic RSVP with rollback.
 *
 * Today and Events used to fire `repo.toggleEventRsvp` and forget it: the
 * button kept its old face until the social slice re-hydrated, and a failed
 * write left "Going" showing for an RSVP that never landed. This flips the
 * button and the count the instant the member taps, holds that until the
 * write settles, and on rejection puts both back and says so in the app
 * toast. The demo keeps its scripted flag path and never reaches the repo.
 */
export function useEventRsvp(event: CommunityEvent | null) {
  const repo = useRepository();
  const [pending, setPending] = useState<boolean | null>(null);

  // A fresh snapshot from the repo is the truth; drop the override once it lands.
  useEffect(() => { setPending(null); }, [event?.rsvpd, event?.going]);

  const base = !!event?.rsvpd;
  const going = pending ?? base;
  const count = (event?.going ?? 0) + (going === base ? 0 : going ? 1 : -1);

  const toggle = () => {
    if (!event || pending !== null) return;
    const next = !event.rsvpd;
    setPending(next);
    repo.toggleEventRsvp(event.id).catch(() => {
      setPending(null);
      emitAppError(`Couldn't ${next ? 'save' : 'remove'} your RSVP — check your connection and try again.`);
    });
  };

  return { going, count, busy: pending !== null, toggle };
}
