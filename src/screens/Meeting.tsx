import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';
import { useVotes, useRepository } from '../data/repo';

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
  const { open: vote } = useVotes();
  const quorum = { count: vote?.quorumCount ?? 0, pct: vote?.quorumPct ?? 0 };
  // Scripted meeting content is demo-only; a stale persisted meetingOpen flag
  // must not surface it in live.
  const demo = useRepository().isDemo();

  if (!state.meetingOpen || !demo) return null;

  return (
    <div
      data-screen-label="Annual Meeting"
      className="pav-scroll pav-fixed absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ meetingOpen: false })} />
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">Juniper Ridge, assembled</h1>
      <p className="m-0 mb-0.5 text-[13.5px] font-semibold text-slatedeep">Annual meeting · Tue Jul 15 · 7 PM</p>
      <p className="m-0 mb-4 text-[12.5px] font-semibold text-slate leading-[1.45]">
        Clubhouse + Zoom · childcare at the clubhouse · minutes posted within 48h
      </p>

      {/*
        The one number the room is watching. Quorum is the hero: the count at
        display size in peach on sky chrome, the denominator beneath it, and
        the sunset sweep — the screen's single warm fill — as the bar.
      */}
      <StackedPanel tint="skydeep" className="mb-3.5">
        <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
          Quorum pledged
        </p>
        <p className="m-0 font-serif text-[36px] leading-[1.1] tabular-nums" style={{ color: 'rgb(var(--peach))' }}>
          {quorum.count}
        </p>
        <p className="m-0 mb-3 text-[13.5px] font-semibold text-mist">of 136 households</p>
        <ProgressBar pct={quorum.pct} height={8} track="rgb(var(--mist) / 0.15)" gradient />
        <p className="m-0 mt-2.5 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
          34 attending remotely · proxies count toward quorum
        </p>
      </StackedPanel>

      {/* Agenda — read, not acted on: flat. */}
      <Card className="mb-3.5">
        <p className="m-0 mb-2.5 font-serif text-[17px] leading-[1.25] text-navy">Agenda</p>
        <ol className="m-0 p-0 list-none flex flex-col gap-2">
          {AGENDA.map((item, i) => (
            <li key={item} className="flex gap-2.5 items-baseline">
              <span className="text-[12.5px] font-bold w-4 flex-shrink-0 tabular-nums" style={{ color: 'rgb(var(--skydeep))' }}>
                {i + 1}
              </span>
              <span className="text-[13.5px] font-bold text-navy leading-[1.4]">{item}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Raise hand — asks for a decision: raised. */}
      {!state.handRaised ? (
        <Card elevation="raised" onClick={() => set({ handRaised: true })} className="mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-skydeep">
              <PhIcon name="ph-fill ph-hand-waving" size={18} color="rgb(var(--mist))" />
            </div>
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy leading-[1.35]">Raise your hand for open comment</p>
            <PhIcon name="ph-bold ph-caret-right" size={16} color="rgb(var(--skydeep))" className="flex-shrink-0" />
          </div>
        </Card>
      ) : (
        <Card tint="mint" className="mb-3 animate-fadeup">
          <div className="flex items-center gap-[11px]">
            <PhIcon name="ph-fill ph-hand-waving" size={20} color="rgb(var(--sagedark))" className="flex-shrink-0" />
            <p className="m-0 text-[13.5px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
              You&apos;re #3 in the comment queue — we&apos;ll ping you when you&apos;re up.
            </p>
          </div>
        </Card>
      )}

      {/* Proxy — also a decision: raised. */}
      {!state.proxyPick ? (
        <Card elevation="raised">
          <button
            type="button"
            onClick={() => set({ proxyOpen: !state.proxyOpen })}
            aria-expanded={state.proxyOpen}
            className="w-full flex items-center gap-3 cursor-pointer border-none bg-transparent text-left font-sans p-0 min-h-[44px]"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
              <PhIcon name="ph-fill ph-user-switch" size={18} color="rgb(var(--skydeep))" />
            </div>
            <p className="m-0 flex-1 text-[13.5px] font-bold text-navy leading-[1.35]">Can&apos;t make it? Assign your vote to a proxy</p>
            <PhIcon name={state.proxyOpen ? 'ph-bold ph-caret-up' : 'ph-bold ph-caret-down'} size={16} color="rgb(var(--skydeep))" className="flex-shrink-0" />
          </button>
          {state.proxyOpen && (
            <div className="animate-fadeup">
              <div className="flex gap-2 flex-wrap mt-3">
                {PROXY_NAMES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => set({ proxyPick: n })}
                    className="text-navy rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans min-h-[44px]"
                    style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--mistpale))', padding: '9px 14px' }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="mt-3 mb-0 text-[12.5px] font-semibold text-slate leading-[1.45]">
                Your proxy counts toward quorum and votes on your behalf. Revoke anytime before the meeting.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card tint="mint" className="animate-fadeup">
          <div className="flex items-center gap-[11px]">
            <PhIcon name="ph-fill ph-seal-check" size={20} color="rgb(var(--sagedark))" className="flex-shrink-0" />
            <p className="m-0 flex-1 text-[13.5px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
              {state.proxyPick} holds your proxy for Jul 15
            </p>
            <button
              type="button"
              onClick={() => set({ proxyPick: null, proxyOpen: false })}
              className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer font-sans px-2 min-h-[44px] text-slatedark"
            >
              Revoke
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}
