import { PhIcon } from './PhIcon';
import { usePavStore } from '../store/store';
import { useAdminMembers, useAmenities, useDocuments, useMember, useVotes } from '../data/repo';
import { isLiveMode } from '../auth/AuthGate';

interface Step {
  key: string;
  done: boolean;
  title: string;
  /** Why a resident cares — never the admin chore. */
  payoff: string;
  cta: string;
  go: () => void;
}

/**
 * Board activation card (live mode, board role only).
 *
 * A pilot community starts empty, and every empty state in the app is written
 * to a resident: "documents appear here once your board publishes them." The
 * board member reading that *is* the board, so the one person who can act sees
 * a dead end. This card is the counterweight — the single place that tells a
 * new board what to do first.
 *
 * Two deliberate choices:
 *
 * - **Steps are framed as resident outcomes, not tasks.** "Publish your
 *   documents" is a chore; "so neighbors stop texting you about the fence
 *   rules" is why it's worth ten minutes. The board's payoff and the
 *   resident's payoff are the same event, which is why this card serves both.
 * - **It is derived, never stored.** Each step reads real domain state, so it
 *   self-completes when the work is done in the ordinary UI and can never
 *   disagree with the app. Finishing the list removes the card permanently.
 *
 * Ordered by dependency: nobody sees anything until neighbors are invited,
 * and documents answer the question residents ask most.
 */
export function BoardSetupCard() {
  const set = usePavStore((s) => s.set);
  const dismissed = usePavStore((s) => s.boardSetupDismissed);
  const member = useMember();
  const members = useAdminMembers();
  const docs = useDocuments();
  const amenities = useAmenities();
  const votes = useVotes();

  // Demo is a scripted, fully-populated community — it has no setup to do.
  if (!isLiveMode || member?.role !== 'board') return null;

  const steps: Step[] = [
    {
      key: 'invite',
      done: members.length > 1,
      title: 'Invite your neighbors',
      payoff: 'Nothing here reaches anyone until they’re in.',
      cta: 'Send invites',
      go: () => set({ boardMode: true, boardTab: 'desk' }),
    },
    {
      key: 'docs',
      done: docs.length > 0,
      title: 'Publish your documents',
      payoff: 'So neighbors look up the rules themselves instead of texting you.',
      cta: 'Add documents',
      go: () => set({ docsOpen: true }),
    },
    {
      key: 'amenities',
      done: amenities.length > 0,
      title: 'Add your amenities',
      payoff: 'So the clubhouse books itself instead of going through you.',
      cta: 'Set up amenities',
      go: () => set({ tab: 'reserve', manageAmenOpen: true }),
    },
    {
      key: 'vote',
      done: votes.openAll.length > 0 || votes.closed.length > 0,
      title: 'Open your first vote',
      payoff: 'A real quorum count, visible to every household.',
      cta: 'Start a vote',
      go: () => set({ boardMode: true, boardTab: 'desk', voteDraftOpen: true }),
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  // Completing the list retires the card for good — no dismissal needed.
  if (doneCount === steps.length || dismissed) return null;

  const next = steps.find((s) => !s.done)!;

  return (
    <div
      className="bg-paper rounded-[20px] mb-3.5 overflow-hidden"
      style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}
    >
      <div style={{ padding: '16px 18px 4px' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="m-0 font-serif text-[19px] text-navy leading-[1.25]">
              Get {member.communityName || 'your community'} running
            </p>
            <p className="m-0 mt-1 text-[12.5px] font-semibold text-slate">
              {doneCount === 0
                ? 'Four things, about ten minutes. Neighbors see the difference immediately.'
                : `${doneCount} of ${steps.length} done — ${steps.length - doneCount} left.`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Hide setup checklist"
            onClick={() => set({ boardSetupDismissed: true })}
            className="border-none bg-transparent cursor-pointer p-1 flex-shrink-0 font-sans"
          >
            <PhIcon name="ph-bold ph-x" size={13} color="rgb(var(--slatelight))" />
          </button>
        </div>

        {/* Progress: four segments, filled as steps complete. */}
        <div className="flex gap-1 mt-3" aria-hidden="true">
          {steps.map((s) => (
            <div
              key={s.key}
              className="flex-1 rounded-full"
              style={{
                height: 4,
                background: s.done ? 'rgb(var(--sage))' : 'rgb(var(--navy) / 0.1)',
                transition: 'background 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 18px 6px' }}>
        {steps.map((s, i) => {
          const isNext = s.key === next.key;
          return (
            <div
              key={s.key}
              className="flex items-start gap-3"
              style={{
                padding: '12px 0',
                borderBottom: i < steps.length - 1 ? '1px solid rgb(var(--navy) / 0.06)' : undefined,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: 20,
                  height: 20,
                  marginTop: 1,
                  background: s.done ? 'rgb(var(--sage))' : 'transparent',
                  border: s.done ? 'none' : '1.5px solid rgb(var(--navy) / 0.18)',
                }}
              >
                {s.done && <PhIcon name="ph-bold ph-check" size={11} color="rgb(var(--white))" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="m-0 text-[13.5px] font-bold leading-[1.3]"
                  style={{
                    color: s.done ? 'rgb(var(--slate))' : 'rgb(var(--navy))',
                    textDecoration: s.done ? 'line-through' : 'none',
                  }}
                >
                  {s.title}
                </p>
                {!s.done && (
                  <p className="m-0 mt-0.5 text-[12px] font-semibold text-slate leading-[1.4]">{s.payoff}</p>
                )}
                {isNext && (
                  // The Porch Light Rule: exactly one ember action in this card,
                  // always the next thing to do.
                  <button
                    type="button"
                    onClick={s.go}
                    className="mt-2.5 border-none rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans text-white"
                    style={{ background: 'rgb(var(--skydeep))', padding: '9px 14px' }}
                  >
                    {s.cta}
                  </button>
                )}
                {!s.done && !isNext && (
                  <button
                    type="button"
                    onClick={s.go}
                    className="mt-2 border-none bg-transparent p-0 text-[12px] font-extrabold cursor-pointer font-sans"
                    style={{ color: 'rgb(var(--accent))' }}
                  >
                    {s.cta} →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
