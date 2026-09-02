import { useState, type ReactNode } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { SectionHeading } from '../components/SectionHeading';
import { Toggle } from '../components/Toggle';
import { usePavStore, dataDefaults } from '../store/store';
import { useArc, useAssessment, useDues, useLoadState, useMember, useMyReports, usePortfolio, useReservation, useGroups, useRepository, useMemberships, useActiveCommunityId, resetDemoData } from '../data/repo';
import type { DuesStatement, ThreadComment } from '../data/repo';
import { DUES_TONE } from '../lib/dues';
import { isLiveMode, signOutLive } from '../auth/AuthGate';

const DIVIDER = { paddingBottom: 10, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 10 } as const;

function Row({ children, divider, onClick }: { children: ReactNode; divider?: boolean; onClick?: () => void }) {
  const style = divider ? DIVIDER : undefined;
  // Interactive rows render as real buttons so they take keyboard focus;
  // static rows stay divs rather than becoming unfocusable buttons.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-2.5 cursor-pointer border-none bg-transparent text-left font-sans min-h-[44px]"
        style={style}
      >
        {children}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2.5 min-h-[44px]" style={style}>
      {children}
    </div>
  );
}

/*
 * Icon well — a 34px tinted bed with the tint's text-bearing twin as the
 * glyph. Settings and Payments rows carried bare 17px glyphs; the well gives
 * each row a shape the eye can land on before it reads.
 */
const WELL = {
  sky: { bed: 'rgb(var(--skypale))', ink: 'rgb(var(--skydeep))' },
  mint: { bed: 'rgb(var(--mint))', ink: 'rgb(var(--sagedark))' },
  gold: { bed: 'rgb(var(--goldpale))', ink: 'rgb(var(--golddark))' },
  neutral: { bed: 'rgb(var(--skyborder))', ink: 'rgb(var(--slatedark))' },
} as const;
function Well({ icon, tone = 'sky', size = 34 }: { icon: string; tone?: keyof typeof WELL; size?: number }) {
  return (
    <span
      className="rounded-[10px] flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, background: WELL[tone].bed }}
      aria-hidden="true"
    >
      <PhIcon name={icon} size={Math.round(size / 2)} color={WELL[tone].ink} />
    </span>
  );
}

