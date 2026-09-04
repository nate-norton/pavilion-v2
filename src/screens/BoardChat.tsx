import { useEffect, useMemo, useRef, useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { useArchivedBoardTopics, useBoardChat, useRepository } from '../data/repo';
import type { BoardMessage } from '../data/repo';
import { usePavStore } from '../store/store';
import { confirmDestructive } from '../components/ConfirmSheet';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';

/** The pinned thread every community always has. Stored as topic = null. */
const GENERAL = 'General';

/** Header icon control: 44px target on paper, skydeep glyph. */
const ICON_BUTTON = 'w-11 h-11 rounded-full border-0 bg-paper cursor-pointer flex items-center justify-center flex-shrink-0';

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

  // Failures: the data layer toasts the cause and rethrows, so `.then` never
  // runs and the draft stays exactly where the member left it.
  const send = (text: string, to: string) => {
    if ((!text.trim() && photos.length === 0) || busy) return;
    setBusy(true);
    repo.sendBoardMessage(text, to === GENERAL ? null : to, photos)
      .then(() => {
        setMsg(''); setNewName(''); setCreating(false); setPhotos([]);
        if (to !== topic) set({ boardChatTopic: to });
      })
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  const rename = () => {
    if (!topic || topic === GENERAL || !newName.trim()) return;
    setBusy(true);
    repo.renameBoardTopic(topic, newName.trim())
      .then(() => { set({ boardChatTopic: newName.trim() }); setRenaming(false); setNewName(''); })
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  const archive = () => {
    if (!topic || topic === GENERAL) return;
    const name = topic;
    confirmDestructive({
      title: `Archive “${name}”?`,
      body: 'The topic leaves the list for every board member. Its messages are kept, and General stays where it is.',
      confirmLabel: 'Archive topic',
      onConfirm: () => {
        void repo.archiveBoardTopic(name)
          .then(() => { set({ boardChatTopic: null }); emitAppSuccess(`“${name}” archived.`); })
          .catch(reportedByDataLayer);
      },
    });
  };

  const canStart = newName.trim().length > 0 && (msg.trim().length > 0 || photos.length > 0) && !busy;
  const canSend = (msg.trim().length > 0 || photos.length > 0) && !busy;

  return (
    <div className="pav-fixed absolute inset-0 z-[86] bg-mist flex flex-col animate-scpop">
      {/* Header */}
      <div className="flex items-center gap-2 flex-shrink-0" style={{ padding: 'calc(60px + var(--pav-chrome-top)) 14px 8px' }}>
        <button
          type="button"
          aria-label={topic !== null ? 'Back to topics' : 'Close board chat'}
          onClick={() => (topic !== null ? set({ boardChatTopic: null }) : close())}
          className="w-11 h-11 -ml-2 border-0 bg-transparent p-0 cursor-pointer flex items-center justify-center flex-shrink-0"
        >
          <PhIcon name="ph-bold ph-arrow-left" size={18} color="rgb(var(--skydeep))" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="m-0 font-serif font-normal text-[19px] text-navy truncate">{topic ?? 'Board chat'}</h1>
          <div className="flex items-center gap-1.5">
            <PhIcon name="ph-fill ph-lock-simple" size={11} color="rgb(var(--slate))" className="flex-shrink-0" />
            <p className="m-0 text-[12px] font-bold text-slate">Private to board members</p>
          </div>
        </div>
        {topic !== null && topic !== GENERAL && (
          <>
            <button
              type="button"
              onClick={() => { setRenaming(!renaming); setNewName(topic); }}
              aria-label="Rename topic"
              aria-expanded={renaming}
              className={ICON_BUTTON}
            >
              <PhIcon name="ph-fill ph-pencil-simple" size={15} color="rgb(var(--skydeep))" />
            </button>
            <button
              type="button"
              onClick={archive}
              aria-label="Archive topic"
              className={ICON_BUTTON}
            >
              <PhIcon name="ph-fill ph-archive" size={15} color="rgb(var(--skydeep))" />
            </button>
          </>
        )}
        {topic === null && (
          <button
            type="button"
            aria-label="Close board chat"
            onClick={close}
            className={ICON_BUTTON}
          >
            <PhIcon name="ph-bold ph-x" size={15} color="rgb(var(--skydeep))" />
          </button>
        )}
      </div>

      {renaming && topic && (
        <div className="flex gap-2 items-end flex-shrink-0" style={{ padding: '0 18px 10px' }}>
          <Field
            label="Topic name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') rename(); }}
            autoFocus
            className="flex-1 min-w-0"
          />
          <button
            type="button"
            onClick={rename}
            disabled={!newName.trim() || busy}
            className="border-0 rounded-[11px] min-h-[44px] px-3.5 text-[13px] font-extrabold cursor-pointer bg-skydeep text-white font-sans"
          >
            Save name
          </button>
        </div>
      )}

      {topic === null ? (
        /* ── Topic list ── */
        <div className="flex-1 overflow-y-auto pav-scroll" style={{ padding: '4px 18px calc(44px + var(--pav-safe-bottom))' }}>
          {threads.map(([name, msgs]) => {
            const last = msgs[msgs.length - 1];
            return (
              <button
                type="button"
                key={name}
                onClick={() => { setCreating(false); set({ boardChatTopic: name }); }}
                className="w-full flex items-center gap-3 py-3 px-0 border-0 bg-transparent cursor-pointer text-left font-sans"
                style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
              >
                <div
                  className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
                  style={{ background: name === GENERAL ? 'rgb(var(--skydeep))' : 'rgb(var(--paper))', border: name === GENERAL ? 'none' : '1px solid rgb(var(--navy) / 0.1)' }}
                >
                  <PhIcon
                    name={name === GENERAL ? 'ph-fill ph-push-pin' : 'ph-fill ph-hash'}
                    size={16}
                    color={name === GENERAL ? 'rgb(var(--white))' : 'rgb(var(--skydeep))'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[14px] font-bold text-navy truncate">{name}</p>
                  <p className="m-0 text-[12px] font-semibold text-slate truncate">
                    {last ? `${last.me ? 'You' : last.authorName}: ${last.text || 'Photo'}` : 'No messages yet'}
                  </p>
                </div>
                <PhIcon name="ph-bold ph-caret-right" size={13} color="rgb(var(--slatelight))" className="flex-shrink-0" />
              </button>
            );
          })}

          {!creating ? (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="w-full rounded-full min-h-[44px] py-3 mt-4 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy font-sans"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
            >
              New topic
            </button>
          ) : (
            <Card elevation="raised" className="mt-4">
              <Field
                label="Topic"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Pool repairs"
                autoFocus
                className="mb-3"
              />
              <Field
                label="First message"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && canStart) send(msg, newName.trim()); }}
                className="mb-3.5"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setCreating(false); setNewName(''); setMsg(''); }}
                  className="flex-1 rounded-full min-h-[44px] py-2.5 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy font-sans"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { if (canStart) send(msg, newName.trim()); }}
                  disabled={!canStart}
                  className="flex-1 border-0 rounded-full min-h-[44px] py-2.5 text-[13px] font-extrabold cursor-pointer font-sans"
                  style={{
                    background: canStart ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
                    color: canStart ? 'rgb(var(--white))' : 'rgb(var(--slatedark))',
                  }}
                >
                  {busy ? 'Starting…' : 'Start topic'}
                </button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* ── Thread ── */
        <>
          <div className="flex-1 overflow-y-auto pav-scroll" style={{ padding: '4px 18px 10px' }}>
            {messages.length === 0 && (
              <p className="m-0 mt-6 text-center text-[13px] font-semibold text-slate">
                No messages in this topic yet — send the first one.
              </p>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((m) => (
                <div key={m.id} className="flex gap-2.5 items-start group">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold text-white flex-shrink-0"
                    style={{ background: m.authorColor }}
                    aria-hidden="true"
                  >
                    {m.authorInitial}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[12px] font-bold text-slate">
                      {m.me ? 'You' : m.authorName} <span className="font-semibold">· {m.time}</span>
                    </p>
                    {m.text && <p className="m-0 text-[13.5px] leading-[1.45] font-semibold text-navy break-words">{m.text}</p>}
                    {m.photoUrls.map((u) => (
                      <img key={u} loading="lazy" decoding="async" src={u} alt="Photo in message" className="mt-1.5 rounded-[13px] max-w-[220px] block" style={{ maxHeight: 240, objectFit: 'cover' }} />
                    ))}
                  </div>
                  {m.me && (
                    <button
                      type="button"
                      onClick={() => confirmDestructive({
                        title: 'Delete this message?',
                        body: 'It disappears from the board thread for every board member.',
                        confirmLabel: 'Delete message',
                        onConfirm: () => {
                          void repo.deleteBoardMessage(m.id)
                            .then(() => emitAppSuccess('Message deleted.'))
                            .catch(reportedByDataLayer);
                        },
                      })}
                      aria-label="Delete message"
                      className="border-0 bg-transparent w-11 h-11 -my-2.5 -mr-2 cursor-pointer flex-shrink-0 flex items-center justify-center opacity-60"
                    >
                      <PhIcon name="ph-bold ph-x" size={12} color="rgb(var(--slatedark))" />
                    </button>
                  )}
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </div>

          {/* Composer */}
          <div className="flex-shrink-0" style={{ padding: '10px 18px calc(40px + var(--pav-safe-bottom))', borderTop: '1px solid rgb(var(--navy) / 0.08)', background: 'rgb(var(--mist))' }}>
            {photos.length > 0 && (
              <p className="m-0 mb-1.5 text-[12px] font-bold text-sagedark" role="status">
                {photos.length} {photos.length > 1 ? 'photos' : 'photo'} attached
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
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label="Attach a photo"
                className={ICON_BUTTON}
                style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
              >
                <PhIcon name="ph-fill ph-image-square" size={16} color="rgb(var(--skydeep))" />
              </button>
              {/* The label stays for assistive tech; on a chat composer a
                  visible one would just repeat the thread title above. */}
              <Field
                label={`Message ${topic}`}
                hideLabel
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') send(msg, topic); }}
                placeholder={`Message ${topic}…`}
                className="flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={() => send(msg, topic)}
                aria-label="Send message"
                disabled={!canSend}
                className="w-11 h-11 border-none rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ background: canSend ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))' }}
              >
                <PhIcon name="ph-fill ph-paper-plane-right" size={15} color={canSend ? 'rgb(var(--white))' : 'rgb(var(--slatedark))'} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
