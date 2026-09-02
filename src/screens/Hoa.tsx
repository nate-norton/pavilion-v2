import { useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { Hint } from '../components/Hint';
import { emitAppSuccess } from '../lib/errorBus';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { StatusTimeline } from '../components/StatusTimeline';
import { StackedCards, StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';
import { useVotes, useArc, useIssues, useDecisions, useMeetings, useMember, useLoadState, useRepository } from '../data/repo';
import type { OpenVote } from '../data/repo';

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

const ISSUE_TONES = {
  gold: { bg: 'rgb(var(--goldpale))', color: 'rgb(var(--golddark))' },
  mint: { bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' },
  sand: { bg: 'rgb(var(--sand))', color: 'rgb(var(--stone))' },
} as const;


/**
 * Renders a real <button> when the row actually does something, and a plain
 * <div> when it does not. Known-issue and decision rows are only tappable in
 * the demo; making them buttons unconditionally would put focusable controls
 * in a live resident's tab order that do nothing when activated.
 */
function RowShell({ interactive, onClick, className, style, children }: {
  interactive: boolean; onClick: () => void; className: string;
  style?: React.CSSProperties; children: React.ReactNode;
}) {
  if (!interactive) return <div className={className} style={style}>{children}</div>;
  return (
    <button type="button" onClick={onClick} className={`w-full border-none bg-transparent font-sans text-left ${className}`} style={style}>
      {children}
    </button>
  );
}

/** HOA screen — ported from prototype lines 630-828. */
export function Hoa() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const { openAll, closed } = useVotes();
  const [forecastOpen, setForecastOpen] = useState(false);

  const arc = useArc();
  const issues = useIssues();
  const decisions = useDecisions();
  const meetings = useMeetings();
  // Demo-flavor panels (finance breakdown, meeting) have no live data domain
  // yet — a live community hides them rather than showing fabricated numbers.
  const demo = repo.isDemo();
  const member = useMember();
  // Empty states are a dead end for the one person who can fill them, so the
  // board gets an action where residents get an honest wait.
  const isBoard = !demo && member?.role === 'board';
  const votesLoad = useLoadState('votes');

  return (
    <div className="absolute inset-0 overflow-y-auto pav-scroll" style={{ padding: '64px 18px 150px' }}>
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">The HOA, in the open</h1>
      <p className="m-0 mb-[18px] text-[13.5px] font-semibold text-taupe">
        Every dollar, vote, and decision — visible to every household.
      </p>

      {/*
       * Open votes (live can carry several at once; the demo has its one),
       * with the annual meeting tucked under the last ballot. The empty state
       * stays outside the stack — nothing to layer against.
       */}
      {openAll.length > 0 ? (
        <StackedCards overlap={22} className="mb-3.5">
          {openAll.map((v) => <VoteCard key={v.id} vote={v} demo={demo} />)}
          {demo && (
          <StackedPanel flush className="px-4 pb-3.5 pt-[22px]">
            <button type="button"
              onClick={() => set({ meetingOpen: true })}
              className="w-full border-none bg-transparent font-sans text-left flex items-center gap-3 cursor-pointer"
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
            </button>
          </StackedPanel>
          )}
        </StackedCards>
      ) : (
        <div className="mb-3.5">
          <EmptyState
            icon="ph-fill ph-scales"
            title="No open votes"
            body={
              isBoard
                ? 'Put a decision to the community and every household sees the tally and quorum as it happens.'
                : 'When your board opens a ballot, it’ll appear here.'
            }
            status={votesLoad}
            actionLabel={isBoard ? 'Open a vote' : undefined}
            onAction={isBoard ? () => set({ boardMode: true, boardTab: 'desk', voteDraftOpen: true }) : undefined}
          />
        </div>
      )}

      {/*
       * Annual meeting (demo-only until a meetings domain exists). With an
       * open ballot it renders tucked under the stack above instead.
       */}
      {demo && openAll.length === 0 && (
      <button type="button"
        onClick={() => set({ meetingOpen: true })}
        className="w-full border-none font-sans text-left bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer mb-3.5"
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
      </button>
      )}

      {/* Live meetings — board-scheduled, minutes downloadable */}
      {!demo && meetings.length > 0 && (
        <div className="bg-paper rounded-[18px] p-4 mb-3.5" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-2 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Meetings
          </p>
          {meetings.map((m, i) => (
            <div key={m.id} className="py-2" style={i < meetings.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}>
              <div className="flex items-center gap-2">
                <p className="m-0 flex-1 text-[13.5px] font-bold text-navy">{m.title}</p>
                {m.minutesUrl ? (
                  <a href={m.minutesUrl} target="_blank" rel="noreferrer" className="text-[12px] font-extrabold no-underline" style={{ color: 'rgb(var(--terracotta))' }}>
                    Minutes →
                  </a>
                ) : (
                  <span className="text-[11px] font-bold text-stone">{m.status === 'past' ? 'Held' : 'Upcoming'}</span>
                )}
              </div>
              <p className="m-0 text-[12px] font-semibold text-stone">
                {[m.whenLabel, m.whereLabel].filter(Boolean).join(' · ')}
              </p>
              {m.agenda.length > 0 && m.status !== 'past' && (
                <p className="m-0 mt-1 text-[12px] font-semibold text-stone">
                  Agenda: {m.agenda.join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Past votes — the results archive */}
      {closed.length > 0 && (
        <div className="bg-paper rounded-[18px] p-4 mb-3.5" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-2 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Past votes
          </p>
          {closed.map((c, i) => (
            <div key={c.id} className="py-2" style={i < closed.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}>
              <p className="m-0 text-[13px] font-bold text-navy">{c.title}</p>
              <p className="m-0 text-[12px] font-semibold text-stone">{c.resultLabel} · {c.dateLabel}</p>
            </div>
          ))}
        </div>
      )}

      {/* Where dues go (demo-only until a finance domain exists) */}
      {demo && (
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
          <button type="button"
            onClick={() => setForecastOpen(!forecastOpen)}
            className="w-full border-none font-sans bg-transparent text-left flex items-center justify-between gap-2 cursor-pointer py-1"
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
          </button>
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
      )}

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
            <button
              type="button"
              key={r.id}
              onClick={() => set({ arcDetailId: r.id })}
              className={`w-full border-none font-sans text-left bg-cream rounded-2xl px-3.5 py-[13px] cursor-pointer${i < arc.requests.length - 1 ? ' mb-2.5' : ''}`}
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
            </button>
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
        {issues.length === 0 ? (
          <p className="m-0 py-1 text-[12.5px] font-semibold text-stone">
            Nothing reported right now — issues you or the board log appear here.
          </p>
        ) : (
          issues.map((issue, i) => (
            <RowShell
              key={issue.id}
              interactive={demo}
              onClick={() => set({ issueDetailId: issue.id })}
              className={`flex items-center gap-[11px]${i < issues.length - 1 ? ' pb-2.5 mb-2.5' : ''}${demo ? ' cursor-pointer' : ''}`}
              style={i < issues.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
            >
              <PhIcon name={issue.icon} size={16} color={issue.iconColor} className="flex-shrink-0" />
              <span className={`flex-1 text-[13px] font-bold ${issue.resolved ? 'text-stone' : 'text-navy'}`}>
                {issue.title}
              </span>
              <span
                className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0"
                style={{ background: ISSUE_TONES[issue.tone].bg, color: ISSUE_TONES[issue.tone].color }}
              >
                {issue.statusLabel}
              </span>
            </RowShell>
          ))
        )}
        <button
          onClick={() => set({ reportOpen: true })}
          className="w-full mt-3 rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy flex items-center justify-center gap-2"
          style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
        >
          <PhIcon name="ph-fill ph-shield-check" size={15} />
          Report an issue — privately, to the board
        </button>
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
        {decisions.length === 0 ? (
          <p className="m-0 py-1 text-[12.5px] font-semibold text-stone">
            No decisions logged yet. Board votes and rulings land here.
          </p>
        ) : (
          <div className="flex flex-col">
            {decisions.map((d, i) => (
              <RowShell
                key={d.id}
                interactive={demo}
                onClick={() => set({ decisionDetailIdx: i })}
                className={`flex items-center gap-[11px] py-2.5${demo ? ' cursor-pointer' : ''}`}
                style={i < decisions.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
              >
                <span className="w-11 flex-shrink-0 text-[11px] font-bold text-stonelight">
                  {d.dateLabel}
                </span>
                <span className="flex-1 text-[13px] font-bold text-navy">{d.text}</span>
                <span
                  className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0"
                  style={{
                    background: d.passed ? 'rgb(var(--mint))' : 'rgb(var(--blush))',
                    color: d.passed ? 'rgb(var(--sagedark))' : 'rgb(var(--terracotta))',
                  }}
                >
                  {d.pillLabel}
                </span>
              </RowShell>
            ))}
          </div>
        )}
      </div>

      {/*
        Docs, and — in the demo, where the assistant actually answers — AI.
        Live has no assistant, so the tile that would advertise one is gone and
        Documents takes the full width rather than pairing with a dead card.
      */}
      <div className={demo ? 'grid grid-cols-2 gap-2.5' : ''}>
        <button type="button"
          onClick={() => set({ docsOpen: true, docReader: false })}
          className="w-full border-none font-sans text-left bg-paper rounded-[18px] p-[15px] cursor-pointer"
          style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
        >
          <PhIcon name="ph-fill ph-files" size={22} color="rgb(var(--navy))" />
          <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold text-navy">Documents</p>
          <p className="m-0 text-[11.5px] font-semibold text-stone">
            CC&amp;Rs · Bylaws · Budget · Minutes
          </p>
        </button>
        {demo && (
          <button type="button"
            onClick={() => set({ aiOpen: true })}
            className="w-full border-none font-sans bg-transparent text-left rounded-[18px] p-[15px] cursor-pointer text-white"
            style={{ background: 'linear-gradient(150deg,rgb(var(--emberdeep)),rgb(var(--embershade)))' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={22} color="rgb(var(--white))" />
            <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold">Ask AI</p>
            <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--white) / 0.92)' }}>
              &quot;Can I paint my fence black?&quot;
            </p>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * One open ballot. Yes/no ballots keep the classic two-button card the demo
 * ships; options ballots render N choices (single tap, or multi-select with a
 * cast button). Live voters can change their ballot while it's open.
 */
function VoteCard({ vote, demo }: { vote: OpenVote; demo: boolean }) {
  const repo = useRepository();
  const [changing, setChanging] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  const [casting, setCasting] = useState<string | null>(null);

  const isOptions = vote.kind === 'options';
  const hasVoted = isOptions ? vote.myOptionIds.length > 0 : !!vote.myVote;
  const showBallot = !hasVoted || changing;
  const votedLabel = vote.myVote === 'yes' ? vote.yesLabel : vote.noLabel;

  // Casting is the highest-stakes action in the product and used to give no
  // feedback until the round trip finished — 1-3s of silence on cell service,
  // which is exactly how a resident ends up tapping twice.
  const castYesNo = (choice: 'yes' | 'no') => {
    if (casting) return;
    setCasting(choice);
    void repo.castVote(vote.id, choice)
      .then(() => { setChanging(false); emitAppSuccess('Your ballot is recorded.'); })
      .finally(() => setCasting(null));
  };
  const castOptions = (ids: string[]) => {
    if (!ids.length || casting) return;
    setCasting('options');
    void repo.castOptionVote(vote.id, ids)
      .then(() => { setChanging(false); setPicks([]); emitAppSuccess('Your ballot is recorded.'); })
      .finally(() => setCasting(null));
  };
  const optionTotal = vote.options.reduce((n, o) => n + o.tally, 0);

  return (
    <StackedPanel tint="navy" className="text-cream">
      <p
        className="m-0 mb-1.5 text-[11px] font-bold uppercase"
        style={{ letterSpacing: '0.12em', color: 'rgb(var(--peach))' }}
      >
        {vote.closesLabel}
      </p>
      <p className="m-0 mb-1 font-serif text-[17px] leading-[1.3]">{vote.title}</p>
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
      <div className="mb-1.5">
        <ProgressBar pct={vote.quorumPct} height={8} track="rgb(var(--cream) / 0.15)" gradient />
      </div>
      <div className="mb-3.5">
        <Hint label="What is quorum?" onDark>
          Enough households have to vote for the result to count at all. Until
          the bar fills, the outcome is not binding no matter how one-sided the
          tally looks — which is why a vote you agree with still needs yours.
        </Hint>
      </div>

      {/* Ballot — yes/no */}
      {!isOptions && showBallot && (
        <div className="flex gap-2.5">
          <button
            onClick={() => castYesNo('yes')}
            disabled={!!casting}
            aria-busy={casting === 'yes'}
            className="flex-1 border-none rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
            style={{ background: 'rgb(var(--emberdeep))', color: 'rgb(var(--white))', opacity: casting && casting !== 'yes' ? 0.5 : 1 }}
          >
            {casting === 'yes' ? 'Recording…' : vote.yesLabel}
          </button>
          <button
            onClick={() => castYesNo('no')}
            disabled={!!casting}
            aria-busy={casting === 'no'}
            className="flex-1 bg-transparent rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
            style={{ border: '1.5px solid rgb(var(--cream) / 0.3)', color: 'rgb(var(--cream))', opacity: casting && casting !== 'no' ? 0.5 : 1 }}
          >
            {casting === 'no' ? 'Recording…' : vote.noLabel}
          </button>
        </div>
      )}

      {/* Ballot — options */}
      {isOptions && showBallot && (
        <div className="flex flex-col gap-2">
          {vote.options.map((o) => {
            const picked = picks.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => {
                  if (vote.multi) {
                    setPicks(picked ? picks.filter((p) => p !== o.id) : [...picks, o.id]);
                  } else {
                    castOptions([o.id]);
                  }
                }}
                className="w-full rounded-[13px] py-3 px-3.5 text-left text-sm font-extrabold cursor-pointer"
                style={picked
                  ? { background: 'rgb(var(--emberdeep))', border: '1.5px solid rgb(var(--emberdeep))', color: 'rgb(var(--white))' }
                  : { background: 'transparent', border: '1.5px solid rgb(var(--cream) / 0.3)', color: 'rgb(var(--cream))' }}
              >
                {vote.multi && <span className="mr-2">{picked ? '☑' : '☐'}</span>}
                {o.label}
              </button>
            );
          })}
          {vote.multi && (
            <button
              onClick={() => castOptions(picks)}
              className="w-full border-none rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
              style={{ background: picks.length ? 'rgb(var(--emberdeep))' : 'rgb(var(--cream) / 0.15)', color: 'rgb(var(--white))' }}
            >
              Cast ballot{picks.length > 1 ? ` · ${picks.length} picks` : ''}
            </button>
          )}
        </div>
      )}

      {/* Voted — yes/no tally */}
      {!isOptions && hasVoted && !changing && (
        <div className="animate-fadeup">
          <div
            className="relative rounded-[13px] px-3.5 py-3 flex items-center gap-2.5"
            style={{ background: 'rgb(var(--sage) / 0.18)', border: '1px solid rgb(var(--sage) / 0.4)' }}
          >
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
              {demo
                ? `Live tally · needs 50% of ${vote.quorumTotal} households by Thursday`
                : `Live tally · one ballot per household · ${vote.quorumTotal} households`}
            </p>
          </div>
          {!demo && (
            <button
              onClick={() => setChanging(true)}
              className="mt-2.5 bg-transparent border-none p-0 text-[12px] font-extrabold cursor-pointer underline"
              style={{ color: 'rgb(var(--cream) / 0.7)' }}
            >
              Change my vote
            </button>
          )}
        </div>
      )}

      {/* Voted — options tally */}
      {isOptions && hasVoted && !changing && (
        <div className="animate-fadeup">
          <div
            className="relative rounded-[13px] px-3.5 py-3 flex items-center gap-2.5 mb-3.5"
            style={{ background: 'rgb(var(--sage) / 0.18)', border: '1px solid rgb(var(--sage) / 0.4)' }}
          >
            <PhIcon name="ph-fill ph-seal-check" size={20} color="rgb(var(--sagebright))" className="flex-shrink-0" />
            <p className="m-0 text-[13px] font-bold text-cream">
              Ballot received · receipt {vote.receipt} · secret ballot
            </p>
          </div>
          {vote.options.map((o) => {
            const pct = optionTotal ? Math.round((o.tally / optionTotal) * 100) : 0;
            const mine = vote.myOptionIds.includes(o.id);
            return (
              <div key={o.id} className="flex items-center gap-2 mb-[7px]">
                <span className="flex-1 text-[12px] font-bold truncate" style={{ color: 'rgb(var(--cream) / 0.85)' }}>
                  {mine ? '✓ ' : ''}{o.label}
                </span>
                <div className="w-[110px]">
                  <ProgressBar pct={pct} height={9} track="rgb(var(--cream) / 0.12)" gradient={mine} color={mine ? undefined : 'rgb(var(--cream) / 0.55)'} />
                </div>
                <span className="w-[52px] text-right text-[11px] font-bold" style={{ color: 'rgb(var(--cream) / 0.85)' }}>
                  {o.tally} · {pct}%
                </span>
              </div>
            );
          })}
          <button
            onClick={() => { setChanging(true); setPicks(vote.myOptionIds); }}
            className="mt-2 bg-transparent border-none p-0 text-[12px] font-extrabold cursor-pointer underline"
            style={{ color: 'rgb(var(--cream) / 0.7)' }}
          >
            Change my vote
          </button>
        </div>
      )}
    </StackedPanel>
  );
}
