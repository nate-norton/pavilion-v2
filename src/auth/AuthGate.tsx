import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isLiveMode, getSupabaseClient } from '../data/repo/supabaseClient';
import { AuthShell, AuthError, PrimaryButton, GhostButton, TextButton, IconBadge, SHELL_BG } from './shell';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { StackedCards, StackedPanel, type StackedTint } from '../components/StackedCard';
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

/*
 * The front door as a place rather than a form. The three screens a person
 * meets first — sign-in, the name step, and "not in a community yet" — open
 * on a hero panel that speaks in the community's chrome, with the form
 * tucked under it on paper (the StackedCards overlap). Utility steps that
 * follow (check your email, new password, paste a code) stay on the plain
 * AuthShell card, since by then the person is already inside the door.
 */
function Door({ tint = 'skydeep', icon, title, lede, children }: {
  tint?: StackedTint; icon: string; title: string; lede: ReactNode; children: ReactNode;
}) {
  const chrome = tint === 'skydeep';
  const titleColor = chrome ? 'rgb(var(--mist))' : 'rgb(var(--navy))';
  const ledeColor = chrome ? 'rgb(var(--mist) / 0.95)' : 'rgb(var(--slatedeep))';
  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: SHELL_BG }}>
      <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: 380 }}>
        <StackedCards className="w-full">
          <StackedPanel tint={tint}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: chrome ? 'rgb(var(--mist) / 0.14)' : 'rgb(var(--paper))' }}
            >
              <PhIcon name={icon} size={24} color={chrome ? 'rgb(var(--peach))' : 'rgb(var(--skydeep))'} />
            </div>
            <h1 className="m-0 font-serif text-[24px] leading-[1.2]" style={{ color: titleColor }}>{title}</h1>
            <p className="m-0 mt-2 text-[13.5px] font-semibold leading-[1.5]" style={{ color: ledeColor }}>{lede}</p>
          </StackedPanel>
          <StackedPanel tint="paper" className="pt-6">
            {children}
          </StackedPanel>
        </StackedCards>
        <p className="m-0 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.14em', color: 'rgb(var(--slate))' }}>
          Pavilion
        </p>
      </div>
    </div>
  );
}

/** Show/Hide for a password field: a quiet text control under the field, 44px tall. */
function ShowPassword({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      className="min-h-[44px] bg-transparent border-none px-1 text-[12.5px] font-extrabold cursor-pointer font-sans"
      style={{ color: 'rgb(var(--accent))' }}
    >
      {shown ? 'Hide password' : 'Show password'}
    </button>
  );
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
    <Door
      tint="sky"
      icon="ph-fill ph-house-line"
      title="You’re not in a community yet"
      lede={<><span className="text-navy font-extrabold">{email}</span> has no invitation. Pavilion is invite-only — your HOA board adds you.</>}
    >
      <div className="mb-4">
        <NextStep title="Invited under another email?" action="Switch" onClick={() => void signOutLive()} />
        <NextStep title="Have an invite link?" action="Open it" onClick={() => setPanel('code')} />
        <NextStep title="Starting a new HOA on Pavilion?" action="Request" onClick={() => setPanel('request')} />
      </div>
      <GhostButton label="Sign out" onClick={() => void signOutLive()} />
    </Door>
  );
}

