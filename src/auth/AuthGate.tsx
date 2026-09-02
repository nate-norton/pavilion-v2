import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isLiveMode, getSupabaseClient } from '../data/repo/supabaseClient';
import { AuthShell, AuthError, PrimaryButton, GhostButton, TextButton, IconBadge, Eyebrow, FIELD, FIELD_STYLE } from './shell';
import { InvitedFlow, MIN_PASSWORD, COMMUNITY_KEY, INVITE_KEY, stashInviteCode, readInviteCode, clearInviteCode, type InvitePeek } from './InvitedFlow';
import { Arrival } from './Arrival';

export { isLiveMode };

/**
 * In demo mode this is a pass-through. In live mode it gates the app behind a
 * real Supabase session: email + password sign-in (with a magic-link fallback)
 * until the user is authenticated, then a one-time onboarding step that asks
 * for a real name and phone. The SupabaseRepository shares the client/session.
 *
 * Onboarding is not cosmetic. handle_new_user() has to invent a profile name at
 * signup and falls back to the email local-part, so without this step a member
 * shows up to their whole community as "nathan26norton".
 */
export function AuthGate({ children }: { children: ReactNode }) {
  if (!isLiveMode) return <>{children}</>;
  return <LiveAuthGate>{children}</LiveAuthGate>;
}

/** The slice of the profile row the onboarding step needs. */
type OnboardingProfile = { id: string; name: string; phone: string; onboarded_at: string | null };

function LiveAuthGate({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  // null = still checking; true/false = whether the user belongs to a community.
  const [hasCommunity, setHasCommunity] = useState<boolean | null>(null);
  // null = still checking; the profile row drives the onboarding step.
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  // Bumped when onboarding finishes, to re-run the membership resolve below.
  const [resolveKey, setResolveKey] = useState(0);
  // Set when the user arrives on a password-recovery link; Supabase signs them
  // in first, so without this they'd land in the app with no way to finish.
  const [recovering, setRecovering] = useState(false);
  // An invite link in hand and no session → the invited door, not sign-in.
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  // Set the moment a membership is claimed, so the first thing a new member
  // sees is their community, not the app's default tab.
  const [arrival, setArrival] = useState<Pick<InvitePeek, 'communityName' | 'role'> | null>(null);
  const [prefillEmail, setPrefillEmail] = useState('');

  useEffect(() => { stashInviteCode(); setInviteCode(readInviteCode()); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) { setHasCommunity(null); setProfile(null); return; }
    let alive = true;
    (async () => {
      try {
        const { data: profileRow } = await supabase.from('profiles')
          .select('id, name, phone, onboarded_at').eq('user_id', session.user.id).maybeSingle();
        if (alive) setProfile(profileRow ?? null);
        if (!profileRow) { if (alive) setHasCommunity(false); return; }
        // Ask for a real name before doing anything else — the claim below
        // stamps them into a community roster under whatever name we hold.
        if (!profileRow.onboarded_at) { if (alive) setHasCommunity(null); return; }
        const { count } = await supabase.from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profileRow.id).eq('status', 'active');
        const already = (count ?? 0) > 0;
        // A copied invite link (?invite=CODE) is claimed even for someone who
        // already belongs elsewhere — an account can hold several communities.
        // Forgetting the device's remembered pick lets the repository land
        // them in the community they just accepted into.
        const code = readInviteCode();
        if (code) {
          const { data: peeked } = await supabase.rpc('peek_invite', { invite_code: code });
          const { data: codeClaimed } = await supabase.rpc('claim_invite_code', { invite_code: code });
          if (codeClaimed === true) {
            clearInviteCode();
            try { localStorage.removeItem(COMMUNITY_KEY); } catch { /* no-op */ }
            void supabase.auth.refreshSession();
            const row = (peeked ?? [])[0];
            if (alive) {
              if (row) setArrival({ communityName: row.community_name, role: row.role === 'board' ? 'board' : 'resident' });
              setHasCommunity(true);
            }
            return;
          }
        }
        if (already) { if (alive) setHasCommunity(true); return; }
        // No membership yet — a pending invite for this email joins them now.
        const { data: claimed } = await supabase.rpc('claim_invite');
        if (claimed === true) {
          // nudge an auth event so the repository re-hydrates with the new membership
          void supabase.auth.refreshSession();
          if (alive) setHasCommunity(true);
          return;
        }
        if (alive) setHasCommunity(false);
      } catch {
        if (alive) setHasCommunity(false); // treat any failure as "no community"
      }
    })();
    return () => { alive = false; };
  }, [session, supabase, resolveKey]);

  if (!ready) return null;
  if (!session && inviteCode) {
    return (
      <InvitedFlow
        code={inviteCode}
        onArrived={(peek) => { setArrival({ communityName: peek.communityName, role: peek.role }); setInviteCode(null); }}
        onSignInInstead={(email) => { setPrefillEmail(email); setInviteCode(null); }}
        onAbandon={() => setInviteCode(null)}
      />
    );
  }
  if (!session) return <LiveSignIn initialEmail={prefillEmail} />;
  if (recovering) return <SetNewPassword onDone={() => setRecovering(false)} />;
  if (profile && !profile.onboarded_at) {
    return (
      <LiveOnboarding
        profile={profile}
        email={session.user.email ?? ''}
        onDone={() => { setProfile(null); setResolveKey((k) => k + 1); }}
      />
    );
  }
  if (hasCommunity === null) return null;              // resolving membership
  if (!hasCommunity) return <NoCommunity email={session.user.email ?? ''} onRetry={() => { setHasCommunity(null); setResolveKey((k) => k + 1); }} />;
  if (arrival) return <Arrival communityName={arrival.communityName} role={arrival.role} onDone={() => setArrival(null)} />;
  return <>{children}</>;
}

