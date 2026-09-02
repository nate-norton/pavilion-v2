import { BoardSetupCard } from '../components/BoardSetupCard';
import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { StackedCards, StackedPanel } from '../components/StackedCard';
import { useArc, useAssessment, useDues, useEvents, useMember, useNotifications, usePortfolio, useReservation, useRepository, useViolation, useVotes } from '../data/repo';
import { DUES_TONE } from '../lib/dues';
import { useEventRsvp } from '../lib/useEventRsvp';
import { usePavStore } from '../store/store';
import { getDelinquent } from '../store/selectors';
import { isLiveMode } from '../auth/AuthGate';

// Rows are real buttons so they take keyboard focus and fire on Enter/Space.
// The resets (w-full/border-none/bg-transparent/text-left/font-sans) keep the
// button visually identical to the div it replaced.
const ROW = 'w-full flex items-center gap-[13px] cursor-pointer border-none bg-transparent text-left font-sans';
const ROW_PAD = { padding: '12px 0' } as const;
const ROW_TITLE = 'm-0 text-sm font-bold text-navy leading-[1.3]';
const ROW_SUB = 'm-0 mt-px text-xs text-slate font-semibold';
const CARET = <PhIcon name="ph-bold ph-caret-right" size={13} color="rgb(var(--slatefaint))" className="flex-shrink-0" />;

/*
 * Icon disc — the tinted bed + twin-colour glyph Notifications already uses.
 * Replaces the 8px status dots, which carried a row's meaning by colour
 * alone (and gave the ARC approval the faintest one).
 */
const DISC = {
  sky: { bed: 'rgb(var(--skypale))', ink: 'rgb(var(--skydeep))' },
  mint: { bed: 'rgb(var(--mint))', ink: 'rgb(var(--sagedark))' },
  gold: { bed: 'rgb(var(--goldpale))', ink: 'rgb(var(--golddark))' },
} as const;
function Disc({ icon, tone }: { icon: string; tone: keyof typeof DISC }) {
  return (
    <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: DISC[tone].bed }} aria-hidden="true">
      <PhIcon name={icon} size={17} color={DISC[tone].ink} />
    </span>
  );
}

