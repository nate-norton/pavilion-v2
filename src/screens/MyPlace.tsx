import { useState, type CSSProperties, type ReactNode } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { Toggle } from '../components/Toggle';
import { usePavStore, dataDefaults } from '../store/store';
import { useArc, useDues, useMember, useMyReports, usePortfolio, useReservation, useGroups, useRepository, useMemberships, useActiveCommunityId, resetDemoData } from '../data/repo';
import type { DuesStatus, ThreadComment } from '../data/repo';
import { isLiveMode, signOutLive } from '../auth/AuthGate';

const CARD: CSSProperties = {
  background: 'rgb(var(--paper))',
  border: '1px solid rgb(var(--navy) / 0.08)',
  borderRadius: 18,
  padding: 16,
  marginBottom: 12,
  
};

function Row({ children, divider, onClick }: { children: ReactNode; divider?: boolean; onClick?: () => void }) {
  const style = divider
    ? { paddingBottom: 10, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 10 }
    : undefined;
  // Interactive rows render as real buttons so they take keyboard focus;
  // static rows stay divs rather than becoming unfocusable buttons.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-2.5 cursor-pointer border-none bg-transparent text-left font-sans"
        style={style}
      >
        {children}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2.5" style={style}>
      {children}
    </div>
  );
}