/**
 * A signed-in person who isn't in any community. The likely reasons, in
 * order: the board invited a different address; they have a link they
 * haven't opened on this device; they're a founder with no community yet.
 * Each gets a real next step instead of a paragraph.
 */
function NoCommunity({ email, onRetry }: { email: string; onRetry: () => void }) {
  const [panel, setPanel] = useState<'menu' | 'code' | 'request'>('menu');
  if (panel === 'code') return <PasteInviteCode onBack={() => setPanel('menu')} onClaim={onRetry} />;
  if (panel === 'request') return <RequestCommunity email={email} onBack={() => setPanel('menu')} />;
  return (
    <AuthShell width={380}>
      <IconBadge icon="ph-fill ph-house-line" />
      <Eyebrow>Signed in</Eyebrow>
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">You’re not in a community yet</h1>
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.55]" style={{ color: 'rgb(var(--slatedeep))' }}>
        <span className="text-navy">{email}</span> has no invitation. Pavilion is invite-only — your HOA board adds you.
      </p>
      <div className="rounded-2xl mb-4 overflow-hidden" style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}>
        <NextStep title="Invited under another email?" action="Switch" onClick={() => void signOutLive()} />
        <NextStep title="Have an invite link?" action="Open it" onClick={() => setPanel('code')} />
        <NextStep title="Starting a new HOA on Pavilion?" action="Request" onClick={() => setPanel('request')} />
      </div>
      <GhostButton label="Sign out" onClick={() => void signOutLive()} />
    </AuthShell>
  );
}

function NextStep({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 bg-paper border-none px-4 py-3.5 text-left cursor-pointer font-sans active:scale-[0.99]"
      style={{ borderTop: '1px solid rgb(var(--navy) / 0.08)', background: 'rgb(var(--mistpale))' }}
    >
      <span className="text-[13px] font-bold text-navy">{title}</span>
      <span className="text-[11px] font-extrabold uppercase rounded-full px-2.5 py-1 flex-shrink-0" style={{ letterSpacing: '0.08em', background: 'rgb(var(--goldpale))', color: 'rgb(var(--golddark))' }}>
        {action}
      </span>
    </button>
  );
}

/** Paste a link or its code; the gate claims it on retry. */
function PasteInviteCode({ onBack, onClaim }: { onBack: () => void; onClaim: () => void }) {
  const [raw, setRaw] = useState('');
  const code = (() => {
    try { return new URL(raw.trim()).searchParams.get('invite') ?? ''; } catch { return raw.trim(); }
  })();
  const go = () => {
    if (!code) return;
    try { localStorage.setItem(INVITE_KEY, code); } catch { /* no-op */ }
    onClaim();
  };
  return (
    <AuthShell width={380}>
      <IconBadge icon="ph-fill ph-envelope-simple" />
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Open your invitation</h1>
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Paste the link your board sent, or just the code at the end of it.
      </p>
      <input
        type="text"
        autoFocus
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
        placeholder="https://app.pavilion.community/?invite=…"
        aria-label="Invite link or code"
        className={`${FIELD} mb-3`}
        style={FIELD_STYLE}
      />
      <PrimaryButton label="Join my community" disabled={!code} onClick={go} />
      <div className="flex justify-center mt-2"><TextButton label="Back" onClick={onBack} /></div>
    </AuthShell>
  );
}

