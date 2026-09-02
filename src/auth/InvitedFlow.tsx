import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../data/repo/supabaseClient';
import { AuthShell, Eyebrow, AuthError, PrimaryButton, GhostButton, TextButton, IconBadge, FIELD, FIELD_STYLE } from './shell';

/** What peek_invite() hands back for a link. */
export interface InvitePeek {
  communityName: string;
  inviterName: string;
  role: 'resident' | 'board';
  unitLabel: string;
  email: string;
  state: 'pending' | 'expired' | 'accepted' | 'revoked';
}

/** Supabase's own floor is 6; 8 is the cheapest real improvement we control. */
export const MIN_PASSWORD = 8;

export const INVITE_KEY = 'pav-invite-code';
export const COMMUNITY_KEY = 'pav-community';

/** Read `?invite=…` into localStorage so it survives every redirect. */
export function stashInviteCode() {
  try {
    const code = new URLSearchParams(window.location.search).get('invite');
    if (code) localStorage.setItem(INVITE_KEY, code);
  } catch { /* no-op */ }
}

export function readInviteCode(): string | null {
  try { return localStorage.getItem(INVITE_KEY); } catch { return null; }
}

export function clearInviteCode() {
  try { localStorage.removeItem(INVITE_KEY); } catch { /* no-op */ }
}

function roleLabel(role: InvitePeek['role']) {
  return role === 'board' ? 'Board member' : 'Resident';
}

/**
 * The invited door: Welcome (who invited you, to what, under which address)
 * then Introduce (name + password, email locked from the invite). Accepting
 * creates a confirmed account, claims the invite and signs in — one tap, no
 * confirmation email — because the link already proved the address.
 *
 * `onSignInInstead` hands off to the returning door with the email prefilled
 * for someone who already has an account; the gate claims the stashed code
 * after they sign in.
 */
export function InvitedFlow({ code, onArrived, onSignInInstead, onAbandon }: {
  code: string;
  onArrived: (peek: InvitePeek) => void;
  onSignInInstead: (email: string) => void;
  onAbandon: () => void;
}) {
  const supabase = getSupabaseClient();
  const [peek, setPeek] = useState<InvitePeek | 'loading' | 'unknown'>('loading');
  const [step, setStep] = useState<'welcome' | 'introduce'>('welcome');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await supabase.rpc('peek_invite', { invite_code: code });
        const row = (data ?? [])[0];
        if (!alive) return;
        if (!row) { setPeek('unknown'); return; }
        setPeek({
          communityName: row.community_name,
          inviterName: row.inviter_name,
          role: row.role === 'board' ? 'board' : 'resident',
          unitLabel: row.unit_label,
          email: row.email,
          state: (['pending', 'expired', 'accepted', 'revoked'].includes(row.state) ? row.state : 'revoked') as InvitePeek['state'],
        });
      } catch {
        if (alive) setPeek('unknown');
      }
    })();
    return () => { alive = false; };
  }, [supabase, code]);

  if (peek === 'loading') return <AuthShell bed="chrome"><p className="m-0 text-[13px] font-bold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>Opening your invitation…</p></AuthShell>;

  if (peek === 'unknown' || peek.state !== 'pending') {
    const dead = peek === 'unknown' ? 'unknown' : peek.state === 'pending' ? 'unknown' : peek.state;
    return <DeadInvite state={dead} communityName={peek === 'unknown' ? '' : peek.communityName} onSignIn={() => { clearInviteCode(); onAbandon(); }} />;
  }

  if (step === 'introduce') {
    return (
      <Introduce
        code={code}
        peek={peek}
        onBack={() => setStep('welcome')}
        onArrived={() => onArrived(peek)}
        onSignInInstead={() => onSignInInstead(peek.email)}
      />
    );
  }

  return <Welcome peek={peek} onAccept={() => setStep('introduce')} onSignInInstead={() => onSignInInstead(peek.email)} onAbandon={() => { clearInviteCode(); onAbandon(); }} />;
}