/** My Place profile screen — ported from prototype lines 1551-1769. */
export function MyPlace() {
  const state = usePavStore();
  const memberships = useMemberships();
  const activeCommunityId = useActiveCommunityId();
  const { set } = state;
  const PORTFOLIO = usePortfolio();
  const reservation = useReservation();
  const groups = useGroups();
  const member = useMember();
  const dues = useDues();
  const duesLoad = useLoadState('dues');
  const assessment = useAssessment();
  const arc = useArc();
  const myReports = useMyReports();

  const [apConfirm, setApConfirm] = useState(false);
  const repo = useRepository();
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [pfName, setPfName] = useState('');
  const [pfPhone, setPfPhone] = useState('');
  const [pfHide, setPfHide] = useState(false);
  const [pfBusy, setPfBusy] = useState(false);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [reportThread, setReportThread] = useState<ThreadComment[]>([]);
  const [reportReply, setReportReply] = useState('');
  const [openArcId, setOpenArcId] = useState<string | null>(null);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  if (!state.myPlaceOpen) return null;

  const demo = repo.isDemo();
  const isOwner = state.role === 'owner';
  const isManager = state.role === 'manager';
  const isTenant = state.role === 'tenant';

  // Live mode: identity comes from the signed-in member's profile + membership.
  // Demo mode: keep the scripted owner/tenant/manager scenario labels.
  const liveRoleLabel = [
    member?.unitLabel,
    member?.role === 'board' ? 'Board member' : 'Resident',
  ].filter(Boolean).join(' · ');
  const roleLabel = isLiveMode
    ? liveRoleLabel
    : isTenant
      ? 'Renter · #27 Alder Way'
      : isManager
        ? 'Property manager · Cedar Hill Mgmt'
        : '#27 Alder Way · Owner · here since 2021';
  const displayName = member?.name ?? 'Alex Rivera';
  const displayInitial = member?.initial ?? 'A';
  const canSwitch = memberships.length > 1;

  const switchTo = (communityId: string) => {
    if (switchingTo || communityId === activeCommunityId) return;
    setSwitchingTo(communityId);
    void repo.switchCommunity(communityId)
      .then(() => setSwitcherOpen(false))
      .catch(reportedByDataLayer)
      .finally(() => setSwitchingTo(null));
  };

  /*
   * The dues hero. `current` is the statement the member can still act on;
   * with none, the latest statement in history is what the panel reports
   * (paid, in plan — whatever its real label says). Nothing here is a
   * literal: the amount, period and status all come off the statement.
   */
  const heroStatement = dues.current ?? dues.history[0] ?? null;
  const paidCount = dues.history.filter((d) => d.status === 'paid').length;
  const paidPct = dues.history.length ? Math.round((paidCount / dues.history.length) * 100) : 0;
  const showAssessment = !!assessment && !assessment.paid;

  const myBookings = reservation.booked && reservation.summary ? '1 upcoming' : 'None yet';
  const myCirclesCount = Object.values(groups).filter((g) => !g.isGroupChat && g.joined).length;

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfCollected = pfDoors
    ? Math.round(PORTFOLIO.reduce((a, c) => a + c.collected * c.doors, 0) / pfDoors)
    : 0;

  const reportTypeLabel = state.reportType || 'Issue';
  const hasReportRows = isLiveMode ? myReports.length > 0 : state.reportSubmitted;
  const requestCount = arc.requests.length + (isLiveMode ? myReports.length : state.reportSubmitted ? 1 : 0);

  // Payments card (owner only)
  const mpApLabel = state.apPaused ? 'Autopay paused' : 'Autopay · the 3rd';

  const payRow = (d: DuesStatement, last: boolean, idx: number) => {
    const style = last ? undefined : DIVIDER;
    const body = (
      <>
        <span className="flex-1 text-[13px] font-bold text-navy min-w-0">{demo ? `${d.period} 2026` : d.period}</span>
        <span className="text-[13px] font-bold text-slatedark tabular-nums">{d.amountLabel}</span>
        <Pill label={d.statusLabel} tone={DUES_TONE[d.status]} size="md" />
      </>
    );
    // Only demo rows open a payment detail; live rows are static text.
    return !isLiveMode ? (
      <button
        key={d.id}
        type="button"
        onClick={() => set({ paymentDetailIdx: idx })}
        className="w-full flex items-center gap-2.5 cursor-pointer border-none bg-transparent text-left font-sans min-h-[44px]"
        style={style}
      >
        {body}
      </button>
    ) : (
      <div key={d.id} className="flex items-center gap-2.5 min-h-[44px]" style={style}>
        {body}
      </div>
    );
  };

  const saveDisabled = !pfName.trim() || pfBusy;

  return (
    <div
      data-screen-label="My Place"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ myPlaceOpen: false })} className="mb-4" />

      <div className="flex items-center gap-3.5 mb-4">
        <div className="w-[58px] h-[58px] rounded-full bg-skydeep flex items-center justify-center text-mist font-extrabold text-[19px] flex-shrink-0">
          {displayInitial}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="m-0 mb-0.5 font-serif font-normal text-2xl text-navy">{displayName}</h1>
          <p className="m-0 text-[12.5px] font-bold text-slate">
            {[member?.communityName, roleLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
        {canSwitch && (
          <button
            type="button"
            onClick={() => setSwitcherOpen((o) => !o)}
            aria-expanded={switcherOpen}
            aria-busy={switchingTo ? true : undefined}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 min-h-[44px] text-[12.5px] font-extrabold cursor-pointer font-sans bg-paper text-navy"
            style={{ border: '1px solid rgb(var(--navy) / 0.15)' }}
          >
            <PhIcon name="ph-fill ph-house-line" size={14} color="rgb(var(--skydeep))" />
            {switchingTo ? 'Switching…' : 'Switch'}
          </button>
        )}
      </div>

      {canSwitch && switcherOpen && (
        <Card padding="sm" className="mb-3 animate-fadeup">
          <SectionHeading title="Your communities" meta={switchingTo ? 'Loading that community…' : `${memberships.length} memberships`} className="px-1 pt-1" />
          {memberships.map((m, i) => {
            const active = m.communityId === activeCommunityId;
            const busy = switchingTo === m.communityId;
            return (
              <button
                key={m.communityId}
                type="button"
                onClick={() => switchTo(m.communityId)}
                aria-pressed={active}
                aria-busy={busy || undefined}
                disabled={!!switchingTo}
                className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 px-1 min-h-[44px] cursor-pointer disabled:cursor-wait"
                style={i < memberships.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.06)' } : undefined}
              >
                <PhIcon name={active ? 'ph-fill ph-check-circle' : busy ? 'ph-fill ph-hourglass' : 'ph ph-circle'} size={18} color={active ? 'rgb(var(--sage))' : 'rgb(var(--slatelight))'} />
                <span className="flex-1 text-[13px] font-bold text-navy min-w-0">
                  {m.communityName}
                  <span className="font-semibold text-slate"> · {m.role === 'board' ? 'Board' : 'Resident'}{m.unitLabel ? ` · ${m.unitLabel}` : ''}</span>
                </span>
                {active && <Pill label="Showing" tone="success" size="md" />}
              </button>
            );
          })}
        </Card>
      )}

      {/*
       * The money leads. Owners open My Place for one number; it used to be
       * a 12.5px string in a one-third tile. Raised, because it asks for a
       * decision; the amount takes the display tier (one per screen).
       */}
      {isOwner && (
        heroStatement ? (
          <Card elevation="raised" padding="lg" className="mb-3">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="m-0 font-serif text-[36px] leading-[1.05] text-navy" style={{ letterSpacing: '-0.02em' }}>
                  {heroStatement.amountLabel}
                </p>
                <p className="m-0 mt-1.5 text-[13.5px] font-bold text-slatedark">
                  {dues.current ? `${heroStatement.period} dues` : `Latest statement · ${heroStatement.period}`}
                </p>
              </div>
              <div className="flex-shrink-0 pb-1">
                <Pill label={heroStatement.statusLabel} tone={DUES_TONE[heroStatement.status]} size="md" />
              </div>
            </div>

            {/* Demo: the brand's dues progress bar — share of this year's statements settled. */}
            {demo && dues.history.length > 0 && (
              <div className="mt-3.5">
                <ProgressBar pct={paidPct} height={8} gradient />
                <p className="m-0 mt-1.5 text-[12.5px] font-semibold text-slate">
                  {paidCount} of {dues.history.length} statements paid this year
                </p>
              </div>
            )}

            {demo && dues.current && (
              <div className="flex gap-2 mt-3.5">
                <button
                  type="button"
                  onClick={() => set({ paySheetOpen: true })}
                  className="flex-1 border-none rounded-xl min-h-[44px] px-4 text-[14px] font-extrabold cursor-pointer font-sans text-white"
                  style={{ background: 'rgb(var(--skydeep))' }}
                >
                  {dues.cardBtn || 'Review & pay'}
                </button>
                <button
                  type="button"
                  onClick={() => set({ paymentDetailIdx: 0 })}
                  className="flex-1 bg-transparent rounded-xl min-h-[44px] px-3 text-[13.5px] font-extrabold cursor-pointer font-sans text-navy"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  Where it goes
                </button>
              </div>
            )}

            {/* An open special assessment, from the same unit's real row. */}
            {showAssessment && (
              <button
                type="button"
                onClick={() => (demo ? set({ saSheetOpen: true }) : undefined)}
                disabled={!demo}
                className="w-full flex items-center gap-2.5 mt-3.5 pt-3.5 border-0 border-t border-solid bg-transparent text-left font-sans min-h-[44px] cursor-pointer disabled:cursor-default"
                style={{ borderTopColor: 'rgb(var(--navy) / 0.08)' }}
              >
                <Well icon="ph-fill ph-receipt" tone="gold" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13px] font-bold text-navy">{assessment?.title}</span>
                  <span className="block text-[12px] font-semibold text-slate">{assessment?.sub}</span>
                </span>
                <Pill label="One-time" tone="warning" size="md" />
              </button>
            )}
          </Card>
        ) : (
          <div className="mb-3">
            <EmptyState
              icon="ph ph-receipt"
              title="No statements yet"
              body="Your board hasn't issued one. When they do, your dues and payment history land here."
              status={duesLoad}
            />
          </div>
        )
      )}

      {/* Board desk entry — live gates on the real membership role. The one
          saturated card on the screen, directly under the money. */}
      {(isLiveMode ? member?.role === 'board' : isOwner) && (
        <button type="button"
          onClick={() => set({ boardMode: true, myPlaceOpen: false })}
          className="w-full border-none font-sans text-left bg-skydeep rounded-[18px] flex items-center gap-[13px] cursor-pointer mb-3"
          style={{ padding: '15px 16px' }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgb(var(--mist) / 0.12)' }}
          >
            <PhIcon name="ph-fill ph-shield-star" size={22} color="rgb(var(--peach))" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="m-0 text-[14.5px] font-bold text-mist">Board desk</p>
              <Pill label="Board" tone="chrome" />
            </div>
            <p className="mt-px mb-0 text-xs font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              Triage, collections, votes &amp; broadcasts
            </p>
          </div>
          <PhIcon name="ph-bold ph-caret-right" size={15} color="rgb(var(--peach))" className="flex-shrink-0" />
        </button>
      )}

      {/* Manager: portfolio entry */}
      {isManager && (
        <button type="button"
          onClick={() => set({ portfolioOpen: true, myPlaceOpen: false })}
          className="w-full border-none font-sans text-left bg-skydeep rounded-[18px] flex items-center gap-[13px] cursor-pointer mb-3"
          style={{ padding: '15px 16px' }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgb(var(--mist) / 0.12)' }}
          >
            <PhIcon name="ph-fill ph-buildings" size={22} color="rgb(var(--peach))" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14.5px] font-bold text-mist">Portfolio</p>
            <p className="mt-px mb-0 text-xs font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              3 communities · {pfDoors} doors · {pfCollected}% collected
            </p>
          </div>
          <PhIcon name="ph-bold ph-caret-right" size={15} color="rgb(var(--peach))" className="flex-shrink-0" />
        </button>
      )}

      {/* Tenant: lease + registration */}
      {isTenant && (
        <>
          <Card className="mb-3">
            <SectionHeading title="Your lease" action={<Pill label="Active" tone="info" size="md" />} />
            <div className="flex items-center gap-[11px]" style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}>
              <Well icon="ph-fill ph-calendar-blank" tone="neutral" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">12-month term · renews Mar 1, 2027</p>
                <p className="m-0 text-[12px] font-semibold text-slate">
                  $2,400/mo · paid to owner, not the HOA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[11px]">
              <Well icon="ph-fill ph-user" tone="neutral" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">Owner: Dana Okafor · #27</p>
                <p className="m-0 text-[12px] font-semibold text-slate">
                  Handles ARC requests &amp; dues
                </p>
              </div>
            </div>
          </Card>
          <Card elevation="raised" className="mb-3">
            <div className="flex items-start gap-[11px]">
              <Well icon="ph-fill ph-identification-card" tone="gold" />
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">Tenant registration</p>
                <p className="m-0 mb-2.5 text-[12px] font-semibold text-slate">
                  CC&amp;Rs §7.4 asks tenants to register with the office within 14 days.
                </p>
                {!state.tenantRegistered ? (
                  <button
                    type="button"
                    onClick={() => set({ tenantRegistered: true })}
                    className="border-none bg-skydeep text-mist rounded-[11px] text-[13px] font-extrabold cursor-pointer font-sans min-h-[44px] px-4"
                  >
                    Register now
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-sagedark">
                    <PhIcon name="ph-fill ph-check-circle" size={15} />
                    Registered with the office
                  </span>
                )}
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Quick doors to the two things that used to sit in the stat tiles. */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <Card padding="sm" onClick={() => set({ myPlaceOpen: false, tab: 'reserve' })}>
          <div className="flex items-center gap-2.5">
            <Well icon="ph-fill ph-calendar-check" tone="mint" />
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-bold text-navy">Bookings</p>
              <p className="m-0 text-[12px] font-semibold text-slate">{myBookings}</p>
            </div>
          </div>
        </Card>
        <Card padding="sm" onClick={() => set({ myPlaceOpen: false, tab: 'commons', commonsView: 'circles' })}>
          <div className="flex items-center gap-2.5">
            <Well icon="ph-fill ph-users-three" tone="sky" />
            <div className="min-w-0">
              <p className="m-0 text-[13px] font-bold text-navy">Groups</p>
              <p className="m-0 text-[12px] font-semibold text-slate">{myCirclesCount} joined</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payments (owner only) — above household for easy access */}
      {isOwner && (
        <Card className="mb-3">
          <SectionHeading title="Payments" meta={dues.history.length ? `${dues.history.length} statements` : undefined} />
          {!isLiveMode && (
          <div className="flex items-center gap-2.5 min-h-[44px]" style={DIVIDER}>
            <Well icon="ph-fill ph-arrows-clockwise" />
            <div className="flex-1 min-w-0">
              <p className="m-0 text-[13px] font-bold text-navy">{mpApLabel}</p>
              <p className="m-0 text-[12px] font-semibold text-slate">
                Juniper CU ····4821 · free ACH · change bank or date anytime
              </p>
            </div>
            {apConfirm ? (
              <div className="flex gap-1.5 animate-fadeup">
                <button
                  onClick={() => { set({ apPaused: !state.apPaused }); setApConfirm(false); }}
                  className="border-none rounded-full px-3 min-h-[36px] text-[12px] font-extrabold cursor-pointer font-sans"
                  style={{ background: state.apPaused ? 'rgb(var(--mint))' : 'rgb(var(--accenttint))', color: state.apPaused ? 'rgb(var(--sagedark))' : 'rgb(var(--accent))' }}
                >
                  {state.apPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setApConfirm(false)}
                  className="border-none bg-transparent text-[12px] font-extrabold cursor-pointer text-slate font-sans px-2 min-h-[36px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Toggle on={!state.apPaused} onToggle={() => setApConfirm(true)} label="Autopay" />
            )}
          </div>
          )}
          {dues.history.length === 0 ? (
            <p className="m-0 py-2 text-[12.5px] font-semibold text-slate">
              {isLiveMode ? 'Nothing paid through Pavilion yet.' : 'No payments yet.'}
            </p>
          ) : (
            dues.history.map((d, i) => payRow(d, i === dues.history.length - 1, i))
          )}
        </Card>
      )}

      {/* Household (demo-only until a household domain exists) */}
      {!isLiveMode && (
      <Card className="mb-3">
        <SectionHeading
          title="Household"
          action={!state.memberAdded && (
            <button
              type="button"
              onClick={() => set({ memberAdded: true })}
              className="inline-flex items-center gap-[5px] bg-transparent rounded-full text-[12px] font-extrabold text-navy cursor-pointer font-sans px-3 min-h-[36px]"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Add member
            </button>
          )}
        />
        <div className="flex items-center gap-[11px] min-h-[44px]" style={DIVIDER}>
          <div className="w-[34px] h-[34px] rounded-full bg-skydeep flex items-center justify-center text-mist font-extrabold text-[13px]">A</div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            You{' '}
            <span className="font-semibold text-slate">
              · Owner
            </span>
          </p>
          <Pill label="Admin" tone="neutral" size="md" />
        </div>
        <div className="flex items-center gap-[11px] min-h-[44px]">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-extrabold text-[13px]"
            style={{ background: 'rgb(var(--accent))' }}
          >
            S
          </div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            Sam R.{' '}
            <span className="font-semibold text-slate">
              · Partner
            </span>
          </p>
          <Pill label="Member" tone="neutral" size="md" />
        </div>
        {state.memberAdded && (
          <div
            className="flex items-center gap-[11px] animate-fadeup min-h-[44px]"
            style={{ paddingTop: 11, borderTop: '1px solid rgb(var(--navy) / 0.06)', marginTop: 11 }}
          >
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgb(var(--skyborder))', border: '1.5px dashed rgb(var(--navy) / 0.25)', color: 'rgb(var(--slate))' }}
            >
              <PhIcon name="ph-bold ph-envelope-simple" size={14} />
            </div>
            <p className="m-0 flex-1 text-[13px] font-bold text-slate">
              Invite sent — they&apos;ll join once they accept
            </p>
          </div>
        )}
      </Card>
      )}

      {/* Vehicles & pets (demo-only until a registry domain exists) */}
      {!isLiveMode && (
      <Card className="mb-3">
        <SectionHeading title="Vehicles & pets" meta="On file for guest passes, gate logs & the pet registry." />
        <div className="flex items-center gap-[11px] min-h-[44px]" style={DIVIDER}>
          <Well icon="ph-fill ph-car" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Subaru Outback · Slate</p>
            <p className="m-0 text-[12px] font-semibold text-slate">
              Plate 8XR-4471 · resident decal #204
            </p>
          </div>
        </div>
        <div className="flex items-center gap-[11px] min-h-[44px]" style={{ ...DIVIDER, paddingBottom: 12, marginBottom: 12 }}>
          <Well icon="ph-fill ph-dog" tone="gold" />
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Biscuit · Golden mix</p>
            <p className="m-0 text-[12px] font-semibold text-slate">
              Registered · licensed &amp; up to date
            </p>
          </div>
        </div>
        {(state.vehicleAdded || state.petAdded) && (
          <div className="flex flex-col gap-2 mb-2">
            {state.vehicleAdded && (
              <div className="flex items-center gap-2.5 animate-fadeup">
                <PhIcon name="ph-fill ph-check-circle" size={16} color="rgb(var(--sage))" />
                <span className="text-[13px] font-bold text-navy">Honda Civic · Silver · ABC-1234</span>
              </div>
            )}
            {state.petAdded && (
              <div className="flex items-center gap-2.5 animate-fadeup">
                <PhIcon name="ph-fill ph-check-circle" size={16} color="rgb(var(--sage))" />
                <span className="text-[13px] font-bold text-navy">Luna · Tabby cat</span>
              </div>
            )}
          </div>
        )}
        <div className="flex gap-2">
          {!state.vehicleAdded && (
            <button
              type="button"
              onClick={() => set({ vehicleAdded: true })}
              className="flex-1 bg-transparent rounded-[11px] min-h-[44px] text-[12.5px] font-extrabold text-navy cursor-pointer font-sans flex items-center justify-center gap-[5px]"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Vehicle
            </button>
          )}
          {!state.petAdded && (
            <button
              type="button"
              onClick={() => set({ petAdded: true })}
              className="flex-1 bg-transparent rounded-[11px] min-h-[44px] text-[12.5px] font-extrabold text-navy cursor-pointer font-sans flex items-center justify-center gap-[5px]"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Pet
            </button>
          )}
        </div>
      </Card>
      )}

      {/* My requests */}
      <Card className="mb-3">
        <SectionHeading title="My requests" meta={requestCount > 0 ? `${requestCount} open or recent` : undefined} />
        {!isLiveMode && state.reportSubmitted && (
          <Row divider>
            <Well icon="ph-fill ph-wrench" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">{reportTypeLabel} report · #M-89</p>
            <Pill label="In triage" tone="info" size="md" />
          </Row>
        )}
        {isLiveMode && myReports.map((r) => (
          <div key={r.id}>
            <Row divider onClick={() => {
              const next = openReportId === r.id ? null : r.id;
              setOpenReportId(next);
              setReportThread([]);
              if (next) void repo.listReportComments(r.id).then(setReportThread);
            }}>
              <Well icon="ph-fill ph-wrench" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy min-w-0">{r.title}{r.ref ? ` · ${r.ref}` : ''}</p>
              {r.status === 'resolved'
                ? <Pill label="Resolved" tone="success" size="md" />
                : r.status === 'open'
                  ? <Pill label="In triage" tone="info" size="md" />
                  : r.status === 'in_progress'
                    ? <Pill label={r.vendor ? `${r.vendor} · working` : 'In progress'} tone="info" size="md" />
                    : <Pill label="Ticketed" tone="warning" size="md" />}
            </Row>
            {openReportId === r.id && (
              <div className="mb-2.5 animate-fadeup" style={{ paddingLeft: 44 }}>
                {reportThread.map((c) => (
                  <p key={c.id} className="m-0 mb-1 text-[12.5px] font-semibold text-navy leading-[1.45]">
                    <strong>{c.me ? 'You' : c.authorName}:</strong> {c.body}{' '}
                    <span className="text-slate text-[12px]">· {c.time}</span>
                  </p>
                ))}
                <Field
                  label="Message the board about this"
                  hideLabel
                  value={reportReply}
                  onChange={(e) => setReportReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && reportReply.trim()) {
                      void repo.addReportComment(r.id, reportReply)
                        .then(() => { setReportReply(''); return repo.listReportComments(r.id); })
                        .then(setReportThread)
                        .catch(reportedByDataLayer);
                    }
                  }}
                  placeholder="Message the board about this…"
                  hint="Press Enter to send."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        ))}
        {arc.requests.length === 0 && !hasReportRows ? (
          <p className="m-0 text-[12.5px] font-semibold text-slate">
            {isLiveMode ? 'No requests yet — ARC requests and reports you send land here.' : 'No requests yet.'}
          </p>
        ) : (
          arc.requests.map((r, i) => (
            <div key={r.id}>
              <Row
                divider={i < arc.requests.length - 1}
                onClick={() => (isLiveMode ? setOpenArcId(openArcId === r.id ? null : r.id) : set({ arcDetailId: r.id }))}
              >
                <Well icon={r.approved ? 'ph-fill ph-seal-check' : 'ph-fill ph-pencil-ruler'} tone={r.approved ? 'mint' : 'sky'} />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy min-w-0">{r.title} · {r.ref}</p>
                <Pill label={r.statusLabel} tone={r.approved ? 'success' : 'info'} size="md" />
              </Row>
              {isLiveMode && openArcId === r.id && (
                <div className="mb-2.5 animate-fadeup" style={{ paddingLeft: 44 }}>
                  {r.conditions && (
                    <p className="m-0 mb-1 text-[12.5px] font-semibold text-navy leading-[1.45]">
                      <strong>Conditions:</strong> {r.conditions}
                    </p>
                  )}
                  {r.decisionNote && (
                    <p className="m-0 mb-1 text-[12.5px] font-semibold text-navy leading-[1.45]">
                      <strong>{r.status === 'info_requested' ? 'The board needs:' : 'Board note:'}</strong> {r.decisionNote}
                    </p>
                  )}
                  {(r.attachmentUrls ?? []).length > 0 && (
                    <p className="m-0 mb-1 text-[12.5px] font-semibold text-navy">
                      {r.attachmentUrls!.map((u, j) => (
                        <a key={u} href={u} target="_blank" rel="noreferrer" className="font-extrabold mr-2" style={{ color: 'rgb(var(--accent))' }}>
                          Attachment {j + 1}
                        </a>
                      ))}
                    </p>
                  )}
                  {r.status === 'info_requested' && (
                    <button
                      onClick={() => set({ arcSheetOpen: true })}
                      className="mt-1 rounded-full px-3.5 min-h-[40px] text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy font-sans"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                    >
                      Submit an updated request
                    </button>
                  )}
                  {!r.conditions && !r.decisionNote && (r.attachmentUrls ?? []).length === 0 && r.status !== 'info_requested' && (
                    <p className="m-0 text-[12.5px] font-semibold text-slate">No board notes on this request.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </Card>

      {/* My groups */}
      <Card className="mb-3">
        <SectionHeading title="My groups" meta={myCirclesCount ? `${myCirclesCount} joined` : undefined} />
        <div className="flex gap-2 flex-wrap">
          {Object.values(groups).filter((g) => !g.isGroupChat && g.joined).map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => set({ activeGroup: g.key })}
              className="inline-flex items-center gap-1.5 border-none rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans px-3.5 min-h-[40px]"
              style={{ background: g.color + '18', color: g.color }}
            >
              <PhIcon name={g.icon} size={14} />
              {g.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set({ myPlaceOpen: false, tab: 'commons', commonsView: 'circles' })}
            className="bg-transparent rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans px-3.5 min-h-[40px]"
            style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)', color: 'rgb(var(--slate))' }}
          >
            + Browse
          </button>
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <SectionHeading title="Settings" />
        {isLiveMode && (
          <div className="flex flex-col" style={DIVIDER}>
            <button type="button"
              onClick={() => {
                if (!profileEditOpen) { setPfName(member?.name ?? ''); setPfPhone(member?.phone ?? ''); setPfHide(member?.hideDirectory ?? false); }
                setProfileEditOpen(!profileEditOpen);
              }}
              aria-expanded={profileEditOpen}
              className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 cursor-pointer min-h-[44px]"
            >
              <Well icon="ph-fill ph-user-circle" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">
                Profile <span className="font-semibold text-slate">· name, phone, privacy</span>
              </p>
              <PhIcon name={profileEditOpen ? 'ph ph-caret-up' : 'ph ph-caret-right'} size={14} color="rgb(var(--slatelight))" />
            </button>
            {profileEditOpen && (
              <div className="mt-2.5 animate-fadeup">
                <Field
                  label="Display name"
                  value={pfName}
                  onChange={(e) => setPfName(e.target.value)}
                  autoComplete="name"
                  error={pfName.trim() ? undefined : 'Neighbors need a name to find you by.'}
                  className="mb-2.5"
                />
                <Field
                  label="Phone"
                  hint="Optional — neighbors never see it."
                  value={pfPhone}
                  onChange={(e) => setPfPhone(e.target.value)}
                  type="tel"
                  autoComplete="tel"
                  className="mb-2.5"
                />
                <div className="flex items-center gap-2.5 mb-3 min-h-[44px]">
                  <p className="m-0 flex-1 text-[12.5px] font-bold text-navy">Hide me from the directory</p>
                  <Toggle on={pfHide} onToggle={() => setPfHide(!pfHide)} label="Hide me from the neighbor directory" />
                </div>
                <button
                  type="button"
                  disabled={saveDisabled}
                  aria-busy={pfBusy || undefined}
                  onClick={() => {
                    if (saveDisabled) return;
                    setPfBusy(true);
                    void repo.updateProfile({ name: pfName, phone: pfPhone, hideDirectory: pfHide })
                      .then(() => setProfileEditOpen(false))
                      .catch(reportedByDataLayer)
                      .finally(() => setPfBusy(false));
                  }}
                  className="w-full border-0 rounded-full min-h-[44px] text-[13px] font-extrabold cursor-pointer text-white font-sans disabled:cursor-not-allowed"
                  style={{ background: saveDisabled ? 'rgb(var(--skyrule))' : 'rgb(var(--skydeep))', color: saveDisabled ? 'rgb(var(--slatedark))' : undefined }}
                >
                  {pfBusy ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            )}
          </div>
        )}
        <button type="button"
          onClick={() => set({ notifOpen: true, myPlaceOpen: false })}
          className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 cursor-pointer min-h-[44px]"
          style={DIVIDER}
        >
          <Well icon="ph-fill ph-bell" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">
            Notifications{' '}
            {!isLiveMode && (
              <span className="font-semibold text-slate">
                · Digest + urgent only
              </span>
            )}
          </p>
          <PhIcon name="ph ph-caret-right" size={14} color="rgb(var(--slatelight))" />
        </button>
        <div className="flex items-center gap-2.5 min-h-[44px]" style={DIVIDER}>
          <Well icon="ph-fill ph-text-aa" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">Large type</p>
          <Toggle on={state.largeType} onToggle={() => set({ largeType: !state.largeType })} label="Large type" />
        </div>
        {/* Honest, not a picker: there is one language until there are two. */}
        <div className="flex items-center gap-2.5 min-h-[44px]" style={DIVIDER}>
          <Well icon="ph-fill ph-translate" tone="neutral" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">
            Language <span className="font-semibold text-slate">· English only for now</span>
          </p>
        </div>
        <button type="button" onClick={() => {
          if (isLiveMode) { void signOutLive(); return; }
          localStorage.removeItem('pavilion-demo');
          resetDemoData();
          usePavStore.setState({ ...dataDefaults, loginOpen: true, epoch: usePavStore.getState().epoch + 1 });
        }} className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans px-0 min-h-[44px] -mb-2" style={{ color: 'rgb(var(--accent))' }}>
          Sign out
        </button>
      </Card>
    </div>
  );
}
