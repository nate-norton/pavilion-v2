import { useEffect, useRef } from 'react';
import { PhIcon } from '../components/PhIcon';
import { TypingDots } from '../components/TypingDots';
import { usePavStore } from '../store/store';
import { useAiQA, useRepository } from '../data/repo';

/** AI scripted-assistant sheet — ported from prototype lines 1399-1449. */
export function AiSheet() {
  const state = usePavStore();
  const { set, msgs, typing, aiInput, askAiChip, sendAiMessage } = state;
  const QA = useAiQA();
  // The scripted assistant is demo-only; live stubs the sheet until a real
  // document-grounded assistant exists — no canned answers in production.
  const demo = useRepository().isDemo();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  useEffect(() => {
    if (!state.aiOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') set({ aiOpen: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.aiOpen, set]);

  if (!state.aiOpen) return null;

  const close = () => set({ aiOpen: false });
  const openCite = () => set({ aiOpen: false, docsOpen: true, docReader: true });
  const askTheBoard = () => set({ aiOpen: false, reportOpen: true, reportType: 'Other' });
  const send = () => sendAiMessage(aiInput);

  return (
    <div className="absolute inset-0 z-[85]">
      <div
        data-testid="ai-scrim"
        onClick={close}
        className="absolute inset-0 animate-scrimfade"
        style={{ background: 'rgb(var(--scrim) / 0.4)' }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 bg-parchment rounded-t-[28px] flex flex-col animate-sheetup"
        style={{ height: '78%', boxShadow: '0 -18px 50px rgb(var(--scrim) / 0.25)' }}
      >
        <div
          className="flex items-center gap-[11px] px-[18px] pt-4 pb-3"
          style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
        >
          <div
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(150deg,rgb(var(--emberdeep)),rgb(var(--embershade)))' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={18} color="rgb(var(--white))" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14px] font-bold text-navy">AI</p>
            <p className="m-0 text-[11.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
              {demo ? "Answers cite Juniper Ridge's actual documents" : 'Coming soon'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="border-none w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 bg-sand cursor-pointer"
          >
            <PhIcon name="ph-bold ph-x" size={13} color="rgb(var(--bark))" />
          </button>
        </div>

        {!demo ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 pb-10 text-center">
            <PhIcon name="ph-fill ph-sparkle" size={30} color="rgb(var(--claypale))" />
            <p className="m-0 mt-3 text-[14px] font-bold text-navy">Ask AI is on the way</p>
            <p className="m-0 mt-1.5 text-[13px] font-semibold leading-[1.5] text-stone">
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
        >
          {msgs.map((m, i) => (
            <div key={i} className="flex" style={{ justifyContent: m.me ? 'flex-end' : 'flex-start' }}>
              <div
                className="max-w-[82%] animate-msgbubble"
                style={{
                  background: m.me ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                  color: m.me ? 'rgb(var(--cream))' : 'rgb(var(--navy))',
                  border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                  borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                  padding: '11px 14px',
                }}
              >
                <p className="m-0 text-[13.5px] leading-[1.5] font-bold">{m.text}</p>
                {m.cite && (
                  <button
                    onClick={openCite}
                    className="inline-flex items-center gap-[5px] mt-[9px] rounded-lg px-[9px] py-[5px] cursor-pointer font-sans"
                    style={{ background: 'rgb(var(--cream))', border: '1px solid rgb(var(--navy) / 0.14)' }}
                  >
                    <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--terracotta))" />
                    <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
                      {m.cite}
                    </span>
                    <PhIcon name="ph-bold ph-arrow-up-right" size={10} color="rgb(var(--stonelight))" />
                  </button>
                )}
                {m.askBoard && (
                  <button
                    onClick={askTheBoard}
                    className="flex items-center gap-[7px] mt-2.5 w-full justify-center border-none rounded-[11px] py-2.5 cursor-pointer font-sans"
                    style={{ background: 'rgb(var(--skydeep))' }}
                  >
                    <PhIcon name="ph-fill ph-paper-plane-tilt" size={14} color="rgb(var(--peach))" />
                    <span className="text-[12.5px] font-extrabold" style={{ color: 'rgb(var(--cream))' }}>
                      Pass this to the board
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {typing && <TypingDots />}
        </div>

        <div className="px-[18px] pb-2 flex gap-[7px] flex-wrap">
          {Object.entries(QA).map(([key, qa]) => (
            <button
              key={key}
              onClick={() => askAiChip(key)}
              className="rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer font-sans text-navy"
              style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--paper))' }}
            >
              {qa.q}
            </button>
          ))}
        </div>
        <div className="px-[18px] pb-5 pt-2 flex gap-[9px]">
          <input
            value={aiInput}
            onChange={(e) => set({ aiInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Ask about rules, dues, amenities…"
            className="flex-1 rounded-full px-4 py-3 text-[13.5px] font-bold text-navy outline-none font-sans"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
          />
          <button
            type="button"
            aria-label="Send question"
            onClick={send}
            className="w-11 h-11 border-none rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
            style={{ background: 'rgb(var(--skydeep))' }}
          >
            <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--cream))" />
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