function NextStep({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[52px] flex items-center justify-between gap-3 bg-transparent border-none px-0 py-3.5 text-left cursor-pointer font-sans active:scale-[0.99]"
      style={{ borderBottom: '1px solid rgb(var(--navy) / 0.08)' }}
    >
      <span className="text-[13.5px] font-bold text-navy">{title}</span>
      <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] font-extrabold" style={{ color: 'rgb(var(--accent))' }}>
        {action}
        <PhIcon name="ph-bold ph-caret-right" size={14} color="rgb(var(--accent))" />
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
      <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Paste the link your board sent, or just the code at the end of it.
      </p>
      <Field
        label="Invite link or code"
        type="text"
        autoFocus
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') go(); }}
        placeholder="https://app.pavilion.community/?invite=…"
        className="mb-4"
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
      <IconBadge icon="ph-fill ph-buildings" />
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Bring your HOA to Pavilion</h1>
      <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        Tell us a little and we’ll set it up with you. You’ll be its first board member.
      </p>
      <div className="flex flex-col gap-3 mb-4">
        <Field label="Your name" type="text" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Jordan Rivera" />
        <Field label="Community name" type="text" value={community} onChange={(e) => setCommunity(e.target.value)} placeholder="Cedar Hollow HOA" />
        <Field label="How many homes (optional)" type="number" inputMode="numeric" min={1} value={homes} onChange={(e) => setHomes(e.target.value)} placeholder="120" />
        <Field label="Anything we should know (optional)" as="textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Self-managed, about 80 townhomes, dues are quarterly." rows={3} />
      </div>
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

  // "Enter your email first" is about one field, so it sits under that
  // field; anything the server says about the pair stays a form-level alert.
  const emailError = error?.startsWith('Enter your email') ? error : null;
  const formError = emailError ? null : error;

  if (stage !== 'form') {
    const copy = {
      linkSent: `We sent a sign-in link to ${cleanEmail}. Open it on this device and you’ll be signed in.`,
      resetSent: `We sent a password reset link to ${cleanEmail}. Open it and you can choose a new password.`,
    }[stage];
    return (
      <AuthShell>
        <IconBadge icon="ph-fill ph-envelope-simple" />
        <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Check your email</h1>
        <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>{copy}</p>
        <GhostButton label="Back to sign in" onClick={() => { setStage('form'); setError(null); }} />
      </AuthShell>
    );
  }

  return (
    <Door icon="ph-fill ph-house-line" title="Welcome back" lede="Sign in to your community.">
      <Field
        label="Email"
        type="email"
        autoComplete="email"
        autoFocus={!initialEmail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        error={emailError}
        className="mb-3"
      />
      <Field
        label="Password"
        type={showPw ? 'text' : 'password'}
        autoComplete="current-password"
        autoFocus={!!initialEmail}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="At least 12 characters"
      />
      <div className="flex items-center justify-between mb-2">
        <ShowPassword shown={showPw} onToggle={() => setShowPw((v) => !v)} />
        <TextButton label="Forgot password?" onClick={sendReset} />
      </div>

      <AuthError message={formError} />
      <PrimaryButton label="Sign in" busyLabel="Signing in…" busy={busy} disabled={!canSubmit} onClick={submit} />

      <div className="flex items-center gap-2.5 my-4">
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
        <span className="text-[12px] font-bold" style={{ color: 'rgb(var(--slate))' }}>or</span>
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
      </div>
      <GhostButton label="Email me a sign-in link instead" onClick={sendLink} disabled={busy} />
      <p className="m-0 mt-5 text-[12.5px] font-semibold leading-[1.5] text-center" style={{ color: 'rgb(var(--slate))' }}>
        New here? Open the invitation link your board sent — that’s how you join.
      </p>
    </Door>
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
      <h1 className="m-0 mb-2 font-serif text-[24px] text-navy">Choose a new password</h1>
      <p className="m-0 mb-5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        You’re signed in from the reset link. Pick a password and you’re set.
      </p>
      <Field
        label="New password"
        type={showPw ? 'text' : 'password'}
        autoComplete="new-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && password.length >= MIN_PASSWORD) void save(); }}
        placeholder="At least 12 characters"
        hint={`At least ${MIN_PASSWORD} characters. That’s the only rule.`}
        error={error}
      />
      <div className="flex mb-3">
        <ShowPassword shown={showPw} onToggle={() => setShowPw((v) => !v)} />
      </div>
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
    <Door
      icon="ph-fill ph-hand-waving"
      title="Introduce yourself"
      lede="This is the name your neighbors see on votes, posts, and the directory. You can change it later in My Place."
    >
      <div className="flex flex-col gap-3 mb-4">
        <Field
          label="Full name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Rivera"
        />
        <Field
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) void save(); }}
          placeholder="(303) 555-0142"
          hint="Only neighbors in your community see it, and you can hide it in My Place."
        />
      </div>

      <AuthError message={error} />
      <PrimaryButton
        label="Continue"
        busyLabel="Saving…"
        busy={busy}
        disabled={!name.trim()}
        onClick={() => void save()}
      />
    </Door>
  );
}
