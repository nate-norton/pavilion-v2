import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePavStore, initialState } from '../store/store';

// The setup card is live+board only, so both the mode flag and the member's
// role have to be faked. Mocking at the module boundary keeps the real
// component under test.
vi.mock('../auth/AuthGate', () => ({ isLiveMode: true, signOutLive: vi.fn() }));

const state = {
  member: { name: 'Dana', initial: 'D', color: '', role: 'board', communityName: 'Juniper Ridge', unitLabel: '#4' },
  members: [{ membershipId: 'm1', name: 'Dana', unitLabel: '#4', role: 'board', status: 'active' }] as { membershipId: string; name?: string; unitLabel?: string; role?: string; status: string }[],
  docs: [] as unknown[],
  amenities: [] as unknown[],
  votes: { openAll: [] as unknown[], closed: [] as unknown[] },
  invites: [] as unknown[],
  feed: [] as unknown[],
};

vi.mock('../data/repo', () => ({
  useMember: () => state.member,
  useAdminMembers: () => state.members,
  useDocuments: () => state.docs,
  useAmenities: () => state.amenities,
  useVotes: () => state.votes,
  useInvites: () => state.invites,
  useFeed: () => state.feed,
}));

const { BoardSetupCard } = await import('./BoardSetupCard');

describe('BoardSetupCard', () => {
  beforeEach(() => {
    act(() => usePavStore.setState(initialState));
    state.member = { name: 'Dana', initial: 'D', color: '', role: 'board', communityName: 'Juniper Ridge', unitLabel: '#4' };
    state.members = [{ membershipId: 'm1', name: 'Dana', unitLabel: '#4', role: 'board', status: 'active' }];
    state.invites = []; state.feed = [];
    state.docs = []; state.amenities = []; state.votes = { openAll: [], closed: [] };
  });

  it('shows the community name and the first incomplete step', () => {
    render(<BoardSetupCard />);
    expect(screen.getByText(/Get Juniper Ridge running/)).toBeTruthy();
    // First step incomplete → its CTA is the one ember action.
    expect(screen.getByText('Send invites')).toBeTruthy();
  });

  it('hides itself from residents', () => {
    state.member = { ...state.member, role: 'resident' };
    const { container } = render(<BoardSetupCard />);
    expect(container.firstChild).toBeNull();
  });

  it('retires permanently once every step is satisfied', () => {
    state.members = [{ membershipId: 'm1', status: 'active' }, { membershipId: 'm2', status: 'active' }];
    state.docs = [{ id: 'd' }];
    state.amenities = [{ id: 'a' }];
    state.votes = { openAll: [{ id: 'v', title: 'Fence' }], closed: [] };
    state.feed = [{ id: 'p', authorName: 'Dana', body: 'Hello' }];
    const { container } = render(<BoardSetupCard />);
    expect(container.firstChild).toBeNull();
  });

  it('derives progress from real domain state, not stored flags', () => {
    state.docs = [{ id: 'd' }];
    state.members = [{ membershipId: 'm1', status: 'active' }, { membershipId: 'm2', status: 'active' }];
    render(<BoardSetupCard />);
    expect(screen.getByText(/2 of 5 done/)).toBeTruthy();
    // Next incomplete step owns the ember CTA.
    expect(screen.getByText('Set up amenities')).toBeTruthy();
  });

  it('can be dismissed by hand', () => {
    render(<BoardSetupCard />);
    act(() => usePavStore.getState().set({ boardSetupDismissed: true }));
    expect(screen.queryByText(/Get Juniper Ridge running/)).toBeNull();
  });
});
