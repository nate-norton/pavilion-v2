import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useSearchIndex, useMember, useRepository } from '../data/repo';

const SUGGESTIONS = ['fence colors', 'pool hours', 'ladder', 'annual meeting'];

/** Global search screen — ported from prototype lines 2359-2403. */
export function Search() {
  const state = usePavStore();
  const SEARCH = useSearchIndex();
  const member = useMember();
  const demo = useRepository().isDemo();
  const { set } = state;
  // "the Ridge" is Juniper Ridge's name, not every community's.
  const communityName = member?.communityName ?? 'your community';

  if (!state.searchOpen) return null;

  const sq = state.searchQ.trim().toLowerCase();
  const rows = sq ? SEARCH.filter((r) => (r.title + ' ' + r.sub + ' ' + r.k).toLowerCase().includes(sq)) : [];

  return (
    <div
      data-screen-label="Search"
      className="absolute inset-0 z-[96] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: '58px 18px 20px' }}
    >
      <div className="flex gap-[9px] items-center mb-3.5">
        <div
          className="flex-1 flex items-center gap-[9px] rounded-full"
          style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.12)', padding: '11px 15px' }}
        >
          <PhIcon name="ph-bold ph-magnifying-glass" size={15} color="rgb(var(--slate))" className="flex-shrink-0" />
          <input
            value={state.searchQ}
            onChange={(e) => set({ searchQ: e.target.value })}
            placeholder="Docs, decisions, people, events…"
            className="flex-1 border-none bg-transparent text-[13.5px] font-semibold text-navy outline-none font-sans min-w-0"
          />
        </div>
        <button
          type="button"
          onClick={() => set({ searchOpen: false })}
          className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans flex-shrink-0"
          style={{ color: 'rgb(var(--slate))' }}
        >
          Cancel
        </button>
      </div>

      {sq.length === 0 && (
        <div>
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--slate))' }}>
            One box for everything
          </p>
          <p className="m-0 mb-3.5 text-[13px] font-semibold" style={{ lineHeight: 1.55, color: 'rgb(var(--slatedeep))' }}>
            The CC&amp;Rs, every board decision ever made, neighbors, and events — searchable forever. No more relitigating 2019.
          </p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ searchQ: t })}
                className="text-navy rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans"
                style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--paper))', padding: '8px 14px' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="pav-scroll flex-1 overflow-y-auto flex flex-col gap-[9px]">
          {rows.map((r) => (
            <div
              key={r.title}
              className="flex items-center gap-3"
              style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '13px 14px' }}
            >
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skyborder))' }}>
                <PhIcon name={r.icon} size={17} color="rgb(var(--skydeep))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.3]">{r.title}</p>
                <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                  {r.sub}
                </p>
              </div>
              <span
                className="rounded-full text-[10px] font-bold flex-shrink-0"
                style={{ background: 'rgb(var(--mist))', color: 'rgb(var(--slate))', padding: '3px 9px' }}
              >
                {r.cat}
              </span>
            </div>
          ))}
        </div>
      )}

      {sq.length > 0 && rows.length === 0 && (
        <div className="text-center" style={{ padding: '34px 16px' }}>
          <PhIcon name="ph ph-binoculars" size={34} color="rgb(var(--slatelight))" className="inline-block" />
          <p className="mt-2.5 mb-1 text-sm font-bold text-navy">Nothing in {communityName} matches that</p>
          {/*
            The assistant only exists in the demo, so live neither offers it
            nor claims it has read anything.
          */}
          <p className="m-0 mb-4 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
            {demo
              ? 'AI can dig deeper — it’s read every page.'
              : 'Try a document name, a unit number, or a neighbor’s name.'}
          </p>
          {demo && (
          <button
            type="button"
            onClick={() => set({ searchOpen: false, aiOpen: true })}
            className="border-none text-white rounded-full text-[13px] font-extrabold cursor-pointer font-sans inline-flex items-center gap-[7px]"
            style={{ background: 'linear-gradient(150deg,rgb(var(--sunsetdeep)),rgb(var(--sunsetshade)))', padding: '11px 18px' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={14} />
            Ask AI instead
          </button>
          )}
        </div>
      )}
    </div>
  );
}
