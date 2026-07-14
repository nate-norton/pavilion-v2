import { PhIcon } from '../components/PhIcon';
import { AMENS, SLOTS, DAYS } from '../data';
import { usePavStore } from '../store/store';

/** Reserve screen — ported from prototype lines 523-628. */
export function Reserve() {
  const state = usePavStore();
  const { set, book, cancelBooking } = state;

  const amen = state.amenIdx != null ? AMENS[state.amenIdx] : null;
  const hasBooking = !!state.bookingSummary && state.booked;
  const canBook = state.slotIdx != null;
  const notCalAdded = !state.calAdded;

  const openAmen = (i: number) =>
    set({ amenIdx: i, slotIdx: null, booked: false, waitlisted: {}, durIdx: 1 });

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
        className="absolute inset-0 overflow-y-auto pav-scroll"
        style={{ padding: '64px 18px 150px' }}
      >
        <div className="animate-fadeup">
          <button
            onClick={backToList}
            className="border-none bg-transparent flex items-center gap-1.5 text-[13px] font-bold cursor-pointer p-0 mb-3.5 text-stone"
            style={{}}
          >
            <PhIcon name="ph-bold ph-arrow-left" size={14} />
            All amenities
          </button>
          <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">{amen.name}</h1>
          <p className="m-0 mb-2.5 text-[13px] text-taupe font-semibold">{amen.sub} · free for residents</p>
          <div
            className="bg-paper rounded-[13px] px-3.5 py-2.5 flex gap-2.5 items-start mb-[18px]"
            style={{ border: '1px solid rgba(26,51,82,0.08)' }}
          >
            <PhIcon name="ph-fill ph-info" size={14} color="#8A8375" className="mt-px flex-shrink-0" />
            <p className="m-0 text-xs leading-[1.5] font-bold text-stone">{amen.rules}</p>
          </div>

          <p
            className="m-0 mb-[9px] text-[11px] font-bold uppercase text-stone"
            style={{ letterSpacing: '0.12em' }}
          >
            Pick a day
          </p>
          <div className="flex gap-1.5 mb-[18px]">
            {DAYS.map((d, i) => {
              const on = state.dayIdx === i;
              return (
                <button
                  key={d}
                  onClick={() => set({ dayIdx: i, slotIdx: null })}
                  className="rounded-[13px] py-2.5 text-xs font-extrabold cursor-pointer text-center leading-[1.3]"
                  style={{
                    width: 64,
                    border: on ? '1px solid #1A3352' : '1px solid rgba(26,51,82,0.12)',
                    background: on ? '#1A3352' : '#FFFEFA',
                    color: on ? '#F5F0E6' : '#5B554A',
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="flex items-baseline justify-between mb-[9px]">
            <p
              className="m-0 text-[11px] font-bold uppercase text-stone"
              style={{ letterSpacing: '0.12em' }}
            >
              Pick a time
            </p>
            <span className="text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
              Taken? Tap to waitlist
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-[18px]">
            {SLOTS.map((label, i) => {
              const taken = amen.taken.indexOf(i) !== -1;
              const wl = !!state.waitlisted[i];
              const sel = state.slotIdx === i && !taken;
              const displayLabel = taken ? label + (wl ? ' · on waitlist' : ' · taken') : label;
              return (
                <button
                  key={label}
                  onClick={() => pickSlot(i)}
                  className="rounded-[13px] py-3.5 text-[13.5px] font-extrabold cursor-pointer"
                  style={{
                    border: sel
                      ? '1px solid #1A3352'
                      : taken && wl
                        ? '1px solid rgba(42,157,92,0.35)'
                        : '1px solid rgba(26,51,82,0.12)',
                    background: taken ? (wl ? '#E9F6EE' : '#EDE6D6') : sel ? '#1A3352' : '#FFFEFA',
                    color: taken ? (wl ? '#228049' : '#B4AC9C') : sel ? '#F5F0E6' : '#1A3352',
                    textDecoration: taken && !wl ? 'line-through' : 'none',
                  }}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          <p
            className="m-0 mb-[9px] text-[11px] font-bold uppercase text-stone"
            style={{ letterSpacing: '0.12em' }}
          >
            Length
          </p>
          <div className="flex gap-2.5 mb-[18px]">
            {['1 hour', '2 hours'].map((label, i) => {
              const on = state.durIdx === i;
              return (
                <button
                  key={label}
                  onClick={() => set({ durIdx: i })}
                  className="flex-1 rounded-[13px] py-[11px] text-[13px] font-extrabold cursor-pointer"
                  style={{
                    border: on ? '1px solid #1A3352' : '1px solid rgba(26,51,82,0.12)',
                    background: on ? '#1A3352' : '#FFFEFA',
                    color: on ? '#F5F0E6' : '#5B554A',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {!state.booked ? (
            <button
              onClick={book}
              className="w-full border-none rounded-2xl py-4 text-[15px] font-extrabold"
              style={{
                background: canBook ? '#E06A3E' : '#DDD5C2',
                color: canBook ? '#fff' : '#A39B8B',
                cursor: canBook ? 'pointer' : 'default',
              }}
            >
              {canBook ? 'Book ' + SLOTS[state.slotIdx as number] : 'Pick a time to book'}
            </button>
          ) : (
            <div
              className="rounded-[18px] px-4 py-[18px] animate-fadeup"
              style={{ background: '#E9F6EE', border: '1px solid rgba(42,157,92,0.25)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <PhIcon name="ph-fill ph-check-circle" size={28} color="#2A9D5C" className="flex-shrink-0" />
                <div>
                  <p className="m-0 mb-0.5 text-[15px] font-bold text-navy">Booked!</p>
                  <p className="m-0 text-[13px] font-bold" style={{ color: '#5F8A6F' }}>
                    {state.bookingSummary}
                  </p>
                </div>
              </div>
              {notCalAdded ? (
                <button
                  onClick={() => set({ calAdded: true })}
                  className="w-full border-none text-white rounded-[13px] py-[11px] text-[13.5px] font-extrabold cursor-pointer mb-2.5 flex items-center justify-center gap-1.5"
                  style={{ background: '#2A9D5C' }}
                >
                  <PhIcon name="ph-fill ph-calendar-plus" size={15} />
                  Add to my calendar
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 py-[11px] mb-2.5 animate-fadeup">
                  <PhIcon name="ph-fill ph-check-circle" size={15} color="#2A9D5C" />
                  <span className="text-[12.5px] font-bold text-sagedark">
                    On your calendar — reminder an hour before
                  </span>
                </div>
              )}
              <button
                onClick={backToList}
                className="w-full bg-transparent rounded-[13px] py-[11px] text-[13.5px] font-extrabold cursor-pointer"
                style={{ border: '1.5px solid rgba(42,157,92,0.35)', color: '#228049' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: '64px 18px 150px' }}
    >
      <div>
        <h1 className="m-0 mb-1 font-serif font-normal text-[28px] text-navy">Reserve</h1>
        <p className="m-0 mb-3.5 text-[13.5px] font-semibold" style={{ color: '#7A7365' }}>
          Amenities, booked in two taps. One active booking per household.
        </p>
        <div
          onClick={() => set({ passOpen: true })}
          className="rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer mb-3.5 bg-navy"
        >
          <PhIcon name="ph-fill ph-qr-code" size={22} color="#E8A788" className="flex-shrink-0" />
          <div className="flex-1">
            <p className="m-0 mb-px text-[13.5px] font-bold text-cream">Expecting visitors?</p>
            <p className="m-0 text-xs font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
              Issue a gate &amp; parking pass in two taps
            </p>
          </div>
          <span className="text-[13px] font-extrabold" style={{ color: '#E8A788' }}>
            Pass →
          </span>
        </div>

        {hasBooking && (
          <div
            className="rounded-2xl px-4 py-3.5 mb-3.5 flex items-center gap-3 animate-fadeup"
            style={{ background: '#E9F6EE', border: '1px solid rgba(42,157,92,0.25)' }}
          >
            <PhIcon name="ph-fill ph-ticket" size={21} color="#2A9D5C" className="flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-px text-[13.5px] font-bold text-navy">{state.bookingSummary}</p>
              <p className="m-0 text-xs font-bold" style={{ color: '#5F8A6F' }}>
                We&apos;ll remind you an hour before
              </p>
            </div>
            <button
              onClick={cancelBooking}
              className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer p-1 text-stone"
              style={{}}
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {AMENS.map((a, i) => (
            <div
              key={a.name}
              onClick={() => openAmen(i)}
              className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3.5 cursor-pointer"
              style={{ border: '1px solid rgba(26,51,82,0.08)' }}
            >
              <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 bg-sand">
                <PhIcon name={a.icon} size={22} color="#1A3352" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[15px] font-bold text-navy">{a.name}</p>
                <p className="m-0 mb-1 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
                  {a.sub}
                </p>
                <p
                  className="m-0 text-[11.5px] font-bold flex items-center gap-1.5"
                  style={{ color: a.occColor }}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full inline-block"
                    style={{ background: a.occColor }}
                  />
                  {a.occ}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{ background: '#E9F6EE', color: '#228049' }}
                >
                  {a.avail}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