/** A founder asks for a community; someone reviews it and runs found_community(). */
function RequestCommunity({ email, onBack }: { email: string; onBack: () => void }) {
  const supabase = getSupabaseClient();
  const [name, setName] = useState('');
  const [community, setCommunity] = useState('');
  const [homes, setHomes] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const canSubmit = !!name.trim() && !!community.trim();

  const submit = async () => {
    if (!canSubmit || busy) return;
    setBusy(true); setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user?.id ?? '').maybeSingle();
    if (!profile) { setError('We couldn’t find your profile. Try signing out and back in.'); setBusy(false); return; }
    const homesNum = parseInt(homes, 10);
    const { error: insErr } = await supabase.from('community_requests').insert({
      profile_id: profile.id, email, requester_name: name.trim(), community_name: community.trim(),
      homes: Number.isFinite(homesNum) ? homesNum : null, note: note.trim(),
    });
    setBusy(false);
    if (insErr) setError(insErr.message); else setSent(true);
  };

  if (sent) {
    return (
      <AuthShell width={380}>
        <IconBadge icon="ph-fill ph-check-circle" />
        <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">We got it</h1>
        <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
          Someone from Pavilion will reach out to <span className="text-navy">{email}</span> to set up {community.trim()}.
          When it’s ready, your invitation will land in the same inbox.
        </p>
        <GhostButton label="Back" onClick={onBack} />
      </AuthShell>
    );
  }

  return (
    <AuthShell width={380}>
      <Eyebrow>New community</Eyebrow>
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Bring your HOA to Pavilion</h1>
      <p className="m-0 mb-4 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Tell us a little and we’ll set it up with you. You’ll be its first board member.
      </p>
      <input type="text" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name" className={`${FIELD} mb-2.5`} style={FIELD_STYLE} />
      <input type="text" value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="Community name" aria-label="Community name" className={`${FIELD} mb-2.5`} style={FIELD_STYLE} />
      <input type="number" inputMode="numeric" min={1} value={homes} onChange={(e) => setHomes(e.target.value)} placeholder="How many homes? (optional)" aria-label="How many homes, optional" className={`${FIELD} mb-2.5`} style={FIELD_STYLE} />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything we should know? (optional)" aria-label="Anything we should know, optional" rows={3} className={`${FIELD} mb-3 resize-none`} style={FIELD_STYLE} />
      <AuthError message={error} />
      <PrimaryButton label="Send request" busyLabel="Sending…" busy={busy} disabled={!canSubmit} onClick={() => void submit()} />
      <div className="flex justify-center mt-2"><TextButton label="Back" onClick={onBack} /></div>
    </AuthShell>
  );
}

/** Sign out of the live session (no-op in demo mode). */
export async function signOutLive() {
  if (isLiveMode) await getSupabaseClient().auth.signOut();
}

type SignInStage = 'form' | 'linkSent' | 'resetSent';

/**
 * The returning door. Accounts are only ever created through an invitation
 * (see InvitedFlow), so there is no sign-up toggle here — just email and
 * password, a reset, and the emailed link as the quiet fallback for anyone
 * who never set a password.
 */
function LiveSignIn({ initialEmail = '' }: { initialEmail?: string }) {
  const supabase = getSupabaseClient();
  const [stage, setStage] = useState<SignInStage>('form');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();
  const canSubmit = !!cleanEmail && password.length >= MIN_PASSWORD;

  const run = async (fn: () => Promise<{ error: { message: string } | null }>, done?: () => void) => {
    setBusy(true); setError(null);
    const { error } = await fn();
    setBusy(false);
    if (error) setError(friendlyAuthError(error.message)); else done?.();
  };

  const submit = () => {
    if (!canSubmit) return;
    void run(() => supabase.auth.signInWithPassword({ email: cleanEmail, password }));
  };

  const sendLink = () => {
    if (!cleanEmail) { setError('Enter your email first.'); return; }
    // supabase-js (detectSessionInUrl, default on) completes sign-in
    // automatically when the user returns via the emailed link.
    void run(
      () => supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
      }),
      () => setStage('linkSent'),
    );
  };

  const sendReset = () => {
    if (!cleanEmail) { setError('Enter your email first, then tap reset.'); return; }
    void run(
      () => supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: window.location.origin }),
      () => setStage('resetSent'),
    );
  };

  if (stage !== 'form') {
    const copy = {
      linkSent: `We sent a sign-in link to ${cleanEmail}. Open it on this device and you’ll be signed in.`,
      resetSent: `We sent a password reset link to ${cleanEmail}. Open it and you can choose a new password.`,
    }[stage];
    return (
      <AuthShell>
        <IconBadge icon="ph-fill ph-envelope-simple" />
        <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Check your email</h1>
        <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>{copy}</p>
        <GhostButton label="Back to sign in" onClick={() => { setStage('form'); setError(null); }} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <IconBadge icon="ph-fill ph-house-line" />
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Welcome back</h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Sign in to your community.
      </p>

      <input
        type="email"
        autoComplete="email"
        autoFocus={!initialEmail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email"
        className={`${FIELD} mb-2.5`}
        style={FIELD_STYLE}
      />
      <div className="relative mb-2">
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          autoFocus={!!initialEmail}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Password"
          aria-label="Password"
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
      <div className="flex justify-end mb-3">
        <TextButton label="Forgot password?" onClick={sendReset} />
      </div>

      <AuthError message={error} />
      <PrimaryButton label="Sign in" busyLabel="Signing in…" busy={busy} disabled={!canSubmit} onClick={submit} />

      <div className="flex items-center gap-2.5 my-3">
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--slatelight))' }}>or</span>
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
      </div>
      <GhostButton label="Email me a sign-in link instead" onClick={sendLink} disabled={busy} />
      <p className="m-0 mt-4 text-[11.5px] font-semibold leading-[1.45] text-center" style={{ color: 'rgb(var(--slate))' }}>
        New here? Open the invitation link your board sent — that’s how you join.
      </p>
    </AuthShell>
  );
}

