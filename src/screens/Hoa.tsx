import { useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { StatusTimeline } from '../components/StatusTimeline';
import { Confetti } from '../components/Confetti';
import { usePavStore } from '../store/store';
import { useVotes, useArc, useRepository } from '../data/repo';

const DUES_LEGEND = [
  { label: 'Landscaping', amount: '$78', color: 'rgb(var(--sage))' },
  { label: 'Reserves', amount: '$71', color: 'rgb(var(--navy))' },
  { label: 'Insurance', amount: '$54', color: 'rgb(var(--ember))' },
  { label: 'Utilities', amount: '$48', color: 'rgb(var(--gold))' },
  { label: 'Management', amount: '$34', color: 'rgb(var(--stonelight))' },
];

const FORECAST_BARS = [
  { year: "'26", height: 47, color: 'rgb(var(--sagemist))' },
  { year: "'27", height: 49, color: 'rgb(var(--sagesoft))' },
  { year: "'28", height: 51, color: 'rgb(var(--sagecool))' },
  { year: "'29", height: 54, color: 'rgb(var(--sagelight))' },
  { year: "'30", height: 57, color: 'rgb(var(--sagemid))' },
  { year: "'31", height: 60, color: 'rgb(var(--sage))' },
];

const DECISIONS = [
  { date: 'JUN 18', text: 'Approved fence colors expanded to five', pill: 'Passed 91–22', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' },
  { date: 'MAY 30', text: 'Snow-removal contract renewed, 2 yrs', pill: 'Passed 104–9', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' },
  { date: 'MAY 12', text: 'Speed bumps on Alder Way', pill: 'Declined 48–71', bg: 'rgb(var(--blush))', color: 'rgb(var(--terracotta))' },
];

/** HOA screen — ported from prototype lines 630-828. */
export function Hoa() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const { open: vote } = useVotes();
  const [forecastOpen, setForecastOpen] = useState(false);

  const notVoted = !!vote && !vote.myVote;
  const hasVoted = !!vote?.myVote;
  const votedLabel = vote?.myVote === 'yes' ? vote.yesLabel : vote?.noLabel ?? '';
  const voteYes = () => { if (vote) repo.castVote(vote.id, 'yes'); };
  const voteNo = () => { if (vote) repo.castVote(vote.id, 'no'); };

  const arc = useArc();

  return (
    <div className="absolute inset-0 overflow-y-auto pav-scroll" style={{ padding: '64px 18px 150px' }}>
      <h1 className="m-0 mb-1 font-serif font-normal text-[28px] text-navy">The HOA, in the open</h1>
      <p className="m-0 mb-[18px] text-[13.5px] font-semibold text-taupe">
        Every dollar, vote, and decision — visible to every household.
      </p>

      {/* Open vote */}
      {vote ? (
        <div className="bg-navy rounded-[20px] p-[18px] mb-3.5 text-cream">
          <p
            className="m-0 mb-1.5 text-[11px] font-bold uppercase"
            style={{ letterSpacing: '0.12em', color: 'rgb(var(--peach))' }}
          >
            {vote.closesLabel}
          </p>
          <p className="m-0 mb-1 font-serif text-[18px] leading-[1.3]">{vote.title}</p>
          <p className="m-0 mb-3.5 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--cream) / 0.65)' }}>
            {vote.subtitle}
          </p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11.5px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
              QUORUM
            </span>
            <span className="text-[11.5px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
              {vote.quorumCount} of {vote.quorumTotal} households
            </span>
          </div>
          <div className="mb-3.5">
            <ProgressBar pct={vote.quorumPct} height={8} track="rgb(var(--cream) / 0.15)" gradient />
          </div>

          {notVoted && (
            <div className="flex gap-2.5">
              <button
                onClick={voteYes}
                className="flex-1 border-none rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
                style={{ background: 'rgb(var(--ember))', color: 'rgb(var(--white))' }}
              >
                {vote.yesLabel}
              </button>
              <button
                onClick={voteNo}
                className="flex-1 bg-transparent rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
                style={{ border: '1.5px solid rgb(var(--cream) / 0.3)', color: 'rgb(var(--cream))' }}
              >
                {vote.noLabel}
              </button>
            </div>
          )}

          {hasVoted && (
            <div className="animate-fadeup">
              <div
                className="relative rounded-[13px] px-3.5 py-3 flex items-center gap-2.5"
                style={{ background: 'rgb(var(--sage) / 0.18)', border: '1px solid rgb(var(--sage) / 0.4)' }}
              >
                <Confetti />
                <PhIcon name="ph-fill ph-seal-check" size={20} color="rgb(var(--sagebright))" className="flex-shrink-0" />
                <p className="m-0 text-[13px] font-bold text-cream">
                  You voted <strong>{votedLabel}</strong> · ballot receipt {vote.receipt} · secret ballot
                </p>
              </div>
              <div className="mt-3.5">
                <div className="flex items-center gap-2 mb-[7px]">
                  <span className="w-8 text-[11px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
                    YES
                  </span>
                  <div className="flex-1">
                    <ProgressBar pct={vote.yesPct} height={9} track="rgb(var(--cream) / 0.12)" gradient />
                  </div>
                  <span
                    className="w-[62px] text-right text-[11px] font-bold"
                    style={{ color: 'rgb(var(--cream) / 0.85)' }}
                  >
                    {vote.yesCount} · {vote.yesPct}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[11px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
                    NO
                  </span>
                  <div className="flex-1">
                    <ProgressBar pct={100 - vote.yesPct} height={9} track="rgb(var(--cream) / 0.12)" color="rgb(var(--cream) / 0.55)" />
                  </div>
                  <span
                    className="w-[62px] text-right text-[11px] font-bold"
                    style={{ color: 'rgb(var(--cream) / 0.85)' }}
                  >
                    {vote.noCount} · {100 - vote.yesPct}%
                  </span>
                </div>
                <p className="mt-[9px] mb-0 text-[11px] font-bold" style={{ color: 'rgb(var(--cream) / 0.55)' }}>
                  Live tally · needs 50% of {vote.quorumTotal} households by Thursday
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="bg-paper rounded-[20px] p-[18px] mb-3.5 text-center"
          style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
        >
          <PhIcon name="ph-fill ph-scales" size={26} color="rgb(var(--claypale))" />
          <p className="m-0 mt-2 text-[13.5px] font-bold text-navy">No open votes</p>
          <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-stone">
            When your board opens a ballot, it’ll appear here.
          </p>
        </div>
      )}

      {/* Annual meeting */}
      <div
        onClick={() => set({ meetingOpen: true })}
        className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer mb-3.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-goldpale">
          <PhIcon name="ph-fill ph-users-four" size={21} color="rgb(var(--gold))" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 mb-0.5 text-sm font-bold text-navy">Annual meeting · Tue, Jul 15</p>
          <p className="m-0 text-xs font-semibold text-stone">
            7 PM · Clubhouse + Zoom · 2 board seats open
          </p>
        </div>
        <span className="text-[13px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--terracotta))' }}>
          Preview →
        </span>
      </div>

      {/* Where dues go */}
      <div
        className="bg-paper rounded-[20px] p-[18px] mb-3.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <p className="m-0 mb-0.5 font-serif text-[17px] text-navy">Your $285, itemized</p>
        <p className="m-0 mb-3.5 text-xs font-semibold text-stone">
          July 2026 · unchanged from June
        </p>
        <div className="flex h-3.5 rounded-full overflow-hidden mb-3.5">
          <div style={{ width: '27%', background: 'rgb(var(--sage))' }} />
          <div style={{ width: '25%', background: 'rgb(var(--navy))' }} />
          <div style={{ width: '19%', background: 'rgb(var(--ember))' }} />
          <div style={{ width: '17%', background: 'rgb(var(--gold))' }} />
          <div style={{ width: '12%', background: 'rgb(var(--stonelight))' }} />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {DUES_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-[7px]">
              <span className="w-[9px] h-[9px] rounded-[3px] flex-shrink-0" style={{ background: item.color }} />
              <span className="flex-1 text-[12.5px] font-bold text-bark">
                {item.label}
              </span>
              <span className="text-[12.5px] font-bold text-navy">{item.amount}</span>
            </div>
          ))}
        </div>
        <div
          className="mt-3.5 pt-[13px] flex items-center justify-between gap-2.5"
          style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}
        >
          <div>
            <p className="m-0 mb-px text-[12.5px] font-bold text-navy">Reserve fund · 82% funded</p>
            <p className="m-0 text-[11.5px] font-semibold text-stone">
              $414K of $505K recommended · study Jan 2026
            </p>
          </div>
          <div className="w-24 flex-shrink-0">
            <ProgressBar pct={82} height={8} color="rgb(var(--sage))" track="rgb(var(--sand))" />
          </div>
        </div>
        <div className="mt-3.5 pt-[13px]" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
          <div
            onClick={() => setForecastOpen(!forecastOpen)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <p className="m-0 text-[12.5px] font-bold text-navy">Funding forecast</p>
            <div className="flex items-center gap-1.5">
              <span
                className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold"
                style={{ color: 'rgb(var(--sagedark))', background: 'rgb(var(--mint))' }}
              >
                Healthy through 2032
              </span>
              <PhIcon name={forecastOpen ? 'ph ph-caret-up' : 'ph ph-caret-down'} size={13} color="rgb(var(--stonelight))" />
            </div>
          </div>
          {forecastOpen && (
            <div className="animate-fadeup mt-2.5">
              <div className="relative h-[78px]">
                <div className="absolute left-0 right-0" style={{ top: 20, borderTop: '1.5px dashed rgb(var(--terracotta) / 0.45)' }} />
                <span
                  className="absolute right-0 bg-paper px-[3px] text-[9.5px] font-bold"
                  style={{ top: 6, color: 'rgb(var(--terracotta))' }}
                >
                  70% healthy line
                </span>
                <div className="absolute inset-0 flex items-end gap-2">
                  {FORECAST_BARS.map((bar) => (
                    <div key={bar.year} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                      <div className="w-full rounded-t-[5px]" style={{ height: bar.height, background: bar.color }} />
                      <span className="text-[9.5px] font-bold text-stonelight">
                        {bar.year}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-[9px] mb-0 text-[11px] font-semibold text-stone">
                No special assessment projected. Reserves stay above the healthy line through 2032.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ARC */}
      <div
        className="bg-paper rounded-[20px] p-[18px] mb-3.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <div className="flex items-center justify-between gap-2.5 mb-3">
          <p className="m-0 font-serif text-[17px] text-navy">Architectural requests</p>
          <button
            onClick={() => set({ arcSheetOpen: true })}
            className="rounded-full px-3 py-1.5 text-xs font-extrabold cursor-pointer bg-transparent"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', color: 'rgb(var(--navy))' }}
          >
            + New request
          </button>
        </div>

        {arc.requests.length === 0 ? (
          <p className="m-0 py-1 text-[12.5px] font-semibold text-stone">
            No requests yet. Start one with “+ New request”.
          </p>
        ) : (
          arc.requests.map((r, i) => (
            <div
              key={r.id}
              onClick={() => set({ arcDetailId: r.id })}
              className={`bg-cream rounded-2xl px-3.5 py-[13px] cursor-pointer${i < arc.requests.length - 1 ? ' mb-2.5' : ''}`}
            >
              <div className="flex items-center justify-between gap-2.5 mb-3">
                <p className="m-0 text-[13.5px] font-bold text-navy">{r.title} · {r.ref}</p>
                <span
                  className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                  style={{
                    background: r.approved ? 'rgb(var(--mint))' : 'rgb(var(--blush))',
                    color: r.approved ? 'rgb(var(--sagedark))' : 'rgb(var(--terracotta))',
                  }}
                >
                  {r.statusLabel}
                </span>
              </div>
              <StatusTimeline steps={r.steps} />
            </div>
          ))
        )}
      </div>

      {/* Known issues */}
      <div
        className="bg-paper rounded-[20px] p-[18px] mb-3.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <p className="m-0 mb-[3px] font-serif text-[17px] text-navy">Known issues</p>
        <p className="m-0 mb-3 text-xs font-semibold text-stone">
          Live from the board&apos;s queue — no more &quot;did anyone report this?&quot;
        </p>
        <div
          onClick={() => set({ issueDetailId: 'streetlight' })}
          className="flex items-center gap-[11px] pb-2.5 mb-2.5 cursor-pointer"
          style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
        >
          <PhIcon name="ph-fill ph-lightbulb" size={16} color="rgb(var(--gold))" className="flex-shrink-0" />
          <span className="flex-1 text-[13px] font-bold text-navy">Streetlight · Alder Way</span>
          <span
            className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0"
            style={{
              background: state.reportTicketed ? 'rgb(var(--mint))' : 'rgb(var(--goldpale))',
              color: state.reportTicketed ? 'rgb(var(--sagedark))' : 'rgb(var(--golddark))',
            }}
          >
            {state.reportTicketed ? 'BrightPath · assigned' : 'In triage'}
          </span>
        </div>
        <div
          onClick={() => set({ issueDetailId: 'pool-gate' })}
          className="flex items-center gap-[11px] pb-2.5 mb-2.5 cursor-pointer"
          style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
        >
          <PhIcon name="ph-fill ph-wrench" size={16} color="rgb(var(--terracotta))" className="flex-shrink-0" />
          <span className="flex-1 text-[13px] font-bold text-navy">Pool gate latch</span>
          <span
            className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0"
            style={{
              background: state.gateScheduled ? 'rgb(var(--mint))' : 'rgb(var(--goldpale))',
              color: state.gateScheduled ? 'rgb(var(--sagedark))' : 'rgb(var(--golddark))',
            }}
          >
            {state.gateScheduled ? 'AquaFix · Thu Jul 3' : 'Reported · 2×'}
          </span>
        </div>
        <div onClick={() => set({ issueDetailId: 'irrigation' })} className="flex items-center gap-[11px] cursor-pointer">
          <PhIcon name="ph-fill ph-check-circle" size={16} color="rgb(var(--stonelight))" className="flex-shrink-0" />
          <span className="flex-1 text-[13px] font-bold text-stone">
            Irrigation valve · the Green
          </span>
          <span
            className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0 bg-sand"
            style={{ color: 'rgb(var(--barkgray))' }}
          >
            Fixed Jun 24
          </span>
        </div>
      </div>

      {/* Decisions log */}
      <div
        className="bg-paper rounded-[20px] p-[18px] mb-3.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <p className="m-0 mb-[3px] font-serif text-[17px] text-navy">Decisions log</p>
        <p className="m-0 mb-3 text-xs font-semibold text-stone">
          Every board decision, searchable forever. No more relitigating 2019.
        </p>
        <div className="flex flex-col">
          {DECISIONS.map((d, i) => (
            <div
              key={d.text}
              onClick={() => set({ decisionDetailIdx: i })}
              className="flex items-center gap-[11px] py-2.5 cursor-pointer"
              style={i < DECISIONS.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
            >
              <span className="w-11 flex-shrink-0 text-[11px] font-bold text-stonelight">
                {d.date}
              </span>
              <span className="flex-1 text-[13px] font-bold text-navy">{d.text}</span>
              <span
                className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0"
                style={{ background: d.bg, color: d.color }}
              >
                {d.pill}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Docs + AI */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => set({ docsOpen: true, docReader: false })}
          className="bg-paper rounded-[18px] p-[15px] cursor-pointer"
          style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
        >
          <PhIcon name="ph-fill ph-files" size={22} color="rgb(var(--navy))" />
          <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold text-navy">Documents</p>
          <p className="m-0 text-[11.5px] font-semibold text-stone">
            CC&amp;Rs · Bylaws · Budget · Minutes
          </p>
        </div>
        <div
          onClick={() => set({ aiOpen: true })}
          className="rounded-[18px] p-[15px] cursor-pointer text-white"
          style={{ background: 'linear-gradient(150deg,rgb(var(--ember)),rgb(var(--terracotta)))' }}
        >
          <PhIcon name="ph-fill ph-sparkle" size={22} color="rgb(var(--white))" />
          <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold">Ask AI</p>
          <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--white) / 0.85)' }}>
            &quot;Can I paint my fence black?&quot;
          </p>
        </div>
      </div>
    </div>
  );
}
