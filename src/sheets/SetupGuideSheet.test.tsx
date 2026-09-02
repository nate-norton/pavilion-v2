import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { usePavStore, initialState } from '../store/store';

vi.mock('../auth/AuthGate', () => ({ isLiveMode: true, signOutLive: vi.fn() }));

const state = {
  member: { name: 'Dana', initial: 'D', color: '', role: 'board', communityName: 'Mountain Vista', unitLabel: '#4' },
  members: [{ membershipId: 'm1', name: 'Dana Ortiz', unitLabel: '#4', role: 'board', status: 'active' }],
  invites: [{ id: 'i1', email: 'cade@example.com', unitLabel: '#12', role: 'board', status: 'pending', code: 'abc', expiresLabel: 'Expires Sep 16' }],
  docs: [] as unknown[], amenities: [] as unknown[], votes: { openAll: [] as unknown[], closed: [] as unknown[] }, feed: [] as unknown[],
  createInvites: vi.fn(),
};

vi.mock('../data/repo', () => ({
  useMember: () => state.member,
  useAdminMembers: () => state.members,
  useInvites: () => state.invites,
  useDocuments: () => state.docs,
  useAmenities: () => state.amenities,
  useVotes: () => state.votes,
  useFeed: () => state.feed,
  useRepository: () => ({ isDemo: () => false, createInvites: state.createInvites }),
}));

const { SetupGuideSheet } = await import('./SetupGuideSheet');

describe('SetupGuideSheet', () => {
  beforeEach(() => { act(() => usePavStore.setState({ ...initialState, setupGuideStep: 'invite' })); });

  it('guides the invite step with live state and the roster paste inline', () => {
    render(<SetupGuideSheet />);
    expect(screen.getByText(/Step 1 of 5 · Mountain Vista/)).toBeTruthy();
    expect(screen.getByText('1 member · 1 invited, not yet joined')).toBeTruthy();
    expect(screen.getByText(/Dana Ortiz · #4 · Board/)).toBeTruthy();
    expect(screen.getByLabelText('Roster, one home per line')).toBeTruthy();
    expect(screen.getByText(/Share all 1 pending link/)).toBeTruthy();
  });

  it('walks to the next undone step', () => {
    render(<SetupGuideSheet />);
    fireEvent.click(screen.getByText(/Next: Publish your documents/));
    expect(usePavStore.getState().setupGuideStep).toBe('docs');
    expect(screen.getByText('No documents yet')).toBeTruthy();
    expect(screen.getByText('Add a document')).toBeTruthy();
  });

  it('the action hands off to the real surface and closes the guide', () => {
    act(() => usePavStore.getState().set({ setupGuideStep: 'docs' }));
    render(<SetupGuideSheet />);
    fireEvent.click(screen.getByText('Add a document'));
    const s = usePavStore.getState();
    expect(s.docsOpen).toBe(true);
    expect(s.setupGuideStep).toBeNull();
  });
});