/** Supabase's messages are for developers; these are for the person. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don’t match. Check both, or reset your password.';
  if (m.includes('email not confirmed')) return 'Confirm your email first — check your inbox for the link we sent.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many tries. Wait a minute and try again.';
  return message;
}

/** Lands here from a password-reset email — Supabase has already signed them in. */
function SetNewPassword({ onDone }: { onDone: () => void }) {
  const supabase = getSupabaseClient();
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setBusy(true); setError(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(error.message); else onDone();
  };

  return (
    <AuthShell>
      <IconBadge icon="ph-fill ph-lock-simple" />
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Choose a new password</h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        You’re signed in from the reset link. Pick a password and you’re set.
      </p>
      <div className="relative mb-2">
        <input
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && password.length >= MIN_PASSWORD) void save(); }}
          placeholder="New password"
          aria-label="New password"
          className={`${FIELD} pr-16`}
          style={FIELD_STYLE}
        />
        <button type="button" onClick={() => setShowPw((v) => !v)} aria-pressed={showPw} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none px-2 py-1 text-[12px] font-extrabold cursor-pointer font-sans" style={{ color: 'rgb(var(--accent))' }}>
          {showPw ? 'Hide' : 'Show'}
        </button>
      </div>
      <p className="m-0 mb-3 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
        At least {MIN_PASSWORD} characters. That’s the only rule.
      </p>
      <AuthError message={error} />
      <PrimaryButton label="Save password" busyLabel="Saving…" busy={busy} disabled={password.length < MIN_PASSWORD} onClick={() => void save()} />
    </AuthShell>
  );
}

/**
 * One-time step for a signed-in user who has never given us a name. Writes the
 * real name/phone onto their profile and stamps onboarded_at, then hands back
 * to the gate to resolve (and if needed claim) their community membership.
 */
function LiveOnboarding({ profile, email, onDone }: {
  profile: OnboardingProfile; email: string; onDone: () => void;
}) {
  const supabase = getSupabaseClient();
  // The trigger's fallback is the email local-part; showing that back as a
  // pre-filled "name" would just get accepted, so start empty when it matches.
  const guessed = email.split('@')[0];
  const [name, setName] = useState(profile.name === guessed ? '' : profile.name);
  const [phone, setPhone] = useState(profile.phone ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const clean = name.trim();
    if (!clean) return;
    setBusy(true); setError(null);
    const { error } = await supabase.from('profiles').update({
      name: clean,
      initial: clean.charAt(0).toUpperCase(),
      phone: phone.trim(),
      onboarded_at: new Date().toISOString(),
    }).eq('id', profile.id);
    setBusy(false);
    if (error) setError(error.message); else onDone();
  };

  return (
    <AuthShell width={380}>
      <IconBadge icon="ph-fill ph-hand-waving" />
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Introduce yourself</h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        This is the name your neighbors see on votes, posts, and the directory. You can change it later in My Place.
      </p>

      <input
        type="text"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full name"
        aria-label="Full name"
        className={`${FIELD} mb-2.5`}
        style={FIELD_STYLE}
      />
      <input
        type="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) void save(); }}
        placeholder="Phone (optional)"
        aria-label="Phone number, optional"
        className={`${FIELD} mb-2`}
        style={FIELD_STYLE}
      />
      <p className="m-0 mb-3 text-[11.5px] font-semibold leading-[1.45]" style={{ color: 'rgb(var(--slate))' }}>
        Your phone is only shown to neighbors in your community, and you can hide it in My Place.
      </p>

      <AuthError message={error} />
      <PrimaryButton
        label="Continue"
        busyLabel="Saving…"
        busy={busy}
        disabled={!name.trim()}
        onClick={() => void save()}
      />
    </AuthShell>
  );
}
