import { useRef, useState, type ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { SectionHeading } from '../components/SectionHeading';
import { usePavStore } from '../store/store';
import { useDocuments, useDocSections, useMember, useLoadState, useRepository } from '../data/repo';
import type { Doc } from '../data/types';
import { confirmDestructive } from '../components/ConfirmSheet';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';

const DOC_CONTENT: Record<string, { sections: { tag: string; name: string; body: string }[] }> = {
  bylaws: {
    sections: [
      { tag: '§2', name: 'Board of Directors', body: 'Five directors elected to staggered two-year terms. Quorum is three. Officers: President, Secretary, Treasurer.' },
      { tag: '§3', name: 'Meetings', body: 'Annual meeting in October. Special meetings called by the board or 10% of owners. 30-day notice required.' },
      { tag: '§6', name: 'Elections', body: 'Candidates self-nominate by Sep 1. Electronic ballots open 14 days before the annual meeting. Ties broken by lot.' },
    ],
  },
  budget: {
    sections: [
      { tag: 'Revenue', name: 'Assessments', body: 'Monthly dues $285 × 136 homes = $465,120/yr. Late fees and interest projected at $3,200.' },
      { tag: 'Expense', name: 'Operations', body: 'Landscaping $112K, Insurance $68K, Utilities $41K, Management $54K, Maintenance $38K.' },
      { tag: 'Reserve', name: 'Contribution', body: '$148K to reserves (32% of revenue). Fully funded through 2032 per reserve study.' },
    ],
  },
  minutes: {
    sections: [
      { tag: '1', name: 'Call to order', body: 'President Ruiz called the meeting to order at 7:02 PM. Quorum confirmed (4 of 5 directors present).' },
      { tag: '2', name: 'Paint palette vote', body: 'Motion to add Sage and Clay to approved exterior colors. Passed 91–22 by homeowner ballot.' },
      { tag: '3', name: 'Pool gate repair', body: 'Board approved $4,200 from reserves for pool gate replacement. Vendor: Apex Fencing, ETA 3 weeks.' },
    ],
  },
  reserve: {
    sections: [
      { tag: 'Summary', name: 'Funding status', body: 'Current reserve balance $1.24M. Percent funded: 78%. Healthy threshold: 70%. No special assessment projected.' },
      { tag: '5-yr', name: 'Near-term projects', body: '2027: Pool resurface ($85K). 2028: Roof common areas ($62K). 2029: Parking lot seal coat ($28K).' },
      { tag: '30-yr', name: 'Long-range forecast', body: 'Reserves remain above 70% funded through 2056 at current contribution rate. Annual increase: 2.5%.' },
    ],
  },
};

const UPLOAD_SECTIONS = ['Governing documents', 'Financials', 'Minutes', 'Forms', 'General'];

/** The scripted library has no `section` column; group it the way a live board would. */
const DEMO_SECTION: Record<string, string> = {
  ccrs: 'Governing documents',
  bylaws: 'Governing documents',
  budget: 'Financials',
  reserve: 'Financials',
  minutes: 'Minutes',
};

/*
 * Each group gets a tinted bed for its icon tile, with the bed's own
 * text-bearing twin as the glyph, so a scan down the list reads the kind
 * of document before the title does.
 */
const TILE: Record<string, { bg: string; fg: string }> = {
  'Governing documents': { bg: 'rgb(var(--skypale))', fg: 'rgb(var(--skydeep))' },
  Financials: { bg: 'rgb(var(--mint))', fg: 'rgb(var(--sagedark))' },
  Minutes: { bg: 'rgb(var(--goldpale))', fg: 'rgb(var(--golddark))' },
  Forms: { bg: 'rgb(var(--skypale))', fg: 'rgb(var(--skydeep))' },
};
const TILE_DEFAULT = { bg: 'rgb(var(--skywash))', fg: 'rgb(var(--slatedark))' };

function groupDocs(docs: Doc[], demo: boolean): { section: string; docs: Doc[] }[] {
  const out: { section: string; docs: Doc[] }[] = [];
  for (const d of docs) {
    const section = (demo ? DEMO_SECTION[d.key] : d.section) || 'General';
    const g = out.find((x) => x.section === section);
    if (g) g.docs.push(d);
    else out.push({ section, docs: [d] });
  }
  return out;
}

/** A section of a document in the reader. Flat: the reader reads, it does not decide. */
function ReaderSection({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card padding="none" className={['px-4 py-[15px]', className ?? 'mb-2.5'].join(' ')}>
      <div className="flex items-center justify-between gap-2.5 mb-1.5">
        <h2 className="m-0 font-serif text-[17px] leading-[1.25] text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

const READER_BODY = 'm-0 text-[13.5px] font-semibold text-ink';
const READER_BODY_STYLE = { lineHeight: 1.65 } as const;

/** Documents list + CC&Rs reader — ported from prototype lines 1955-2041. */
export function Documents() {
  const state = usePavStore();
  const { set, askAiDocsSummary } = state;
  const DOCS = useDocuments();
  const DOC_SECTIONS = useDocSections();
  const repo = useRepository();
  const member = useMember();
  const canManage = !repo.isDemo() && member?.role === 'board';
  const docsLoad = useLoadState('docs');
  const [upName, setUpName] = useState('');
  const [upSection, setUpSection] = useState('Governing documents');
  const [upBusy, setUpBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!state.docsOpen) return null;

  const dq = state.docQ.trim().toLowerCase();
  const show = (tag: string) => {
    const s = DOC_SECTIONS.find((x) => x.tag === tag);
    if (!s) return false;
    return !dq || (s.name + ' ' + s.tag + ' ' + s.kw).toLowerCase().includes(dq);
  };
  const showEx = show('§4');
  const showLiv = show('§5');
  const showLease = show('§7');
  const showAssess = show('§9');
  const noMatch = !showEx && !showLiv && !showLease && !showAssess;

  const groups = groupDocs(DOCS, repo.isDemo());

  return (
    <div
      data-screen-label="Documents"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      {!state.docReader ? (
        <div>
          <BackButton onClick={() => set({ docsOpen: false })} />
          <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">Documents</h1>
          <p className="m-0 mb-4 text-[13.5px] font-semibold text-slatedeep">
            {/* Only the demo has an assistant that has read anything. */}
            {DOCS.length > 0 && repo.isDemo()
              ? 'Every governing document, searchable. Your AI has read them all.'
              : 'Every governing document, in one place.'}
          </p>
          {DOCS.length === 0 && (
            <EmptyState
              icon="ph-fill ph-files"
              title="No documents yet"
              status={docsLoad}
              body={
                canManage
                  ? 'Start with the CC&Rs and bylaws — they answer the questions neighbors ask you most. Publish below.'
                  : 'CC&Rs, bylaws, budgets, and minutes appear here once your board publishes them.'
              }
            />
          )}
          {groups.map((g, gi) => {
            const tile = TILE[g.section] ?? TILE_DEFAULT;
            return (
              <section key={g.section} className={gi === 0 ? '' : 'mt-5'}>
                <SectionHeading title={g.section} meta={`${g.docs.length} ${g.docs.length === 1 ? 'document' : 'documents'}`} />
                <div className="flex flex-col gap-2">
                  {g.docs.map((d) => (
                    // The row and its remove action are siblings inside a wrapper:
                    // a <button> may not contain another <button>, and nesting them
                    // also made the delete unreachable as its own tab stop.
                    <Card key={d.key} padding="none" className="flex items-center gap-1 pr-3">
                      <button
                        type="button"
                        onClick={() => {
                          // Live docs are real files — open them; demo docs open the
                          // scripted reader.
                          if (d.url) window.open(d.url, '_blank', 'noreferrer');
                          else set({ docReader: true, docReaderKey: d.key, docQ: '', diffOpen: false });
                        }}
                        className="flex-1 min-w-0 border-none bg-transparent font-sans text-left flex items-center gap-3 cursor-pointer min-h-[44px]"
                        style={{ padding: '12px 0 12px 12px' }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tile.bg }}>
                          <PhIcon name={d.icon} size={19} color={tile.fg} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 mb-px text-[13.5px] font-bold text-navy leading-[1.3]">{d.title}</p>
                          <p className="m-0 text-[12.5px] font-semibold text-slate leading-[1.4]">{d.sub}</p>
                        </div>
                      </button>
                      {canManage && d.id ? (
                        <button
                          type="button"
                          onClick={() => confirmDestructive({
                            title: 'Remove this document?',
                            body: `“${d.title}” disappears for every household. If it is a governing document, residents lose their copy of the rules until you publish it again.`,
                            confirmLabel: 'Remove document',
                            onConfirm: () => { void repo.deleteDocument(d.id!); emitAppSuccess('Document removed.'); },
                          })}
                          aria-label={`Remove ${d.title}`}
                          className="border-0 bg-transparent cursor-pointer flex-shrink-0 flex items-center justify-center w-11 h-11"
                        >
                          <PhIcon name="ph-fill ph-trash" size={15} color="rgb(var(--slate))" />
                        </button>
                      ) : (
                        <PhIcon name="ph-bold ph-caret-right" size={14} color="rgb(var(--slatefaint))" className="flex-shrink-0" />
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Board: publish a document into the community library */}
          {canManage && (
            <section className="mt-5">
              <SectionHeading title="Publish a document" meta="Every household sees it the moment it lands." />
              <Card>
                <Field
                  label="Name"
                  value={upName}
                  onChange={(e) => setUpName(e.target.value)}
                  placeholder="e.g. CC&Rs (rev. 2026)"
                  maxLength={120}
                  className="mb-3"
                />
                <p className="m-0 mb-1.5 text-[12.5px] font-bold text-slatedark">Section</p>
                <div className="flex gap-1.5 flex-wrap mb-3.5" role="group" aria-label="Section">
                  {UPLOAD_SECTIONS.map((s) => (
                    <Chip key={s} label={s} active={upSection === s} onClick={() => setUpSection(s)} size="md" />
                  ))}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f || upBusy) return;
                    setUpBusy(true);
                    void repo.uploadDocument({ file: f, name: upName || f.name, section: upSection })
                      .then(() => setUpName(''))
                      .catch(reportedByDataLayer)
                      .finally(() => { setUpBusy(false); if (fileRef.current) fileRef.current.value = ''; });
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={upBusy}
                  className="w-full border-0 rounded-[13px] py-3 text-[13.5px] font-extrabold font-sans cursor-pointer min-h-[44px]"
                  style={upBusy
                    ? { background: 'rgb(var(--skyrule))', color: 'rgb(var(--slatelight))' }
                    : { background: 'rgb(var(--skydeep))', color: 'rgb(var(--white))' }}
                >
                  {upBusy ? 'Uploading…' : 'Choose file & publish'}
                </button>
              </Card>
            </section>
          )}
        </div>
      ) : state.docReaderKey === 'ccrs' ? (
        <div className="animate-fadeup">
          <BackButton label="All documents" onClick={() => set({ docReader: false })} />
          <h1 className="m-0 mb-[3px] font-serif font-normal text-[24px] text-navy">CC&amp;Rs</h1>
          <p className="m-0 mb-3 text-[12.5px] font-semibold text-slatedeep">
            Rev. March 2026 · 48 pages · applies to all 136 homes
          </p>

          <div
            className="flex items-center gap-[9px] rounded-full mb-[11px] min-h-[44px]"
            style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.12)', padding: '8px 14px' }}
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={14} color="rgb(var(--slate))" className="flex-shrink-0" />
            <input
              value={state.docQ}
              onChange={(e) => set({ docQ: e.target.value })}
              placeholder="Search within this document…"
              aria-label="Search within this document"
              className="flex-1 border-none bg-transparent text-[13.5px] font-semibold text-navy outline-none font-sans min-w-0"
            />
            {dq.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => set({ docQ: '' })}
                className="border-none w-7 h-7 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                style={{ background: 'rgb(var(--skyborder))' }}
              >
                <PhIcon name="ph-bold ph-x" size={10} color="rgb(var(--slatedark))" />
              </button>
            )}
          </div>

          <div className="flex gap-[7px] flex-wrap mb-3.5">
            {DOC_SECTIONS.map((s) => (
              <span
                key={s.tag}
                className="inline-flex items-center gap-[5px] rounded-full text-[12px] font-bold"
                style={{ background: 'rgb(var(--skywash))', color: 'rgb(var(--slatedark))', padding: '6px 11px' }}
              >
                <span style={{ color: 'rgb(var(--skydeep))' }}>{s.tag}</span>
                {s.name}
              </span>
            ))}
          </div>

          {/* Demo only — live has no assistant to summarize with. */}
          {repo.isDemo() && (
            <button
              type="button"
              onClick={askAiDocsSummary}
              className="bg-ai w-full border-none rounded-[14px] text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2 mb-3.5 min-h-[44px]"
              style={{ padding: '13px 0' }}
            >
              <PhIcon name="ph-fill ph-sparkle" size={15} />
              Ask AI to summarize
            </button>
          )}

          {showEx && (
            <ReaderSection
              title="§4 · Exteriors"
              action={
                <button
                  type="button"
                  onClick={() => set({ diffOpen: !state.diffOpen })}
                  aria-expanded={state.diffOpen}
                  className="inline-flex items-center gap-[5px] rounded-full text-[12px] font-extrabold cursor-pointer font-sans flex-shrink-0 min-h-[32px]"
                  style={{ border: '1px solid rgb(var(--sage) / 0.3)', background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', padding: '5px 11px' }}
                >
                  <PhIcon name="ph-fill ph-git-diff" size={12} />
                  What changed
                </button>
              }
            >
              <p className={READER_BODY} style={READER_BODY_STYLE}>
                4.1 Structures visible from the street require ARC approval before work begins. 4.2{' '}
                <span style={{ background: 'rgb(var(--accenttint))', borderRadius: 4, padding: '1px 4px' }}>
                  Approved exterior palette: Cedar, Slate Gray, White, Sage, and Clay.
                </span>{' '}
                4.3 Fences max 6 ft, rear yards only.
              </p>
              {state.diffOpen && (
                <div className="animate-fadeup" style={{ marginTop: 11, borderTop: '1px dashed rgb(var(--navy) / 0.12)', paddingTop: 11 }}>
                  <p className="m-0 mb-1.5 text-[12.5px] font-bold text-slatedark">
                    March 2026 revision · §4.2
                  </p>
                  <p className="m-0 mb-[5px] text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: 'rgb(var(--sunsetdim))', color: 'rgb(var(--reddeep))', textDecoration: 'line-through', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White
                    </span>
                  </p>
                  <p className="m-0 mb-2 text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White, Sage, Clay
                    </span>
                  </p>
                  <p className="m-0 text-[12px] font-semibold text-slate">
                    Sage &amp; Clay added by board vote (91–22) on Jun 18, 2026.
                  </p>
                </div>
              )}
            </ReaderSection>
          )}

          {showLiv && (
            <ReaderSection title="§5 · Living">
              <p className={READER_BODY} style={READER_BODY_STYLE}>
                5.2 Quiet hours 10 PM–7 AM. 5.7 Up to 4 hens permitted, no roosters; coops need ARC sign-off. 5.9 Fireworks
                prohibited year-round.
              </p>
            </ReaderSection>
          )}

          {showLease && (
            <ReaderSection title="§7 · Leasing">
              <p className={READER_BODY} style={READER_BODY_STYLE}>
                7.4 Minimum lease term 6 months; register tenants with the office within 14 days. Short-term rentals are not
                permitted.
              </p>
            </ReaderSection>
          )}

          {showAssess && (
            <ReaderSection title="§9 · Assessments" className="mb-0">
              <p className={READER_BODY} style={READER_BODY_STYLE}>
                Dues fund landscaping, insurance, utilities, and reserves. Late policy is courtesy-first: two reminders before any
                fee.
              </p>
            </ReaderSection>
          )}

          {noMatch && (
            <div className="text-center" style={{ padding: '24px 16px' }}>
              <div className="flex justify-center">
                <PhIcon name="ph ph-file-magnifying-glass" size={32} color="rgb(var(--slatefaint))" />
              </div>
              <p className="mt-[9px] mb-0.5 text-[13.5px] font-bold text-navy">No section matches that</p>
              <p className="m-0 text-[12.5px] font-semibold text-slate">
                Try &quot;palette&quot;, &quot;quiet&quot;, &quot;lease&quot; — or ask AI above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <GenericDocReader />
      )}
    </div>
  );
}

function GenericDocReader() {
  const state = usePavStore();
  const { set } = state;
  const DOCS = useDocuments();
  const doc = DOCS.find((d) => d.key === state.docReaderKey);
  const content = DOC_CONTENT[state.docReaderKey];
  if (!doc || !content) return null;

  return (
    <div className="animate-fadeup">
      <BackButton label="All documents" onClick={() => set({ docReader: false })} />
      <h1 className="m-0 mb-[3px] font-serif font-normal text-[24px] text-navy">{doc.title}</h1>
      <p className="m-0 mb-4 text-[12.5px] font-semibold text-slatedeep">
        {doc.sub}
      </p>
      {content.sections.map((s, i) => (
        <ReaderSection key={s.tag} title={`${s.tag} · ${s.name}`} className={i === content.sections.length - 1 ? 'mb-0' : 'mb-2.5'}>
          <p className={READER_BODY} style={READER_BODY_STYLE}>{s.body}</p>
        </ReaderSection>
      ))}
    </div>
  );
}
