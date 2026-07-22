import { useMemo, useState } from 'react';
import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { useBoardChat, useRepository } from '../data/repo';
import { usePavStore } from '../store/store';
import type { BoardMessage } from '../data/repo';

/** The pinned thread every community always has. Stored as topic = null. */
const GENERAL = 'General';

/**
 * Board-only (live mode): the board's private chat, organized as topic
 * threads. General is always pinned at the top; any board member can start
 * a new topic. Navigation is store-driven: `boardChatTopic` null shows the
 * topic list, a string shows that thread.
 */
export function BoardChatSheet() {
  const open = usePavStore((s) => s.boardChatOpen);
  const topic = usePavStore((s) => s.boardChatTopic);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const chat = useBoardChat();
  const [msg, setMsg] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  // General first (always, even empty), then topics by most recent activity.
  const threads = useMemo(() => {
    const map = new Map<string, BoardMessage[]>([[GENERAL, []]]);
    chat.forEach((m) => {
      const k = m.topic ?? GENERAL;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    });
    const [general, ...rest] = [...map.entries()];
    rest.sort((a, b) => chat.lastIndexOf(b[1][b[1].length - 1]) - chat.lastIndexOf(a[1][a[1].length - 1]));
    return [general, ...rest];
  }, [chat]);

  if (!open) return null;
  const onClose = () => { set({ boardChatOpen: false, boardChatTopic: null }); setCreating(false); setMsg(''); setNewName(''); };

  const send = (text: string, to: string) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    repo.sendBoardMessage(text, to === GENERAL ? null : to)
      .then(() => { setMsg(''); setNewName(''); setCreating(false); if (to !== topic) set({ boardChatTopic: to }); })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const messages = topic ? chat.filter((m) => (m.topic ?? GENERAL) === topic) : [];

  return (
    <Sheet open onClose={onClose} maxHeight="88%">
      {/* Header */}
      <div className="flex items-center gap-2 mb-0.5">
        {topic !== null && (
          <button
            onClick={() => set({ boardChatTopic: null })}
            className="border-0 bg-transparent p-0 cursor-pointer flex items-center"
          >
            <PhIcon name="ph-bold ph-caret-left" size={18} color="rgb(var(--navy))" />
          </button>
        )}
        <p className="m-0 font-serif text-xl text-navy">{topic ?? 'Board chat'}</p>
      </div>
      <div className="flex items-center gap-1.5 mb-4">
        <PhIcon name="ph-fill ph-lock-simple" size={12} color="rgb(var(--stone))" className="flex-shrink-0" />
        <p className="m-0 text-[11.5px] font-bold text-stone">Private to board members — residents never see this.</p>
      </div>

      {topic === null ? (
        <>
          {/* Topic list — General pinned on top */}
          <div className="mb-4">
            {threads.map(([name, msgs], i) => {
              const last = msgs[msgs.length - 1];
              return (
                <button
                  key={name}
                  onClick={() => { setCreating(false); set({ boardChatTopic: name }); }}
                  className="w-full flex items-center gap-2.5 py-3 px-0 border-0 bg-transparent cursor-pointer text-left"
                  style={i < threads.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
                >
                  <div
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
                    style={{ background: name === GENERAL ? 'rgb(var(--navy))' : 'rgb(var(--parchment))' }}
                  >
                    <PhIcon
                      name={name === GENERAL ? 'ph-fill ph-push-pin' : 'ph-fill ph-hash'}
                      size={15}
                      color={name === GENERAL ? 'rgb(var(--cream))' : 'rgb(var(--navy))'}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13.5px] font-bold text-navy">{name}</p>
                    <p className="m-0 text-[11.5px] font-semibold text-stone truncate">
                      {last ? `${last.me ? 'You' : last.authorName}: ${last.text}` : 'No messages yet'}
                    </p>
                  </div>
                  <PhIcon name="ph-bold ph-caret-right" size={13} color="rgb(var(--stonelight))" className="flex-shrink-0" />
                </button>
              );
            })}
          </div>

          {/* Start a new topic */}
          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full rounded-full py-3 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
            >
              + New topic
            </button>
          ) : (
            <div className="rounded-[18px] p-3.5" style={{ border: '1px solid rgb(var(--navy) / 0.1)', background: 'rgb(var(--parchment))' }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Topic — e.g. Pool repairs"
                autoFocus
                className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
              />
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) send(msg, newName.trim()); }}
                placeholder="First message…"
                className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2.5"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setCreating(false); setNewName(''); setMsg(''); }}
                  className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { if (newName.trim()) send(msg, newName.trim()); }}
                  className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                  style={{ background: newName.trim() && msg.trim() && !busy ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
                >
                  Start topic
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Thread */}
          {messages.length > 0 ? (
            <div className="pav-scroll flex flex-col gap-2.5 mb-3 overflow-y-auto" style={{ maxHeight: 380 }}>
              {messages.map((m) => (
                <div key={m.id} className="flex gap-2.5 items-start">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold text-white flex-shrink-0"
                    style={{ background: m.authorColor }}
                  >
                    {m.authorInitial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[11px] font-bold text-stone">
                      {m.me ? 'You' : m.authorName} <span className="font-semibold" style={{ color: 'rgb(var(--stonelight))' }}>· {m.time}</span>
                    </p>
                    <p className="m-0 text-[13px] leading-[1.45] font-semibold text-navy">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="m-0 mb-3 text-[12.5px] font-semibold text-stone">No messages in this topic yet — start it off.</p>
          )}
          <div className="flex gap-2">
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(msg, topic); }}
              placeholder={`Message ${topic}…`}
              className="flex-1 rounded-full px-3.5 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
              style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
            />
            <button
              onClick={() => send(msg, topic)}
              className="w-10 h-10 border-none rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: msg.trim() && !busy ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
            >
              <PhIcon name="ph-fill ph-paper-plane-right" size={15} color="rgb(var(--cream))" />
            </button>
          </div>
        </>
      )}
    </Sheet>
  );
}