/** My Place profile screen — ported from prototype lines 1551-1769. */
export function MyPlace() {
  const state = usePavStore();
  const memberships = useMemberships();
  const activeCommunityId = useActiveCommunityId();
  const repoForSwitch = useRepository();
  const { set } = state;
  const PORTFOLIO = usePortfolio();
  const reservation = useReservation();
  const groups = useGroups();
  const member = useMember();
  const dues = useDues();
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

  if (!state.myPlaceOpen) return null;

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
  // Dues stat tile — data-driven off the member's dues (empty for a fresh member).
  const duesStatus: DuesStatus | null = dues.current?.status ?? (dues.history[0] ? 'paid' : null);
  const duesLabel =
    duesStatus === 'paid' ? 'Paid · Jul 1'
      : duesStatus === 'plan' ? 'Plan active'
        : duesStatus === 'past_due' ? '30 days late'
          : duesStatus === 'due' ? 'Due Jul 3'
            : '—';
  const statOneLabel = isTenant ? 'Lease' : isManager ? 'Role' : 'Dues';
  const statOneValue = isTenant ? 'Active' : isManager ? 'Manager' : duesLabel;
  const duesBg = duesStatus === 'paid' ? 'rgb(var(--mint))'
    : duesStatus === 'plan' ? 'rgb(var(--skypale))'
      : duesStatus === 'due' || duesStatus === 'past_due' ? 'rgb(var(--accenttint))'
        : 'rgb(var(--paper))';
  const duesColor = duesStatus === 'paid' ? 'rgb(var(--sagedark))'
    : duesStatus === 'plan' ? 'rgb(var(--skydeep))'
      : duesStatus === 'due' || duesStatus === 'past_due' ? 'rgb(var(--accent))'
        : 'rgb(var(--slate))';
  const myBookings = reservation.booked && reservation.summary ? '1 upcoming' : 'None yet';
  const myCirclesCount = Object.values(groups).filter((g) => !g.isGroupChat && g.joined).length;

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfCollected = pfDoors
    ? Math.round(PORTFOLIO.reduce((a, c) => a + c.collected * c.doors, 0) / pfDoors)
    : 0;

  const reportTypeLabel = state.reportType || 'Issue';
  const hasReportRows = isLiveMode ? myReports.length > 0 : state.reportSubmitted;

  // Payments card (owner only)
  const mpApLabel = state.apPaused ? 'Autopay paused' : 'Autopay · the 3rd';

  const statusPill = (label: string, bg: string, color: string) => (
    <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0" style={{ background: bg, color }}>
      {label}
    </span>
  );

  // Payments history rows come straight from the member's dues (empty in live).
  const duesPillBg: Record<DuesStatus, string> = {
    paid: 'rgb(var(--mint))', plan: 'rgb(var(--skypale))',
    past_due: 'rgb(var(--accenttint))', due: 'rgb(var(--goldpale))',
  };
  const duesPillColor: Record<DuesStatus, string> = {
    paid: 'rgb(var(--sagedark))', plan: 'rgb(var(--skydeep))',
    past_due: 'rgb(var(--accent))', due: 'rgb(var(--golddark))',
  };

  const payRow = (label: string, pill: ReactNode, last?: boolean, idx?: number) => {
    const style = last ? undefined : { paddingBottom: 10, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 10 };
    const body = (
      <>
        <span className="flex-1 text-[13px] font-bold text-navy">{label}</span>
        {pill}
      </>
    );
    // Only demo rows open a payment detail; live rows are static text.
    return idx != null && !isLiveMode ? (
      <button
        type="button"
        onClick={() => set({ paymentDetailIdx: idx })}
        className="w-full flex items-center gap-2.5 cursor-pointer border-none bg-transparent text-left font-sans"
        style={style}
      >
        {body}
      </button>
    ) : (
      <div className="flex items-center gap-2.5" style={style}>
        {body}
      </div>
    );
  };

  return (
    <div
      data-screen-label="My Place"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ myPlaceOpen: false })} className="mb-4" />

      <div className="flex items-center gap-3.5 mb-[18px]">
        <div className="w-[58px] h-[58px] rounded-full bg-skydeep flex items-center justify-center text-mist font-extrabold text-[19px] flex-shrink-0">
          {displayInitial}
        </div>
        <div>
          <h1 className="m-0 mb-0.5 font-serif font-normal text-2xl text-navy">{displayName}</h1>
          <p className="m-0 text-[12.5px] font-bold text-slate">
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-[9px] mb-3.5">
        <button type="button" onClick={() => (isLiveMode ? set({ myPlaceOpen: false, tab: 'hoa' }) : set({ paySheetOpen: true }))} className="w-full rounded-[15px] text-center cursor-pointer border-none font-sans" style={{ background: duesBg, padding: '12px 10px' }}>
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: duesColor }}>
            {statOneLabel}
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{statOneValue}</p>
        </button>
        <button type="button"
          onClick={() => set({ myPlaceOpen: false, tab: 'reserve' })}
          className="w-full border-none font-sans bg-transparent rounded-[15px] text-center cursor-pointer"
          style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', padding: '12px 10px' }}
        >
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--slate))' }}>
            Bookings
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{myBookings}</p>
        </button>
        <button type="button"
          onClick={() => set({ myPlaceOpen: false, tab: 'commons', commonsView: 'circles' })}
          className="w-full border-none font-sans bg-transparent rounded-[15px] text-center cursor-pointer"
          style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', padding: '12px 10px' }}
        >
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--slate))' }}>
            Groups
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{myCirclesCount} joined</p>
        </button>
      </div>

      {/* Board desk entry — live gates on the real membership role */}
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
              <span
                className="rounded-full px-2 py-0.5 text-[9.5px] font-bold"
                style={{ background: 'rgb(var(--peach) / 0.2)', color: 'rgb(var(--peach))', letterSpacing: '0.06em' }}
              >
                BOARD
              </span>
            </div>
            <p className="mt-px mb-0 text-xs font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              Triage, collections, votes &amp; broadcasts
            </p>
          </div>
          <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--peach))' }}>
            Open →
          </span>
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
          <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--peach))' }}>
            Open →
          </span>
        </button>
      )}

      {/* Tenant: lease + registration */}
      {isTenant && (
        <>
          <div style={CARD}>
            <div className="flex items-center justify-between gap-2.5 mb-3">
              <p className="m-0 font-serif text-base text-navy">Your lease</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))' }}>
                Active
              </span>
            </div>
            <div
              className="flex items-center gap-[11px]"
              style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
            >
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skyborder))' }}>
                <PhIcon name="ph-fill ph-calendar-blank" size={16} color="rgb(var(--slatedark))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">12-month term · renews Mar 1, 2027</p>
                <p className="m-0 text-[11.5px] font-semibold text-slate">
                  $2,400/mo · paid to owner, not the HOA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[11px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skyborder))' }}>
                <PhIcon name="ph-fill ph-user" size={16} color="rgb(var(--slatedark))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">Owner: Dana Okafor · #27</p>
                <p className="m-0 text-[11.5px] font-semibold text-slate">
                  Handles ARC requests &amp; dues
                </p>
              </div>
            </div>
          </div>
          <div style={{ ...CARD, border: '1px solid rgb(var(--gold) / 0.4)' }}>
            <div className="flex items-start gap-[11px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--goldpale))' }}>
                <PhIcon name="ph-fill ph-identification-card" size={17} color="rgb(var(--golddark))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">Tenant registration</p>
                <p className="m-0 mb-2.5 text-[11.5px] font-semibold text-slate">
                  CC&amp;Rs §7.4 asks tenants to register with the office within 14 days.
                </p>
                {!state.tenantRegistered ? (
                  <button
                    type="button"
                    onClick={() => set({ tenantRegistered: true })}
                    className="border-none bg-skydeep text-mist rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans"
                    style={{ padding: '9px 15px' }}
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
          </div>
        </>
      )}

      {/* Payments (owner only) — above household for easy access */}
      {isOwner && (
        <div style={CARD}>
          <p className="m-0 mb-[11px] font-serif text-base text-navy">Payments</p>
          {!isLiveMode && (
          <div
            className="flex items-center gap-2.5"
            style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
          >
            <PhIcon name="ph-fill ph-arrows-clockwise" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">{mpApLabel}</p>
              <p className="m-0 text-[11.5px] font-semibold text-slate">
                Juniper CU ····4821 · free ACH · change bank or date anytime
              </p>
            </div>
            {apConfirm ? (
              <div className="flex gap-1.5 animate-fadeup">
                <button
                  onClick={() => { set({ apPaused: !state.apPaused }); setApConfirm(false); }}
                  className="border-none rounded-full px-2.5 py-1.5 text-[11px] font-extrabold cursor-pointer"
                  style={{ background: state.apPaused ? 'rgb(var(--mint))' : 'rgb(var(--accenttint))', color: state.apPaused ? 'rgb(var(--sagedark))' : 'rgb(var(--accent))' }}
                >
                  {state.apPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setApConfirm(false)}
                  className="border-none bg-transparent text-[11px] font-extrabold cursor-pointer text-slate"
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
            <p className="m-0 py-2 text-[12.5px] font-semibold text-slate">No payments yet.</p>
          ) : (
            dues.history.map((d, i) =>
              payRow(
                `${d.period} 2026 · ${d.amountLabel}`,
                statusPill(d.statusLabel, duesPillBg[d.status], duesPillColor[d.status]),
                i === dues.history.length - 1,
                i,
              ),
            )
          )}
        </div>
      )}

      {/* Household (demo-only until a household domain exists) */}
      {!isLiveMode && (
      <div style={CARD}>
        <div className="flex items-center justify-between gap-2.5 mb-[11px]">
          <p className="m-0 font-serif text-base text-navy">Household</p>
          {!state.memberAdded && (
            <button
              type="button"
              onClick={() => set({ memberAdded: true })}
              className="inline-flex items-center gap-[5px] bg-transparent rounded-full text-[11.5px] font-extrabold text-navy cursor-pointer font-sans"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', padding: '6px 12px' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Add member
            </button>
          )}
        </div>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
        >
          <div className="w-[34px] h-[34px] rounded-full bg-skydeep flex items-center justify-center text-mist font-extrabold text-[13px]">A</div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            You{' '}
            <span className="font-semibold text-slatelight">
              · Owner
            </span>
          </p>
          <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: 'rgb(var(--skyborder))', color: 'rgb(var(--slate))' }}>
            Admin
          </span>
        </div>
        <div className="flex items-center gap-[11px]">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-extrabold text-[13px]"
            style={{ background: 'rgb(var(--accent))' }}
          >
            S
          </div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            Sam R.{' '}
            <span className="font-semibold text-slatelight">
              · Partner
            </span>
          </p>
          <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: 'rgb(var(--skyborder))', color: 'rgb(var(--slate))' }}>
            Member
          </span>
        </div>
        {state.memberAdded && (
          <div
            className="flex items-center gap-[11px] animate-fadeup"
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
      </div>
      )}

      {/* Vehicles & pets (demo-only until a registry domain exists) */}
      {!isLiveMode && (
      <div style={CARD}>
        <p className="m-0 mb-[3px] font-serif text-base text-navy">Vehicles &amp; pets</p>
        <p className="m-0 mb-3 text-[11.5px] font-semibold text-slate">
          On file for guest passes, gate logs &amp; the pet registry.
        </p>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
        >
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
            <PhIcon name="ph-fill ph-car" size={17} color="rgb(var(--skydeep))" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Subaru Outback · Slate</p>
            <p className="m-0 text-[11.5px] font-semibold text-slate">
              Plate 8XR-4471 · resident decal #204
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 12, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 12 }}
        >
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--goldpale))' }}>
            <PhIcon name="ph-fill ph-dog" size={17} color="rgb(var(--golddark))" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Biscuit · Golden mix</p>
            <p className="m-0 text-[11.5px] font-semibold text-slate">
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
              className="flex-1 bg-transparent rounded-[11px] py-[9px] text-xs font-extrabold text-navy cursor-pointer font-sans flex items-center justify-center gap-[5px]"
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
              className="flex-1 bg-transparent rounded-[11px] py-[9px] text-xs font-extrabold text-navy cursor-pointer font-sans flex items-center justify-center gap-[5px]"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Pet
            </button>
          )}
        </div>
      </div>
      )}

      {/* My requests */}
      <div style={CARD}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">My requests</p>
        {!isLiveMode && state.reportSubmitted && (
          <Row divider>
            <PhIcon name="ph-fill ph-wrench" size={17} color="rgb(var(--accent))" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">{reportTypeLabel} report · #M-89</p>
            {statusPill('In triage', 'rgb(var(--accenttint))', 'rgb(var(--accent))')}
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
              <PhIcon name="ph-fill ph-wrench" size={17} color="rgb(var(--accent))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">{r.title}{r.ref ? ` · ${r.ref}` : ''}</p>
              {r.status === 'resolved'
                ? statusPill('Resolved', 'rgb(var(--mint))', 'rgb(var(--sagedark))')
                : r.status === 'open'
                  ? statusPill('In triage', 'rgb(var(--accenttint))', 'rgb(var(--accent))')
                  : r.status === 'in_progress'
                    ? statusPill(r.vendor ? `${r.vendor} · working` : 'In progress', 'rgb(var(--skypale))', 'rgb(var(--skydeep))')
                    : statusPill('Ticketed', 'rgb(var(--goldpale))', 'rgb(var(--golddark))')}
            </Row>
            {openReportId === r.id && (
              <div className="mb-2.5 animate-fadeup" style={{ paddingLeft: 27 }}>
                {reportThread.map((c) => (
                  <p key={c.id} className="m-0 mb-1 text-[12px] font-semibold text-navy">
                    <strong>{c.me ? 'You' : c.authorName}:</strong> {c.body}{' '}
                    <span className="text-slate" style={{ fontSize: 10.5 }}>· {c.time}</span>
                  </p>
                ))}
                <div className="flex gap-2 mt-1">
                  <input
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
                    className="flex-1 rounded-full px-3 py-2 text-[12px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        {arc.requests.length === 0 && !hasReportRows ? (
          <p className="m-0 text-[12.5px] font-semibold text-slate">No requests yet.</p>
        ) : (
          arc.requests.map((r, i) => (
            <div key={r.id}>
              <Row
                divider={i < arc.requests.length - 1}
                onClick={() => (isLiveMode ? setOpenArcId(openArcId === r.id ? null : r.id) : set({ arcDetailId: r.id }))}
              >
                <PhIcon
                  name={r.approved ? 'ph-fill ph-seal-check' : 'ph-fill ph-pencil-ruler'}
                  size={17}
                  color={r.approved ? 'rgb(var(--sage))' : 'rgb(var(--skydeep))'}
                  className="flex-shrink-0"
                />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy">{r.title} · {r.ref}</p>
                {statusPill(
                  r.statusLabel,
                  r.approved ? 'rgb(var(--mint))' : 'rgb(var(--accenttint))',
                  r.approved ? 'rgb(var(--sagedark))' : 'rgb(var(--accent))',
                )}
              </Row>
              {isLiveMode && openArcId === r.id && (
                <div className="mb-2.5 animate-fadeup" style={{ paddingLeft: 27 }}>
                  {r.conditions && (
                    <p className="m-0 mb-1 text-[12px] font-semibold text-navy">
                      <strong>Conditions:</strong> {r.conditions}
                    </p>
                  )}
                  {r.decisionNote && (
                    <p className="m-0 mb-1 text-[12px] font-semibold text-navy">
                      <strong>{r.status === 'info_requested' ? 'The board needs:' : 'Board note:'}</strong> {r.decisionNote}
                    </p>
                  )}
                  {(r.attachmentUrls ?? []).length > 0 && (
                    <p className="m-0 mb-1 text-[12px] font-semibold text-navy">
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
                      className="mt-1 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                    >
                      Submit an updated request
                    </button>
                  )}
                  {!r.conditions && !r.decisionNote && (r.attachmentUrls ?? []).length === 0 && r.status !== 'info_requested' && (
                    <p className="m-0 text-[12px] font-semibold text-slate">No board notes on this request.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* My groups */}
      <div style={CARD}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">My groups</p>
        <div className="flex gap-2 flex-wrap">
          {Object.values(groups).filter((g) => !g.isGroupChat && g.joined).map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => set({ activeGroup: g.key })}
              className="inline-flex items-center gap-1.5 border-none rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans"
              style={{ background: g.color + '18', color: g.color, padding: '8px 13px' }}
            >
              <PhIcon name={g.icon} size={14} />
              {g.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => set({ myPlaceOpen: false, tab: 'commons', commonsView: 'circles' })}
            className="bg-transparent rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans"
            style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)', color: 'rgb(var(--slate))', padding: '7px 13px' }}
          >
            + Browse
          </button>
        </div>
      </div>

      {/* Settings */}
      <div style={{ ...CARD, marginBottom: 0 }}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">Settings</p>
        {isLiveMode && (
          <div
            className="flex flex-col"
            style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
          >
            <button type="button"
              onClick={() => {
                if (!profileEditOpen) { setPfName(member?.name ?? ''); setPfPhone(member?.phone ?? ''); setPfHide(member?.hideDirectory ?? false); }
                setProfileEditOpen(!profileEditOpen);
              }}
              className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 cursor-pointer"
            >
              <PhIcon name="ph-fill ph-user-circle" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">
                Profile <span className="font-semibold text-slatelight">· name, phone, privacy</span>
              </p>
              <PhIcon name={profileEditOpen ? 'ph ph-caret-up' : 'ph ph-caret-right'} size={14} color="rgb(var(--slatelight))" />
            </button>
            {profileEditOpen && (
              <div className="mt-2.5 animate-fadeup">
                <input
                  value={pfName}
                  onChange={(e) => setPfName(e.target.value)}
                  placeholder="Display name"
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' }}
                />
                <input
                  value={pfPhone}
                  onChange={(e) => setPfPhone(e.target.value)}
                  placeholder="Phone (optional — neighbors never see it)"
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' }}
                />
                <div className="flex items-center gap-2.5 mb-2.5">
                  <p className="m-0 flex-1 text-[12.5px] font-bold text-navy">Hide me from the directory</p>
                  <Toggle on={pfHide} onToggle={() => setPfHide(!pfHide)} label="Hide me from the neighbor directory" />
                </div>
                <button
                  onClick={() => {
                    if (pfBusy) return;
                    setPfBusy(true);
                    void repo.updateProfile({ name: pfName, phone: pfPhone, hideDirectory: pfHide })
                      .then(() => setProfileEditOpen(false))
                      .catch(reportedByDataLayer)
                      .finally(() => setPfBusy(false));
                  }}
                  className="w-full border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-mist"
                  style={{ background: pfName.trim() && !pfBusy ? 'rgb(var(--navy))' : 'rgb(var(--skyrule))' }}
                >
                  {pfBusy ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            )}
          </div>
        )}
        {memberships.length > 1 && (
          <div
            className="flex flex-col gap-1.5"
            style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
          >
            <div className="flex items-center gap-2.5">
              <PhIcon name="ph-fill ph-house-line" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">Your communities</p>
            </div>
            <div className="ml-[29px] flex flex-col gap-1">
              {memberships.map((m) => {
                const active = m.communityId === activeCommunityId;
                return (
                  <button
                    key={m.communityId}
                    type="button"
                    onClick={() => { if (!active) void repoForSwitch.switchCommunity(m.communityId); }}
                    aria-pressed={active}
                    className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2 py-1 cursor-pointer"
                  >
                    <PhIcon name={active ? 'ph-fill ph-check-circle' : 'ph ph-circle'} size={16} color={active ? 'rgb(var(--sage))' : 'rgb(var(--slatelight))'} />
                    <span className="text-[13px] font-semibold text-navy">
                      {m.communityName}
                      <span className="text-slatelight"> · {m.role === 'board' ? 'Board' : 'Resident'}{m.unitLabel ? ` · ${m.unitLabel}` : ''}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button type="button"
          onClick={() => set({ notifOpen: true, myPlaceOpen: false })}
          className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 cursor-pointer"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
        >
          <PhIcon name="ph-fill ph-bell" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">
            Notifications{' '}
            {!isLiveMode && (
              <span className="font-semibold text-slatelight">
                · Digest + urgent only
              </span>
            )}
          </p>
          <PhIcon name="ph ph-caret-right" size={14} color="rgb(var(--slatelight))" />
        </button>
        <div
          className="flex items-center gap-2.5"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
        >
          <PhIcon name="ph-fill ph-text-aa" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">Large type</p>
          <Toggle on={state.largeType} onToggle={() => set({ largeType: !state.largeType })} label="Large type" />
        </div>
        <div
          className="flex flex-col"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgb(var(--navy) / 0.06)', marginBottom: 11 }}
        >
          <button type="button"
            onClick={() => set({ langOpen: !state.langOpen })}
            className="w-full border-none font-sans bg-transparent text-left flex items-center gap-2.5 cursor-pointer"
          >
            <PhIcon name="ph-fill ph-translate" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">
              Language{' '}
              <span className="font-semibold text-slatelight">
                · English
              </span>
            </p>
            <PhIcon name={state.langOpen ? 'ph ph-caret-up' : 'ph ph-caret-right'} size={14} color="rgb(var(--slatelight))" />
          </button>
          {state.langOpen && (
            <div className="mt-2.5 ml-[29px] flex flex-col gap-1.5 animate-fadeup">
              {['English', 'Español', '中文'].map((lang) => (
                <div key={lang} className="flex items-center gap-2 py-1">
                  <PhIcon
                    name={lang === 'English' ? 'ph-fill ph-check-circle' : 'ph ph-circle'}
                    size={16}
                    color={lang === 'English' ? 'rgb(var(--sage))' : 'rgb(var(--slatelight))'}
                  />
                  <span className="text-[13px] font-semibold text-navy">{lang}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => {
          if (isLiveMode) { void signOutLive(); return; }
          localStorage.removeItem('pavilion-demo');
          resetDemoData();
          usePavStore.setState({ ...dataDefaults, loginOpen: true, epoch: usePavStore.getState().epoch + 1 });
        }} className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans p-0" style={{ color: 'rgb(var(--accent))' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
