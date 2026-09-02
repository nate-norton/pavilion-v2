import { usePavStore } from '../store/store';
import { useAmenities, useDirectory, useDocuments, useLoadState, useMember, useVotes } from '../data/repo';
import { AuthShell, Eyebrow, PrimaryButton, TextButton, IconBadge } from './shell';

/**
 * The first thing a new member sees after joining: their community as it
 * actually stands, counted from the same repository the app reads. Numbers
 * render honestly at zero and as a dash while still loading — arrival is a
 * fact, not a celebration. Board members are pointed at the Desk, since the
 * setup card that lives there is the next thing that needs them.
 */
export function Arrival({ communityName, role, onDone }: {
  communityName: string; role: 'resident' | 'board'; onDone: () => void;
}) {
  const set = usePavStore((s) => s.set);
  const member = useMember();
  const directory = useDirectory();
  const docs = useDocuments();
  const votes = useVotes();
  const amenities = useAmenities();
  const ready = {
    directory: useLoadState('directory') === 'ready',
    docs: useLoadState('docs') === 'ready',
    votes: useLoadState('votes') === 'ready',
    amenities: useLoadState('amenities') === 'ready',
  };
  const firstName = (member?.name ?? '').trim().split(/\s+/)[0] || '';
  const isBoard = role === 'board';

  const stats: { n: number | null; label: string }[] = [
    { n: ready.directory ? directory.length : null, label: directory.length === 1 ? 'neighbor joined' : 'neighbors joined' },
    { n: ready.docs ? docs.length : null, label: docs.length === 1 ? 'document' : 'documents' },
    { n: ready.votes ? votes.openAll.length : null, label: votes.openAll.length === 1 ? 'open vote' : 'open votes' },
    { n: ready.amenities ? amenities.length : null, label: amenities.length === 1 ? 'amenity' : 'amenities' },
  ];

  const openDesk = () => { set({ boardMode: true, boardTab: 'desk', boardSetupDismissed: false }); onDone(); };
  const lookAround = () => { set({ boardMode: false, tab: 'today' }); onDone(); };

  return (
    <AuthShell width={380}>
      <IconBadge icon="ph-fill ph-house-line" />
      <Eyebrow>Welcome home</Eyebrow>
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">
        {firstName ? `You’re in, ${firstName}.` : 'You’re in.'}
      </h1>
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Here’s {communityName} as it stands today.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl px-3.5 py-3" style={{ background: 'rgb(var(--mistpale))', border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <p className="m-0 font-serif text-[24px] leading-none text-navy" style={{ fontVariantNumeric: 'tabular-nums' }} aria-label={s.n === null ? 'Still loading' : undefined}>
              {s.n === null ? '—' : s.n}
            </p>
            <p className="m-0 mt-1 text-[11.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>{s.label}</p>
          </div>
        ))}
      </div>
      {isBoard ? (
        <>
          <p className="m-0 mb-4 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
            <span className="text-navy font-extrabold">You’re on the board.</span> The Desk is where you’ll invite
            neighbors and publish the rules — nothing here reaches anyone until they’re in.
          </p>
          <PrimaryButton label="Open the Board Desk" onClick={openDesk} />
          <div className="flex justify-center mt-2">
            <TextButton label="Or look around first" onClick={lookAround} />
          </div>
        </>
      ) : (
        <PrimaryButton label="See what’s happening" onClick={lookAround} />
      )}
    </AuthShell>
  );
}