function Welcome({ peek, onAccept, onSignInInstead, onAbandon }: {
  peek: InvitePeek; onAccept: () => void; onSignInInstead: () => void; onAbandon: () => void;
}) {
  const who = peek.inviterName ? `${peek.inviterName} invited you` : 'Your HOA board invited you';
  return (
    <AuthShell bed="chrome" width={380}>
      <IconBadge icon="ph-fill ph-house-line" onChrome />
      <Eyebrow onChrome>You’re invited</Eyebrow>
      <h1 className="m-0 mb-2 font-serif text-[36px] leading-[1.1]" style={{ color: 'rgb(var(--mist))' }}>
        {peek.communityName}
      </h1>
      <p className="m-0 mb-4 text-[14px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--mist) / 0.92)' }}>
        {who} to join your community on Pavilion.
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Chip>{roleLabel(peek.role)}</Chip>
        {peek.unitLabel && <Chip>{peek.unitLabel}</Chip>}
      </div>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--mist) / 0.92)' }}>
        This invitation is for <span className="font-extrabold" style={{ color: 'rgb(var(--mist))' }}>{peek.email}</span>.
        If that’s you, you’re one step from home.
      </p>
      <PrimaryButton label="Accept the invitation" onClick={onAccept} onChrome />
      <div className="flex flex-col items-center gap-0.5 mt-3">
        <TextButton label="I already have a Pavilion account" onClick={onSignInInstead} onChrome />
        <TextButton label="Not you? Ask your board for a new link" onClick={onAbandon} onChrome />
      </div>
    </AuthShell>
  );
}

function Chip({ children }: { children: string }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-[12px] font-extrabold"
      style={{ background: 'rgb(var(--mist) / 0.14)', color: 'rgb(var(--mist))' }}
    >
      {children}
    </span>
  );
}

function Introduce({ code, peek, onBack, onArrived, onSignInInstead }: {
  code: string; peek: InvitePeek; onBack: () => void; onArrived: () => void; onSignInInstead: () => void;
}) {
  const supabase = getSupabaseClient();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const canSubmit = !!name.trim() && password.length >= MIN_PASSWORD;

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true); setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('accept_invite', {
        body: { code, name: name.trim(), password, phone: phone.trim() },
      });
      const failure = await describeFailure(fnErr, data);
      if (failure === 'account_exists') { setExists(true); setBusy(false); return; }
      if (failure) { setError(failure); setBusy(false); return; }
      const session = (data as { session?: { access_token: string; refresh_token: string } })?.session;
      if (!session) { setError('Something went wrong joining. Try again in a moment.'); setBusy(false); return; }
      clearInviteCode();
      try { localStorage.removeItem(COMMUNITY_KEY); } catch { /* no-op */ }
      const { error: sessErr } = await supabase.auth.setSession(session);
      if (sessErr) { setError(sessErr.message); setBusy(false); return; }
      onArrived();
    } catch {
      setError('We couldn’t reach Pavilion. Check your connection and try again.');
      setBusy(false);
    }
  };

  if (exists) {
    return (
      <AuthShell width={380}>
        <IconBadge icon="ph-fill ph-hand-waving" />
        <Eyebrow>{peek.communityName}</Eyebrow>
        <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Welcome back</h1>
        <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
          <span className="text-navy">{peek.email}</span> already has a Pavilion account. Sign in with it and
          we’ll add {peek.communityName} to it.
        </p>
        <PrimaryButton label="Sign in" onClick={onSignInInstead} />
      </AuthShell>
    );
  }

  return (
    <AuthShell width={380}>
      <Eyebrow>{peek.communityName}</Eyebrow>
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Introduce yourself</h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        This is the name your neighbors see on votes, posts, and the directory. You can change it later in My Place.
      </p>

      <input
        type="text"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        aria-label="Full name"
        className={`${FIELD} mb-2.5`}
        style={FIELD_STYLE}
      />
      <div className={`${FIELD} mb-2.5 flex items-center justify-between gap-2`} style={{ ...FIELD_STYLE, background: 'rgb(var(--skypale) / 0.5)' }} aria-label={`Email, from your invitation: ${peek.email}`}>
        <span className="truncate">{peek.email}</span>
        <span className="text-[10.5px] font-extrabold uppercase flex-shrink-0" style={{ letterSpacing: '0.1em', color: 'rgb(var(--slate))' }}>from invite</span>
      </div>
      <div className="relative mb-2">
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choose a password"
          aria-label="Choose a password"
          className={`${FIELD} pr-16`}
          style={FIELD_STYLE}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          aria-pressed={showPw}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none px-2 py-1 text-[12px] font-extrabold cursor-pointer font-sans"
          style={{ color: 'rgb(var(--accent))' }}
        >
          {showPw ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="m-0 mb-3 text-[11.5px] font-semibold" style={{ color: password.length > 0 && password.length < MIN_PASSWORD ? 'rgb(var(--sunsetdeep))' : 'rgb(var(--slate))' }}>
        At least {MIN_PASSWORD} characters. That’s the only rule.
      </p>
      <input
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
        placeholder="Phone (optional)"
        aria-label="Phone number, optional"
        className={`${FIELD} mb-2`}
        style={FIELD_STYLE}
      />
      <p className="m-0 mb-4 text-[11.5px] font-semibold leading-[1.45]" style={{ color: 'rgb(var(--slate))' }}>
        Your phone is only shown to neighbors in {peek.communityName}, and you can hide it in My Place.
      </p>

      <AuthError message={error} />
      <PrimaryButton
        label={`Join ${peek.communityName}`}
        busyLabel="Joining…"
        busy={busy}
        disabled={!canSubmit}
        onClick={() => void submit()}
      />
      <div className="flex justify-center mt-2">
        <TextButton label="Back" onClick={onBack} />
      </div>
    </AuthShell>
  );
}

