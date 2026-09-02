import { useState } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { useInvites, useRepository } from '../data/repo';
import { parseRoster } from '../auth/roster';

const APP_URL = 'https://app.pavilion.community';

export const inviteUrl = (code: string) => `${APP_URL}/?invite=${code}`;

/**
 * Bring a whole roster in at once. Boards keep their rosters in a
 * spreadsheet; pasting a column here turns forty form submissions into one
 * preview and one tap. Delivery stays in the board's hands — share sheet
 * where the device has one, otherwise every link copied at once — since
 * Pavilion sends no email of its own yet.
 */
export function RosterInvite() {
  const repo = useRepository();
  const invites = useInvites();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const parsed = parseRoster(text);
  const pending = invites.filter((i) => i.status === 'pending');

  // The presenter demo is a scripted, fully-populated community; it has no
  // roster to bring in, and its Desk stays byte-for-byte as rehearsed.
  if (repo.isDemo()) return null;

  const create = () => {
    if (parsed.ready.length === 0 || busy) return;
    setBusy(true);
    void repo.createInvites(parsed.ready)
      .then((r) => { setResult(r); setText(''); })
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full mt-2 bg-transparent rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer font-sans text-navy"
        style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
      >
        Paste a whole roster instead
      </button>
    );
  }

  return (
    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
      <p className="m-0 mb-1 text-[13.5px] font-bold text-navy">Bring your neighbors in</p>
      <p className="m-0 mb-2.5 text-[11.5px] font-semibold text-slate leading-[1.45]">
        Paste from your spreadsheet. One home per line: address, email. Add “board” to a line for a board member.
      </p>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setResult(null); }}
        rows={5}
        placeholder={'#12 Alder Way, cade@example.com\n#14 Alder Way, priya@example.com'}
        aria-label="Roster, one home per line"
        className="w-full rounded-[11px] px-3 py-2.5 text-[12.5px] font-semibold text-navy outline-none resize-none font-sans"
        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' }}
      />
      {text.trim() && (
        <div className="mt-2 mb-2.5">
          <Row label={`${parsed.ready.length} ${parsed.ready.length === 1 ? 'invitation' : 'invitations'} ready`} tone={parsed.ready.length ? 'sage' : 'slate'} />
          {parsed.skipped.length > 0 && (
            <Row label={`${parsed.skipped.length} ${parsed.skipped.length === 1 ? 'line' : 'lines'} skipped — no email`} tone="gold" detail={parsed.skipped.map((s) => `Line ${s.line}: ${s.text}`).join('\n')} />
          )}
        </div>
      )}
      {result && (
        <p className="m-0 mb-2.5 text-[12px] font-bold" style={{ color: 'rgb(var(--sagedark))' }} role="status">
          {result.created} created{result.skipped > 0 ? `, ${result.skipped} already invited` : ''}.
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={create}
          disabled={parsed.ready.length === 0 || busy}
          className="flex-1 border-0 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer font-sans"
          style={{
            background: parsed.ready.length && !busy ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
            color: parsed.ready.length && !busy ? 'rgb(var(--white))' : 'rgb(var(--slatelight))',
          }}
        >
          {busy ? 'Creating…' : `Create ${parsed.ready.length || ''} ${parsed.ready.length === 1 ? 'invitation' : 'invitations'}`.replace('  ', ' ')}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setText(''); setResult(null); }}
          className="bg-transparent rounded-[11px] px-3 py-2.5 text-[12px] font-extrabold cursor-pointer font-sans text-slate"
          style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
        >
          Close
        </button>
      </div>
      {pending.length > 0 && <ShareAll pending={pending} />}
    </div>
  );
}

function Row({ label, tone, detail }: { label: string; tone: 'sage' | 'gold' | 'slate'; detail?: string }) {
  const [show, setShow] = useState(false);
  const color = tone === 'sage' ? 'rgb(var(--sagedark))' : tone === 'gold' ? 'rgb(var(--golddark))' : 'rgb(var(--slate))';
  return (
    <div className="py-1" style={{ borderTop: '1px solid rgb(var(--navy) / 0.06)' }}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-bold" style={{ color }}>{label}</span>
        {detail && (
          <button type="button" onClick={() => setShow((v) => !v)} className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 font-sans" style={{ color: 'rgb(var(--accent))' }}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {show && detail && <pre className="m-0 mt-1 text-[11px] font-semibold text-slate whitespace-pre-wrap font-sans">{detail}</pre>}
    </div>
  );
}

/** One tap hands every pending link to the board's own messaging. */
export function ShareAll({ pending }: { pending: { email: string; unitLabel: string; code: string }[] }) {
  const [done, setDone] = useState<'shared' | 'copied' | null>(null);
  const text = pending
    .map((p) => `${[p.unitLabel, p.email].filter(Boolean).join(' · ')}\n${inviteUrl(p.code)}`)
    .join('\n\n');
  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: { text: string; title?: string }) => Promise<void> };
    try {
      if (nav.share) { await nav.share({ title: 'Pavilion invitations', text }); setDone('shared'); return; }
    } catch { /* cancelled — fall through to copy */ }
    try { await navigator.clipboard?.writeText(text); setDone('copied'); } catch { /* no-op */ }
    setTimeout(() => setDone(null), 2500);
  };
  return (
    <button
      type="button"
      onClick={() => void share()}
      className="w-full mt-2.5 bg-transparent rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer font-sans"
      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', color: done ? 'rgb(var(--sagedark))' : 'rgb(var(--navy))' }}
    >
      {done === 'copied' ? 'All links copied ✓' : done === 'shared' ? 'Shared ✓' : `Share all ${pending.length} pending ${pending.length === 1 ? 'link' : 'links'}`}
    </button>
  );
}