/** Today screen — ported from prototype v10 lines 82-260. */
export function Today() {
  const state = usePavStore();
  const set = state.set;
  const NOTIFS = useNotifications();
  const PORTFOLIO = usePortfolio();
  const reservation = useReservation();
  const member = useMember();
  const repo = useRepository();
  const demo = repo.isDemo();
  const firstName = member?.name.split(' ')[0] ?? '';
  const dues = useDues();
  const delinquent = usePavStore(getDelinquent);
  const { open: vote } = useVotes();
  const violation = useViolation();
  const assessment = useAssessment();
  const arc = useArc();
  const events = useEvents();
  const featuredEvent = events.find((e) => e.featured) ?? null;
  const hasNeighborhood = events.length > 0;
  // Drives the stack: with a hero the list tucks under it, without one it
  // stands alone and drops the extra top padding.
  const showFeatured = hasNeighborhood && !!featuredEvent;
  // Live RSVPs are optimistic with rollback; the demo flips its scripted flag.
  const rsvp = useEventRsvp(demo ? null : featuredEvent);

  const isOwner = state.role === 'owner';
  const isTenant = state.role === 'tenant';
  const isManager = state.role === 'manager';
  // Live gates on the real membership role; the demo keeps its owner persona.
  const isBoardMember = isLiveMode ? member?.role === 'board' : isOwner;

  const showPayCardRole = !!dues.current && isOwner;
  const showArcCardRole = !!arc.unseenApproval && isOwner;
  const showVoteCardRole = !!vote && !vote.myVote && (isOwner || isManager);
  const saCardShow = !!assessment && !assessment.paid;
  const violPendingCard = !!violation && !violation.fixed;
  const violFixedCard = !!violation && violation.fixed;

  /*
   * The ask is the ask. The first money item — an unpaid special assessment
   * if there is one, otherwise the current dues statement — leaves the row
   * list and takes the screen's one warm surface, with the amount at 24px
   * and a real button. Anything after it stays a row. Live gates on the
   * repo's own `dues.current` / assessment, so a fresh community never sees
   * an empty warm card.
   */
  const heroAssessment = saCardShow ? assessment : null;
  const heroDues = !heroAssessment && showPayCardRole ? dues.current : null;
  const duesStaysRow = !!heroAssessment && showPayCardRole;
  // 'Roof-reserve assessment · $450' → name + amount, when the title carries
  // one. Read off the real string, never invented.
  const saParts = heroAssessment?.title.match(/^(.*?)\s·\s(\$[\d,.]+)$/);
  const saName = saParts?.[1] ?? heroAssessment?.title ?? '';
  const saAmount = saParts?.[2] ?? null;
  // The delinquent script owes two months; the statement row carries one.
  const heroAmount = heroDues ? (demo && delinquent ? '$570' : heroDues.amountLabel) : null;
  const openMoney = () => {
    if (heroAssessment) return demo ? set({ saSheetOpen: true }) : set({ myPlaceOpen: true });
    return demo ? set({ paySheetOpen: true }) : set({ myPlaceOpen: true });
  };

  // "Needs you" counter — data-driven off the repo domains (empty for a fresh
  // member). Dues + ARC are owner tasks; the open vote is owner/manager.
  const ownerTasks = isOwner ? (dues.current ? 1 : 0) + (arc.unseenApproval ? 1 : 0) : 0;
  const n = (showVoteCardRole ? 1 : 0) + ownerTasks;
  const attnSummary =
    n === 0
      ? 'All caught up — enjoy the sunshine.'
      : n === 1
        ? 'One thing needs you.'
        : n + ' things need you.';
  const quorumPct = vote?.quorumPct ?? 0;
  /*
   * The closing date comes off the ballot, never a literal. closesLabel reads
   * 'Open vote · closes Thu, Jul 3'; the row only wants the closing clause,
   * and a ballot with no deadline simply doesn't get one.
   */
  const voteCloses = (() => {
    const clause = vote?.closesLabel?.split('·').pop()?.trim();
    if (!clause) return null;
    return clause.charAt(0).toUpperCase() + clause.slice(1);
  })();
  const showAllClear = n === 0;
  const showAlert = state.showAlert && !state.alertDismissed;
  const showNudge = !state.nudgeDismissed;

  const notifBadge = state.notifsRead
    ? 0
    : NOTIFS.filter((nt) => nt.unread && !state.mutedCats[nt.cat]).length;
  const hasNotifBadge = notifBadge > 0;

  const rsvpFood = state.rsvpFood;
  // Live counts include this member's RSVP in `going` (trigger-maintained);
  // the demo adds the scripted flag on top.
  const tacoGoing = demo ? (featuredEvent?.going ?? 0) + (rsvpFood ? 1 : 0) : rsvp.count;
  const tacoRsvpd = demo ? rsvpFood : rsvp.going;
  const toggleRsvp = () => (demo ? set({ rsvpFood: !state.rsvpFood }) : rsvp.toggle());

  const hasBooking = reservation.booked && !!reservation.summary;

  const payCardTitle = dues.cardTitle;
  const payCardSub = dues.cardSub;
  const payCardBtn = dues.cardBtn;

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfOpen = PORTFOLIO.reduce((a, c) => a + c.open, 0);

  const dateLabel = demo
    ? 'Tuesday, July 1'
    : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      className="pav-tabscroll absolute inset-0 overflow-y-auto pav-scroll"
      style={{ padding: 'calc(64px + var(--pav-chrome-top)) 20px var(--pav-screen-bottom)' }}
    >
      {showAlert && (
        <div className="rounded-2xl px-3.5 py-3 flex gap-2.5 items-start mb-[18px] text-white" style={{ background: 'rgb(var(--red))' }}>
          <PhIcon name="ph-fill ph-warning" size={17} className="mt-px flex-shrink-0" />
          <div className="flex-1">
            <p className="m-0 mb-px text-[13px] font-bold">Water shutoff — Alder Way</p>
            <p className="m-0 text-[12px] font-semibold" style={{ color: 'rgb(var(--white) / 0.85)' }}>
              Today 1–4 PM · hydrant repair · bottled water at the clubhouse
            </p>
          </div>
          <button
            onClick={() => set({ alertDismissed: true })}
            aria-label="Dismiss alert"
            className="border-none bg-transparent cursor-pointer w-11 h-11 -my-2 -mr-2 flex items-center justify-center flex-shrink-0"
          >
            <PhIcon name="ph-bold ph-x" size={14} color="rgb(var(--white) / 0.85)" />
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-1">
        {/* 28px, one step under the display tier, so the money line below
            can lead the screen instead of the greeting. */}
        <h1 className="m-0 font-serif font-normal text-[28px] text-navy leading-[1.15]" style={{ letterSpacing: '-0.01em' }}>
          {(() => {
            // The demo is scripted to Tuesday, July 1 in the morning; live
            // greets by actual time of day.
            const h = new Date().getHours();
            const word = demo ? 'Morning' : h < 5 ? 'Up late' : h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
            return firstName ? `${word}, ${firstName}.` : `${word}.`;
          })()}
        </h1>
        <div className="flex items-center gap-0.5 flex-shrink-0 -mt-1">
          <button
            onClick={() => set({ searchOpen: true, searchQ: '' })}
            title="Search"
            aria-label="Search"
            className="w-11 h-11 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={17} color="rgb(var(--skydeep))" />
          </button>
          <button
            onClick={() => set({ notifOpen: true })}
            title="Notifications"
            aria-label={hasNotifBadge ? `Notifications — ${notifBadge} unread` : 'Notifications'}
            className="relative w-11 h-11 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <PhIcon name="ph ph-bell" size={18} color="rgb(var(--skydeep))" />
            {hasNotifBadge && (
              <span
                className="absolute top-2 right-2 w-2 h-2 rounded-full"
                style={{ background: 'rgb(var(--sunset))', border: '2px solid rgb(var(--mist))' }}
              />
            )}
          </button>
          <button
            onClick={() => set({ myPlaceOpen: true })}
            title="My Place"
            aria-label="My Place — profile and settings"
            className="w-11 h-11 rounded-full border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <span className="w-[34px] h-[34px] rounded-full bg-skydeep flex items-center justify-center text-mist font-extrabold text-[13px]">
              {member?.initial ?? ''}
            </span>
          </button>
        </div>
      </div>
      <p className="m-0 mb-4 text-[13px] font-semibold text-slate">
        {member?.communityName ? `${dateLabel} · ${member.communityName}` : dateLabel}
      </p>

      {/* The money hero: the screen's one warm surface. */}
      {(heroAssessment || heroDues) && (
        <StackedPanel tint="sunset" className="mb-3.5 animate-fadeup">
          <p className="m-0 font-serif text-[17px] leading-[1.25] text-navy">
            {heroAssessment ? saName : payCardTitle}
          </p>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            {(heroDues || saAmount) && (
              <p className="m-0 font-serif text-[24px] leading-[1.15] text-navy" style={{ letterSpacing: '-0.02em' }}>
                {heroAssessment ? saAmount : heroAmount}
              </p>
            )}
            {heroDues && <Pill label={heroDues.statusLabel} tone={DUES_TONE[heroDues.status]} size="md" />}
            {heroAssessment && <Pill label="One-time" tone="info" size="md" />}
          </div>
          <p className="m-0 mt-1.5 text-[13px] font-semibold text-ink leading-[1.45]">
            {heroAssessment ? heroAssessment.sub : payCardSub}
          </p>
          <button
            type="button"
            onClick={openMoney}
            className="mt-3.5 w-full border-none rounded-xl min-h-[44px] px-4 text-[14px] font-extrabold cursor-pointer font-sans text-white"
            style={{ background: 'rgb(var(--skydeep))' }}
          >
            {heroAssessment ? (demo ? 'Review & pay' : 'See the details') : demo ? payCardBtn : 'See your statement'}
          </button>
        </StackedPanel>
      )}

      {/* Board desk door. It already existed inside My Place, three taps deep
          behind a 34px avatar — which meant a first-time board member had no
          way to learn their tools exist. Chrome, not warm: it is a standing
          door, not the one action of the day (The Porch Light Rule). */}
      {isBoardMember && (
        <button
          type="button"
          onClick={() => set({ boardMode: true })}
          className="w-full border-none font-sans text-left bg-skydeep rounded-[16px] flex items-center gap-3 cursor-pointer mb-3.5 min-h-[44px]"
          style={{ padding: '13px 15px' }}
        >
          <PhIcon name="ph-fill ph-shield-star" size={19} color="rgb(var(--peach))" className="flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13.5px] font-bold text-mist">Board desk</p>
            <p className="m-0 text-[12px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.92)' }}>
              Requests, compliance, money, and the roster
            </p>
          </div>
          <PhIcon name="ph-bold ph-caret-right" size={13} color="rgb(var(--mist) / 0.92)" className="flex-shrink-0" />
        </button>
      )}

      {/* Board activation — above "Needs you" because on a fresh community
          there is nothing in "Needs you" yet, and this is the only thing
          anyone can actually do. Renders itself null once setup is done. */}
      <BoardSetupCard />

      {/* Needs you: raised, because it asks for a decision. One card, one list. */}
      <Card elevation="raised" padding="none" className="px-[18px] pt-4 pb-1.5 animate-fadeup" style={{ animationDelay: '40ms' }}>
        <SectionHeading title="Needs you" meta={attnSummary} className="mb-0.5" />

        {isManager && (
          <button type="button" onClick={() => set({ portfolioOpen: true, myPlaceOpen: false })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-buildings" tone="sky" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Your portfolio</p>
              <p className={ROW_SUB}>3 communities · {pfDoors} doors · {pfOpen} open items</p>
            </div>
            {CARET}
          </button>
        )}

        {isTenant && (
          <button type="button" onClick={() => set({ myPlaceOpen: true })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-house-line" tone="sky" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Your lease &amp; amenities</p>
              <p className={ROW_SUB}>Rent goes to your landlord — Pavilion handles the rest</p>
            </div>
            {CARET}
          </button>
        )}

        {showVoteCardRole && (
          <button type="button" onClick={() => set({ tab: 'hoa' })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-check-square" tone="sky" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>{vote?.title ?? 'Open vote'}</p>
              <p className={ROW_SUB}>{voteCloses ? voteCloses + ' · ' : ''}quorum at {quorumPct}%</p>
            </div>
            {CARET}
          </button>
        )}

        {/* Dues keep a row only when an assessment took the hero. Live goes
            to My Place, where the real statement lives; the HOA tab's dues
            card is demo-only. */}
        {duesStaysRow && (
          <button type="button" onClick={() => (demo ? set({ paySheetOpen: true }) : set({ myPlaceOpen: true }))} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-receipt" tone="gold" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>{payCardTitle}</p>
              <p className={ROW_SUB}>{payCardSub}</p>
            </div>
            <Pill label={demo ? payCardBtn : 'View'} tone="info" size="md" />
          </button>
        )}

        {violPendingCard && (
          <button type="button" onClick={() => set({ violSheetOpen: true })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-warning" tone="gold" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>{violation?.title}</p>
              <p className={ROW_SUB}>{violation?.sub}</p>
            </div>
            {CARET}
          </button>
        )}

        {violFixedCard && (
          <div className="flex items-center gap-[13px] animate-fadeup" style={ROW_PAD}>
            <Disc icon="ph-fill ph-check-circle" tone="mint" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>Notice marked fixed — thank you</p>
              <p className={ROW_SUB}>Closes after the board&apos;s next walk-through</p>
            </div>
          </div>
        )}

        {showArcCardRole && (
          <button type="button" onClick={() => set({ arcSeen: true, tab: 'hoa' })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-seal-check" tone="mint" />
            <div className="flex-1 min-w-0">
              <p className={ROW_TITLE}>{arc.unseenApproval?.title}</p>
              <p className={ROW_SUB}>{arc.unseenApproval?.sub}</p>
            </div>
            {CARET}
          </button>
        )}

        {showAllClear && (
          <div className="flex items-center gap-[13px] animate-fadeup" style={{ padding: '12px 0 14px' }}>
            <Disc icon="ph-fill ph-check-circle" tone="mint" />
            <p className="m-0 text-[13.5px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
              All caught up — nothing needs you today.
            </p>
          </div>
        )}
      </Card>

      {/* AI nudge: one quiet line (scripted — demo only) */}
      {demo && showNudge && hasNeighborhood && (
        <div className="flex gap-[9px] items-start" style={{ padding: '14px 6px 0' }}>
          <PhIcon name="ph-fill ph-sparkle" size={13} color="rgb(var(--accent))" className="mt-[3px] flex-shrink-0" />
          <p className="m-0 flex-1 text-xs leading-[1.5] font-semibold text-slate">
            AI: fireworks aren&apos;t allowed in the Ridge (§5.9) — the east lot has the best view of Saturday&apos;s
            city show.
          </p>
          <button
            onClick={() => set({ nudgeDismissed: true })}
            aria-label="Dismiss"
            className="border-none bg-transparent cursor-pointer flex-shrink-0 w-11 h-11 -my-3 -mr-2 flex items-center justify-center rounded-full"
          >
            <PhIcon name="ph-bold ph-x" size={12} color="rgb(var(--slatefaint))" />
          </button>
        </div>
      )}

      {/* Around the neighborhood — ambient content; hidden for an empty community */}
      {hasNeighborhood && (
      <div className="animate-fadeup" style={{ animationDelay: '80ms' }}>
      <SectionHeading
        level="subtitle"
        title="Around the neighborhood"
        className="mt-7 mb-3"
        action={
          <button
            onClick={() => set({ eventsOpen: true })}
            className="border-none bg-transparent text-[13px] font-bold cursor-pointer px-2 min-h-[44px] -my-2.5 -mr-2 text-skydeep font-sans"
          >
            Calendar
          </button>
        }
      />

      {/*
       * Featured event hero with the ambient list tucked under it. The hero is
       * conditional and the list is always on, so a community with no events
       * renders the list alone — StackedCards drops the falsy child.
       */}
      <StackedCards overlap={22}>
        {showFeatured && (
        <StackedPanel tint="skydeep" className="!pt-4 text-mist">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 mb-[3px] text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
              {featuredEvent?.whenLabel}
            </p>
            <p className="m-0 mb-[3px] font-serif text-[19px] leading-[1.2]">{featuredEvent?.title}</p>
            <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              {tacoGoing} neighbors going
            </p>
          </div>
          {tacoRsvpd ? (
            <button
              onClick={toggleRsvp}
              aria-pressed="true"
              aria-busy={rsvp.busy || undefined}
              className="border-none bg-white text-sagedark rounded-full px-4 min-h-[44px] text-[13px] font-extrabold cursor-pointer flex-shrink-0 flex items-center gap-1.5 font-sans"
            >
              <PhIcon name="ph-fill ph-check" size={14} />
              Going
            </button>
          ) : (
            <button
              onClick={toggleRsvp}
              aria-pressed="false"
              aria-busy={rsvp.busy || undefined}
              className="border-none bg-white text-skydeep rounded-full px-4 min-h-[44px] text-[13px] font-extrabold cursor-pointer flex-shrink-0 font-sans"
            >
              I&apos;m in
            </button>
          )}
        </div>
        </StackedPanel>
        )}

        {/* Quiet neighborhood list — flat, always on: booking + map are real surfaces */}
        <Card padding="none" className={`px-[18px] pb-1 ${showFeatured ? 'pt-[24px]' : 'pt-1'}`}>
        {hasBooking ? (
          <button type="button" onClick={() => set({ tab: 'reserve' })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-calendar-check" tone="mint" />
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">Reserved: {reservation.summary}</p>
            {CARET}
          </button>
        ) : (
          <button type="button" onClick={() => set({ tab: 'reserve' })} className={ROW} style={ROW_PAD}>
            <Disc icon="ph-fill ph-swimming-pool" tone="sky" />
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
              {demo ? 'Pool cabana open today · 4 slots left' : 'Reserve an amenity'}
            </p>
            {CARET}
          </button>
        )}

        <button type="button" onClick={() => set({ mapOpen: true })} className={ROW} style={ROW_PAD}>
          <Disc icon="ph-fill ph-map-trifold" tone="sky" />
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            {demo ? 'Neighborhood map · 5 pins today' : 'Neighborhood map'}
          </p>
          {CARET}
        </button>

        <button type="button" onClick={() => set({ reportOpen: true })} className={ROW} style={ROW_PAD}>
          <Disc icon="ph-fill ph-shield-check" tone="gold" />
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">See a problem? Report it privately</p>
          {CARET}
        </button>

        {demo && (
        <div className="flex items-center gap-[13px]" style={ROW_PAD}>
          <Disc icon="ph-fill ph-hand-waving" tone="mint" />
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">The Okafors moved into #42</p>
          <button
            onClick={() => set({ chatWith: 'okafor' })}
            className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer flex-shrink-0 font-sans px-2 min-h-[44px] -my-2"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Say hi
          </button>
        </div>
        )}
        </Card>
      </StackedCards>
      </div>
      )}
    </div>
  );
}
