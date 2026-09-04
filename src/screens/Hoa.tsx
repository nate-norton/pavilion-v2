import { useState, type CSSProperties, type ReactNode } from 'react';
import { DUES_CATEGORIES } from '../lib/dues';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Hint } from '../components/Hint';
import { Pill, type PillTone } from '../components/Pill';
import { PILL_TONES } from '../components/pillTones';
import { SectionHeading } from '../components/SectionHeading';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { StatusTimeline } from '../components/StatusTimeline';
import { StackedCards, StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';
import { useVotes, useArc, useIssues, useDecisions, useMeetings, useMember, useLoadState, useRepository } from '../data/repo';
import type { ArcRequest, KnownIssue, OpenVote } from '../data/repo';

/*
 * Sunset is spent once on this screen, on the quorum bar. The dues chart
 * used to carry it a second time (Insurance) and its legend disagreed with
 * its bar (Reserves was navy in one and skydeep in the other); the five
 * categories now share one list and none of them is the accent.
 */

const FORECAST_BARS = [
  { year: "'26", height: 47, color: 'rgb(var(--sagemist))' },
  { year: "'27", height: 49, color: 'rgb(var(--sagesoft))' },
  { year: "'28", height: 51, color: 'rgb(var(--sagecool))' },
  { year: "'29", height: 54, color: 'rgb(var(--sagelight))' },
  { year: "'30", height: 57, color: 'rgb(var(--sagemid))' },
  { year: "'31", height: 60, color: 'rgb(var(--sage))' },
];

/** Known-issue row tone → the shared Pill vocabulary. */
const ISSUE_TONE: Record<KnownIssue['tone'], PillTone> = {
  gold: 'warning',
  mint: 'success',
  skyborder: 'neutral',
};

/*
 * ARC status → tone. Declined and In review used to share a colour, so a
 * refused request looked like a pending one. The demo rows carry only
 * `approved`, so they fall through to the same map via the boolean.
 */
const ARC_TONE: Record<string, PillTone> = {
  approved: 'success',
  in_review: 'info',
  submitted: 'info',
  info_requested: 'warning',
  declined: 'danger',
};
function arcTone(r: Pick<ArcRequest, 'status' | 'approved'>): PillTone {
  const status = r.status ?? (r.approved ? 'approved' : 'in_review');
  return ARC_TONE[status] ?? 'info';
}

/** Warm control on a light bed: peach with navy text (9.96:1). One per screen. */
const PEACH_CONTROL: CSSProperties = {
  background: 'rgb(var(--peach))',
  color: 'rgb(var(--navy))',
  border: '1px solid rgb(var(--navy) / 0.1)',
};

/** Staggered entry: each section arrives a beat after the one above it. */
function enter(i: number): CSSProperties {
  return { animationDelay: `${i * 45}ms` };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/**
 * Renders a real <button> when the row actually does something, and a plain
 * <div> when it does not. Known-issue and decision rows are only tappable in
 * the demo; making them buttons unconditionally would put focusable controls
 * in a live resident's tab order that do nothing when activated.
 */
function RowShell({ interactive, onClick, className, style, children }: {
  interactive: boolean; onClick: () => void; className: string;
  style?: CSSProperties; children: ReactNode;
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
  const arcLoad = useLoadState('arc');
  const goToDesk = () => set({ boardMode: true, boardTab: 'desk' });

  const openIssues = issues.filter((i) => !i.resolved).length;
  const fixedIssues = issues.length - openIssues;
  const upcomingMeetings = meetings.filter((m) => m.status !== 'past').length;
  const arcOpen = arc.requests.filter((r) => !r.approved && r.status !== 'declined').length;
  const arcMeta = arc.requests.length === 0
    ? 'Nothing in review'
    : arcOpen > 0 ? `${plural(arcOpen, 'request')} in review` : `${plural(arc.requests.length, 'request')} decided`;

  // Below the list rather than beside the title: "Architectural requests"
  // plus a pill does not fit a 393px line, and a wrapped title next to a
  // control is the kind of thing that reads as unfinished.
  const newRequestButton = (
    <button
      type="button"
      onClick={() => set({ arcSheetOpen: true })}
      className="w-full rounded-xl px-3 text-[13.5px] font-extrabold cursor-pointer bg-paper font-sans text-navy flex items-center justify-center gap-1.5"
      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', minHeight: 44 }}
    >
      <PhIcon name="ph-bold ph-plus" size={14} color="rgb(var(--navy))" />
      New request
    </button>
  );

  const annualMeetingPanel = demo && (
    <StackedPanel flush className="px-4 pb-3.5 pt-[26px]">
      <button type="button"
        onClick={() => set({ meetingOpen: true })}
        className="w-full border-none bg-transparent font-sans text-left flex items-center gap-3 cursor-pointer"
        style={{ minHeight: 44 }}
      >
        <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-goldpale">
          <PhIcon name="ph-fill ph-users-four" size={21} color="rgb(var(--gold))" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 mb-0.5 text-sm font-bold text-navy">Annual meeting · Tue, Jul 15</p>
          <p className="m-0 text-xs font-semibold text-slate">
            7 PM · Clubhouse + Zoom · 2 board seats open
          </p>
        </div>
        <span className="text-[13px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--accent))' }}>
          Preview →
        </span>
      </button>
    </StackedPanel>
  );

  return (
    <div className="pav-tabscroll absolute inset-0 overflow-y-auto pav-scroll" style={{ padding: 'calc(64px + var(--pav-chrome-top)) 18px var(--pav-screen-bottom)' }}>
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">The HOA, in the open</h1>
      <p className="m-0 mb-[18px] text-[13.5px] font-semibold text-slatedeep">
        {demo
          ? 'Every dollar, vote, and decision — visible to every household.'
          : 'Every vote and decision, visible to every household. Dues arrive here when your board publishes them.'}
      </p>

      {/*
       * Tier one: the chrome stack. Open ballots (live can carry several at
       * once; the demo has its one), with the resident's own ARC requests
       * tucked under the last ballot on a sky wash and, in the demo, the
       * annual meeting under that. The vote empty state stays outside the
       * stack — nothing to layer against.
       */}
      <section className="animate-fadeup mb-3.5" style={enter(0)}>
        {openAll.length === 0 && (
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
        {(openAll.length > 0 || arc.requests.length > 0 || demo) && (
          <StackedCards overlap={22}>
            {openAll.map((v) => <VoteCard key={v.id} vote={v} demo={demo} />)}
            {arc.requests.length > 0 && (
              <StackedPanel tint="sky">
                <SectionHeading title="Architectural requests" meta={arcMeta} />
                <div className="flex flex-col gap-2.5 mb-3">
                  {arc.requests.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => set({ arcDetailId: r.id })}
                      className="w-full border-none font-sans text-left bg-paper rounded-2xl px-3.5 py-[13px] cursor-pointer transition-transform active:scale-[0.985]"
                    >
                      <div className="flex items-center justify-between gap-2.5 mb-3">
                        <p className="m-0 min-w-0 text-[13.5px] font-bold text-navy">{r.title} · {r.ref}</p>
                        <Pill label={r.statusLabel} tone={arcTone(r)} size="md" />
                      </div>
                      <StatusTimeline steps={r.steps} />
                    </button>
                  ))}
                </div>
                {newRequestButton}
              </StackedPanel>
            )}
            {annualMeetingPanel}
          </StackedCards>
        )}
        {arc.requests.length === 0 && (
          <div className="mt-3.5">
            <EmptyState
              icon="ph-fill ph-pencil-ruler"
              title="No architectural requests"
              body="Planning a fence, a paint colour, a pergola? Ask first and you’ll see every step of the board’s review here."
              status={arcLoad}
              actionLabel="Start a request"
              onAction={() => set({ arcSheetOpen: true })}
            />
          </div>
        )}
      </section>

      {/*
        Docs, and — in the demo, where the assistant actually answers — AI.
        Live has no assistant, so the tile that would advertise one is gone and
        Documents takes the full width rather than pairing with a dead card.
      */}
      <section className={`animate-fadeup mb-5 ${demo ? 'grid grid-cols-2 gap-2.5' : ''}`} style={enter(1)}>
        <Card elevation="raised" padding="none" className="p-[15px]" onClick={() => set({ docsOpen: true, docReader: false })}>
          <PhIcon name="ph-fill ph-files" size={22} color="rgb(var(--skydeep))" />
          <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold text-navy">Documents</p>
          <p className="m-0 text-[12px] font-semibold text-slate">
            CC&amp;Rs · Bylaws · Budget · Minutes
          </p>
        </Card>
        {demo && (
          <button type="button"
            onClick={() => set({ aiOpen: true })}
            className="bg-ai w-full border-none font-sans text-left rounded-[18px] p-[15px] cursor-pointer transition-transform active:scale-[0.985]"
          >
            <PhIcon name="ph-fill ph-sparkle" size={22} color="rgb(var(--navy))" />
            <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold text-navy">Ask AI</p>
            <p className="m-0 text-[12px] font-semibold" style={{ color: 'rgb(var(--navy) / 0.85)' }}>
              &quot;Can I paint my fence black?&quot;
            </p>
          </button>
        )}
      </section>

      {/*
       * Tier two: what the resident can act on. Known issues sit on a gold
       * wash while something is open and drop to flat paper once everything
       * is fixed; the report control is the screen's one warm button.
       */}
      <section className="animate-fadeup mb-5" style={enter(2)}>
        {issues.length === 0 ? (
          <>
            <SectionHeading title="Known issues" meta="Nothing reported right now" />
            <EmptyState
              icon="ph-fill ph-wrench"
              title="Nothing reported"
              body="Issues you or the board log appear here, so nobody has to wonder whether the gate has been reported."
              actionLabel={isBoard ? 'Open the board desk' : undefined}
              onAction={isBoard ? goToDesk : undefined}
            />
            <ReportButton onClick={() => set({ reportOpen: true })} className="mt-3" />
          </>
        ) : (
          <IssuesSurface open={openIssues > 0}>
            <SectionHeading
              title="Known issues"
              meta={openIssues > 0 ? `${plural(openIssues, 'open', 'open')}${fixedIssues ? ` · ${fixedIssues} fixed` : ''}` : `All ${fixedIssues} fixed`}
            />
            {issues.map((issue, i) => (
              <RowShell
                key={issue.id}
                interactive={demo}
                onClick={() => set({ issueDetailId: issue.id })}
                className={`flex items-center gap-[11px] py-2.5${demo ? ' cursor-pointer' : ''}`}
                style={i < issues.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
              >
                <PhIcon name={issue.icon} size={16} color={issue.iconColor} className="flex-shrink-0" />
                <span className={`flex-1 min-w-0 text-[13.5px] font-bold ${issue.resolved ? 'text-slate' : 'text-navy'}`}>
                  {issue.title}
                </span>
                {/*
                  On the gold wash a warning pill's own goldpale bed vanishes
                  into the panel, so open-issue pills sit on paper there and
                  keep their tone's text colour.
                */}
                {openIssues > 0
                  ? <Pill label={issue.statusLabel} bg="rgb(var(--paper))" color={PILL_TONES[ISSUE_TONE[issue.tone]].color} size="md" />
                  : <Pill label={issue.statusLabel} tone={ISSUE_TONE[issue.tone]} size="md" />}
              </RowShell>
            ))}
            <ReportButton onClick={() => set({ reportOpen: true })} className="mt-3" />
          </IssuesSurface>
        )}
      </section>

      {/* Where dues go (demo-only until a finance domain exists) */}
      {demo && (
      <section className="animate-fadeup mb-5" style={enter(3)}>
        <SectionHeading title="Your $285, itemized" meta="July 2026 · unchanged from June" />
        <Card padding="lg">
          <div className="flex h-3.5 rounded-full overflow-hidden mb-3.5">
            {DUES_CATEGORIES.map((item) => (
              <div key={item.label} style={{ width: `${item.pct}%`, background: item.color }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {DUES_CATEGORIES.map((item) => (
              <div key={item.label} className="flex items-center gap-[7px]">
                <span className="w-[9px] h-[9px] rounded-[3px] flex-shrink-0" style={{ background: item.color }} />
                <span className="flex-1 text-[12.5px] font-bold text-slatedark">
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
              <p className="m-0 text-[12px] font-semibold text-slate">
                $414K of $505K recommended · study Jan 2026
              </p>
            </div>
            <div className="w-24 flex-shrink-0">
              <ProgressBar pct={82} height={8} color="rgb(var(--sage))" track="rgb(var(--skyborder))" />
            </div>
          </div>
          <div className="mt-3.5 pt-[13px]" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
            <button type="button"
              onClick={() => setForecastOpen(!forecastOpen)}
              aria-expanded={forecastOpen}
              className="w-full border-none font-sans bg-transparent text-left flex items-center justify-between gap-2 cursor-pointer py-2.5"
              style={{ minHeight: 44 }}
            >
              <p className="m-0 text-[12.5px] font-bold text-navy">Funding forecast</p>
              <div className="flex items-center gap-1.5">
                <Pill label="Healthy through 2032" tone="success" size="md" />
                <PhIcon name={forecastOpen ? 'ph ph-caret-up' : 'ph ph-caret-down'} size={13} color="rgb(var(--slatelight))" />
              </div>
            </button>
            {forecastOpen && (
              <div className="animate-fadeup mt-2.5">
                <div className="relative h-[84px]">
                  <div className="absolute left-0 right-0" style={{ top: 22, borderTop: '1.5px dashed rgb(var(--accent) / 0.45)' }} />
                  <span
                    className="absolute right-0 bg-paper px-[3px] text-[11px] font-bold"
                    style={{ top: 6, color: 'rgb(var(--accent))' }}
                  >
                    70% healthy line
                  </span>
                  <div className="absolute inset-0 flex items-end gap-2">
                    {FORECAST_BARS.map((bar) => (
                      <div key={bar.year} className="flex-1 flex flex-col items-center gap-1 justify-end h-full">
                        <div className="w-full rounded-t-[5px]" style={{ height: bar.height, background: bar.color }} />
                        <span className="text-[11px] font-bold text-slatelight">
                          {bar.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="mt-[9px] mb-0 text-[12px] font-semibold text-slate">
                  No special assessment projected. Reserves stay above the healthy line through 2032.
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
      )}

      {/*
       * Tier three: the archives, on flat paper. Past votes, the decisions
       * log and (live) the meetings list are things a household reads, not
       * things it acts on, so they sit at ground level.
       */}
      {closed.length > 0 && (
        <section className="animate-fadeup mb-5" style={enter(4)}>
          <SectionHeading title="Past votes" meta={plural(closed.length, 'result')} />
          <Card>
            {closed.map((c, i) => (
              <div key={c.id} className="py-2" style={i < closed.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}>
                <p className="m-0 text-[13.5px] font-bold text-navy">{c.title}</p>
                <p className="m-0 text-[12.5px] font-semibold text-slate">{c.resultLabel} · {c.dateLabel}</p>
              </div>
            ))}
          </Card>
        </section>
      )}

      <section className="animate-fadeup mb-5" style={enter(5)}>
        <SectionHeading
          title="Decisions log"
          meta={decisions.length === 0 ? 'Nothing on the record yet' : `${plural(decisions.length, 'decision')} on the record`}
        />
        {decisions.length === 0 ? (
          <EmptyState
            icon="ph-fill ph-gavel"
            title="No decisions logged"
            body="Every ballot the board closes and every ruling it makes lands here, so nobody has to relitigate what was decided."
            actionLabel={isBoard ? 'Open the board desk' : undefined}
            onAction={isBoard ? goToDesk : undefined}
          />
        ) : (
          <Card>
            {decisions.map((d, i) => (
              <RowShell
                key={d.id}
                interactive={demo}
                onClick={() => set({ decisionDetailIdx: i })}
                className={`flex items-center gap-[11px] py-2.5${demo ? ' cursor-pointer' : ''}`}
                style={i < decisions.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
              >
                <span className="w-11 flex-shrink-0 text-[12px] font-bold text-slate">
                  {d.dateLabel}
                </span>
                <span className="flex-1 min-w-0 text-[13.5px] font-bold text-navy">{d.text}</span>
                <Pill label={d.pillLabel} tone={d.passed ? 'success' : 'neutral'} size="md" />
              </RowShell>
            ))}
          </Card>
        )}
      </section>

      {/* Live meetings — board-scheduled, minutes downloadable */}
      {!demo && meetings.length > 0 && (
        <section className="animate-fadeup mb-5" style={enter(6)}>
          <SectionHeading
            title="Meetings"
            meta={upcomingMeetings > 0 ? `${plural(upcomingMeetings, 'upcoming', 'upcoming')} · ${meetings.length - upcomingMeetings} held` : `${plural(meetings.length, 'meeting')} held`}
          />
          <Card>
            {meetings.map((m, i) => (
              <div key={m.id} className="py-2" style={i < meetings.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}>
                <div className="flex items-center gap-2">
                  <p className="m-0 flex-1 min-w-0 text-[13.5px] font-bold text-navy">{m.title}</p>
                  {m.minutesUrl ? (
                    <a
                      href={m.minutesUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center text-[12.5px] font-extrabold no-underline flex-shrink-0"
                      style={{ color: 'rgb(var(--accent))', minHeight: 44 }}
                    >
                      Minutes →
                    </a>
                  ) : (
                    <Pill label={m.status === 'past' ? 'Held' : 'Upcoming'} tone={m.status === 'past' ? 'neutral' : 'info'} size="md" />
                  )}
                </div>
                <p className="m-0 text-[12.5px] font-semibold text-slate">
                  {[m.whenLabel, m.whereLabel].filter(Boolean).join(' · ')}
                </p>
                {m.agenda.length > 0 && m.status !== 'past' && (
                  <p className="m-0 mt-1 text-[12.5px] font-semibold text-slate">
                    Agenda: {m.agenda.join(' · ')}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

/** Gold wash while an issue is open; flat paper once the list is all fixed. */
function IssuesSurface({ open, children }: { open: boolean; children: ReactNode }) {
  if (open) return <StackedPanel tint="gold">{children}</StackedPanel>;
  return <Card padding="lg">{children}</Card>;
}

/** The screen's one warm control: a peach bed under navy text. */
function ReportButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl px-3 py-3 text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2 ${className ?? ''}`}
      style={{ ...PEACH_CONTROL, minHeight: 44 }}
    >
      <PhIcon name="ph-fill ph-shield-check" size={16} color="rgb(var(--navy))" />
      Report an issue — privately, to the board
    </button>
  );
}

/**
 * One open ballot. Yes/no ballots keep the classic two-button card the demo
 * ships; options ballots render N choices (a pick, then one confirm tap — or
 * multi-select with a cast button). Live voters can change their ballot
 * while it's open.
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
  const pickedLabels = vote.options.filter((o) => picks.includes(o.id)).map((o) => o.label);

  // Casting is the highest-stakes action in the product and used to give no
  // feedback until the round trip finished — 1-3s of silence on cell service,
  // which is exactly how a resident ends up tapping twice. A rejection is
  // already toasted by the data layer; here it just has to leave the ballot
  // open and the buttons live again instead of becoming an unhandled promise.
  const castYesNo = (choice: 'yes' | 'no') => {
    if (casting) return;
    setCasting(choice);
    void repo.castVote(vote.id, choice)
      .then(() => { setChanging(false); emitAppSuccess('Your ballot is recorded.'); })
      .catch(reportedByDataLayer)
      .finally(() => setCasting(null));
  };
  const castOptions = (ids: string[]) => {
    if (!ids.length || casting) return;
    setCasting('options');
    void repo.castOptionVote(vote.id, ids)
      .then(() => { setChanging(false); setPicks([]); emitAppSuccess('Your ballot is recorded.'); })
      .catch(reportedByDataLayer)
      .finally(() => setCasting(null));
  };
  const optionTotal = vote.options.reduce((n, o) => n + o.tally, 0);

  // A ballot with no receipt yet (the row predates the receipt column) is
  // still recorded — say so without inventing a number.
  const receiptLine = vote.receipt ? <>ballot receipt {vote.receipt}</> : 'Ballot recorded';

  return (
    <StackedPanel tint="skydeep" className="text-mist">
      <h2 className="m-0 mb-1.5 font-serif font-normal text-[24px] leading-[1.18] text-mist">{vote.title}</h2>
      <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
        {vote.closesLabel}
      </p>
      <p className="m-0 mb-4 text-[13.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
        {vote.subtitle}
      </p>
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <span className="text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.85)' }}>
          Quorum
        </span>
        <span className="text-[12.5px] font-bold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
          <span className="font-serif text-[19px] text-mist">{vote.quorumCount}</span>
          {' '}of {vote.quorumTotal} households
        </span>
      </div>
      <div className="mb-1.5">
        <ProgressBar pct={vote.quorumPct} height={8} track="rgb(var(--mist) / 0.15)" gradient />
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
            style={{ background: 'rgb(var(--white))', color: 'rgb(var(--skydeep))', opacity: casting && casting !== 'yes' ? 0.5 : 1, minHeight: 44 }}
          >
            {casting === 'yes' ? 'Recording…' : vote.yesLabel}
          </button>
          <button
            onClick={() => castYesNo('no')}
            disabled={!!casting}
            aria-busy={casting === 'no'}
            className="flex-1 bg-transparent rounded-[13px] py-3 text-sm font-extrabold cursor-pointer"
            style={{ border: '1.5px solid rgb(var(--mist) / 0.3)', color: 'rgb(var(--mist))', opacity: casting && casting !== 'no' ? 0.5 : 1, minHeight: 44 }}
          >
            {casting === 'no' ? 'Recording…' : vote.noLabel}
          </button>
        </div>
      )}

      {/*
        Ballot — options. A single-choice ballot used to cast on the first
        tap, with no way back; now the tap picks and a second, named button
        casts. Multi-select keeps its cast button. Both are the peach control
        the chrome allows (sunsetdeep measures 1.00:1 on skydeep).
      */}
      {isOptions && showBallot && (
        <div className="flex flex-col gap-2" role="group" aria-label={vote.multi ? 'Pick one or more' : 'Pick one'}>
          {vote.options.map((o) => {
            const picked = picks.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={picked}
                disabled={!!casting}
                onClick={() => {
                  if (vote.multi) setPicks(picked ? picks.filter((p) => p !== o.id) : [...picks, o.id]);
                  else setPicks(picked ? [] : [o.id]);
                }}
                className="w-full rounded-[13px] py-3 px-3.5 text-left text-sm font-extrabold cursor-pointer flex items-center gap-2.5"
                style={picked
                  ? { background: 'rgb(var(--white))', border: '1.5px solid rgb(var(--white))', color: 'rgb(var(--skydeep))', minHeight: 44 }
                  : { background: 'transparent', border: '1.5px solid rgb(var(--mist) / 0.3)', color: 'rgb(var(--mist))', minHeight: 44 }}
              >
                <PhIcon
                  name={picked ? 'ph-fill ph-check-square' : 'ph ph-circle'}
                  size={18}
                  color={picked ? 'rgb(var(--skydeep))' : 'rgb(var(--mist) / 0.7)'}
                  className="flex-shrink-0"
                />
                <span className="min-w-0">{o.label}</span>
              </button>
            );
          })}
          {picks.length > 0 && (
            <button
              type="button"
              onClick={() => castOptions(picks)}
              disabled={!!casting}
              aria-busy={casting === 'options'}
              className="w-full border-none rounded-[13px] py-3 px-3.5 text-sm font-extrabold cursor-pointer animate-fadeup"
              style={{ background: 'rgb(var(--peach))', color: 'rgb(var(--navy))', minHeight: 44 }}
            >
              {casting === 'options'
                ? 'Recording…'
                : vote.multi
                  ? `Cast ballot · ${plural(picks.length, 'pick')}`
                  : `Cast ballot for ${pickedLabels[0] ?? 'this option'}`}
            </button>
          )}
          {vote.multi && picks.length === 0 && (
            <p className="m-0 mt-0.5 text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.85)' }}>
              Pick one or more, then cast.
            </p>
          )}
        </div>
      )}

      {changing && (
        <button
          type="button"
          onClick={() => { setChanging(false); setPicks([]); }}
          className="mt-1 bg-transparent border-none px-0 text-[12.5px] font-extrabold cursor-pointer underline font-sans flex items-center"
          style={{ color: 'rgb(var(--mist) / 0.9)', minHeight: 44 }}
        >
          Keep my vote as it is
        </button>
      )}

      {/* Voted — yes/no tally */}
      {!isOptions && hasVoted && !changing && (
        <div className="animate-fadeup">
          <div
            className="relative rounded-[13px] px-3.5 py-3 flex items-center gap-2.5"
            style={{ background: 'rgb(var(--sage) / 0.18)', border: '1px solid rgb(var(--sage) / 0.4)' }}
          >
            <PhIcon name="ph-fill ph-seal-check" size={20} color="rgb(var(--sagebright))" className="flex-shrink-0" />
            <p className="m-0 text-[13px] font-bold text-mist">
              You voted <strong>{votedLabel}</strong> · {receiptLine} · secret ballot
            </p>
          </div>
          <div className="mt-3.5">
            <div className="flex items-center gap-2 mb-[7px]">
              <span className="w-8 text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
                YES
              </span>
              <div className="flex-1">
                <ProgressBar pct={vote.yesPct} height={9} track="rgb(var(--mist) / 0.12)" color="rgb(var(--peach))" />
              </div>
              <span
                className="w-[62px] text-right text-[12px] font-bold"
                style={{ color: 'rgb(var(--mist) / 0.95)' }}
              >
                {vote.yesCount} · {vote.yesPct}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
                NO
              </span>
              <div className="flex-1">
                <ProgressBar pct={100 - vote.yesPct} height={9} track="rgb(var(--mist) / 0.12)" color="rgb(var(--mist) / 0.9)" />
              </div>
              <span
                className="w-[62px] text-right text-[12px] font-bold"
                style={{ color: 'rgb(var(--mist) / 0.95)' }}
              >
                {vote.noCount} · {100 - vote.yesPct}%
              </span>
            </div>
            <p className="mt-[9px] mb-0 text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
              {demo
                ? `Live tally · needs 50% of ${vote.quorumTotal} households by Thursday`
                : `Live tally · one ballot per household · ${vote.quorumTotal} households`}
            </p>
          </div>
          {!demo && (
            <button
              type="button"
              onClick={() => setChanging(true)}
              className="mt-1 bg-transparent border-none px-0 text-[12.5px] font-extrabold cursor-pointer underline font-sans flex items-center"
              style={{ color: 'rgb(var(--mist) / 0.9)', minHeight: 44 }}
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
            <p className="m-0 text-[13px] font-bold text-mist">
              {vote.receipt ? <>Ballot received · receipt {vote.receipt}</> : 'Ballot recorded'} · secret ballot
            </p>
          </div>
          {vote.options.map((o) => {
            const pct = optionTotal ? Math.round((o.tally / optionTotal) * 100) : 0;
            const mine = vote.myOptionIds.includes(o.id);
            return (
              <div key={o.id} className="flex items-center gap-2 mb-[7px]">
                <span className="flex-1 min-w-0 text-[12.5px] font-bold truncate flex items-center gap-1.5" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
                  {mine && <PhIcon name="ph-bold ph-check" size={12} color="rgb(var(--peach))" className="flex-shrink-0" />}
                  <span className="truncate">{o.label}</span>
                </span>
                <div className="w-[110px]">
                  <ProgressBar pct={pct} height={9} track="rgb(var(--mist) / 0.12)" color={mine ? 'rgb(var(--peach))' : 'rgb(var(--mist) / 0.9)'} />
                </div>
                <span className="w-[52px] text-right text-[12px] font-bold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
                  {o.tally} · {pct}%
                </span>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => { setChanging(true); setPicks(vote.myOptionIds); }}
            className="mt-1 bg-transparent border-none px-0 text-[12.5px] font-extrabold cursor-pointer underline font-sans flex items-center"
            style={{ color: 'rgb(var(--mist) / 0.9)', minHeight: 44 }}
          >
            Change my vote
          </button>
        </div>
      )}
    </StackedPanel>
  );
}
