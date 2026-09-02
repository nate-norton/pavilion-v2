import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { PhIcon } from '../components/PhIcon';
import { isLiveMode, getSupabaseClient } from '../data/repo/supabaseClient';

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

/** Supabase's own floor is 6; 8 is the cheapest real improvement we control. */
const MIN_PASSWORD = 8;

const SHELL_BG = 'radial-gradient(120% 90% at 50% 0%, rgb(var(--misttint)) 0%, rgb(var(--skywash)) 60%, rgb(var(--skyedge)) 100%)';
const CARD_STYLE = { border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' } as const;
const FIELD = 'w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-navy outline-none font-sans';
const FIELD_STYLE = { border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--mistpale))' } as const;

/** Centered card shell shared by every auth screen. */
function AuthShell({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: SHELL_BG }}>
      <div className="w-full bg-paper rounded-[24px] p-7" style={{ ...CARD_STYLE, maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 mb-3 text-[12.5px] font-bold" style={{ color: 'rgb(var(--accent))' }}>
      {message}
    </p>
  );
}

function PrimaryButton({ label, busyLabel, busy, disabled, onClick }: {
  label: string; busyLabel: string; busy: boolean; disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="w-full border-none rounded-xl py-3 text-[14px] font-extrabold cursor-pointer font-sans"
      style={{ background: 'rgb(var(--skydeep))', color: 'rgb(var(--white))', opacity: busy || disabled ? 0.6 : 1 }}
    >
      {busy ? busyLabel : label}
    </button>
  );
}

/** Stash an invite code from the URL (?invite=…) so it survives the
 * magic-link round trip; claimed after sign-in, cleared on success. */
function stashInviteCode() {
  try {
    const code = new URLSearchParams(window.location.search).get('invite');
    if (code) localStorage.setItem('pav-invite-code', code);
  } catch { /* no-op */ }
}

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

  useEffect(() => { stashInviteCode(); }, []);

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
        const code = localStorage.getItem('pav-invite-code');
        if (code) {
          const { data: codeClaimed } = await supabase.rpc('claim_invite_code', { invite_code: code });
          if (codeClaimed === true) {
            localStorage.removeItem('pav-invite-code');
            localStorage.removeItem('pav-community');
            void supabase.auth.refreshSession();
            if (alive) setHasCommunity(true);
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
  if (!session) return <LiveSignIn />;
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
  if (!hasCommunity) return <NoCommunity email={session.user.email ?? ''} />;
  return <>{children}</>;
}

/** A signed-in user who isn't a member of any community yet. */
function NoCommunity({ email }: { email: string }) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgb(var(--misttint)) 0%, rgb(var(--skywash)) 60%, rgb(var(--skyedge)) 100%)' }}
    >
      <div className="w-full max-w-[380px] bg-paper rounded-[24px] p-7 text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgb(var(--navy) / 0.06)' }}>
          <PhIcon name="ph-fill ph-house-line" size={26} color="rgb(var(--skydeep))" />
        </div>
        <h1 className="m-0 mb-2 font-serif text-[23px] text-navy">You’re signed in</h1>
        <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.55]" style={{ color: 'rgb(var(--slatedeep))' }}>
          <span className="text-navy">{email}</span> isn’t part of a community yet. Pavilion is
          invite-based — your HOA board adds you to your community.
        </p>
        <div className="rounded-2xl px-4 py-3.5 mb-4 text-left" style={{ background: 'rgb(var(--mistpale))', border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase text-slate" style={{ letterSpacing: '0.1em' }}>What’s next</p>
          <p className="m-0 text-[13px] font-semibold text-slatedark leading-[1.5]">
            Ask your board to invite this email. Once you’re added, you’ll land right in your community.
          </p>
        </div>

        {/*
          The most likely reason someone lands here is a mismatch, not a
          missing invite: the board invited a different address than the one
          they just signed in with. Naming that turns a dead end into a
          one-tap retry — and it costs nothing to offer.
        */}
        <p className="m-0 mb-3 text-[11.5px] font-semibold text-slate leading-[1.45]">
          Invited under a different address? Sign in with that one instead.
        </p>
        <button
          type="button"
          onClick={() => void signOutLive()}
          className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer font-sans"
          style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))' }}
        >
          Sign out and try another email
        </button>
      </div>
    </div>
  );
}

/** Sign out of the live session (no-op in demo mode). */
export async function signOutLive() {
  if (isLiveMode) await getSupabaseClient().auth.signOut();
}

type SignInMode = 'signin' | 'signup';
type SignInStage = 'form' | 'linkSent' | 'resetSent' | 'confirmSent';

/**
 * Password is the primary path in both directions: members sign in with one,
 * and creating an account collects a real name up front so the community
 * roster never shows an email local-part. The magic link stays as a fallback
 * for anyone who'd rather not keep a password, and powers the reset flow.
 */
