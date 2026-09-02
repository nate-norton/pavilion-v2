import type { ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { SectionHeading } from '../components/SectionHeading';
import { useEvents, useMember, useRepository } from '../data/repo';
import type { CommunityEvent } from '../data/repo';
import { useEventRsvp } from '../lib/useEventRsvp';
import { usePavStore } from '../store/store';

const DOTS: Record<number, boolean> = { 1: true, 5: true, 15: true, 19: true };

interface CalCell {
  label: string;
  dot: boolean;
  bg: string;
  color: string;
}

// July 2026 mini calendar (Jul 1 = Wednesday) — prototype lines 3190-3194.
const CAL_CELLS: CalCell[] = [
  ...Array.from({ length: 3 }, () => ({ label: '', dot: false, bg: 'transparent', color: 'rgb(var(--slatedark))' })),
  ...Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return {
      label: String(d),
      dot: !!DOTS[d],
      bg: d === 1 ? 'rgb(var(--skydeep))' : 'transparent',
      color: d === 1 ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))',
    };
  }),
];

/*
 * RSVP on a light card is one of the brand sheet's named uses of sunset, so
 * the resting control is the sunset text-bearing twin under white (5.81:1);
 * once the member is in, it turns sage.
 */
function RsvpButton({ going, busy, onToggle }: { going: boolean; busy?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={going}
      aria-busy={busy || undefined}
      className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 min-h-[44px]"
      style={{ background: going ? 'rgb(var(--sagedark))' : 'rgb(var(--sunsetdeep))' }}
    >
      {going && <PhIcon name="ph-bold ph-check" size={13} />}
      {going ? 'Going' : 'RSVP'}
    </button>
  );
}

function EventIcon({ bg, icon, color }: { bg: string; icon: string; color: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }} aria-hidden="true">
      <PhIcon name={icon} size={19} color={color} />
    </div>
  );
}

function EventTitle({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="m-0 mb-px text-[13.5px] font-bold text-navy">{title}</p>
      <p className="m-0 text-[12px] font-semibold text-slate">
        {sub}
      </p>
    </div>
  );
}

/** A real event from the repository, with an honest, optimistic RSVP. */
function LiveEventRow({ event }: { event: CommunityEvent }) {
  const rsvp = useEventRsvp(event);
  const where = [event.whenLabel, event.whereLabel].filter(Boolean).join(' · ');
  return (
    <Card className="flex items-center gap-3" padding="sm">
      <EventIcon bg="rgb(var(--skypale))" icon="ph-fill ph-calendar-dots" color="rgb(var(--skydeep))" />
      <EventTitle
        title={event.title}
        sub={`${where}${where ? ' · ' : ''}${rsvp.count} going`}
      />
      <RsvpButton going={rsvp.going} busy={rsvp.busy} onToggle={rsvp.toggle} />
    </Card>
  );
}

