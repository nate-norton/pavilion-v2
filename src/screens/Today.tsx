import { PhIcon } from '../components/PhIcon';
import { NOTIFS, PORTFOLIO } from '../data';
import { usePavStore } from '../store/store';
import { getAttention, getDelinquent, getQuorum } from '../store/selectors';

const ROW = 'flex items-center gap-[13px] cursor-pointer';
const ROW_PAD = { padding: '14px 0' } as const;
const DOT = 'w-2 h-2 rounded-full flex-shrink-0';
const ROW_TITLE = 'm-0 text-sm font-bold text-navy leading-[1.3]';
const ROW_SUB = 'm-0 mt-px text-xs text-stone font-semibold';
const CARET = <PhIcon name="ph-bold ph-caret-right" size={13} color="#C9C0AE" className="flex-shrink-0" />;

/** Today screen — ported from prototype v10 lines 82-260. */
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
      style={{ padding: '64px 20px 150px' }}
    >
      {showAlert && (
        <div className="rounded-2xl px-3.5 py-3 flex gap-2.5 items-start mb-[18px] text-white" style={{ background: '#C7402E' }}>
          <PhIcon name="ph-fill ph-warning" size={17} className="mt-px flex-shrink-0" />
          <div className="flex-1">
            <p className="m-0 mb-px text-[13px] font-bold">Water shutoff — Alder Way</p>
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

      <p className="m-0 mb-1.5 text-[11px] font-bold uppercase text-stonelight" style={{ letterSpacing: '0.14em' }}>
        Tuesday, July 1 · Juniper Ridge
      </p>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <h1 className="m-0 font-serif font-normal text-[32px] text-navy leading-[1.1]" style={{ letterSpacing: '-0.01em' }}>
          Morning, Alex.
        </h1>
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          <button
            onClick={() => set({ searchOpen: true, searchQ: '' })}
            title="Search"
            className="w-9 h-9 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={17} color="#1A3352" />
          </button>
          <button
            onClick={() => set({ notifOpen: true })}
            title="Notifications"
            className="relative w-9 h-9 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <PhIcon name="ph ph-bell" size={18} color="#1A3352" />
            {hasNotifBadge && (
              <span
                className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                style={{ background: '#C75A31', border: '2px solid #F5F0E6' }}
              />
            )}
          </button>
          <button
            onClick={() => set({ myPlaceOpen: true })}
            title="My Place"
            className="w-[34px] h-[34px] rounded-full border-none bg-navy flex items-center justify-center text-cream font-extrabold text-[13px] cursor-pointer ml-1.5"
          >
            A
          </button>
        </div>
      </div>
      <p className="m-0 mb-5 text-sm text-taupe font-semibold">{attnSummary}</p>

      {/* Needs you: one card, one list */}
      <div className="bg-paper rounded-[20px] flex flex-col" style={{ border: '1px solid rgba(26,51,82,0.1)', padding: '6px 18px' }}>
        {isManager && (
          <div onClick={() => set({ portfolioOpen: true, myPlaceOpen: false })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#1A3352' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Your portfolio</p>
              <p className={ROW_SUB}>3 communities · {pfDoors} doors · {pfOpen} open items</p>
            </div>
            {CARET}
          </div>
        )}

        {isTenant && (
          <div onClick={() => set({ myPlaceOpen: true })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#C9C0AE' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Your lease &amp; amenities</p>
              <p className={ROW_SUB}>Rent goes to your landlord — Pavilion handles the rest</p>
            </div>
            {CARET}
          </div>
        )}

        {saCardShow && (
          <div onClick={() => set({ saSheetOpen: true })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#C75A31' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Roof-reserve assessment · $450</p>
              <p className={ROW_SUB}>Due Aug 1 · pay now or split into 3</p>
            </div>
            {CARET}
          </div>
        )}

        {showVoteCardRole && (
          <div onClick={() => set({ tab: 'hoa' })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#C75A31' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Vote on the pool furniture</p>
              <p className={ROW_SUB}>Closes Thursday · quorum at {quorumPct}%</p>
            </div>
            {CARET}
          </div>
        )}

        {showPayCardRole && (
          <div onClick={() => set({ paySheetOpen: true })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#C75A31' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>{payCardTitle}</p>
              <p className={ROW_SUB}>{payCardSub}</p>
            </div>
            <span className="rounded-full px-[10px] py-[5px] text-[12px] font-extrabold flex-shrink-0" style={{ background: '#FBEDE4', color: '#C75A31' }}>
              {payCardBtn}
            </span>
          </div>
        )}

        {violPendingCard && (
          <div onClick={() => set({ violSheetOpen: true })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#D9A441' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Courtesy notice: trash bins</p>
              <p className={ROW_SUB}>No fee · auto-closes if fixed by Jul 8</p>
            </div>
            {CARET}
          </div>
        )}

        {violFixedCard && (
          <div className="flex items-center gap-[13px] animate-fadeup" style={ROW_PAD}>
            <PhIcon name="ph-fill ph-check-circle" size={17} color="#2A9D5C" className="flex-shrink-0 -ml-1" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Notice marked fixed — thank you</p>
              <p className={ROW_SUB}>Closes after the board&apos;s next walk-through</p>
            </div>
          </div>
        )}

        {showArcCardRole && (
          <div onClick={() => set({ arcSeen: true, tab: 'hoa' })} className={ROW} style={ROW_PAD}>
            <span className={DOT} style={{ background: '#C9C0AE' }} />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Your pergola was approved</p>
              <p className={ROW_SUB}>ARC #A-118 · reviewed in 6 days</p>
            </div>
            {CARET}
          </div>
        )}

        {showAllClear && (
          <div className="flex items-center gap-[13px] animate-fadeup" style={{ padding: '16px 0' }}>
            <PhIcon name="ph-fill ph-check-circle" size={18} color="#2A9D5C" className="flex-shrink-0 -ml-1" />
            <p className="m-0 text-[13.5px] font-bold" style={{ color: '#5F8A6F' }}>
              All caught up — nothing needs you today.
            </p>
          </div>
        )}
      </div>

      {/* AI nudge: one quiet line */}
      {showNudge && (
        <div className="flex gap-[9px] items-start" style={{ padding: '14px 6px 0' }}>
          <PhIcon name="ph-fill ph-sparkle" size={13} color="#C75A31" className="mt-[3px] flex-shrink-0" />
          <p className="m-0 flex-1 text-xs leading-[1.5] font-semibold text-stone">
            AI: fireworks aren&apos;t allowed in the Ridge (§5.9) — the east lot has the best view of Saturday&apos;s
            city show.
          </p>
          <button
            onClick={() => set({ nudgeDismissed: true })}
            className="border-none bg-transparent cursor-pointer flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full"
          >
            <PhIcon name="ph-bold ph-x" size={12} color="#C9C0AE" />
          </button>
        </div>
      )}

      {/* Around the neighborhood */}
      <div className="flex items-baseline justify-between gap-2.5" style={{ margin: '28px 0 12px' }}>
        <h2 className="m-0 font-serif font-normal text-[19px] text-navy">Around the neighborhood</h2>
        <button
          onClick={() => set({ eventsOpen: true })}
          className="border-none bg-transparent text-[12.5px] font-bold cursor-pointer p-0 text-stone"
        >
          Calendar
        </button>
      </div>

      {/* One featured event */}
      <div className="rounded-[20px] text-cream bg-navy mb-2.5" style={{ padding: '16px 18px' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 mb-[3px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: '#E8A788' }}>
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

      {/* Quiet neighborhood list */}
      <div className="bg-paper rounded-[20px]" style={{ border: '1px solid rgba(26,51,82,0.1)', padding: '6px 18px' }}>
        {hasBooking ? (
          <div onClick={() => set({ tab: 'reserve' })} className="flex items-center gap-3 cursor-pointer" style={ROW_PAD}>
            <PhIcon name="ph-fill ph-calendar-check" size={17} color="#2A9D5C" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">Reserved: {state.bookingSummary}</p>
          </div>
        ) : (
          <div onClick={() => set({ tab: 'reserve' })} className="flex items-center gap-3 cursor-pointer" style={ROW_PAD}>
            <PhIcon name="ph ph-swimming-pool" size={17} color="#8A8375" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">Pool cabana open today · 4 slots left</p>
            <PhIcon name="ph-bold ph-caret-right" size={12} color="#C9C0AE" className="flex-shrink-0" />
          </div>
        )}

        <div onClick={() => set({ mapOpen: true })} className="flex items-center gap-3 cursor-pointer" style={ROW_PAD}>
          <PhIcon name="ph ph-map-trifold" size={17} color="#8A8375" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">Neighborhood map · 5 pins today</p>
          <PhIcon name="ph-bold ph-caret-right" size={12} color="#C9C0AE" className="flex-shrink-0" />
        </div>

        <div className="flex items-center gap-3" style={ROW_PAD}>
          <PhIcon name="ph ph-hand-waving" size={17} color="#8A8375" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">The Okafors moved into #42</p>
          <button
            onClick={() => set({ chatWith: 'okafor' })}
            className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer flex-shrink-0"
            style={{ color: '#C75A31', padding: '2px 4px' }}
          >
            Say hi
          </button>
        </div>
      </div>
    </div>
  );
}
