import { useEffect, useMemo, useRef, useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { useArchivedBoardTopics, useBoardChat, useRepository } from '../data/repo';
import type { BoardMessage } from '../data/repo';
import { usePavStore } from '../store/store';
import { confirmDestructive } from '../components/ConfirmSheet';
import { emitAppSuccess } from '../lib/errorBus';

/** The pinned thread every community always has. Stored as topic = null. */
const GENERAL = 'General';

/**
 * Board-only (live mode): the board's private chat as a full-screen overlay —
 * topic list (General pinned) → thread with composer. Any board member can
 * start a topic; threads support photos, deleting your own messages, and
 * renaming/archiving topics. Store-driven: `boardChatOpen` shows the screen,
 * `boardChatTopic` null = list, a string = that thread.
 */
export function BoardChat() {
  const open = usePavStore((s) => s.boardChatOpen);
  const topic = usePavStore((s) => s.boardChatTopic);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const chat = useBoardChat();
  const archived = useArchivedBoardTopics();
  const [msg, setMsg] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // General first (always, even empty), then topics by most recent activity;
  // archived topics stay hidden.
  const threads = useMemo(() => {
    const map = new Map<string, BoardMessage[]>([[GENERAL, []]]);
    chat.forEach((m) => {
      const k = m.topic ?? GENERAL;
      if (archived.includes(k)) return;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    });
    const [general, ...rest] = [...map.entries()];
    rest.sort((a, b) => chat.lastIndexOf(b[1][b[1].length - 1]) - chat.lastIndexOf(a[1][a[1].length - 1]));
    return [general, ...rest];
  }, [chat, archived]);

  const messages = useMemo(
    () => (topic ? chat.filter((m) => (m.topic ?? GENERAL) === topic) : []),
    [chat, topic],
  );

  // Keep the newest message in view when the thread grows or opens.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, topic, open]);

  if (!open) return null;

  const close = () => {
    set({ boardChatOpen: false, boardChatTopic: null });
    setCreating(false); setRenaming(false); setMsg(''); setNewName(''); setPhotos([]);
  };

  const send = (text: string, to: string) => {
    if ((!text.trim() && photos.length === 0) || busy) return;
    setBusy(true);
    repo.sendBoardMessage(text, to === GENERAL ? null : to, photos)
      .then(() => {
        setMsg(''); setNewName(''); setCreating(false); setPhotos([]);
        if (to !== topic) set({ boardChatTopic: to });
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const rename = () => {
    if (!topic || topic === GENERAL || !newName.trim()) return;
    setBusy(true);
    repo.renameBoardTopic(topic, newName.trim())
      .then(() => { set({ boardChatTopic: newName.trim() }); setRenaming(false); setNewName(''); })
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  const archive = () => {
    if (!topic || topic === GENERAL) return;
    void repo.archiveBoardTopic(topic).then(() => set({ boardChatTopic: null })).catch(() => {});
  };

  const input = (props: { value: string; onChange: (v: string) => void; placeholder: string; onEnter?: () => void; autoFocus?: boolean }) => (
    <input
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter') props.onEnter?.(); }}
      placeholder={props.placeholder}
      autoFocus={props.autoFocus}
      className="flex-1 rounded-full px-3.5 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
      style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
    />
  );

  return (
    <div className="absolute inset-0 z-[86] bg-cream flex flex-col animate-scpop">
      {/* Header */}
      <div className="flex items-center gap-2.5 flex-shrink-0" style={{ padding: '64px 18px 10px' }}>
        <button
          onClick={() => (topic !== null ? set({ boardChatTopic: null }) : close())}
          className="border-0 bg-transparent p-0 cursor-pointer flex items-center"
        >
          <PhIcon name="ph-bold ph-arrow-left" size={18} color="rgb(var(--navy))" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="m-0 font-serif font-normal text-[22px] text-navy truncate">{topic ?? 'Board chat'}</h1>
          <div className="flex items-center gap-1.5">
            <PhIcon name="ph-fill ph-lock-simple" size={11} color="rgb(var(--stone))" className="flex-shrink-0" />
            <p className="m-0 text-[11px] font-bold text-stone">Private to board members</p>
          </div>
        </div>
        {topic !== null && topic !== GENERAL && (
          <>
            <button
              onClick={() => { setRenaming(!renaming); setNewName(topic); }}
              title="Rename topic"
              className="w-8 h-8 rounded-full border-0 bg-paper cursor-pointer flex items-center justify-center"
            >
              <PhIcon name="ph-fill ph-pencil-simple" size={14} color="rgb(var(--navy))" />
            </button>
            <button
              onClick={archive}
              title="Archive topic"
              className="w-8 h-8 rounded-full border-0 bg-paper cursor-pointer flex items-center justify-center"
            >
              <PhIcon name="ph-fill ph-archive" size={14} color="rgb(var(--navy))" />
            </button>
          </>
        )}
        {topic === null && (
          <button
            type="button"
            aria-label="Close board chat"
            onClick={close}
            className="w-8 h-8 rounded-full border-0 bg-paper cursor-pointer flex items-center justify-center"
          >
            <PhIcon name="ph-bold ph-x" size={14} color="rgb(var(--navy))" />
          </button>
        )}
      </div>

      {renaming && topic && (
        <div className="flex gap-2 flex-shrink-0" style={{ padding: '0 18px 10px' }}>
          {input({ value: newName, onChange: setNewName, placeholder: 'New topic name', onEnter: rename, autoFocus: true })}
          <button
            onClick={rename}
            className="border-0 rounded-full px-3.5 text-[12px] font-extrabold cursor-pointer bg-navy text-cream"
          >
            Rename
          </button>
        </div>
      )}

      {topic === null ? (
        /* ── Topic list ── */
        <div className="flex-1 overflow-y-auto pav-scroll" style={{ padding: '4px 18px 44px' }}>
          {threads.map(([name, msgs]) => {
            const last = msgs[msgs.length - 1];
            return (
              <button
                key={name}
                onClick={() => { setCreating(false); set({ boardChatTopic: name }); }}
                className="w-full flex items-center gap-3 py-3 px-0 border-0 bg-transparent cursor-pointer text-left"
                style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
                  style={{ background: name === GENERAL ? 'rgb(var(--navy))' : 'rgb(var(--paper))', border: name === GENERAL ? 'none' : '1px solid rgb(var(--navy) / 0.1)' }}
                >
                  <PhIcon
                    name={name === GENERAL ? 'ph-fill ph-push-pin' : 'ph-fill ph-hash'}
                    size={16}
                    color={name === GENERAL ? 'rgb(var(--cream))' : 'rgb(var(--navy))'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[14px] font-bold text-navy">{name}</p>
                  <p className="m-0 text-[12px] font-semibold text-stone truncate">
                    {last ? `${last.me ? 'You' : last.authorName}: ${last.text || '📷 Photo'}` : 'No messages yet'}
                  </p>
                </div>
                <PhIcon name="ph-bold ph-caret-right" size={13} color="rgb(var(--stonelight))" className="flex-shrink-0" />
              </button>
            );
          })}

          {!creating ? (
            <button
              onClick={() => setCreating(true)}
              className="w-full rounded-full py-3 mt-4 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
            >
              + New topic
            </button>
          ) : (
            <div className="rounded-[18px] p-3.5 mt-4" style={{ border: '1px solid rgb(var(--navy) / 0.1)', background: 'rgb(var(--paper))' }}>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Topic — e.g. Pool repairs"
                autoFocus
                className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
              />
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && newName.trim()) send(msg, newName.trim()); }}
                placeholder="First message…"
                className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2.5"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
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
        </div>
      ) : (
        /* ── Thread ── */
        <>
          <div className="flex-1 overflow-y-auto pav-scroll" style={{ padding: '4px 18px 10px' }}>
            {messages.length === 0 && (
              <p className="m-0 mt-6 text-center text-[12.5px] font-semibold text-stone">
                No messages in this topic yet — start it off.
              </p>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-2.5 items-start group">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white flex-shrink-0"
                    style={{ background: m.authorColor }}
                  >
                    {m.authorInitial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[11px] font-bold text-stone">
                      {m.me ? 'You' : m.authorName} <span className="font-semibold" style={{ color: 'rgb(var(--stonelight))' }}>· {m.time}</span>
                    </p>
                    {m.text && <p className="m-0 text-[13.5px] leading-[1.45] font-semibold text-navy">{m.text}</p>}
                    {m.photoUrls.map((u) => (
                      <img key={u} src={u} alt="Photo in message" className="mt-1.5 rounded-[13px] max-w-[220px] block" style={{ maxHeight: 240, objectFit: 'cover' }} />
                    ))}
                  </div>
                  {m.me && (
                    <button
                      onClick={() => confirmDestructive({
                        title: 'Delete this message?',
                        body: 'It disappears from the board thread for every board member.',
                        confirmLabel: 'Delete message',
                        onConfirm: () => { void repo.deleteBoardMessage(m.id); emitAppSuccess('Message deleted.'); },
                      })}
                      title="Delete message"
                      className="border-0 bg-transparent p-1 cursor-pointer flex-shrink-0 opacity-40"
                    >
                      <PhIcon name="ph-bold ph-x" size={11} color="rgb(var(--stone))" />
                    </button>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          {/* Composer */}
          <div className="flex-shrink-0" style={{ padding: '10px 18px 40px', borderTop: '1px solid rgb(var(--navy) / 0.08)', background: 'rgb(var(--cream))' }}>
            {photos.length > 0 && (
              <p className="m-0 mb-1.5 text-[11.5px] font-bold" style={{ color: 'rgb(var(--sage))' }}>
                {photos.length} photo{photos.length > 1 ? 's' : ''} attached ✓
              </p>
            )}
            <div className="flex gap-2 items-center">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? [])].slice(0, 4))}
              />
              <button
                onClick={() => fileRef.current?.click()}
                title="Attach a photo"
                className="w-10 h-10 rounded-full cursor-pointer flex items-center justify-center flex-shrink-0 bg-paper border-0"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
              >
                <PhIcon name="ph-fill ph-image-square" size={16} color="rgb(var(--navy))" />
              </button>
              {input({ value: msg, onChange: setMsg, placeholder: `Message ${topic}…`, onEnter: () => send(msg, topic) })}
              <button
                onClick={() => send(msg, topic)}
                aria-label="Send"
                className="w-10 h-10 border-none rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ background: (msg.trim() || photos.length) && !busy ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
              >
                <PhIcon name="ph-fill ph-paper-plane-right" size={15} color="rgb(var(--cream))" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
