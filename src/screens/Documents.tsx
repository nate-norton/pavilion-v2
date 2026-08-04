import { useRef, useState, type CSSProperties } from 'react';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useDocuments, useDocSections, useMember, useRepository } from '../data/repo';

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

const SECTION_CARD: CSSProperties = {
  background: 'rgb(var(--paper))',
  border: '1px solid rgb(var(--navy) / 0.08)',
  borderRadius: 16,
  padding: 15,
  marginBottom: 10,
};

/** Documents list + CC&Rs reader — ported from prototype lines 1955-2041. */
export function Documents() {
  const state = usePavStore();
  const { set, askAiDocsSummary } = state;
  const DOCS = useDocuments();
  const DOC_SECTIONS = useDocSections();
  const repo = useRepository();
  const member = useMember();
  const canManage = !repo.isDemo() && member?.role === 'board';
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

  return (
    <div
      data-screen-label="Documents"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--cream))', padding: '60px 18px 40px' }}
    >
      {!state.docReader ? (
        <div>
          <BackButton onClick={() => set({ docsOpen: false })} />
          <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">Documents</h1>
          <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
            {DOCS.length > 0
              ? 'Every governing document, searchable. Your AI has read them all.'
              : 'Every governing document, in one place.'}
          </p>
          {DOCS.length === 0 && (
            <EmptyState
              icon="ph-fill ph-files"
              title="No documents yet"
              body={
                canManage
                  ? 'Start with the CC&Rs and bylaws — they answer the questions neighbors ask you most. Publish below.'
                  : 'CC&Rs, bylaws, budgets, and minutes appear here once your board publishes them.'
              }
            />
          )}
          <div className="flex flex-col gap-[9px]">
            {DOCS.map((d) => (
              <div
                key={d.key}
                onClick={() => {
                  // Live docs are real files — open them; demo docs open the
                  // scripted reader.
                  if (d.url) window.open(d.url, '_blank', 'noreferrer');
                  else set({ docReader: true, docReaderKey: d.key, docQ: '', diffOpen: false });
                }}
                className="flex items-center gap-3 cursor-pointer"
                style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: 14 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--sand))' }}>
                  <PhIcon name={d.icon} size={19} color="rgb(var(--navy))" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-px text-[13.5px] font-bold text-navy">{d.title}</p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
                    {d.sub}
                  </p>
                </div>
                {canManage && d.id ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); void repo.deleteDocument(d.id!); }}
                    title="Remove document"
                    className="border-0 bg-transparent p-1 cursor-pointer flex-shrink-0 opacity-50"
                  >
                    <PhIcon name="ph-fill ph-trash" size={14} color="rgb(var(--stone))" />
                  </button>
                ) : (
                  <PhIcon name="ph ph-caret-right" size={14} color="rgb(var(--stonelight))" />
                )}
              </div>
            ))}
          </div>

          {/* Board: publish a document into the community library */}
          {canManage && (
            <div className="mt-3.5 bg-paper rounded-[16px] p-3.5" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              <p className="m-0 mb-2 text-[13px] font-bold text-navy">Publish a document</p>
              <input
                value={upName}
                onChange={(e) => setUpName(e.target.value)}
                placeholder="Name — e.g. CC&Rs (rev. 2026)"
                className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
              />
              <div className="flex gap-1.5 flex-wrap mb-2.5">
                {['Governing documents', 'Financials', 'Minutes', 'Forms', 'General'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setUpSection(s)}
                    className="rounded-full px-3 py-1.5 text-[11px] font-extrabold cursor-pointer"
                    style={upSection === s
                      ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', border: '1.5px solid rgb(var(--navy))' }
                      : { background: 'transparent', color: 'rgb(var(--navy))', border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    {s}
                  </button>
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
                    .catch(() => {})
                    .finally(() => { setUpBusy(false); if (fileRef.current) fileRef.current.value = ''; });
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={upBusy}
                className="w-full border-0 rounded-[13px] py-3 text-[13px] font-extrabold cursor-pointer text-cream"
                style={{ background: upBusy ? 'rgb(var(--sandpale))' : 'rgb(var(--navy))' }}
              >
                {upBusy ? 'Uploading…' : 'Choose file & publish'}
              </button>
            </div>
          )}
        </div>
      ) : state.docReaderKey === 'ccrs' ? (
        <div className="animate-fadeup">
          <BackButton label="All documents" onClick={() => set({ docReader: false })} />
          <h1 className="m-0 mb-[3px] font-serif font-normal text-[26px] text-navy">CC&amp;Rs</h1>
          <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
            Rev. March 2026 · 48 pages · applies to all 136 homes
          </p>

          <div
            className="flex items-center gap-[9px] rounded-full mb-[11px]"
            style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.12)', padding: '10px 14px' }}
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={14} color="rgb(var(--stone))" className="flex-shrink-0" />
            <input
              value={state.docQ}
              onChange={(e) => set({ docQ: e.target.value })}
              placeholder="Search within this document…"
              className="flex-1 border-none bg-transparent text-[13px] font-semibold text-navy outline-none font-sans min-w-0"
            />
            {dq.length > 0 && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => set({ docQ: '' })}
                className="border-none w-5 h-5 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                style={{ background: 'rgb(var(--sand))' }}
              >
                <PhIcon name="ph-bold ph-x" size={10} color="rgb(var(--bark))" />
              </button>
            )}
          </div>

          <div className="flex gap-[7px] flex-wrap mb-3.5">
            {DOC_SECTIONS.map((s) => (
              <span
                key={s.tag}
                className="inline-flex items-center gap-[5px] rounded-full text-[11.5px] font-bold"
                style={{ background: 'rgb(var(--sand))', color: 'rgb(var(--bark))', padding: '6px 11px' }}
              >
                <span style={{ color: 'rgb(var(--terracotta))' }}>{s.tag}</span>
                {s.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={askAiDocsSummary}
            className="w-full border-none text-white rounded-[14px] text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2 mb-3.5"
            style={{ background: 'linear-gradient(150deg,rgb(var(--ember)),rgb(var(--terracotta)))', padding: '13px 0' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={15} />
            Ask AI to summarize
          </button>

          {showEx && (
            <div style={SECTION_CARD}>
              <div className="flex items-center justify-between gap-2.5 mb-[7px]">
                <p className="m-0 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--terracotta))' }}>
                  §4 · Exteriors
                </p>
                <button
                  type="button"
                  onClick={() => set({ diffOpen: !state.diffOpen })}
                  className="inline-flex items-center gap-[5px] rounded-full text-[10px] font-extrabold cursor-pointer font-sans"
                  style={{ border: '1px solid rgb(var(--sage) / 0.3)', background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', padding: '4px 9px' }}
                >
                  <PhIcon name="ph-fill ph-git-diff" size={11} />
                  What changed
                </button>
              </div>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: 'rgb(var(--ink))' }}>
                4.1 Structures visible from the street require ARC approval before work begins. 4.2{' '}
                <span style={{ background: 'rgb(var(--blush))', borderRadius: 4, padding: '1px 4px' }}>
                  Approved exterior palette: Cedar, Slate Gray, White, Sage, and Clay.
                </span>{' '}
                4.3 Fences max 6 ft, rear yards only.
              </p>
              {state.diffOpen && (
                <div className="animate-fadeup" style={{ marginTop: 11, borderTop: '1px dashed rgb(var(--navy) / 0.12)', paddingTop: 11 }}>
                  <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--stone))' }}>
                    March 2026 revision · §4.2
                  </p>
                  <p className="m-0 mb-[5px] text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: 'rgb(var(--blushdim))', color: 'rgb(var(--reddeep))', textDecoration: 'line-through', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White
                    </span>
                  </p>
                  <p className="m-0 mb-2 text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: 'rgb(var(--sagetint))', color: 'rgb(var(--sagedark))', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White, Sage, Clay
                    </span>
                  </p>
                  <p className="m-0 text-[11px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
                    Sage &amp; Clay added by board vote (91–22) on Jun 18, 2026.
                  </p>
                </div>
              )}
            </div>
          )}

          {showLiv && (
            <div style={SECTION_CARD}>
              <p className="m-0 mb-[7px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--stone))' }}>
                §5 · Living
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: 'rgb(var(--ink))' }}>
                5.2 Quiet hours 10 PM–7 AM. 5.7 Up to 4 hens permitted, no roosters; coops need ARC sign-off. 5.9 Fireworks
                prohibited year-round.
              </p>
            </div>
          )}

          {showLease && (
            <div style={SECTION_CARD}>
              <p className="m-0 mb-[7px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--stone))' }}>
                §7 · Leasing
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: 'rgb(var(--ink))' }}>
                7.4 Minimum lease term 6 months; register tenants with the office within 14 days. Short-term rentals are not
                permitted.
              </p>
            </div>
          )}

          {showAssess && (
            <div style={{ ...SECTION_CARD, marginBottom: 0 }}>
              <p className="m-0 mb-[7px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--stone))' }}>
                §9 · Assessments
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: 'rgb(var(--ink))' }}>
                Dues fund landscaping, insurance, utilities, and reserves. Late policy is courtesy-first: two reminders before any
                fee.
              </p>
            </div>
          )}

          {noMatch && (
            <div className="text-center" style={{ padding: '24px 16px' }}>
              <PhIcon name="ph ph-file-magnifying-glass" size={32} color="rgb(var(--stonelight))" className="inline-block" />
              <p className="mt-[9px] mb-0.5 text-sm font-bold text-navy">No section matches that</p>
              <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
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
      <h1 className="m-0 mb-[3px] font-serif font-normal text-[26px] text-navy">{doc.title}</h1>
      <p className="m-0 mb-4 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
        {doc.sub}
      </p>
      {content.sections.map((s) => (
        <div key={s.tag} style={SECTION_CARD}>
          <p className="m-0 mb-[7px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--terracotta))' }}>
            {s.tag} · {s.name}
          </p>
          <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: 'rgb(var(--ink))' }}>
            {s.body}
          </p>
        </div>
      ))}
    </div>
  );
}
