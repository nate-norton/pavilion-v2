import { useEffect, useRef, useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useChatSeed, useChats, useRepository } from '../data/repo';
import { confirmDestructive } from '../components/ConfirmSheet';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';

/** 1:1 chat thread screen — ported from prototype lines 1926-1953. */
export function Chat() {
  const chatKey = usePavStore((s) => s.chatWith);
  const set = usePavStore((s) => s.set);
  const CHAT_SEED = useChatSeed();
  const repo = useRepository();
  const demo = repo.isDemo();
  const chats = useChats();
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // The draft lives here rather than in the store: a keystroke used to
  // re-render every whole-store subscriber in the app. It is committed on send.
  const [draft, setDraft] = useState('');

  const thread = chatKey ? chats[chatKey] : undefined;

  useEffect(() => {
    if (chatKey) repo.markChatRead(chatKey);
  }, [chatKey, thread, repo]);

  const sendChatMessage = () => {
    const t = draft.trim();
    if (!t || !chatKey) return;
    setDraft('');
    void repo.sendChatMessage(chatKey, t).catch(() => { setDraft(t); reportedByDataLayer(); });
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
      className="pav-fixed absolute inset-0 z-[78] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--mist))' }}
    >
      <div className="flex items-center gap-2 bg-paper" style={{ padding: 'calc(50px + var(--pav-chrome-top)) 12px 8px 8px', borderBottom: '1px solid rgb(var(--navy) / 0.08)' }}>
        <button
          type="button"
          aria-label="Back to messages"
          onClick={() => set({ chatWith: null, msgsOpen: true })}
          className="w-11 h-11 border-none bg-transparent cursor-pointer font-sans flex items-center justify-center flex-shrink-0 rounded-full"
        >
          <PhIcon name="ph-bold ph-arrow-left" size={18} color="rgb(var(--skydeep))" />
        </button>
        <Avatar initial={p.initial} color={p.color} size={38} />
        <div className="flex-1 min-w-0">
          <h1 className="m-0 text-[14.5px] font-bold text-navy font-sans leading-[1.3] overflow-hidden text-ellipsis whitespace-nowrap">
            {p.name}{' '}
            <span className="font-semibold text-slate">· {p.unit}</span>
          </h1>
          <p className="m-0 text-[12px] font-bold text-slate">
            {demo ? 'Neighbor · usually replies fast' : 'Neighbor'}
          </p>
        </div>
      </div>

      <div ref={listRef} className="pav-scroll flex-1 overflow-y-auto flex flex-col gap-2.5" style={{ padding: '16px 18px' }} aria-live="polite">
        {msgs.map((m, i) => (
          <div key={m.id ?? i} className="flex flex-col group" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
            <div className="flex items-center gap-1" style={{ flexDirection: m.me ? 'row' : 'row-reverse' }}>
              {m.me && !demo && m.id && (
                <button
                  type="button"
                  onClick={() => confirmDestructive({
                    title: 'Delete this message?',
                    body: 'It disappears from the thread for both of you.',
                    confirmLabel: 'Delete message',
                    onConfirm: () => {
                      void repo.deleteChatMessage(chatKey, m.id!)
                        .then(() => emitAppSuccess('Message deleted.'))
                        .catch(reportedByDataLayer);
                    },
                  })}
                  aria-label="Delete this message"
                  className="w-11 h-11 -my-3 border-0 bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0 opacity-50"
                >
                  <PhIcon name="ph-bold ph-x" size={12} color="rgb(var(--slate))" />
                </button>
              )}
              <div
                style={{
                  maxWidth: '80%',
                  background: m.me ? 'rgb(var(--skydeep))' : 'rgb(var(--paper))',
                  color: m.me ? 'rgb(var(--mist))' : 'rgb(var(--navy))',
                  border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                  borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  padding: '10px 13px',
                }}
              >
                {m.text && <p className="m-0 text-[13.5px] leading-[1.45] font-semibold break-words">{m.text}</p>}
                {(m.photos ?? []).map((u) => (
                  <img key={u} src={u} alt="Photo in message" loading="lazy" decoding="async" className="mt-1 rounded-[11px] block" style={{ maxWidth: 200, maxHeight: 220, objectFit: 'cover' }} />
                ))}
              </div>
            </div>
            <span className="text-[12px] font-bold text-slate" style={{ margin: '3px 4px 0' }}>
              {m.time || ''}
            </span>
          </div>
        ))}
      </div>

      {/* The composer sits on its own paper bed so it reads as a control strip, not more feed. */}
      <div className="flex gap-2 items-center bg-paper" style={{ padding: '10px 18px calc(22px + var(--pav-safe-bottom))', borderTop: '1px solid rgb(var(--navy) / 0.08)' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f && chatKey) void repo.sendChatMessage(chatKey, '', false, [f]).catch(reportedByDataLayer);
            if (fileRef.current) fileRef.current.value = '';
          }}
        />
        <button
          type="button"
          aria-label="Send a photo"
          onClick={() => {
            if (!chatKey) return;
            if (demo) { void repo.sendChatMessage(chatKey, '📷 Photo', false); return; }
            fileRef.current?.click();
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' }}
        >
          <PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--slate))" />
        </button>
        <Field
          label={`Message ${p.name}`}
          hideLabel
          className="flex-1 min-w-0"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendChatMessage();
          }}
          placeholder="Message…"
          maxLength={2000}
          autoComplete="off"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))', borderRadius: 22, padding: '10px 16px' }}
        />
        <button
          type="button"
          aria-label="Send"
          onClick={sendChatMessage}
          className="w-11 h-11 border-none rounded-full bg-skydeep flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--mist))" />
        </button>
      </div>
    </div>
  );
}
