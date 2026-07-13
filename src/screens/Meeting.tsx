import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { getQuorum } from '../store/selectors';

const AGENDA = [
  '2027 budget ratification',
  'Board election — 2 seats, 3 candidates',
  'Pool furniture vote — results',
  'Open comment (2 min each)',
];

const PROXY_NAMES = ['Tom B. · #18', 'Rosa M. · #12', 'Priya S. · #31'];

/** Annual meeting screen — ported from prototype lines 2159-2221. */
export function Meeting() {
  const state = usePavStore();
  const { set } = state;
  const quorum = getQuorum(state);

  if (!state.meetingOpen) return null;

  return (
    <div
      data-screen-label="Annual Meeting"
      className="pav-scroll absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ meetingOpen: false })} />
      <p className="m-0 mb-1.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.14em', color: '#C75A31' }}>
        Annual meeting · Tue Jul 15 · 7 PM
      </p>
      <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">Juniper Ridge, assembled</h1>
      <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
        Clubhouse + Zoom · childcare at the clubhouse · minutes posted within 48h
      </p>

      {/* Quorum pledged */}
      <div className="bg-navy rounded-[18px] p-4 text-cream mb-3.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11.5px] font-bold" style={{ color: 'rgba(245,240,230,0.8)' }}>
            QUORUM PLEDGED
          </span>
          <span className="text-[11.5px] font-bold" style={{ color: 'rgba(245,240,230,0.8)' }}>
            {quorum.count} of 136 households
          </span>
        </div>
        <div className="rounded-full overflow-hidden mb-2.5" style={{ height: 8, background: 'rgba(245,240,230,0.15)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${quorum.pct}%`, background: 'linear-gradient(90deg,#E06A3E,#F97B4B)', transition: 'width 0.6s ease' }}
          />
        </div>
        <p className="m-0 text-xs font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
          34 attending remotely · proxies count toward quorum
        </p>
      </div>

      {/* Agenda */}
      <div
        style={{
          background: '#FFFEFA',
          border: '1px solid rgba(26,51,82,0.08)',
          borderRadius: 18,
          padding: 16,
          marginBottom: 14,
          
        }}
      >
        <p className="m-0 mb-[11px] font-serif text-base text-navy">Agenda</p>
        <div className="flex flex-col gap-[9px]">
          {AGENDA.map((item, i) => (
            <div key={item} className="flex gap-2.5 items-baseline">
              <span className="text-[11px] font-extrabold w-4" style={{ color: '#C75A31' }}>
                {i + 1}
              </span>
              <span className="text-[13px] font-bold text-navy">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Raise hand */}
      {!state.handRaised ? (
        <button
          type="button"
          onClick={() => set({ handRaised: true })}
          className="w-full border-none text-white rounded-2xl text-sm font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2 mb-3"
          style={{ background: '#E06A3E', padding: '15px 0' }}
        >
          <PhIcon name="ph-fill ph-hand-waving" size={16} />
          Raise your hand for open comment
        </button>
      ) : (
        <div
          className="flex items-center gap-[11px] mb-3 animate-fadeup"
          style={{ background: '#E9F6EE', border: '1px solid rgba(42,157,92,0.25)', borderRadius: 16, padding: '14px 16px' }}
        >
          <PhIcon name="ph-fill ph-hand-waving" size={20} color="#2A9D5C" className="flex-shrink-0" />
          <p className="m-0 text-[13px] font-bold" style={{ color: '#228049' }}>
            You&apos;re #3 in the comment queue — we&apos;ll ping you when you&apos;re up.
          </p>
        </div>
      )}

      {/* Proxy */}
      {!state.proxyPick ? (
        <div style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 15px' }}>
          <div onClick={() => set({ proxyOpen: !state.proxyOpen })} className="flex items-center gap-[11px] cursor-pointer">
            <PhIcon name="ph-fill ph-user-switch" size={18} color="#1A3352" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[12.5px] font-bold text-navy">Can&apos;t make it? Assign your vote to a proxy</p>
            <PhIcon name={state.proxyOpen ? 'ph ph-caret-up' : 'ph ph-caret-down'} size={14} color="#A39B8B" />
          </div>
          {state.proxyOpen && (
            <div className="animate-fadeup">
              <div className="flex gap-2 flex-wrap mt-3">
                {PROXY_NAMES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set({ proxyPick: n })}
                    className="text-navy rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans"
                    style={{ border: '1px solid rgba(26,51,82,0.14)', background: '#F9F5EC', padding: '9px 14px' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-[11px] mb-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                Your proxy counts toward quorum and votes on your behalf. Revoke anytime before the meeting.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex items-center gap-[11px] animate-fadeup"
          style={{ background: '#E9F6EE', border: '1px solid rgba(42,157,92,0.25)', borderRadius: 16, padding: '14px 16px' }}
        >
          <PhIcon name="ph-fill ph-seal-check" size={20} color="#2A9D5C" className="flex-shrink-0" />
          <p className="m-0 flex-1 text-[13px] font-bold" style={{ color: '#228049' }}>
            {state.proxyPick} holds your proxy for Jul 15
          </p>
          <button
            type="button"
            onClick={() => set({ proxyPick: null, proxyOpen: false })}
            className="border-none bg-transparent text-xs font-extrabold cursor-pointer font-sans p-1"
            style={{ color: '#8A8375' }}
          >
            Revoke
          </button>
        </div>
      )}
    </div>
  );
}
