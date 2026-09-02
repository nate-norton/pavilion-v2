import { useCallback, useEffect, useState } from 'react';
import { Sheet } from './Sheet';

interface ConfirmRequest {
  title: string;
  body: string;
  /** Names the action, never "OK" — the button should say what it does. */
  confirmLabel: string;
  onConfirm: () => void;
}

let openConfirm: ((req: ConfirmRequest) => void) | null = null;

/**
 * Ask before a destructive action.
 *
 * The critique proposed an undo-toast instead, and for reversible content that
 * is the nicer pattern. It is the wrong one here: an undo window means the
 * delete is a client-side timer, so closing the app or losing the tab inside
 * the window leaves the row alive after the user was told it was gone. That
 * failure is quieter and worse than a dialog.
 *
 * Deleting a community's governing document also *deserves* a beat of
 * deliberation rather than a five-second window to catch a mistake. So:
 * confirm first, then a success toast so the outcome is never silent.
 */
export function confirmDestructive(req: ConfirmRequest) {
  if (openConfirm) openConfirm(req);
  else req.onConfirm(); // No host mounted (tests) — don't silently drop the action.
}

/** Single host, mounted once inside the phone frame. */
export function ConfirmSheet() {
  const [req, setReq] = useState<ConfirmRequest | null>(null);

  useEffect(() => {
    openConfirm = (r) => setReq(r);
    return () => { openConfirm = null; };
  }, []);

  const close = useCallback(() => setReq(null), []);

  return (
    <Sheet
      label="Confirm"
      open={!!req} onClose={close}>
      {req && (
        <div>
          <p className="m-0 mb-1 font-serif text-xl text-navy">{req.title}</p>
          <p className="m-0 mb-5 text-[13px] font-semibold text-slate leading-[1.5]">{req.body}</p>
          <button
            type="button"
            onClick={() => { req.onConfirm(); close(); }}
            className="w-full border-none rounded-2xl py-3.5 text-[14px] font-extrabold cursor-pointer font-sans text-white mb-2"
            style={{ background: 'rgb(var(--red))' }}
          >
            {req.confirmLabel}
          </button>
          <button
            type="button"
            onClick={close}
            className="w-full bg-transparent rounded-2xl py-3.5 text-[13.5px] font-bold cursor-pointer font-sans"
            style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))' }}
          >
            Keep it
          </button>
        </div>
      )}
    </Sheet>
  );
}
