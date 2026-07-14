import { useState, type CSSProperties, type ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { Toggle } from '../components/Toggle';
import { usePavStore, dataDefaults } from '../store/store';
import { getDelinquent } from '../store/selectors';
import { PORTFOLIO } from '../data';

const CARD: CSSProperties = {
  background: '#FFFEFA',
  border: '1px solid rgba(26,51,82,0.08)',
  borderRadius: 18,
  padding: 16,
  marginBottom: 12,
  
};

function Row({ children, divider, onClick }: { children: ReactNode; divider?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5${onClick ? ' cursor-pointer' : ''}`}
      style={divider ? { paddingBottom: 10, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 10 } : undefined}
    >
      {children}
    </div>
  );
}

/** My Place profile screen — ported from prototype lines 1551-1769. */
export function MyPlace() {
  const state = usePavStore();
  const { set } = state;

  const [apConfirm, setApConfirm] = useState(false);

  if (!state.myPlaceOpen) return null;

  const isOwner = state.role === 'owner';
  const isManager = state.role === 'manager';
  const isTenant = state.role === 'tenant';
  const delinquent = getDelinquent(state);
  const juneLate = state.showDelinquent;

  const roleLabel = isTenant
    ? 'Renter · #27 Alder Way'
    : isManager
      ? 'Property manager · Cedar Hill Mgmt'
      : '#27 Alder Way · Owner · here since 2021';
  const duesLabel = state.paid ? 'Paid · Jul 1' : state.planActive ? 'Plan active' : delinquent ? '30 days late' : 'Due Jul 3';
  const statOneLabel = isTenant ? 'Lease' : isManager ? 'Role' : 'Dues';
  const statOneValue = isTenant ? 'Active' : isManager ? 'Manager' : duesLabel;
  const duesBg = state.paid ? '#E9F6EE' : state.planActive ? '#EAF3FD' : '#FBEDE4';
  const duesColor = state.paid ? '#228049' : state.planActive ? '#3A73B5' : '#C75A31';
  const myBookings = state.booked && state.bookingSummary ? '1 upcoming' : 'None yet';
  const myCirclesCount = Object.values(state.groups).filter((g) => !g.isGroupChat && g.joined).length;

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfCollected = Math.round(
    PORTFOLIO.reduce((a, c) => a + c.collected * c.doors, 0) / pfDoors
  );

  const approved = state.arcApprovedByBoard;
  const arcNewTitle = state.arcType || 'Exterior update';
  const reportTypeLabel = state.reportType || 'Issue';

  // Payments card (owner only)
  const mpApLabel = state.apPaused ? 'Autopay paused' : 'Autopay · the 3rd';
  const mpJulyStatus = state.paid
    ? 'Paid Jul 1 · #P-2231'
    : state.planActive
      ? 'In plan · 3 × $190'
      : delinquent
        ? 'Past due'
        : 'Due Jul 3';
  const mpJulyBg = state.paid ? '#E9F6EE' : state.planActive ? '#EAF3FD' : delinquent ? '#FBEDE4' : '#FBF3E0';
  const mpJulyColor = state.paid ? '#228049' : state.planActive ? '#3A73B5' : delinquent ? '#C75A31' : '#A87B1F';
  const mpJuneStatus = !juneLate
    ? 'Paid Jun 3 · #P-2168'
    : state.paid
      ? 'Paid Jul 1'
      : state.planActive
        ? 'In plan'
        : 'Past due · 30 days';
  const mpJuneBg = !juneLate || state.paid ? '#E9F6EE' : state.planActive ? '#EAF3FD' : '#FBEDE4';
  const mpJuneColor = !juneLate || state.paid ? '#228049' : state.planActive ? '#3A73B5' : '#C75A31';

  const statusPill = (label: string, bg: string, color: string) => (
    <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0" style={{ background: bg, color }}>
      {label}
    </span>
  );

  const payRow = (label: string, pill: ReactNode, last?: boolean, idx?: number) => (
    <div
      onClick={idx != null ? () => set({ paymentDetailIdx: idx }) : undefined}
      className={`flex items-center gap-2.5${idx != null ? ' cursor-pointer' : ''}`}
      style={last ? undefined : { paddingBottom: 10, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 10 }}
    >
      <span className="flex-1 text-[13px] font-bold text-navy">{label}</span>
      {pill}
    </div>
  );

  return (
    <div
      data-screen-label="My Place"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ myPlaceOpen: false })} className="mb-4" />

      <div className="flex items-center gap-3.5 mb-[18px]">
        <div className="w-[58px] h-[58px] rounded-full bg-navy flex items-center justify-center text-cream font-extrabold text-[22px] flex-shrink-0">
          A
        </div>
        <div>
          <h1 className="m-0 mb-0.5 font-serif font-normal text-2xl text-navy">Alex Rivera</h1>
          <p className="m-0 text-[12.5px] font-bold text-stone">
            {roleLabel}
          </p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-[9px] mb-3.5">
        <div onClick={() => set({ paySheetOpen: true })} className="rounded-[15px] text-center cursor-pointer" style={{ background: duesBg, padding: '12px 10px' }}>
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: duesColor }}>
            {statOneLabel}
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{statOneValue}</p>
        </div>
        <div
          onClick={() => set({ myPlaceOpen: false, tab: 'reserve' })}
          className="rounded-[15px] text-center cursor-pointer"
          style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', padding: '12px 10px' }}
        >
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
            Bookings
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{myBookings}</p>
        </div>
        <div
          onClick={() => set({ myPlaceOpen: false, tab: 'commons', commonsView: 'circles' })}
          className="rounded-[15px] text-center cursor-pointer"
          style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', padding: '12px 10px' }}
        >
          <p className="m-0 mb-[3px] text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
            Groups
          </p>
          <p className="m-0 text-[12.5px] font-bold text-navy">{myCirclesCount} joined</p>
        </div>
      </div>

      {/* Owner: board desk entry */}
      {isOwner && (
        <div
          onClick={() => set({ boardMode: true, myPlaceOpen: false })}
          className="bg-navy rounded-[18px] flex items-center gap-[13px] cursor-pointer mb-3"
          style={{ padding: '15px 16px' }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,240,230,0.12)' }}
          >
            <PhIcon name="ph-fill ph-shield-star" size={22} color="#E8A788" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="m-0 text-[14.5px] font-bold text-cream">Board desk</p>
              <span
                className="rounded-full px-2 py-0.5 text-[9.5px] font-bold"
                style={{ background: 'rgba(232,167,136,0.2)', color: '#E8A788', letterSpacing: '0.06em' }}
              >
                TREASURER
              </span>
            </div>
            <p className="mt-px mb-0 text-xs font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
              Triage, collections, votes &amp; broadcasts
            </p>
          </div>
          <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: '#E8A788' }}>
            Open →
          </span>
        </div>
      )}

      {/* Manager: portfolio entry */}
      {isManager && (
        <div
          onClick={() => set({ portfolioOpen: true, myPlaceOpen: false })}
          className="bg-navy rounded-[18px] flex items-center gap-[13px] cursor-pointer mb-3"
          style={{ padding: '15px 16px' }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(245,240,230,0.12)' }}
          >
            <PhIcon name="ph-fill ph-buildings" size={22} color="#E8A788" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14.5px] font-bold text-cream">Portfolio</p>
            <p className="mt-px mb-0 text-xs font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
              3 communities · {pfDoors} doors · {pfCollected}% collected
            </p>
          </div>
          <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: '#E8A788' }}>
            Open →
          </span>
        </div>
      )}

      {/* Tenant: lease + registration */}
      {isTenant && (
        <>
          <div style={CARD}>
            <div className="flex items-center justify-between gap-2.5 mb-3">
              <p className="m-0 font-serif text-base text-navy">Your lease</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: '#EAF3FD', color: '#3A73B5' }}>
                Active
              </span>
            </div>
            <div
              className="flex items-center gap-[11px]"
              style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
            >
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#EDE6D6' }}>
                <PhIcon name="ph-fill ph-calendar-blank" size={16} color="#5B554A" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">12-month term · renews Mar 1, 2027</p>
                <p className="m-0 text-[11.5px] font-semibold text-stone">
                  $2,400/mo · paid to owner, not the HOA
                </p>
              </div>
            </div>
            <div className="flex items-center gap-[11px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#EDE6D6' }}>
                <PhIcon name="ph-fill ph-user" size={16} color="#5B554A" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">Owner: Dana Okafor · #27</p>
                <p className="m-0 text-[11.5px] font-semibold text-stone">
                  Handles ARC requests &amp; dues
                </p>
              </div>
            </div>
          </div>
          <div style={{ ...CARD, border: '1px solid rgba(217,164,65,0.4)' }}>
            <div className="flex items-start gap-[11px]">
              <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBF3E0' }}>
                <PhIcon name="ph-fill ph-identification-card" size={17} color="#A87B1F" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">Tenant registration</p>
                <p className="m-0 mb-2.5 text-[11.5px] font-semibold text-stone">
                  CC&amp;Rs §7.4 asks tenants to register with the office within 14 days.
                </p>
                {!state.tenantRegistered ? (
                  <button
                    type="button"
                    onClick={() => set({ tenantRegistered: true })}
                    className="border-none bg-navy text-cream rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans"
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
          <div
            className="flex items-center gap-2.5"
            style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
          >
            <PhIcon name="ph-fill ph-arrows-clockwise" size={17} color="#1A3352" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">{mpApLabel}</p>
              <p className="m-0 text-[11.5px] font-semibold text-stone">
                Juniper CU ····4821 · free ACH · change bank or date anytime
              </p>
            </div>
            {apConfirm ? (
              <div className="flex gap-1.5 animate-fadeup">
                <button
                  onClick={() => { set({ apPaused: !state.apPaused }); setApConfirm(false); }}
                  className="border-none rounded-full px-2.5 py-1.5 text-[11px] font-extrabold cursor-pointer"
                  style={{ background: state.apPaused ? '#E9F6EE' : '#FBEDE4', color: state.apPaused ? '#228049' : '#C75A31' }}
                >
                  {state.apPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => setApConfirm(false)}
                  className="border-none bg-transparent text-[11px] font-extrabold cursor-pointer text-stone"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Toggle on={!state.apPaused} onToggle={() => setApConfirm(true)} />
            )}
          </div>
          {payRow('July 2026 · $285', statusPill(mpJulyStatus, mpJulyBg, mpJulyColor), false, 0)}
          {payRow('June 2026 · $285', statusPill(mpJuneStatus, mpJuneBg, mpJuneColor), false, 1)}
          {payRow('May 2026 · $285', statusPill('Paid May 3 · #P-2103', '#E9F6EE', '#228049'), false, 2)}
          {payRow('April 2026 · $285', statusPill('Paid Apr 3 · #P-2041', '#E9F6EE', '#228049'), true, 3)}
        </div>
      )}

      {/* Household */}
      <div style={CARD}>
        <div className="flex items-center justify-between gap-2.5 mb-[11px]">
          <p className="m-0 font-serif text-base text-navy">Household</p>
          {!state.memberAdded && (
            <button
              type="button"
              onClick={() => set({ memberAdded: true })}
              className="inline-flex items-center gap-[5px] bg-transparent rounded-full text-[11.5px] font-extrabold text-navy cursor-pointer font-sans"
              style={{ border: '1.5px solid rgba(26,51,82,0.15)', padding: '6px 12px' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Add member
            </button>
          )}
        </div>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
        >
          <div className="w-[34px] h-[34px] rounded-full bg-navy flex items-center justify-center text-cream font-extrabold text-[13px]">A</div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            You{' '}
            <span className="font-semibold text-stonelight">
              · Owner
            </span>
          </p>
          <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: '#EDE6D6', color: '#6E6759' }}>
            Admin
          </span>
        </div>
        <div className="flex items-center gap-[11px]">
          <div
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-white font-extrabold text-[13px]"
            style={{ background: '#C75A31' }}
          >
            S
          </div>
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">
            Sam R.{' '}
            <span className="font-semibold text-stonelight">
              · Partner
            </span>
          </p>
          <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: '#EDE6D6', color: '#6E6759' }}>
            Member
          </span>
        </div>
        {state.memberAdded && (
          <div
            className="flex items-center gap-[11px] animate-fadeup"
            style={{ paddingTop: 11, borderTop: '1px solid rgba(26,51,82,0.06)', marginTop: 11 }}
          >
            <div
              className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#EDE6D6', border: '1.5px dashed rgba(26,51,82,0.25)', color: '#8A8375' }}
            >
              <PhIcon name="ph-bold ph-envelope-simple" size={14} />
            </div>
            <p className="m-0 flex-1 text-[13px] font-bold text-stone">
              Invite sent — they&apos;ll join once they accept
            </p>
          </div>
        )}
      </div>

      {/* Vehicles & pets */}
      <div style={CARD}>
        <p className="m-0 mb-[3px] font-serif text-base text-navy">Vehicles &amp; pets</p>
        <p className="m-0 mb-3 text-[11.5px] font-semibold text-stone">
          On file for guest passes, gate logs &amp; the pet registry.
        </p>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
        >
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#EAF3FD' }}>
            <PhIcon name="ph-fill ph-car" size={17} color="#3A73B5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Subaru Outback · Slate</p>
            <p className="m-0 text-[11.5px] font-semibold text-stone">
              Plate 8XR-4471 · resident decal #204
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-[11px]"
          style={{ paddingBottom: 12, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 12 }}
        >
          <div className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBF3E0' }}>
            <PhIcon name="ph-fill ph-dog" size={17} color="#A87B1F" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[13px] font-bold text-navy">Biscuit · Golden mix</p>
            <p className="m-0 text-[11.5px] font-semibold text-stone">
              Registered · licensed &amp; up to date
            </p>
          </div>
        </div>
        {(state.vehicleAdded || state.petAdded) && (
          <div className="flex flex-col gap-2 mb-2">
            {state.vehicleAdded && (
              <div className="flex items-center gap-2.5 animate-fadeup">
                <PhIcon name="ph-fill ph-check-circle" size={16} color="#2A9D5C" />
                <span className="text-[13px] font-bold text-navy">Honda Civic · Silver · ABC-1234</span>
              </div>
            )}
            {state.petAdded && (
              <div className="flex items-center gap-2.5 animate-fadeup">
                <PhIcon name="ph-fill ph-check-circle" size={16} color="#2A9D5C" />
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
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
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
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={12} />
              Pet
            </button>
          )}
        </div>
      </div>

      {/* My requests */}
      <div style={CARD}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">My requests</p>
        {state.arcSubmitted && (
          <Row divider onClick={() => set({ arcDetailId: 'A-121' })}>
            <PhIcon name="ph-fill ph-pencil-ruler" size={17} color="#3A73B5" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">{arcNewTitle} · #A-121</p>
            {statusPill(approved ? 'Approved' : 'In review', approved ? '#E9F6EE' : '#FBEDE4', approved ? '#228049' : '#C75A31')}
          </Row>
        )}
        {state.reportSubmitted && (
          <Row divider>
            <PhIcon name="ph-fill ph-wrench" size={17} color="#C75A31" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">{reportTypeLabel} report · #M-89</p>
            {statusPill('In triage', '#FBEDE4', '#C75A31')}
          </Row>
        )}
        <Row onClick={() => set({ arcDetailId: 'A-118' })}>
          <PhIcon name="ph-fill ph-seal-check" size={17} color="#2A9D5C" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">Backyard pergola · #A-118</p>
          {statusPill('Approved', '#E9F6EE', '#228049')}
        </Row>
      </div>

      {/* My groups */}
      <div style={CARD}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">My groups</p>
        <div className="flex gap-2 flex-wrap">
          {Object.values(state.groups).filter((g) => !g.isGroupChat && g.joined).map((g) => (
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
            style={{ border: '1.5px dashed rgba(26,51,82,0.2)', color: '#8A8375', padding: '7px 13px' }}
          >
            + Browse
          </button>
        </div>
      </div>

      {/* Settings */}
      <div style={{ ...CARD, marginBottom: 0 }}>
        <p className="m-0 mb-[11px] font-serif text-base text-navy">Settings</p>
        <div
          onClick={() => set({ notifOpen: true, myPlaceOpen: false })}
          className="flex items-center gap-2.5 cursor-pointer"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
        >
          <PhIcon name="ph-fill ph-bell" size={17} color="#1A3352" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">
            Notifications{' '}
            <span className="font-semibold text-stonelight">
              · Digest + urgent only
            </span>
          </p>
          <PhIcon name="ph ph-caret-right" size={14} color="#A39B8B" />
        </div>
        <div
          className="flex items-center gap-2.5"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
        >
          <PhIcon name="ph-fill ph-text-aa" size={17} color="#1A3352" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold text-navy">Large type</p>
          <Toggle on={state.largeType} onToggle={() => set({ largeType: !state.largeType })} />
        </div>
        <div
          className="flex flex-col"
          style={{ paddingBottom: 11, borderBottom: '1px solid rgba(26,51,82,0.06)', marginBottom: 11 }}
        >
          <div
            onClick={() => set({ langOpen: !state.langOpen })}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <PhIcon name="ph-fill ph-translate" size={17} color="#1A3352" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13px] font-bold text-navy">
              Language{' '}
              <span className="font-semibold text-stonelight">
                · English
              </span>
            </p>
            <PhIcon name={state.langOpen ? 'ph ph-caret-up' : 'ph ph-caret-right'} size={14} color="#A39B8B" />
          </div>
          {state.langOpen && (
            <div className="mt-2.5 ml-[29px] flex flex-col gap-1.5 animate-fadeup">
              {['English', 'Español', '中文'].map((lang) => (
                <div key={lang} className="flex items-center gap-2 py-1">
                  <PhIcon
                    name={lang === 'English' ? 'ph-fill ph-check-circle' : 'ph ph-circle'}
                    size={16}
                    color={lang === 'English' ? '#2A9D5C' : '#A39B8B'}
                  />
                  <span className="text-[13px] font-semibold text-navy">{lang}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="button" onClick={() => {
          localStorage.removeItem('pavilion-demo');
          usePavStore.setState({ ...dataDefaults, loginOpen: true, epoch: usePavStore.getState().epoch + 1 });
        }} className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans p-0" style={{ color: '#C75A31' }}>
          Sign out
        </button>
      </div>
    </div>
  );
}