function LiveSignIn() {
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<SignInMode>('signin');
  const [stage, setStage] = useState<SignInStage>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();
  const isSignup = mode === 'signup';
  const canSubmit = !!cleanEmail && password.length >= MIN_PASSWORD && (!isSignup || !!name.trim());

  const run = async (fn: () => Promise<{ error: { message: string } | null }>, done?: () => void) => {
    setBusy(true); setError(null);
    const { error } = await fn();
    setBusy(false);
    if (error) setError(error.message); else done?.();
  };

  const submit = () => {
    if (!canSubmit) return;
    if (isSignup) {
      // handle_new_user() reads raw_user_meta_data->>'name', so passing it here
      // means the profile is created correctly instead of guessed from email.
      void run(
        () => supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
        }).then(({ data, error }) => {
          // Confirmations on → a user with no session; they must click the email.
          if (!error && !data.session) setStage('confirmSent');
          return { error };
        }),
      );
    } else {
      void run(() => supabase.auth.signInWithPassword({ email: cleanEmail, password }));
    }
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
      confirmSent: `Almost there — confirm ${cleanEmail} using the link we just sent, then sign in with your password.`,
    }[stage];
    return (
      <AuthShell>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--sunsetdeep)),rgb(var(--sunsetshade)))' }}>
          <PhIcon name="ph-fill ph-envelope-simple" size={24} color="rgb(var(--white))" />
        </div>
        <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Check your email</h1>
        <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>{copy}</p>
        <button
          type="button"
          onClick={() => { setStage('form'); setError(null); }}
          className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer font-sans"
          style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))' }}
        >
          Back to sign in
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--sunsetdeep)),rgb(var(--sunsetshade)))' }}>
        <PhIcon name="ph-fill ph-house-line" size={24} color="rgb(var(--white))" />
      </div>
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">
        {isSignup ? 'Create your account' : 'Welcome to Pavilion'}
      </h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        {isSignup
          ? 'Your board invites you by email — use the address they invited, and we’ll put you in your community.'
          : 'Sign in with your email and password.'}
      </p>

      {isSignup && (
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
      )}
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        aria-label="Email"
        className={`${FIELD} mb-2.5`}
        style={FIELD_STYLE}
      />
      <input
        type="password"
        autoComplete={isSignup ? 'new-password' : 'current-password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Password"
        aria-label="Password"
        className={`${FIELD} ${isSignup ? 'mb-2' : 'mb-3'}`}
        style={FIELD_STYLE}
      />
      {isSignup && (
        <p className="m-0 mb-3 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
          At least {MIN_PASSWORD} characters.
        </p>
      )}

      <AuthError message={error} />
      <PrimaryButton
        label={isSignup ? 'Create account' : 'Sign in'}
        busyLabel={isSignup ? 'Creating…' : 'Signing in…'}
        busy={busy}
        disabled={!canSubmit}
        onClick={submit}
      />

      <div className="flex items-center justify-between gap-2 mt-3">
        <button
          type="button"
          onClick={() => { setMode(isSignup ? 'signin' : 'signup'); setError(null); }}
          className="bg-transparent border-none p-1 text-[12.5px] font-extrabold cursor-pointer font-sans"
          style={{ color: 'rgb(var(--navy))' }}
        >
          {isSignup ? 'I already have an account' : 'Create an account'}
        </button>
        {!isSignup && (
          <button
            type="button"
            onClick={sendReset}
            className="bg-transparent border-none p-1 text-[12.5px] font-bold cursor-pointer font-sans"
            style={{ color: 'rgb(var(--slate))' }}
          >
            Forgot password?
          </button>
        )}
      </div>

      <div className="flex items-center gap-2.5 my-3">
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
        <span className="text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--slatelight))' }}>or</span>
        <span className="flex-1 h-px" style={{ background: 'rgb(var(--navy) / 0.1)' }} />
      </div>
      <button
        type="button"
        onClick={sendLink}
        disabled={busy}
        className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer font-sans"
        style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))', opacity: busy ? 0.6 : 1 }}
      >
        Email me a sign-in link instead
      </button>
    </AuthShell>
  );
}

/** Lands here from a password-reset email — Supabase has already signed them in. */
function SetNewPassword({ onDone }: { onDone: () => void }) {
  const supabase = getSupabaseClient();
  const [password, setPassword] = useState('');
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
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--sunsetdeep)),rgb(var(--sunsetshade)))' }}>
        <PhIcon name="ph-fill ph-lock-simple" size={24} color="rgb(var(--white))" />
      </div>
      <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Choose a new password</h1>
      <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        You’re signed in from the reset link. Pick a password and you’re set.
      </p>
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && password.length >= MIN_PASSWORD) void save(); }}
        placeholder="New password"
        aria-label="New password"
        className={`${FIELD} mb-2`}
        style={FIELD_STYLE}
      />
      <p className="m-0 mb-3 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
        At least {MIN_PASSWORD} characters.
      </p>
      <AuthError message={error} />
      <PrimaryButton
        label="Save password"
        busyLabel="Saving…"
        busy={busy}
        disabled={password.length < MIN_PASSWORD}
        onClick={() => void save()}
      />
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
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--sunsetdeep)),rgb(var(--sunsetshade)))' }}>
        <PhIcon name="ph-fill ph-hand-waving" size={24} color="rgb(var(--white))" />
      </div>
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
