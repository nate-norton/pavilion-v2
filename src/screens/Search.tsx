import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { SectionHeading } from '../components/SectionHeading';
import { usePavStore } from '../store/store';
import { useSearchIndex, useMember, useRepository } from '../data/repo';

const SUGGESTIONS = ['fence colors', 'pool hours', 'ladder', 'annual meeting'];

/** Global search screen — ported from prototype lines 2359-2403. */
export function Search() {
  const searchOpen = usePavStore((s) => s.searchOpen);
  const searchQ = usePavStore((s) => s.searchQ);
  const set = usePavStore((s) => s.set);
  const SEARCH = useSearchIndex();
  const member = useMember();
  const demo = useRepository().isDemo();
  // "the Ridge" is Juniper Ridge's name, not every community's.
  const communityName = member?.communityName ?? 'your community';

  if (!searchOpen) return null;

  const sq = searchQ.trim().toLowerCase();
  const rows = sq ? SEARCH.filter((r) => (r.title + ' ' + r.sub + ' ' + r.k).toLowerCase().includes(sq)) : [];
  // Results grouped by what they are, in the order the index lists them.
  const groups = rows.reduce<{ cat: string; rows: typeof rows }[]>((acc, r) => {
    const g = acc.find((x) => x.cat === r.cat);
    if (g) g.rows.push(r); else acc.push({ cat: r.cat, rows: [r] });
    return acc;
  }, []);

  return (
    <div
      data-screen-label="Search"
      className="pav-fixed absolute inset-0 z-[96] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(58px + var(--pav-chrome-top)) 18px 20px' }}
    >
      <div className="flex gap-2 items-center mb-3.5">
        <div className="flex-1 min-w-0 relative">
          <PhIcon name="ph-bold ph-magnifying-glass" size={15} color="rgb(var(--slate))" className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Field
            label={`Search ${communityName}`}
            hideLabel
            type="search"
            aria-label={`Search ${communityName}`}
            value={searchQ}
            onChange={(e) => set({ searchQ: e.target.value })}
            placeholder="Docs, decisions, people, events…"
            autoComplete="off"
            autoFocus
            style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', borderRadius: 22, padding: '10px 15px 10px 40px' }}
          />
        </div>
        <button
          type="button"
          onClick={() => set({ searchOpen: false })}
          className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans flex-shrink-0 min-h-[44px] px-2 text-slate"
        >
          Cancel
        </button>
      </div>

      {sq.length === 0 && (
        <div>
          <SectionHeading title="One box for everything" />
          <p className="m-0 mb-3.5 text-[13px] font-semibold leading-[1.55] text-slatedeep">
            The CC&amp;Rs, every board decision ever made, neighbors, and events — searchable forever. No more relitigating 2019.
          </p>
          <p className="m-0 mb-2 text-[12.5px] font-bold text-slatedark">Try searching for</p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ searchQ: t })}
                className="text-navy rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans min-h-[44px] px-3.5"
                style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--paper))' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div
          className="pav-scroll flex-1 overflow-y-auto"
          style={{ paddingBottom: 'var(--pav-safe-bottom)' }}
          aria-live="polite"
        >
          <p className="sr-only">{rows.length} result{rows.length === 1 ? '' : 's'}</p>
          {groups.map((g) => (
            <section key={g.cat} className="mb-4">
              <SectionHeading title={g.cat} meta={`${g.rows.length} match${g.rows.length === 1 ? '' : 'es'}`} />
              <div className="flex flex-col gap-[9px]">
                {g.rows.map((r) => (
                  <div
                    key={r.title}
                    className="flex items-center gap-3 bg-paper"
                    style={{ border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '13px 14px' }}
                  >
                    <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 bg-skyborder">
                      <PhIcon name={r.icon} size={17} color="rgb(var(--skydeep))" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 mb-px text-[13.5px] font-bold text-navy leading-[1.3]">{r.title}</p>
                      <p className="m-0 text-[12.5px] font-semibold text-slate">{r.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {sq.length > 0 && rows.length === 0 && (
        <div className="text-center" style={{ padding: '34px 16px' }} aria-live="polite">
          <PhIcon name="ph ph-binoculars" size={34} color="rgb(var(--slatelight))" className="inline-block" />
          <p className="mt-2.5 mb-1 text-[13.5px] font-bold text-navy">Nothing in {communityName} matches that</p>
          {/*
            The assistant only exists in the demo, so live neither offers it
            nor claims it has read anything.
          */}
          <p className="m-0 mb-4 text-[12.5px] font-semibold text-slate">
            {demo
              ? 'AI can dig deeper — it’s read every page.'
              : 'Try a document name, a unit number, or a neighbor’s name.'}
          </p>
          {demo && (
          <button
            type="button"
            onClick={() => set({ searchOpen: false, aiOpen: true })}
            className="bg-ai border-none rounded-full text-[13px] font-extrabold cursor-pointer font-sans inline-flex items-center gap-[7px] text-navy min-h-[44px]"
            style={{ padding: '11px 18px' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={14} color="rgb(var(--navy))" />
            Ask AI instead
          </button>
          )}
        </div>
      )}
    </div>
  );
}
