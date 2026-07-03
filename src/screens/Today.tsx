import { Confetti } from '../components/Confetti';
import { PhIcon } from '../components/PhIcon';
import { NOTIFS, PORTFOLIO } from '../data';
import { usePavStore } from '../store/store';
import { getAttention, getDelinquent, getQuorum } from '../store/selectors';

/** Today screen — ported from prototype lines 82-277. */
export function Today() {
  const state = usePavStore();
  const set = state.set;
  const { n, summary: attnSummary } = getAttention(state);
  const { pct: quorumPct } = getQuorum(state);
  const delinquent = getDelinquent(state);

  const isOwner = state.role === 'owner';
  const isTenant = state.role === 'tenant';
  const isManager = state.role === 'manager';

  const showPayCardRole = !state.paid && isOwner;
  const showArcCardRole = !state.arcSeen && isOwner;
  const showVoteCardRole = !state.voted && (isOwner || isManager);
  const saCardShow = state.showSpecialAssessment && !state.saPaid;
  const violPendingCard = state.showViolation && !state.violFixed;
  const violFixedCard = state.showViolation && state.violFixed;
  const showAllClear = n === 0;
  const showAlert = state.showAlert && !state.alertDismissed;
  const showNudge = !state.nudgeDismissed;

  const notifBadge = state.notifsRead
    ? 0
    : NOTIFS.filter((nt) => nt.unread && !state.mutedCats[nt.cat]).length;
  const hasNotifBadge = notifBadge > 0;

  const rsvpFood = state.rsvpFood;
  const tacoGoing = 12 + (rsvpFood ? 1 : 0);

  const hasBooking = !!state.bookingSummary && state.booked;

  const payCardTitle =
    state.planActive && !state.paid
      ? 'Payment plan active'
      : delinquent
        ? 'Dues are past due'
        : 'July dues are ready';
  const payCardSub =
    state.planActive && !state.paid
      ? '3 × $190 · next runs Jul 3 · no fees'
      : delinquent
        ? '$570 · 30 days · courtesy period, no fees yet'
        : '$285 · same as June · itemized inside';
  const payCardBtn = state.planActive && !state.paid ? 'View plan' : 'Review & pay';

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfOpen = PORTFOLIO.reduce((a, c) => a + c.open, 0);

  return (
    <div
      className="absolute inset-0 overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: '64px 18px 150px' }}
    >
      {showAlert && (
        <div className="rounded-2xl px-3.5 py-3 flex gap-2.5 items-start mb-4 text-white" style={{ background: '#C7402E' }}>
          <PhIcon name="ph-fill ph-warning" size={17} className="mt-px flex-shrink-0" />
          <div className="flex-1">
            <p className="m-0 mb-px text-[13px] font-extrabold">Water shutoff — Alder Way</p>
            <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Today 1–4 PM · hydrant repair · bottled water at the clubhouse
            </p>
          </div>
          <button
            onClick={() => set({ alertDismissed: true })}
            className="border-none bg-transparent cursor-pointer p-0.5 flex-shrink-0"
          >
            <PhIcon name="ph-bold ph-x" size={13} color="rgba(255,255,255,0.7)" />
          </button>
        </div>
      )}

      <p className="m-0 mb-1.5 text-[11px] font-extrabold uppercase text-stone" style={{ letterSpacing: '0.14em' }}>
        Tuesday, July 1 · Juniper Ridge · 78°
      </p>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h1 className="m-0 font-serif font-normal text-[32px] text-navy leading-[1.1]" style={{ letterSpacing: '-0.01em' }}>
          Morning, Alex.
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button
            onClick={() => set({ searchOpen: true, searchQ: '' })}
            title="Search"
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center cursor-pointer bg-paper"
            style={{ border: '1px solid rgba(26,51,82,0.14)' }}
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={16} color="#1A3352" />
          </button>
          <button
            onClick={() => set({ notifOpen: true })}
            title="Notifications"
            className="relative w-[38px] h-[38px] rounded-full flex items-center justify-center cursor-pointer bg-paper"
            style={{ border: '1px solid rgba(26,51,82,0.14)' }}
          >
            <PhIcon name="ph-fill ph-bell" size={17} color="#1A3352" />
            {hasNotifBadge && (
              <span
                className="absolute -top-[3px] -right-[3px] min-w-[16px] h-[16px] px-1 bg-ember text-white text-[10px] font-extrabold rounded-full flex items-center justify-center"
                style={{ border: '2px solid #F5F0E6' }}
              >
                {notifBadge}
              </span>
            )}
          </button>
          <button
            onClick={() => set({ myPlaceOpen: true })}
            title="My Place"
            className="w-[38px] h-[38px] rounded-full border-none bg-navy flex items-center justify-center text-cream font-extrabold text-sm cursor-pointer"
          >
            A
          </button>
        </div>
      </div>
      <p className="m-0 mb-[22px] text-sm text-taupe font-semibold">{attnSummary}</p>

      {/* Needs you */}
      <div className="flex flex-col gap-2.5 mb-3">
        {isManager && (
          <div
            onClick={() => set({ portfolioOpen: true, myPlaceOpen: false })}
            className="rounded-[18px] p-4 cursor-pointer text-cream bg-navy"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <PhIcon name="ph-fill ph-buildings" size={20} color="#E8A788" />
              <p className="m-0 flex-1 text-[14.5px] font-extrabold">Your portfolio</p>
              <span className="text-[12.5px] font-extrabold" style={{ color: '#E8A788' }}>
                Open →
              </span>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(245,240,230,0.08)' }}>
                <p className="m-0 mb-0.5 font-serif text-[19px]">3</p>
                <p className="m-0 text-[10px] font-bold tracking-wide" style={{ color: 'rgba(245,240,230,0.6)' }}>
                  COMMUNITIES
                </p>
              </div>
              <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(245,240,230,0.08)' }}>
                <p className="m-0 mb-0.5 font-serif text-[19px]">{pfDoors}</p>
                <p className="m-0 text-[10px] font-bold tracking-wide" style={{ color: 'rgba(245,240,230,0.6)' }}>
                  DOORS
                </p>
              </div>
              <div className="flex-1 rounded-xl p-2.5 text-center" style={{ background: 'rgba(245,240,230,0.08)' }}>
                <p className="m-0 mb-0.5 font-serif text-[19px]">{pfOpen}</p>
                <p className="m-0 text-[10px] font-bold tracking-wide" style={{ color: 'rgba(245,240,230,0.6)' }}>
                  OPEN ITEMS
                </p>
              </div>
            </div>
          </div>
        )}

        {isTenant && (
          <div
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3"
            style={{ border: '1px solid rgba(26,51,82,0.08)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-skypale">
              <PhIcon name="ph-fill ph-key" size={21} color="#3A73B5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">Rent goes to your landlord</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">Pavilion handles amenities &amp; notices — not rent</p>
            </div>
            <button
              onClick={() => set({ myPlaceOpen: true })}
              className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer flex-shrink-0 p-1"
              style={{ color: '#3A73B5' }}
            >
              Lease →
            </button>
          </div>
        )}

        {saCardShow && (
          <div
            onClick={() => set({ saSheetOpen: true })}
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3 cursor-pointer"
            style={{ border: '1px solid rgba(199,90,49,0.35)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-blush">
              <PhIcon name="ph-fill ph-scroll" size={21} color="#C75A31" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">Roof-reserve special assessment</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">$450 · due Aug 1 · approved at the June meeting</p>
            </div>
            <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: '#C75A31' }}>
              Review →
            </span>
          </div>
        )}

        {showVoteCardRole && (
          <div
            onClick={() => set({ tab: 'hoa' })}
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3 cursor-pointer"
            style={{ border: '1px solid rgba(26,51,82,0.08)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-blush">
              <PhIcon name="ph-fill ph-check-square" size={21} color="#C75A31" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">Pool furniture vote closes Thursday</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">Quorum at {quorumPct}% — your ballot counts</p>
            </div>
            <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: '#C75A31' }}>
              Vote →
            </span>
          </div>
        )}

        {showPayCardRole && (
          <div
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3"
            style={{ border: '1px solid rgba(26,51,82,0.08)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-mint">
              <PhIcon name="ph-fill ph-bank" size={21} color="#2A9D5C" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">{payCardTitle}</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">{payCardSub}</p>
            </div>
            <button
              onClick={() => set({ paySheetOpen: true })}
              className="border-none text-white rounded-full px-3.5 py-2 text-[12.5px] font-extrabold cursor-pointer flex-shrink-0 bg-sage"
            >
              {payCardBtn}
            </button>
          </div>
        )}

        {showArcCardRole && (
          <div
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3"
            style={{ border: '1px solid rgba(26,51,82,0.08)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-skypale">
              <PhIcon name="ph-fill ph-seal-check" size={21} color="#4A90E2" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">Your pergola was approved</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">ARC request #A-118 · reviewed in 6 days</p>
            </div>
            <button
              onClick={() => set({ arcSeen: true, tab: 'hoa' })}
              className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer flex-shrink-0 p-1"
              style={{ color: '#4A90E2' }}
            >
              Details →
            </button>
          </div>
        )}

        {violPendingCard && (
          <div
            onClick={() => set({ violSheetOpen: true })}
            className="bg-paper rounded-[18px] px-4 py-[15px] flex items-center gap-3 cursor-pointer"
            style={{ border: '1px solid rgba(217,164,65,0.45)', boxShadow: '0 4px 14px -8px rgba(26,51,82,0.14)' }}
          >
            <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-goldpale">
              <PhIcon name="ph-fill ph-trash" size={21} color="#A87B1F" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy leading-[1.25]">Courtesy notice: trash bins</p>
              <p className="m-0 text-[12.5px] text-stone font-semibold">No fee · auto-closes if fixed by Jul 8</p>
            </div>
            <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: '#A87B1F' }}>
              Open →
            </span>
          </div>
        )}

        {violFixedCard && (
          <div
            className="rounded-[18px] px-4 py-[15px] flex items-center gap-3 bg-mint animate-fadeup"
            style={{ border: '1px solid rgba(42,157,92,0.25)' }}
          >
            <PhIcon name="ph-fill ph-check-circle" size={24} color="#2A9D5C" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 mb-0.5 text-sm font-extrabold text-navy">Notice marked fixed — thank you</p>
              <p className="m-0 text-xs font-semibold" style={{ color: '#5F8A6F' }}>
                The board confirms on their next walk-through, then it closes for good
              </p>
            </div>
          </div>
        )}

        {showAllClear && (
          <div
            className="relative rounded-[18px] px-4 py-[18px] flex items-center gap-3 bg-mint animate-fadeup"
            style={{ border: '1px solid rgba(42,157,92,0.2)' }}
          >
            <Confetti />
            <PhIcon name="ph-fill ph-check-circle" size={26} color="#2A9D5C" className="flex-shrink-0" />
            <div>
              <p className="m-0 mb-0.5 text-[14.5px] font-extrabold text-navy">You&apos;re all caught up.</p>
              <p className="m-0 text-[12.5px] font-semibold" style={{ color: '#5F8A6F' }}>
                Nothing needs you today. Taco cart at five.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Penny nudge */}
      {showNudge && (
        <div className="rounded-2xl px-3.5 py-3 flex gap-2.5 items-start mb-[26px] bg-blush" style={{ border: '1px solid rgba(199,90,49,0.18)' }}>
          <PhIcon name="ph-fill ph-sparkle" size={15} color="#C75A31" className="mt-0.5 flex-shrink-0" />
          <p className="m-0 flex-1 text-[12.5px] leading-[1.5] font-bold" style={{ color: '#8A5138' }}>
            Penny: fireworks aren&apos;t allowed in the Ridge (§5.9) — but the east lot has the best view of Saturday&apos;s city
            show.
          </p>
          <button
            onClick={() => set({ nudgeDismissed: true })}
            className="border-none bg-transparent cursor-pointer p-0.5 flex-shrink-0"
          >
            <PhIcon name="ph-bold ph-x" size={13} color="#C79A85" />
          </button>
        </div>
      )}

      {/* Around the neighborhood */}
      <div className="flex items-baseline justify-between gap-2.5 mb-3">
        <h2 className="m-0 font-serif font-normal text-[19px] text-navy">Around the neighborhood</h2>
        <button
          onClick={() => set({ eventsOpen: true })}
          className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer p-0"
          style={{ color: '#C75A31' }}
        >
          Calendar →
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        <div className="rounded-[18px] p-4 text-cream bg-navy">
          <div className="flex items-center justify-between gap-2.5">
            <div className="min-w-0">
              <p className="m-0 mb-[3px] text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#E8A788' }}>
                Today · 5–8 PM
              </p>
              <p className="m-0 mb-[3px] font-serif text-[17px] leading-[1.2]">Taco cart at the clubhouse</p>
              <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
                {tacoGoing} neighbors going
              </p>
            </div>
            {rsvpFood ? (
              <button
                onClick={() => set({ rsvpFood: !state.rsvpFood })}
                className="border-none text-white rounded-full px-[15px] py-[9px] text-[13px] font-extrabold cursor-pointer flex-shrink-0 flex items-center gap-1.5 bg-sage"
              >
                <PhIcon name="ph-fill ph-check" size={14} />
                Going
              </button>
            ) : (
              <button
                onClick={() => set({ rsvpFood: !state.rsvpFood })}
                className="border-none text-white rounded-full px-[15px] py-[9px] text-[13px] font-extrabold cursor-pointer flex-shrink-0 bg-ember"
              >
                I&apos;m in
              </button>
            )}
          </div>
        </div>

        {hasBooking ? (
          <div
            className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3"
            style={{ border: '1px solid rgba(26,51,82,0.08)' }}
          >
            <PhIcon name="ph-fill ph-calendar-check" size={20} color="#2A9D5C" className="flex-shrink-0" />
            <p className="m-0 text-[13.5px] font-bold text-navy flex-1">Reserved: {state.bookingSummary}</p>
          </div>
        ) : (
          <div
            onClick={() => set({ tab: 'reserve' })}
            className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer"
            style={{ border: '1px solid rgba(26,51,82,0.08)' }}
          >
            <PhIcon name="ph-fill ph-swimming-pool" size={20} color="#4A90E2" className="flex-shrink-0" />
            <p className="m-0 text-[13.5px] font-bold text-navy flex-1">The pool cabana is open today — 4 slots left</p>
            <span className="text-[13px] font-extrabold" style={{ color: '#C75A31' }}>
              Book →
            </span>
          </div>
        )}

        <div
          onClick={() => set({ mapOpen: true })}
          className="bg-paper rounded-[18px] overflow-hidden cursor-pointer"
          style={{ border: '1px solid rgba(26,51,82,0.08)' }}
        >
          <div className="h-16 relative overflow-hidden" style={{ background: '#EFE8D6' }}>
            <div className="absolute left-0 right-0 h-2.5" style={{ top: 26, background: '#F7F3EA' }} />
            <div className="absolute top-0 bottom-0 w-2.5" style={{ left: '46%', background: '#F7F3EA' }} />
            <span className="absolute rounded" style={{ left: '16%', top: 10, width: 28, height: 16, background: '#DCE9DD' }} />
            <span
              className="absolute rounded"
              style={{ left: '64%', top: 40, width: 28, height: 16, background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.1)' }}
            />
            <span
              className="absolute rounded-full"
              style={{ left: '30%', top: 40, width: 18, height: 18, background: '#E06A3E', border: '2px solid #fff' }}
            />
            <span
              className="absolute rounded-full"
              style={{ left: '72%', top: 8, width: 18, height: 18, background: '#4A90E2', border: '2px solid #fff' }}
            />
            <span
              className="absolute rounded-full"
              style={{ left: '52%', top: 24, width: 18, height: 18, background: '#2A9D5C', border: '2px solid #fff' }}
            />
          </div>
          <div className="px-4 py-3 flex items-center gap-2.5">
            <PhIcon name="ph-fill ph-map-trifold" size={19} color="#1A3352" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">See the neighborhood — 5 pins today</p>
            <span className="text-[13px] font-extrabold" style={{ color: '#C75A31' }}>
              Map →
            </span>
          </div>
        </div>

        <div
          className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3"
          style={{ border: '1px solid rgba(26,51,82,0.08)' }}
        >
          <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-extrabold text-[13px] flex-shrink-0 bg-gold">
            O
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 mb-px text-[13.5px] font-extrabold text-navy">The Okafors moved into #42</p>
            <p className="m-0 text-xs text-stone font-semibold">New this week — say hello</p>
          </div>
          {state.waved ? (
            <span className="text-[12.5px] font-extrabold flex-shrink-0" style={{ color: '#2A9D5C' }}>
              Wave sent ✓
            </span>
          ) : (
            <button
              onClick={() => set({ waved: true })}
              className="rounded-full bg-transparent px-3.5 py-[7px] text-[12.5px] font-extrabold text-navy cursor-pointer flex-shrink-0 flex items-center gap-1.5"
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
            >
              <PhIcon name="ph ph-hand-waving" size={15} />
              Wave
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
