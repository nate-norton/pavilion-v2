import { useEffect, useRef, useState } from 'react';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { TypingDots } from '../components/TypingDots';
import { usePavStore } from '../store/store';
import { useAiQA, useRepository } from '../data/repo';

/** AI scripted-assistant sheet — ported from prototype lines 1399-1449. */
export function AiSheet() {
  const aiOpen = usePavStore((s) => s.aiOpen);
  const msgs = usePavStore((s) => s.msgs);
  const typing = usePavStore((s) => s.typing);
  const set = usePavStore((s) => s.set);
  const askAiChip = usePavStore((s) => s.askAiChip);
  const sendAiMessage = usePavStore((s) => s.sendAiMessage);
  const QA = useAiQA();
  // The scripted assistant is demo-only; live stubs the sheet until a real
  // document-grounded assistant exists — no canned answers in production.
  const demo = useRepository().isDemo();
  const listRef = useRef<HTMLDivElement>(null);
  // The draft is local: a keystroke used to re-render every whole-store
  // subscriber. It is handed to the store only on send.
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    if (!aiOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set({ aiOpen: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [aiOpen, set]);

  if (!aiOpen) return null;

  const close = () => set({ aiOpen: false });
  const openCite = () => set({ aiOpen: false, docsOpen: true, docReader: true });
  const askTheBoard = () => set({ aiOpen: false, reportOpen: true, reportType: 'Other' });
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    sendAiMessage(t);
    setDraft('');
  };

  return (
    <div className="pav-fixed pav-sheet-root absolute inset-0 z-[85]">
      <div
        data-testid="ai-scrim"
        onClick={close}
        className="pav-scrim absolute inset-0 animate-scrimfade"
        style={{ background: 'rgb(var(--scrim) / 0.4)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Ask AI"
        className="pav-sheet absolute left-0 right-0 bottom-0 bg-mistpale rounded-t-[28px] flex flex-col animate-sheetup"
        style={{
          height: '78%',
          // The composer is the point of this sheet, so it rides above the
          // software keyboard rather than sitting behind it, and gives back
          // the height it borrowed.
          bottom: 'var(--pav-keyboard)',
          maxHeight: 'calc(100% - var(--pav-keyboard))',
          boxShadow: '0 -18px 50px rgb(var(--scrim) / 0.25)',
        }}
      >
        {/* The header is the one AI-gradient surface here; everything on it is navy (white fails on the amber stop). */}
        <div className="bg-ai rounded-t-[28px] flex items-center gap-[11px] px-[18px] pt-4 pb-3.5">
          <div
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgb(var(--navy) / 0.12)' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={18} color="rgb(var(--navy))" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="m-0 text-[14px] font-bold text-navy font-sans">Ask AI</h2>
            <p className="m-0 text-[12.5px] font-bold text-navy" style={{ opacity: 0.85 }}>
              {demo ? "Answers cite Juniper Ridge's actual documents" : 'Coming soon'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="border-none bg-transparent w-11 h-11 -mr-2 flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            <span className="w-[30px] h-[30px] rounded-full flex items-center justify-center" style={{ background: 'rgb(var(--navy) / 0.12)' }}>
              <PhIcon name="ph-bold ph-x" size={13} color="rgb(var(--navy))" />
            </span>
          </button>
        </div>

        {!demo ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10 text-center">
            <PhIcon name="ph-fill ph-sparkle" size={30} color="rgb(var(--slatefaint))" />
            <p className="m-0 mt-3 text-[14px] font-bold text-navy">Ask AI is on the way</p>
            <p className="m-0 mt-1.5 text-[13px] font-semibold leading-[1.5] text-slate">
              It will answer questions about rules, dues, and amenities — grounded in your
              community&apos;s actual documents, with citations.
            </p>
          </div>
        ) : (
        <>
        <div
          ref={listRef}
          data-ai-scroll
          className="pav-scroll flex-1 overflow-y-auto px-[18px] py-4 flex flex-col gap-2.5"
          aria-live="polite"
        >
          {msgs.map((m, i) => (
            <div key={i} className="flex" style={{ justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
              <div
                className="max-w-[82%] animate-msgbubble"
                style={{
                  background: m.me ? 'rgb(var(--skydeep))' : 'rgb(var(--paper))',
                  color: m.me ? 'rgb(var(--mist))' : 'rgb(var(--navy))',
                  border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                  borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  padding: '11px 14px',
                }}
              >
                <p className="m-0 text-[13.5px] leading-[1.5] font-semibold break-words">{m.text}</p>
                {m.cite && (
                  <button
                    type="button"
                    onClick={openCite}
                    className="inline-flex items-center gap-[5px] mt-[9px] rounded-lg px-[9px] cursor-pointer font-sans min-h-[36px]"
                    style={{ background: 'rgb(var(--mist))', border: '1px solid rgb(var(--navy) / 0.14)' }}
                  >
                    <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--accent))" />
                    <span className="text-[12px] font-bold text-slatedark">{m.cite}</span>
                    <PhIcon name="ph-bold ph-arrow-up-right" size={10} color="rgb(var(--slate))" />
                    <span className="sr-only">— open the document</span>
                  </button>
                )}
                {m.askBoard && (
                  <button
                    type="button"
                    onClick={askTheBoard}
                    className="flex items-center gap-[7px] mt-2.5 w-full justify-center border-none rounded-[11px] cursor-pointer font-sans min-h-[44px] bg-skydeep"
                  >
                    <PhIcon name="ph-fill ph-paper-plane-tilt" size={14} color="rgb(var(--peach))" />
                    <span className="text-[12.5px] font-extrabold text-mist">Pass this to the board</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && <TypingDots />}
        </div>

        <div className="px-[18px] pb-2 flex gap-[7px] flex-wrap" role="group" aria-label="Suggested questions">
          {Object.entries(QA).map(([key, qa]) => (
            <button
              key={key}
              type="button"
              onClick={() => askAiChip(key)}
              className="rounded-full px-3.5 text-[12.5px] font-extrabold cursor-pointer font-sans text-navy min-h-[44px] text-left"
              style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--paper))' }}
            >
              {qa.q}
            </button>
          ))}
        </div>
        <div
          className="px-[18px] pt-2 flex gap-[9px] items-center"
          style={{ paddingBottom: 'calc(20px + var(--pav-safe-bottom))' }}
        >
          <Field
            label="Ask a question"
            hideLabel
            className="flex-1 min-w-0"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Ask about rules, dues, amenities…"
            autoComplete="off"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', borderRadius: 22, padding: '10px 16px' }}
          />
          <button
            type="button"
            aria-label="Send question"
            onClick={send}
            className="w-11 h-11 border-none rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer bg-skydeep"
          >
            <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--mist))" />
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
