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

function LiveAuthGate({ children }: { children: ReactNode }) {
  const supabase = getSupabaseClient();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!ready) return null;
  if (!session) return <LiveSignIn />;
  return <>{children}</>;
}

/** Sign out of the live session (no-op in demo mode). */
export async function signOutLive() {
  if (isLiveMode) await getSupabaseClient().auth.signOut();
}

function LiveSignIn() {
  const supabase = getSupabaseClient();
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    setBusy(true); setError(null);
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false);
    if (error) setError(error.message); else setStage('code');
  };

  const verify = async () => {
    setBusy(true); setError(null);
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'email' });
    setBusy(false);
    if (error) setError(error.message);
    // success → onAuthStateChange in the gate swaps to the app.
  };

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgb(var(--creamtint)) 0%, rgb(var(--sandtint)) 60%, rgb(var(--sanddeep)) 100%)' }}
    >
      <div className="w-full max-w-[360px] bg-paper rounded-[24px] p-7" style={{ border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(150deg,rgb(var(--ember)),rgb(var(--terracotta)))' }}>
          <PhIcon name="ph-fill ph-house-line" size={24} color="rgb(var(--white))" />
        </div>
        <h1 className="m-0 mb-1 font-serif text-[24px] text-navy">Welcome to Pavilion</h1>
        <p className="m-0 mb-5 text-[13px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
          {stage === 'email' ? 'Sign in with your email — we’ll send a one-time code.' : `Enter the code we sent to ${email}.`}
        </p>

        {stage === 'email' ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && email.trim()) sendCode(); }}
            placeholder="you@email.com"
            className="w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-navy outline-none font-sans mb-3"
            style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--parchment))' }}
          />
        ) : (
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && code.trim()) verify(); }}
            placeholder="6-digit code"
            className="w-full rounded-xl px-4 py-3 text-[16px] font-bold text-navy outline-none font-sans mb-3 tracking-[0.3em]"
            style={{ border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--parchment))' }}
          />
        )}

        {error && <p className="m-0 mb-3 text-[12.5px] font-bold" style={{ color: 'rgb(var(--terracotta))' }}>{error}</p>}

        <button
          onClick={stage === 'email' ? sendCode : verify}
          disabled={busy || (stage === 'email' ? !email.trim() : !code.trim())}
          className="w-full border-none rounded-xl py-3 text-[14px] font-extrabold cursor-pointer"
          style={{ background: 'rgb(var(--ember))', color: 'rgb(var(--white))', opacity: busy ? 0.6 : 1 }}
        >
          {busy ? 'Please wait…' : stage === 'email' ? 'Send code' : 'Verify & sign in'}
        </button>

        {stage === 'code' && (
          <button
            onClick={() => { setStage('email'); setCode(''); setError(null); }}
            className="w-full mt-2 bg-transparent border-none py-2 text-[12.5px] font-bold cursor-pointer"
            style={{ color: 'rgb(var(--stone))' }}
          >
            Use a different email
          </button>
        )}
      </div>
    </div>
  );
}