/** Map the edge function's outcomes to something a person can act on. */
async function describeFailure(fnErr: unknown, data: unknown): Promise<string | null> {
  let code: string | undefined = (data as { error?: string } | null)?.error;
  if (!code && fnErr && typeof fnErr === 'object' && 'context' in fnErr) {
    // FunctionsHttpError carries the Response; the body has our error code.
    const ctx = (fnErr as { context?: Response }).context;
    try { code = (await ctx?.clone().json())?.error; } catch { /* fall through */ }
  }
  if (!code && fnErr) return 'We couldn’t reach Pavilion. Check your connection and try again.';
  switch (code) {
    case undefined: return null;
    case 'account_exists': return 'account_exists';
    case 'expired': return 'This invitation has expired. Ask your board to send a new one.';
    case 'accepted': return 'This invitation was already used. If that was you, sign in instead.';
    case 'revoked': return 'This invitation was withdrawn. Ask your board if you think that’s a mistake.';
    case 'unknown_invite': return 'We don’t recognize this invitation link. Ask your board to send it again.';
    case 'password_short': return `Your password needs at least ${MIN_PASSWORD} characters.`;
    default: return 'Something went wrong joining. Try again in a moment.';
  }
}

/** An invite that can't be used: say why, and what to do instead. */
function DeadInvite({ state, communityName, onSignIn }: {
  state: 'unknown' | 'expired' | 'accepted' | 'revoked'; communityName: string; onSignIn: () => void;
}) {
  const copy = {
    unknown: ['We don’t recognize this link', 'It may have been copied incompletely. Ask your board to send the invitation again.'],
    expired: ['This invitation has expired', `Invitations last 14 days. Ask the ${communityName} board to send you a fresh one.`],
    accepted: ['This invitation was already used', `If that was you, sign in and ${communityName} will be there.`],
    revoked: ['This invitation was withdrawn', `Ask the ${communityName} board if you think that’s a mistake.`],
  }[state];
  return (
    <AuthShell width={380}>
      <IconBadge icon="ph-fill ph-envelope-simple" />
      {communityName && <Eyebrow>{communityName}</Eyebrow>}
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">{copy[0]}</h1>
      <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>{copy[1]}</p>
      <GhostButton label="Go to sign in" onClick={onSignIn} />
    </AuthShell>
  );
}
