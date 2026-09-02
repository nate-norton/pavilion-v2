import { useEffect, useState } from 'react';
import { getSupabaseClient } from '../data/repo/supabaseClient';
import { AuthShell, Door, AuthError, PrimaryButton, GhostButton, TextButton, ShowPassword } from './shell';
import { Field } from '../components/Field';
import { Pill } from '../components/Pill';

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
    <Door
      icon="ph-fill ph-house-line"
      title={peek.communityName}
      titleSize={36}
      facts={
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {peek.unitLabel && (
            <p className="m-0 text-[17px] font-extrabold leading-[1.3]" style={{ color: 'rgb(var(--mist))' }}>{peek.unitLabel}</p>
          )}
          <Pill label={roleLabel(peek.role)} tone="chrome" size="md" />
        </div>
      }
      lede={`${who} to join your community on Pavilion.`}
    >
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        This invitation is for <span className="font-extrabold text-navy">{peek.email}</span>.
        If that’s you, you’re one step from home.
      </p>
      <PrimaryButton label="Accept the invitation" onClick={onAccept} />
      <div className="mt-2.5">
        <GhostButton label="I already have a Pavilion account" onClick={onSignInInstead} />
      </div>
      <div className="flex justify-center mt-1">
        <TextButton label="Not you? Ask your board for a new link" onClick={onAbandon} />
      </div>
    </Door>
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
  const passwordRule = `At least ${MIN_PASSWORD} characters. That’s the only rule.`;
  const passwordShort = password.length > 0 && password.length < MIN_PASSWORD;

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
      <Door
        tint="sky"
        icon="ph-fill ph-hand-waving"
        title="Welcome back"
        lede={<><span className="text-navy font-extrabold">{peek.email}</span> already has a Pavilion account. Sign in with it and we’ll add {peek.communityName} to it.</>}
      >
        <PrimaryButton label="Sign in" onClick={onSignInInstead} />
      </Door>
    );
  }

  return (
    <Door
      icon="ph-fill ph-hand-waving"
      title="Introduce yourself"
      lede={`You’re joining ${peek.communityName}. This is the name your neighbors see on votes, posts, and the directory — you can change it later in My Place.`}
    >
      <div className="flex flex-col gap-3">
        <Field
          label="Full name"
          type="text"
          autoComplete="name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Rivera"
        />
        <LockedEmail email={peek.email} />
        <div>
          <Field
            label="Password"
            type={showPw ? 'text' : 'password'}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`At least ${MIN_PASSWORD} characters`}
            hint={passwordRule}
            error={passwordShort ? passwordRule : null}
          />
          <div className="flex">
            <ShowPassword shown={showPw} onToggle={() => setShowPw((v) => !v)} />
          </div>
        </div>
        <Field
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void submit(); }}
          placeholder="(303) 555-0142"
          hint={`Only neighbors in ${peek.communityName} see it, and you can hide it in My Place.`}
          className="mb-1"
        />
      </div>

      <AuthError message={error} />
      <PrimaryButton
        label={`Join ${peek.communityName}`}
        busyLabel="Joining…"
        busy={busy}
        disabled={!canSubmit}
        onClick={() => void submit()}
      />
      <div className="flex justify-center mt-1">
        <TextButton label="Back" onClick={onBack} />
      </div>
    </Door>
  );
}

/**
 * The email is the invitation's, not the person's to change: the link
 * already proved it. It sits in the form with the same label and bed as
 * the fields around it so the column reads as one, but as text, not a
 * disabled control.
 */
function LockedEmail({ email }: { email: string }) {
  return (
    <div>
      <p className="m-0 mb-1.5 text-[12.5px] font-bold text-slatedark">Email</p>
      <div
        className="w-full min-h-[44px] rounded-[11px] px-3 py-2.5 flex items-center justify-between gap-2 text-[13px] font-bold text-navy"
        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--skypale) / 0.5)' }}
        aria-label={`Email, from your invitation: ${email}`}
      >
        <span className="truncate">{email}</span>
        <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: 'rgb(var(--slate))' }}>From your invitation</span>
      </div>
    </div>
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
    <Door tint="sky" icon="ph-fill ph-envelope-simple" title={copy[0]} lede={copy[1]}>
      <PrimaryButton label="Go to sign in" onClick={onSignIn} />
    </Door>
  );
}
