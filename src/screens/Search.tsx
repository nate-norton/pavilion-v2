import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { SEARCH } from '../data';

const SUGGESTIONS = ['fence colors', 'pool hours', 'ladder', 'annual meeting'];

/** Global search screen — ported from prototype lines 2359-2403. */
export function Search() {
  const state = usePavStore();
  const { set } = state;

  if (!state.searchOpen) return null;

  const sq = state.searchQ.trim().toLowerCase();
  const rows = sq ? SEARCH.filter((r) => (r.title + ' ' + r.sub + ' ' + r.k).toLowerCase().includes(sq)) : [];

  return (
    <div
      data-screen-label="Search"
      className="absolute inset-0 z-[96] flex flex-col animate-scpop"
      style={{ background: '#F5F0E6', padding: '58px 18px 20px' }}
    >
      <div className="flex gap-[9px] items-center mb-3.5">
        <div
          className="flex-1 flex items-center gap-[9px] rounded-full"
          style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.12)', padding: '11px 15px' }}
        >
          <PhIcon name="ph-bold ph-magnifying-glass" size={15} color="#8A8375" className="flex-shrink-0" />
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
          style={{ color: '#8A8375' }}
        >
          Cancel
        </button>
      </div>

      {sq.length === 0 && (
        <div>
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            One box for everything
          </p>
          <p className="m-0 mb-3.5 text-[13px] font-semibold" style={{ lineHeight: 1.55, color: '#7A7365' }}>
            The CC&amp;Rs, every board decision ever made, neighbors, and events — searchable forever. No more relitigating 2019.
          </p>
          <div className="flex gap-2 flex-wrap">
            {SUGGESTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set({ searchQ: t })}
                className="text-navy rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans"
                style={{ border: '1px solid rgba(26,51,82,0.14)', background: '#FFFEFA', padding: '8px 14px' }}
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
              style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 14px' }}
            >
              <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: '#EDE6D6' }}>
                <PhIcon name={r.icon} size={17} color="#1A3352" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.3]">{r.title}</p>
                <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                  {r.sub}
                </p>
              </div>
              <span
                className="rounded-full text-[10px] font-bold flex-shrink-0"
                style={{ background: '#F5F0E6', color: '#8A8375', padding: '3px 9px' }}
              >
                {r.cat}
              </span>
            </div>
          ))}
        </div>
      )}

      {sq.length > 0 && rows.length === 0 && (
        <div className="text-center" style={{ padding: '34px 16px' }}>
          <PhIcon name="ph ph-binoculars" size={34} color="#A39B8B" className="inline-block" />
          <p className="mt-2.5 mb-1 text-sm font-bold text-navy">Nothing in the Ridge matches that</p>
          <p className="m-0 mb-4 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
            Penny can dig deeper — she&apos;s read every page.
          </p>
          <button
            type="button"
            onClick={() => set({ searchOpen: false, pennyOpen: true })}
            className="border-none text-white rounded-full text-[13px] font-extrabold cursor-pointer font-sans inline-flex items-center gap-[7px]"
            style={{ background: 'linear-gradient(150deg,#E06A3E,#C75A31)', padding: '11px 18px' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={14} />
            Ask Penny instead
          </button>
        </div>
      )}
    </div>
  );
}
