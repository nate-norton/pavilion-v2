import type { CSSProperties } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { DOCS, DOC_SECTIONS } from '../data';

const SECTION_CARD: CSSProperties = {
  background: '#FFFEFA',
  border: '1px solid rgba(26,51,82,0.08)',
  borderRadius: 16,
  padding: 15,
  marginBottom: 10,
};

/** Documents list + CC&Rs reader — ported from prototype lines 1955-2041. */
export function Documents() {
  const state = usePavStore();
  const { set, askPennyDocsSummary } = state;

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
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      {!state.docReader ? (
        <div>
          <BackButton onClick={() => set({ docsOpen: false })} />
          <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">Documents</h1>
          <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
            Every governing document, searchable. Penny has read them all.
          </p>
          <div className="flex flex-col gap-[9px]">
            {DOCS.map((d) => (
              <div
                key={d.key}
                onClick={() => {
                  if (d.key === 'ccrs') set({ docReader: true, docQ: '', diffOpen: false });
                }}
                className="flex items-center gap-3 cursor-pointer"
                style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: 14 }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#EDE6D6' }}>
                  <PhIcon name={d.icon} size={19} color="#1A3352" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-px text-[13.5px] font-extrabold text-navy">{d.title}</p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                    {d.sub}
                  </p>
                </div>
                <PhIcon name="ph ph-caret-right" size={14} color="#A39B8B" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="animate-fadeup">
          <BackButton label="All documents" onClick={() => set({ docReader: false })} />
          <h1 className="m-0 mb-[3px] font-serif font-normal text-[26px] text-navy">CC&amp;Rs</h1>
          <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: '#7A7365' }}>
            Rev. March 2026 · 48 pages · applies to all 136 homes
          </p>

          <div
            className="flex items-center gap-[9px] rounded-full mb-[11px]"
            style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.12)', padding: '10px 14px' }}
          >
            <PhIcon name="ph-bold ph-magnifying-glass" size={14} color="#8A8375" className="flex-shrink-0" />
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
                style={{ background: '#EDE6D6' }}
              >
                <PhIcon name="ph-bold ph-x" size={10} color="#5B554A" />
              </button>
            )}
          </div>

          <div className="flex gap-[7px] flex-wrap mb-3.5">
            {DOC_SECTIONS.map((s) => (
              <span
                key={s.tag}
                className="inline-flex items-center gap-[5px] rounded-full text-[11.5px] font-extrabold"
                style={{ background: '#EDE6D6', color: '#5B554A', padding: '6px 11px' }}
              >
                <span style={{ color: '#C75A31' }}>{s.tag}</span>
                {s.name}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={askPennyDocsSummary}
            className="w-full border-none text-white rounded-[14px] text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2 mb-3.5"
            style={{ background: 'linear-gradient(150deg,#E06A3E,#C75A31)', padding: '13px 0' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={15} />
            Ask Penny to summarize
          </button>

          {showEx && (
            <div style={SECTION_CARD}>
              <div className="flex items-center justify-between gap-2.5 mb-[7px]">
                <p className="m-0 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.1em', color: '#C75A31' }}>
                  §4 · Exteriors
                </p>
                <button
                  type="button"
                  onClick={() => set({ diffOpen: !state.diffOpen })}
                  className="inline-flex items-center gap-[5px] rounded-full text-[10px] font-extrabold cursor-pointer font-sans"
                  style={{ border: '1px solid rgba(42,157,92,0.3)', background: '#E9F6EE', color: '#228049', padding: '4px 9px' }}
                >
                  <PhIcon name="ph-fill ph-git-diff" size={11} />
                  What changed
                </button>
              </div>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: '#3E4C63' }}>
                4.1 Structures visible from the street require ARC approval before work begins. 4.2{' '}
                <span style={{ background: '#FBEDE4', borderRadius: 4, padding: '1px 4px' }}>
                  Approved exterior palette: Cedar, Slate Gray, White, Sage, and Clay.
                </span>{' '}
                4.3 Fences max 6 ft, rear yards only.
              </p>
              {state.diffOpen && (
                <div className="animate-fadeup" style={{ marginTop: 11, borderTop: '1px dashed rgba(26,51,82,0.12)', paddingTop: 11 }}>
                  <p className="m-0 mb-1.5 text-[10.5px] font-extrabold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
                    March 2026 revision · §4.2
                  </p>
                  <p className="m-0 mb-[5px] text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: '#FBE4E0', color: '#B23A2B', textDecoration: 'line-through', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White
                    </span>
                  </p>
                  <p className="m-0 mb-2 text-[12.5px] font-bold" style={{ lineHeight: 1.55 }}>
                    <span style={{ background: '#E2F2E8', color: '#228049', borderRadius: 3, padding: '1px 3px' }}>
                      Cedar, Slate Gray, White, Sage, Clay
                    </span>
                  </p>
                  <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
                    Sage &amp; Clay added by board vote (91–22) on Jun 18, 2026.
                  </p>
                </div>
              )}
            </div>
          )}

          {showLiv && (
            <div style={SECTION_CARD}>
              <p className="m-0 mb-[7px] text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.1em', color: '#8A8375' }}>
                §5 · Living
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: '#3E4C63' }}>
                5.2 Quiet hours 10 PM–7 AM. 5.7 Up to 4 hens permitted, no roosters; coops need ARC sign-off. 5.9 Fireworks
                prohibited year-round.
              </p>
            </div>
          )}

          {showLease && (
            <div style={SECTION_CARD}>
              <p className="m-0 mb-[7px] text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.1em', color: '#8A8375' }}>
                §7 · Leasing
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: '#3E4C63' }}>
                7.4 Minimum lease term 6 months; register tenants with the office within 14 days. Short-term rentals are not
                permitted.
              </p>
            </div>
          )}

          {showAssess && (
            <div style={{ ...SECTION_CARD, marginBottom: 0 }}>
              <p className="m-0 mb-[7px] text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.1em', color: '#8A8375' }}>
                §9 · Assessments
              </p>
              <p className="m-0 text-[13px] font-semibold" style={{ lineHeight: 1.65, color: '#3E4C63' }}>
                Dues fund landscaping, insurance, utilities, and reserves. Late policy is courtesy-first: two reminders before any
                fee.
              </p>
            </div>
          )}

          {noMatch && (
            <div className="text-center" style={{ padding: '24px 16px' }}>
              <PhIcon name="ph ph-file-magnifying-glass" size={32} color="#A39B8B" className="inline-block" />
              <p className="mt-[9px] mb-0.5 text-sm font-extrabold text-navy">No section matches that</p>
              <p className="m-0 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
                Try &quot;palette&quot;, &quot;quiet&quot;, &quot;lease&quot; — or ask Penny above.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