/** Events / July calendar screen — ported from prototype lines 2088-2157. */
export function Events() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const events = useEvents();
  const member = useMember();

  if (!state.eventsOpen) return null;

  const demo = repo.isDemo();
  const tacoGoing = 12 + (state.rsvpFood ? 1 : 0);
  const movieGoing = 23 + (state.rsvpMovie ? 1 : 0);

  return (
    <div
      data-screen-label="Events"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ eventsOpen: false })} />

      {/*
       * Live: what the community has actually posted, nothing else. The
       * scripted July calendar below belongs to Juniper Ridge and renders
       * only in the demo.
       */}
      {!demo ? (
        <>
          <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">Events</h1>
          <p className="m-0 mb-3.5 text-[13px] font-semibold text-slatedeep">
            {events.length === 0
              ? member?.communityName ?? 'Your community'
              : `${events.length} coming up${member?.communityName ? ` at ${member.communityName}` : ''}`}
          </p>
          {events.length === 0 ? (
            <EmptyState
              icon="ph ph-calendar-blank"
              title="Nothing on the calendar yet"
              body="When your board or a neighbor posts an event, it lands here with a one-tap RSVP."
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {events.map((e) => <LiveEventRow key={e.id} event={e} />)}
            </div>
          )}
        </>
      ) : (
        <>
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">July at the Ridge</h1>
      <p className="m-0 mb-3.5 text-[13px] font-semibold text-slatedeep">
        4 events · dots mark the days
      </p>

      {/* Calendar */}
      <Card padding="sm" className="mb-4">
        <div className="grid grid-cols-7 gap-0.5 mb-1" aria-hidden="true">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-center text-[11px] font-extrabold text-slatelight">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {CAL_CELLS.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-0.5 rounded-[9px]"
              style={{ height: 36, background: c.bg }}
            >
              <span className="text-[12px] font-extrabold" style={{ color: c.color }}>
                {c.label}
              </span>
              {c.dot && <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'rgb(var(--sunset))' }} />}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col gap-2.5">
        {/* Taco cart */}
        <Card padding="sm" className="flex items-center gap-3">
          <EventIcon bg="rgb(var(--accenttint))" icon="ph-fill ph-storefront" color="rgb(var(--accent))" />
          <EventTitle title="Taco cart · today 5–8 PM" sub={`${tacoGoing} going · clubhouse forecourt`} />
          <RsvpButton going={state.rsvpFood} onToggle={() => set({ rsvpFood: !state.rsvpFood })} />
        </Card>

        {/* Movie */}
        <Card padding="sm">
          <div className="flex items-center gap-3 mb-3">
            <EventIcon bg="rgb(var(--goldpale))" icon="ph-fill ph-popcorn" color="rgb(var(--golddark))" />
            <EventTitle title="Movie on the lawn · Sat, dusk" sub={`${movieGoing} going · The Green`} />
            <RsvpButton going={state.rsvpMovie} onToggle={() => set({ rsvpMovie: !state.rsvpMovie })} />
          </div>
          <SectionHeading title="Volunteer slots" meta="2 of 3 filled" className="mb-1.5" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 min-h-[36px]">
              <PhIcon name="ph-fill ph-check-circle" size={15} color="rgb(var(--sage))" />
              <span className="flex-1 text-[12.5px] font-bold text-slatedark">
                Blankets &amp; chairs
              </span>
              <span className="text-[12px] font-bold text-slatelight">
                Filled
              </span>
            </div>
            <div className="flex items-center gap-2 min-h-[44px]">
              <PhIcon name="ph ph-circle" size={15} color="rgb(var(--slatelight))" />
              <span className="flex-1 text-[12.5px] font-bold text-slatedark">
                Popcorn duty · 2 of 3
              </span>
              {state.volPopcorn ? (
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-sagedark">
                  <PhIcon name="ph-bold ph-check" size={12} />
                  You&apos;re in
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => set({ volPopcorn: true })}
                  className="bg-transparent text-navy rounded-full text-[12px] font-extrabold cursor-pointer font-sans px-3 min-h-[36px]"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  Sign up
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 min-h-[36px]">
              <PhIcon name="ph-fill ph-check-circle" size={15} color="rgb(var(--sage))" />
              <span className="flex-1 text-[12.5px] font-bold text-slatedark">
                Projector &amp; screen
              </span>
              <span className="text-[12px] font-bold text-slatelight">
                Filled
              </span>
            </div>
          </div>
        </Card>

        {/* Annual meeting */}
        <Card padding="sm" onClick={() => set({ meetingOpen: true })}>
          <div className="flex items-center gap-3">
            <EventIcon bg="rgb(var(--skypale))" icon="ph-fill ph-users-four" color="rgb(var(--skydeep))" />
            <EventTitle title="Annual meeting · Tue Jul 15, 7 PM" sub="Clubhouse + Zoom · 2 board seats open" />
            <span className="inline-flex items-center gap-1 text-[12.5px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--accent))' }}>
              Preview
              <PhIcon name="ph-bold ph-caret-right" size={12} />
            </span>
          </div>
        </Card>

        {/* Pool party */}
        <Card padding="sm" className="flex items-center gap-3">
          <EventIcon bg="rgb(var(--skypale))" icon="ph-fill ph-swimming-pool" color="rgb(var(--skydeep))" />
          <EventTitle title="Pool party & potluck · Sun Jul 19, 1 PM" sub="Pool deck · bring a dish" />
          <RsvpButton going={state.rsvpPool} onToggle={() => set({ rsvpPool: !state.rsvpPool })} />
        </Card>
      </div>
        </>
      )}
    </div>
  );
}
