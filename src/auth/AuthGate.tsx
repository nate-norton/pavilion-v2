import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { PhIcon } from '../components/PhIcon';
import { isLiveMode, getSupabaseClient } from '../data/repo/supabaseClient';

export { isLiveMode };

/**
 * In demo mode this is a pass-through. In live mode it gates the app behind a
 * real Supabase session, showing an email one-time-code sign-in until the user
 * is authenticated. The SupabaseRepository shares the same client/session.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  if (!isLiveMode) return <>{children}</>;
  return <LiveAuthGate>{children}</LiveAuthGate>;
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

  useEffect(() => { stashInviteCode(); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!session) { setHasCommunity(null); return; }
    let alive = true;
    (async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).maybeSingle();
        if (!profile) { if (alive) setHasCommunity(false); return; }
        const { count } = await supabase.from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('profile_id', profile.id).eq('status', 'active');
        if ((count ?? 0) > 0) { if (alive) setHasCommunity(true); return; }
        // No membership yet — a pending invite for this email joins them now.
        const { data: claimed } = await supabase.rpc('claim_invite');
        if (claimed === true) {
          // nudge an auth event so the repository re-hydrates with the new membership
          void supabase.auth.refreshSession();
          if (alive) setHasCommunity(true);
          return;
        }
        // Or a copied invite link (?invite=CODE) works for any email.
        const code = localStorage.getItem('pav-invite-code');
        if (code) {
          const { data: codeClaimed } = await supabase.rpc('claim_invite_code', { invite_code: code });
          if (codeClaimed === true) {
            localStorage.removeItem('pav-invite-code');
            void supabase.auth.refreshSession();
            if (alive) setHasCommunity(true);
            return;
          }
        }
        if (alive) setHasCommunity(false);
      } catch {
        if (alive) setHasCommunity(false); // treat any failure as "no community"
      }
    })();
    return () => { alive = false; };
  }, [session, supabase]);

  if (!ready) return null;
  if (!session) return <LiveSignIn />;
  if (hasCommunity === null) return null;              // resolving membership
  if (!hasCommunity) return <NoCommunity email={session.user.email ?? ''} />;
  return <>{children}</>;
}

/** A signed-in user who isn't a member of any community yet. */
function NoCommunity({ email }: { email: string }) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgb(var(--creamtint)) 0%, rgb(var(--sandtint)) 60%, rgb(var(--sanddeep)) 100%)' }}
    >
      <div className="w-full max-w-[380px] bg-paper rounded-[24px] p-7 text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto" style={{ background: 'rgb(var(--navy) / 0.06)' }}>
          <PhIcon name="ph-fill ph-house-line" size={26} color="rgb(var(--navy))" />
        </div>
        <h1 className="m-0 mb-2 font-serif text-[23px] text-navy">You’re signed in</h1>
        <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.55]" style={{ color: 'rgb(var(--taupe))' }}>
          <span className="text-navy">{email}</span> isn’t part of a community yet. Pavilion is
          invite-based — your HOA board adds you to your community.
        </p>
        <div className="rounded-2xl px-4 py-3.5 mb-5 text-left" style={{ background: 'rgb(var(--parchment))', border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-1 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.1em' }}>What’s next</p>
          <p className="m-0 text-[13px] font-semibold text-bark leading-[1.5]">
            Ask your board or manager to invite this email. Once you’re added, you’ll land right in your community.
          </p>
        </div>
        <button
          onClick={() => void signOutLive()}
          className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer"
          style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/** Sign out of the live session (no-op in demo mode). */
export async function signOutLive() {
  if (isLiveMode) await getSupabaseClient().auth.signOut();
}

function LiveSignIn() {
  const supabase = getSupabaseClient();
  const [stage, setStage] = useState<'email' | 'sent'>('email');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendLink = async () => {
    setBusy(true); setError(null);
    // supabase-js (detectSessionInUrl, default on) completes sign-in
    // automatically when the user returns via the emailed link.
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setError(error.message); else setStage('sent');
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgb(var(--creamtint)) 0%, rgb(var(--sandtint)) 60%, rgb(var(--sanddeep)) 100%)' }}
    >
      <div className="w-full max-w-[360px] bg-paper rounded-[24px] p-7" style={{ border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--ember)),rgb(var(--terracotta)))' }}>
          <PhIcon name={stage === 'sent' ? 'ph-fill ph-envelope-simple' : 'ph-fill ph-house-line'} size={24} color="rgb(var(--white))" />
        </div>
        <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">
          {stage === 'sent' ? 'Check your email' : 'Welcome to Pavilion'}
        </h1>
        <p className="m-0 mb-5 text-[13px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--taupe))' }}>
          {stage === 'sent'
            ? `We sent a sign-in link to ${email}. Open it on this device and you’ll be signed in.`
            : 'Sign in with your email — we’ll send you a secure sign-in link.'}
        </p>

        {stage === 'email' ? (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && email.trim()) sendLink(); }}
              placeholder="you@email.com"
              className="w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-navy outline-none font-sans mb-3"
              style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--parchment))' }}
            />
            {error && <p className="m-0 mb-3 text-[12.5px] font-bold" style={{ color: 'rgb(var(--terracotta))' }}>{error}</p>}
            <button
              onClick={sendLink}
              disabled={busy || !email.trim()}
              className="w-full border-none rounded-xl py-3 text-[14px] font-extrabold cursor-pointer"
              style={{ background: 'rgb(var(--ember))', color: 'rgb(var(--white))', opacity: busy || !email.trim() ? 0.6 : 1 }}
            >
              {busy ? 'Sending…' : 'Send sign-in link'}
            </button>
          </>
        ) : (
          <button
            onClick={() => { setStage('email'); setError(null); }}
            className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer"
            style={{ border: '1px solid rgb(var(--navy) / 0.14)', color: 'rgb(var(--navy))' }}
          >
            Use a different email
          </button>
        )}
      </div>
    </div>
  );
}
