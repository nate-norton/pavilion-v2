import { render, screen, fireEvent, waitFor } from '@testing-library/react';

/*
 * The gate is env-gated: isLiveMode is false under test, so AuthGate is a
 * pass-through and none of the live screens render. These tests mock the
 * client module to force live mode and hand back a scriptable Supabase stub,
 * so the sign-in / onboarding / membership branches are actually exercised.
 */

type ProfileRow = { id: string; name: string; phone: string; onboarded_at: string | null } | null;

const state = {
  session: null as { user: { id: string; email: string } } | null,
  profile: null as ProfileRow,
  membershipCount: 0,
  claimInvite: false,
  claimCode: false,
  peek: null as null | Record<string, string>,
  invoke: vi.fn(),
  setSession: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signInWithOtp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  profileUpdate: vi.fn(),
};

vi.mock('../data/repo/supabaseClient', () => ({
  isLiveMode: true,
  getSupabaseClient: () => ({
    auth: {
      getSession: () => Promise.resolve({ data: { session: state.session } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: state.signInWithPassword,
      signUp: state.signUp,
      signInWithOtp: state.signInWithOtp,
      resetPasswordForEmail: state.resetPasswordForEmail,
      refreshSession: () => Promise.resolve({}),
      updateUser: () => Promise.resolve({ error: null }),
      setSession: state.setSession,
    },
    functions: { invoke: state.invoke },
    rpc: (name: string) => Promise.resolve({
      data: name === 'claim_invite' ? state.claimInvite
        : name === 'claim_invite_code' ? state.claimCode
        : name === 'peek_invite' ? (state.peek ? [state.peek] : [])
        : false,
    }),
    from: (table: string) => {
      if (table === 'profiles') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: state.profile }) }) }),
          update: (patch: Record<string, unknown>) => {
            state.profileUpdate(patch);
            return { eq: () => Promise.resolve({ error: null }) };
          },
        };
      }
      return {
        select: () => ({ eq: () => ({ eq: () => Promise.resolve({ count: state.membershipCount }) }) }),
      };
    },
  }),
}));

const { AuthGate } = await import('./AuthGate');

beforeEach(() => {
  state.session = null;
  state.profile = null;
  state.membershipCount = 0;
  state.claimInvite = false;
  state.claimCode = false;
  state.peek = null;
  Object.values(state).forEach((v) => { if (typeof v === 'function' && 'mockReset' in v) v.mockReset(); });
  state.signInWithPassword.mockResolvedValue({ error: null });
  state.signUp.mockResolvedValue({ data: { session: {} }, error: null });
  state.signInWithOtp.mockResolvedValue({ error: null });
  state.resetPasswordForEmail.mockResolvedValue({ error: null });
  state.invoke.mockResolvedValue({ data: { session: { access_token: 'a', refresh_token: 'r' } }, error: null });
  state.setSession.mockResolvedValue({ error: null });
  localStorage.clear();
});

const app = <AuthGate><p>Community home</p></AuthGate>;

it('signed-out members get password fields, not just a magic link', async () => {
  render(app);
  expect(await screen.findByLabelText('Password')).toBeInTheDocument();
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  // the link stays available, but as the fallback
  expect(screen.getByRole('button', { name: /email me a sign-in link/i })).toBeInTheDocument();
});

it('signs in with email and password', async () => {
  render(app);
  fireEvent.change(await screen.findByLabelText('Email'), { target: { value: ' Ada@Example.com ' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'hunter2hunter2' } });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
  await waitFor(() => expect(state.signInWithPassword).toHaveBeenCalledWith({
    email: 'ada@example.com', // trimmed + lowercased so it matches the invite
    password: 'hunter2hunter2',
  }));
});

it('will not submit a password under the minimum length', async () => {
  render(app);
  fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'ada@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
  fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));
  expect(state.signInWithPassword).not.toHaveBeenCalled();
});

it('has no sign-up toggle: accounts are only created through an invitation', async () => {
  render(app);
  await screen.findByText('Welcome back');
  expect(screen.queryByRole('button', { name: /create an account/i })).toBeNull();
  expect(screen.getByText(/Open the invitation link your board sent/)).toBeInTheDocument();
});

