import { BackButton } from '../components/BackButton';
import { usePavStore } from '../store/store';
import { CHAT_SEED } from '../data';

/** Messages inbox screen — ported from prototype lines 1902-1924. */
export function Messages() {
  const state = usePavStore();
  const { set } = state;

  if (!state.msgsOpen || state.chatWith) return null;

  return (
    <div
      data-screen-label="Messages"
      className="pav-scroll absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ msgsOpen: false })} />
      <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">Messages</h1>
      <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
        Neighbor-to-neighbor. Private, and never in the feed.
      </p>
      <div className="flex flex-col gap-[9px]">
        {Object.entries(CHAT_SEED).map(([k, p]) => {
          const mine = state.chats[k] || [];
          const last = mine.length ? mine[mine.length - 1] : { text: p.seed, me: false };
          const preview = (last.me ? 'You: ' : '') + last.text;
          const lastTime = mine.length ? mine[mine.length - 1].time || 'now' : p.time;
          return (
            <div
              key={k}
              onClick={() => set({ chatWith: k, msgsOpen: false })}
              className="flex items-center gap-3 cursor-pointer"
              style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 14px' }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                style={{ background: p.color }}
              >
                {p.initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="m-0 flex-1 text-sm font-extrabold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {p.name}{' '}
                    <span className="font-semibold" style={{ color: '#A39B8B' }}>
                      · {p.unit}
                    </span>
                  </p>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#A39B8B' }}>
                    {lastTime}
                  </span>
                </div>
                <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#8A8375' }}>
                  {preview}
                </p>
              </div>
              {p.unread > 0 && (
                <span data-testid="msg-unread" className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: '#E06A3E' }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
