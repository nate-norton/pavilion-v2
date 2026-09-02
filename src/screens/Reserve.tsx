import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { StackedPanel } from '../components/StackedCard';
import { useAmenities, useMember, useReservationSlots, useReservationDays, useReservation, useLoadState, useRepository } from '../data/repo';
import { usePavStore } from '../store/store';
import { useScrollTopOnChange } from '../lib/pageMode';
import { isLiveMode } from '../auth/AuthGate';

/** "9:00 AM" style label for an hour+minute pair. */
function slotLabel(mins: number): string {
  let h = Math.floor(mins / 60);
  const m = mins % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}

/*
 * One recipe for every choice control on the booking form: day, time,
 * length. Selected is sky chrome (navy is text in this system, not a
 * surface); unselected is paper with the hairline. Every one clears 44px.
 */
const CHOICE = 'rounded-[13px] font-extrabold cursor-pointer font-sans min-h-[44px] transition-transform active:scale-[0.985]';
const choiceStyle = (on: boolean) => ({
  border: on ? '1px solid rgb(var(--skydeep))' : '1px solid rgb(var(--navy) / 0.12)',
  background: on ? 'rgb(var(--skydeep))' : 'rgb(var(--paper))',
  color: on ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))',
});

/** Reserve screen — ported from prototype lines 523-628. */
export function Reserve() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const AMENS = useAmenities();
  const DEMO_SLOTS = useReservationSlots();
  const DEMO_DAYS = useReservationDays();
  const reservation = useReservation();
  const member = useMember();
  const canManage = isLiveMode && member?.role === 'board';
  const demo = repo.isDemo();
  const amenLoad = useLoadState('amenities');

  const amen = state.amenIdx != null ? AMENS[state.amenIdx] : null;

  // Drilling into an amenity swaps the list for a detail without leaving the
  // tab, so in page mode the document would otherwise open the detail at
  // whatever depth the list was left scrolled to.
  useScrollTopOnChange(state.amenIdx ?? 'list');

  // Live: the booking grid comes from the amenity's own configuration
  // (hours, slot length, booking window). Demo keeps its scripted grid.
  const SLOTS = demo || !amen ? DEMO_SLOTS : (() => {
    const out: string[] = [];
    const step = amen.slotMinutes ?? 60;
    for (let t = (amen.openHour ?? 8) * 60; t + step <= (amen.closeHour ?? 21) * 60; t += step) out.push(slotLabel(t));
    return out;
  })();
  const DAYS = demo ? DEMO_DAYS : (() => {
    const out: string[] = [];
    for (let i = 0; i < (amen?.maxDaysAhead ?? 7); i++) {
      const d = new Date(Date.now() + i * 86400_000);
      out.push(i === 0
        ? `Today · ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', ' ·'));
    }
    return out;
  })();

  const hasBooking = reservation.booked && !!reservation.summary;
  const canBook = state.slotIdx != null;
  const notCalAdded = !state.calAdded;

  const book = () => {
    if (state.slotIdx == null || amen == null) return;
    const day = demo ? DAYS[state.dayIdx].split(' · ')[0] : DAYS[state.dayIdx] ?? DAYS[0];
    repo.createReservation({ amenity: amen.name, day, slot: SLOTS[state.slotIdx], hours: state.durIdx === 1 ? 2 : 1 });
    set({ bookingConfirmed: true, calAdded: false });
  };
  const cancelBooking = () => {
    repo.cancelReservation();
    set({ bookingConfirmed: false, slotIdx: null, calAdded: false });
  };

  const openAmen = (i: number) =>
    set({ amenIdx: i, slotIdx: null, bookingConfirmed: false, waitlisted: {}, durIdx: 1 });

  const backToList = () => set({ amenIdx: null });

  const pickSlot = (i: number) => {
    const taken = amen ? amen.taken.indexOf(i) !== -1 : false;
    if (taken) {
      set({ waitlisted: { ...state.waitlisted, [i]: !state.waitlisted[i] } });
    } else {
      set({ slotIdx: i });
    }
  };

  if (amen) {
    return (
      <div
        className="pav-tabscroll absolute inset-0 overflow-y-auto pav-scroll"
        style={{ padding: 'calc(64px + var(--pav-chrome-top)) 18px var(--pav-screen-bottom)' }}
      >
        <div className="animate-fadeup">
          <BackButton label="All amenities" onClick={backToList} />
          <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">{amen.name}</h1>
          <p className="m-0 mb-3 text-[13.5px] text-slatedeep font-semibold">{demo ? `${amen.sub} · free for residents` : amen.sub}</p>
          <Card padding="sm" className="flex gap-2.5 items-start mb-5">
            <PhIcon name="ph-fill ph-info" size={14} color="rgb(var(--slate))" className="mt-0.5 flex-shrink-0" />
            <p className="m-0 text-[12.5px] leading-[1.5] font-semibold text-slatedark">{amen.rules}</p>
          </Card>

          <SectionHeading title="Pick a day" />
          {/*
            Seven 64px chips plus their gaps are 484px inside a 357px column,
            so the row clipped its last days off the right edge with no way to
            reach them — and live amenities can set maxDaysAhead higher still.
            It scrolls now, and the chips hold their width instead of being
            squeezed until the date labels wrap.
          */}
          <div className="flex gap-1.5 mb-5 overflow-x-auto pav-scroll" role="group" aria-label="Day">
            {DAYS.map((d, i) => {
              const on = state.dayIdx === i;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ dayIdx: i, slotIdx: null })}
                  className={`${CHOICE} py-2.5 text-[12px] text-center leading-[1.3] flex-shrink-0`}
                  style={{ width: 64, ...choiceStyle(on) }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <SectionHeading title="Pick a time" meta="Taken? Tap to waitlist" />
          <div className="grid grid-cols-2 gap-2.5 mb-5" role="group" aria-label="Time">
            {SLOTS.map((label, i) => {
              const taken = amen.taken.indexOf(i) !== -1;
              const wl = !!state.waitlisted[i];
              const sel = state.slotIdx === i && !taken;
              const displayLabel = taken ? label + (wl ? ' · on waitlist' : ' · taken') : label;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={taken ? wl : sel}
                  onClick={() => pickSlot(i)}
                  className={`${CHOICE} py-3.5 text-[13.5px] tabular-nums`}
                  style={
                    taken
                      ? {
                          border: wl ? '1px solid rgb(var(--sage) / 0.35)' : '1px solid rgb(var(--navy) / 0.12)',
                          background: wl ? 'rgb(var(--mint))' : 'rgb(var(--skyborder))',
                          color: wl ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))',
                          textDecoration: wl ? 'none' : 'line-through',
                        }
                      : choiceStyle(sel)
                  }
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          <SectionHeading title="Length" />
          <div className="flex gap-2.5 mb-5" role="group" aria-label="Length">
            {['1 hour', '2 hours'].map((label, i) => {
              const on = state.durIdx === i;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ durIdx: i })}
                  className={`${CHOICE} flex-1 py-[11px] text-[13px]`}
                  style={choiceStyle(on)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {!state.bookingConfirmed ? (
            <button
              type="button"
              onClick={book}
              disabled={!canBook}
              className="w-full border-none rounded-2xl py-4 text-[14px] font-extrabold font-sans min-h-[44px]"
              style={{
                background: canBook ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
                color: canBook ? 'rgb(var(--white))' : 'rgb(var(--slatelight))',
                cursor: canBook ? 'pointer' : 'default',
              }}
            >
              {canBook ? 'Book ' + SLOTS[state.slotIdx as number] : 'Pick a time to book'}
            </button>
          ) : (
            <Card tint="mint" padding="lg" className="animate-fadeup">
              <div className="flex items-center gap-3 mb-3">
                <PhIcon name="ph-fill ph-check-circle" size={28} color="rgb(var(--sagedark))" className="flex-shrink-0" />
                <div>
                  <p className="m-0 mb-0.5 font-serif text-[17px] leading-[1.25] text-navy">Booked!</p>
                  <p className="m-0 text-[13px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
                    {reservation.summary}
                  </p>
                </div>
              </div>
              {notCalAdded ? (
                <button
                  type="button"
                  onClick={() => set({ calAdded: true })}
                  className="w-full border-none text-white rounded-[13px] py-[11px] text-[13.5px] font-extrabold font-sans cursor-pointer mb-2.5 flex items-center justify-center gap-1.5 min-h-[44px]"
                  style={{ background: 'rgb(var(--sagedark))' }}
                >
                  <PhIcon name="ph-fill ph-calendar-plus" size={15} />
                  Add to my calendar
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 py-[11px] mb-2.5 animate-fadeup">
                  <PhIcon name="ph-fill ph-check-circle" size={15} color="rgb(var(--sagedark))" />
                  <span className="text-[12.5px] font-bold text-sagedark">
                    On your calendar — reminder an hour before
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={backToList}
                className="w-full bg-transparent rounded-[13px] py-[11px] text-[13.5px] font-extrabold font-sans cursor-pointer min-h-[44px]"
                style={{ border: '1.5px solid rgb(var(--sagedark) / 0.4)', color: 'rgb(var(--sagedark))' }}
              >
                Done
              </button>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="pav-tabscroll absolute inset-0 overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: 'calc(64px + var(--pav-chrome-top)) 18px var(--pav-screen-bottom)' }}
    >
      <div>
        <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">Reserve</h1>
        <p className="m-0 mb-3.5 text-[13.5px] font-semibold text-slatedeep">
          Amenities, booked in two taps. One active booking per household.
        </p>

        {/*
          The resident's own booking is the hero when there is one — the
          thing they came back to check — on the same sky chrome as every
          other hero in the app. With no booking, the amenities lead.
        */}
        {hasBooking && (
          <StackedPanel tint="skydeep" className="mb-4 animate-fadeup">
            <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
              Your booking
            </p>
            <p className="m-0 font-serif text-[24px] leading-[1.18] text-mist">{reservation.summary}</p>
            <div className="flex items-center justify-between gap-3 mt-3">
              <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
                We&apos;ll remind you an hour before
              </p>
              <button
                type="button"
                onClick={cancelBooking}
                className="border-0 rounded-full px-3.5 text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 min-h-[36px]"
                style={{ background: 'rgb(var(--peach))', color: 'rgb(var(--navy))' }}
              >
                Cancel
              </button>
            </div>
          </StackedPanel>
        )}

        {AMENS.length === 0 && (
          <EmptyState
            icon="ph-fill ph-calendar-check"
            title="No amenities set up yet"
            body={
              canManage
                ? 'Add the clubhouse, pool, or courts and neighbors book them themselves — no more sign-up sheet on the door.'
                : 'When your board adds the clubhouse, pool, or courts, you’ll book them here.'
            }
            status={amenLoad}
            actionLabel={canManage ? 'Add an amenity' : undefined}
            onAction={canManage ? () => set({ manageAmenOpen: true }) : undefined}
          />
        )}

        {AMENS.length > 0 && (
          <SectionHeading
            title="Amenities"
            meta={hasBooking ? undefined : 'Tap one to book'}
            action={
              canManage ? (
                <button
                  type="button"
                  onClick={() => set({ manageAmenOpen: true })}
                  className="rounded-full px-3 text-[12.5px] font-extrabold cursor-pointer bg-paper text-navy font-sans flex items-center gap-1.5 min-h-[36px]"
                  style={{ border: '1px solid rgb(var(--navy) / 0.15)' }}
                >
                  <PhIcon name="ph-fill ph-gear-six" size={14} color="rgb(var(--skydeep))" />
                  Manage amenities
                </button>
              ) : undefined
            }
          />
        )}
        {AMENS.length === 0 && canManage && (
          <button
            type="button"
            onClick={() => set({ manageAmenOpen: true })}
            className="w-full mt-3 mb-1 rounded-xl py-[11px] text-[13px] font-extrabold font-sans cursor-pointer bg-transparent text-navy flex items-center justify-center gap-2 min-h-[44px]"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
          >
            <PhIcon name="ph-fill ph-gear-six" size={15} />
            Manage amenities
          </button>
        )}
        <div className="flex flex-col gap-2.5">
          {AMENS.map((a, i) => (
            <Card key={a.name} elevation="raised" padding="none" onClick={() => openAmen(i)} className="px-4 py-[15px]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
                  <PhIcon name={a.icon} size={22} color="rgb(var(--skydeep))" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[14px] font-bold text-navy">{a.name}</p>
                  <p className="m-0 mb-1 text-[12.5px] font-semibold text-slate">{a.sub}</p>
                  {/* The dot carries the colour; the copy stays on a text-bearing slate. */}
                  <p className="m-0 text-[12px] font-semibold text-slatedark flex items-center gap-1.5">
                    <span className="w-[7px] h-[7px] rounded-full inline-block flex-shrink-0" style={{ background: a.occColor }} />
                    {a.occ}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Pill label={a.avail} tone="success" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Demo-only visitor pass: a secondary door, below the amenities so it never competes with the hero. */}
        {repo.isDemo() && (
          <Card elevation="raised" padding="none" onClick={() => set({ passOpen: true })} className="px-4 py-3.5 mt-3.5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-skydeep">
                <PhIcon name="ph-fill ph-qr-code" size={22} color="rgb(var(--peach))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[14px] font-bold text-navy">Expecting visitors?</p>
                <p className="m-0 text-[12.5px] font-semibold text-slate">Issue a gate &amp; parking pass in two taps</p>
              </div>
              <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--skydeep))' }}>
                Pass →
              </span>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