it('asks a never-onboarded member for a real name before letting them in', async () => {
  state.session = { user: { id: 'u1', email: 'ada@example.com' } };
  state.profile = { id: 'p1', name: 'ada', phone: '', onboarded_at: null };
  state.membershipCount = 1;
  render(app);
  expect(await screen.findByText(/introduce yourself/i)).toBeInTheDocument();
  expect(screen.queryByText('Community home')).not.toBeInTheDocument();

  // the email-derived name is not offered back as a real answer
  expect((screen.getByLabelText('Full name') as HTMLInputElement).value).toBe('');

  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Ada Lovelace' } });
  fireEvent.click(screen.getByRole('button', { name: /continue/i }));
  await waitFor(() => expect(state.profileUpdate).toHaveBeenCalledWith(expect.objectContaining({
    name: 'Ada Lovelace',
    initial: 'A',
    onboarded_at: expect.any(String),
  })));
});

it('an onboarded member with a membership lands in the app', async () => {
  state.session = { user: { id: 'u1', email: 'ada@example.com' } };
  state.profile = { id: 'p1', name: 'Ada Lovelace', phone: '', onboarded_at: '2026-08-04T00:00:00Z' };
  state.membershipCount = 1;
  render(app);
  expect(await screen.findByText('Community home')).toBeInTheDocument();
});

it('an onboarded member with no invite gets the no-community screen', async () => {
  state.session = { user: { id: 'u1', email: 'ada@example.com' } };
  state.profile = { id: 'p1', name: 'Ada Lovelace', phone: '', onboarded_at: '2026-08-04T00:00:00Z' };
  state.membershipCount = 0;
  render(app);
  expect(await screen.findByText(/has no invitation/i)).toBeInTheDocument();
});

it('claims a copied invite link even when the member already belongs elsewhere', async () => {
  state.session = { user: { id: 'u1', email: 'nate@example.com' } };
  state.profile = { id: 'p1', name: 'Nate', phone: '', onboarded_at: '2026-01-01' };
  state.membershipCount = 1;
  localStorage.setItem('pav-invite-code', 'abc123');
  localStorage.setItem('pav-community', 'old-community');
  state.claimCode = true;
  render(app);
  await screen.findByText('Community home');
  await waitFor(() => expect(localStorage.getItem('pav-invite-code')).toBeNull());
  expect(localStorage.getItem('pav-community')).toBeNull();
});

const pendingInvite = {
  community_name: 'Mountain Vista', inviter_name: 'Nathan Norton', role: 'board',
  unit_label: '#12 Alder Way', email: 'cade@example.com', state: 'pending',
};

it('an invite link opens the community’s welcome, not the sign-in form', async () => {
  localStorage.setItem('pav-invite-code', 'abc123');
  state.peek = pendingInvite;
  render(app);
  expect(await screen.findByText('Mountain Vista')).toBeInTheDocument();
  expect(screen.getByText(/Nathan Norton invited you/)).toBeInTheDocument();
  expect(screen.getByText('Board member')).toBeInTheDocument();
  expect(screen.getByText('#12 Alder Way')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText('you@email.com')).toBeNull();
});

it('accepting asks for a name and password, then joins in one step with no confirmation email', async () => {
  localStorage.setItem('pav-invite-code', 'abc123');
  state.peek = pendingInvite;
  render(app);
  fireEvent.click(await screen.findByText('Accept the invitation'));
  expect(screen.getByText('cade@example.com')).toBeInTheDocument();   // locked, from the invite
  const join = screen.getByText('Join Mountain Vista');
  expect(join).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Cade Norton' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'porchlight1' } });
  fireEvent.click(join);
  await waitFor(() => expect(state.invoke).toHaveBeenCalledWith('accept_invite', {
    body: { code: 'abc123', name: 'Cade Norton', password: 'porchlight1', phone: '' },
  }));
  await waitFor(() => expect(state.setSession).toHaveBeenCalledWith({ access_token: 'a', refresh_token: 'r' }));
  expect(state.signUp).not.toHaveBeenCalled();
  expect(localStorage.getItem('pav-invite-code')).toBeNull();
});

it('an expired invite says so and points at the board, instead of a generic error', async () => {
  localStorage.setItem('pav-invite-code', 'old');
  state.peek = { ...pendingInvite, state: 'expired' };
  render(app);
  expect(await screen.findByText('This invitation has expired')).toBeInTheDocument();
  expect(screen.getByText(/Mountain Vista board/)).toBeInTheDocument();
});

it('someone who already has an account is sent to sign in with the email prefilled', async () => {
  localStorage.setItem('pav-invite-code', 'abc123');
  state.peek = pendingInvite;
  render(app);
  fireEvent.click(await screen.findByText('I already have a Pavilion account'));
  expect(await screen.findByText('Welcome back')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('you@email.com')).toHaveValue('cade@example.com');
  // the code stays stashed so the gate claims it after sign-in
  expect(localStorage.getItem('pav-invite-code')).toBe('abc123');
});
