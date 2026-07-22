import { useEffect, useRef } from 'react';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useChatSeed, useChats, useRepository } from '../data/repo';

/** 1:1 chat thread screen — ported from prototype lines 1926-1953. */
export function Chat() {
  const state = usePavStore();
  const CHAT_SEED = useChatSeed();
  const { set } = state;
  const repo = useRepository();
  const demo = repo.isDemo();
  const chats = useChats();
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const chatKey = state.chatWith;
  const thread = chatKey ? chats[chatKey] : undefined;

  useEffect(() => {
    if (chatKey) repo.markChatRead(chatKey);
  }, [chatKey, thread, repo]);

  const sendChatMessage = () => {
    const t = state.chatInput.trim();
    if (!t || !chatKey) return;
    repo.sendChatMessage(chatKey, t);
    set({ chatInput: '' });
  };

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread]);

  if (!chatKey) return null;
  const p = CHAT_SEED[chatKey];
  if (!p) return null;

  // The demo prepends the neighbor's scripted opener; live threads are only
  // real messages (the index's `seed` is just the list preview there).
  const msgs = repo.isDemo()
    ? [{ me: false, text: p.seed, time: p.time }, ...(chats[chatKey] || [])]
    : (chats[chatKey] || []);

  return (
    <div
      data-screen-label="Chat"
      className="absolute inset-0 z-[78] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--cream))' }}
    >
      <div className="flex items-center gap-[11px]" style={{ padding: '58px 18px 12px', borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
        <button
          type="button"
          aria-label="Back to messages"
          onClick={() => set({ chatWith: null, msgsOpen: true })}
          className="border-none bg-transparent cursor-pointer p-1 font-sans"
        >
          <PhIcon name="ph-bold ph-arrow-left" size={17} color="rgb(var(--navy))" />
        </button>
        <div
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0"
          style={{ background: p.color }}
        >
          {p.initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="m-0 text-[14.5px] font-bold text-navy">
            {p.name}{' '}
            <span className="font-semibold" style={{ color: 'rgb(var(--stonelight))' }}>
              · {p.unit}
            </span>
          </p>
          <p className="m-0 text-[11px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Neighbor · usually replies fast
          </p>
        </div>
      </div>

      <div ref={listRef} className="pav-scroll flex-1 overflow-y-auto flex flex-col gap-2.5" style={{ padding: '16px 18px' }}>
        {msgs.map((m, i) => (
          <div key={m.id ?? i} className="flex flex-col group" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
            <div className="flex items-center gap-1.5" style={{ flexDirection: m.me ? 'row' : 'row-reverse' }}>
              {m.me && !demo && m.id && (
                <button
                  onClick={() => void repo.deleteChatMessage(chatKey, m.id!)}
                  title="Delete message"
                  className="border-0 bg-transparent p-0.5 cursor-pointer opacity-30"
                >
                  <PhIcon name="ph-bold ph-x" size={10} color="rgb(var(--stone))" />
                </button>
              )}
              <div
                style={{
                  maxWidth: '80%',
                  background: m.me ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                  color: m.me ? 'rgb(var(--cream))' : 'rgb(var(--navy))',
                  border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                  borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  padding: '10px 13px',
                }}
              >
                {m.text && <p className="m-0 text-[13.5px] leading-[1.45] font-semibold">{m.text}</p>}
                {(m.photos ?? []).map((u) => (
                  <img key={u} src={u} alt="" className="mt-1 rounded-[11px] block" style={{ maxWidth: 200, maxHeight: 220, objectFit: 'cover' }} />
                ))}
              </div>
            </div>
            <span className="text-[10.5px] font-bold" style={{ margin: '3px 4px 0', color: 'rgb(var(--claygray))' }}>
              {m.time || ''}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-[9px] items-center" style={{ padding: '10px 18px 26px' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && chatKey) void repo.sendChatMessage(chatKey, '', false, [f]);
            if (fileRef.current) fileRef.current.value = '';
          }}
        />
        <button
          type="button"
          title="Send a photo"
          onClick={() => {
            if (!chatKey) return;
            if (demo) { void repo.sendChatMessage(chatKey, '📷 Photo', false); return; }
            fileRef.current?.click();
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
        >
          <PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--stone))" />
        </button>
        <input
          value={state.chatInput}
          onChange={(e) => set({ chatInput: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendChatMessage();
          }}
          placeholder="Message…"
          className="flex-1 rounded-full text-[13.5px] font-semibold text-navy outline-none font-sans min-w-0"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', padding: '12px 16px' }}
        />
        <button
          type="button"
          aria-label="Send"
          onClick={sendChatMessage}
          className="w-11 h-11 border-none rounded-full bg-navy flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--cream))" />
        </button>
      </div>
    </div>
  );
}
