// accept_invite — turn an invitation link into a signed-in member in one step.
//
// The invite link already proved the email (it was sent to that address), so
// the account is created pre-confirmed with the name the person typed, the
// invite is claimed, and a session comes back. No confirmation email, no
// second sign-in. The invite code is the credential: this runs with the
// service role, and the only thing a caller can do with it is join the one
// community the code names, under the email the code was issued to.
import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const MIN_PASSWORD = 8;

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return reply(405, { error: 'method' });

  let body: { code?: string; name?: string; password?: string; phone?: string };
  try { body = await req.json(); } catch { return reply(400, { error: 'bad_json' }); }
  const code = (body.code ?? '').trim();
  const name = (body.name ?? '').trim();
  const password = body.password ?? '';
  const phone = (body.phone ?? '').trim();
  if (!code || !name) return reply(400, { error: 'missing_fields' });
  if (password.length < MIN_PASSWORD) return reply(400, { error: 'password_short' });

  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: inv } = await admin.from('invites')
    .select('email, status, expires_at').eq('code', code).maybeSingle();
  if (!inv) return reply(404, { error: 'unknown_invite' });
  if (inv.status !== 'pending') return reply(410, { error: inv.status });
  if (new Date(inv.expires_at) <= new Date()) return reply(410, { error: 'expired' });
  const email = inv.email.toLowerCase();

  // handle_new_user() reads raw_user_meta_data->>'name', so the profile is
  // created with the real name rather than the email local-part.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email, password, email_confirm: true, user_metadata: { name },
  });
  if (createErr) {
    const msg = createErr.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return reply(409, { error: 'account_exists', email });
    }
    return reply(500, { error: 'create_failed', detail: createErr.message });
  }
  const userId = created.user.id;

  await admin.from('profiles').update({
    name, initial: name.charAt(0).toUpperCase(), phone, onboarded_at: new Date().toISOString(),
  }).eq('user_id', userId);

  // Sign in as the new member and claim through the same RPC the app uses,
  // so unit creation and the accepted stamp live in exactly one place.
  const member = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: signed, error: signErr } = await member.auth.signInWithPassword({ email, password });
  if (signErr || !signed.session) return reply(500, { error: 'signin_failed', detail: signErr?.message });
  const { data: claimed, error: claimErr } = await member.rpc('claim_invite_code', { invite_code: code });
  if (claimErr || claimed !== true) return reply(500, { error: 'claim_failed', detail: claimErr?.message });

  return reply(200, {
    session: { access_token: signed.session.access_token, refresh_token: signed.session.refresh_token },
    email,
  });
});
