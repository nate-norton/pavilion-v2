import { usePavStore } from '../store/store';
import { useAdminMembers, useAmenities, useDocuments, useFeed, useInvites, useMember, useVotes } from '../data/repo';

/**
 * The setup guide's steps, derived live from the repository — never stored.
 * Each step knows whether it's done, what the community holds right now
 * (`detail`), why a resident cares (`payoff`), what neighbors will see once
 * it's done (`sees`), and how to actually do it (`act`). The card and the
 * sheet both read this one list, so they can never disagree.
 *
 * Ordered by dependency: nobody sees anything until neighbors are in, the
 * documents answer the question residents ask most, and a first post is what
 * makes the Commons feel inhabited when people arrive.
 */
export interface SetupStep {
  key: 'invite' | 'docs' | 'amenities' | 'vote' | 'hello';
  done: boolean;
  title: string;
  payoff: string;
  /** Live one-liner: "2 joined · 1 invited". */
  detail: string;
  sees: string;
  cta: string;
  /** Opens the real surface for the work. Null when the sheet does the work itself. */
  act: (() => void) | null;
  /** Names to show in the sheet's "right now" panel. */
  items: string[];
}

export function useSetupSteps() {
  const set = usePavStore((s) => s.set);
  const member = useMember();
  const members = useAdminMembers();
  const invites = useInvites();
  const docs = useDocuments();
  const amenities = useAmenities();
  const votes = useVotes();
  const feed = useFeed();

  const active = members.filter((m) => m.status === 'active');
  const pending = invites.filter((i) => i.status === 'pending');
  const openVote = votes.openAll[0];
  const closeGuide = { setupGuideStep: null as string | null };

  const steps: SetupStep[] = [
    {
      key: 'invite',
      done: active.length > 1,
      title: 'Invite your neighbors',
      payoff: 'Nothing here reaches anyone until they’re in.',
      detail: `${active.length} ${active.length === 1 ? 'member' : 'members'}${pending.length ? ` · ${pending.length} invited, not yet joined` : ''}`,
      sees: 'A welcome with your community’s name and their address on it, then their own Today screen.',
      cta: 'Send invites',
      act: null,
      items: active.map((m) => `${m.name}${m.unitLabel ? ` · ${m.unitLabel}` : ''}${m.role === 'board' ? ' · Board' : ''}`),
    },
    {
      key: 'docs',
      done: docs.length > 0,
      title: 'Publish your documents',
      payoff: 'So neighbors look up the rules themselves instead of texting you.',
      detail: docs.length ? `${docs.length} ${docs.length === 1 ? 'document' : 'documents'} published` : 'No documents yet',
      sees: 'CC&Rs, bylaws and minutes in the Documents tab, and the assistant answering questions from them — with citations.',
      cta: 'Add a document',
      act: () => set({ docsOpen: true, myPlaceOpen: false, ...closeGuide }),
      items: docs.slice(0, 4).map((d) => d.title),
    },
    {
      key: 'amenities',
      done: amenities.length > 0,
      title: 'Add your amenities',
      payoff: 'So the clubhouse books itself instead of going through you.',
      detail: amenities.length ? `${amenities.length} ${amenities.length === 1 ? 'amenity' : 'amenities'}` : 'No amenities yet',
      sees: 'A Reserve tab with real slots, and a pass on their phone when they book.',
      cta: 'Set up amenities',
      act: () => set({ tab: 'reserve', boardMode: false, manageAmenOpen: true, ...closeGuide }),
      items: amenities.slice(0, 4).map((a) => a.name),
    },
    {
      key: 'vote',
      done: votes.openAll.length > 0 || votes.closed.length > 0,
      title: 'Open your first vote',
      payoff: 'A real quorum count, visible to every household.',
      detail: openVote ? `Open now: ${openVote.title}` : votes.closed.length ? `${votes.closed.length} closed` : 'No votes yet',
      sees: 'The ballot on Today, the live tally as neighbors vote, and a receipt for their own ballot.',
      cta: 'Start a vote',
      act: () => set({ boardMode: true, boardTab: 'desk', voteDraftOpen: true, votePosted: false, ...closeGuide }),
      items: openVote ? [openVote.title] : [],
    },
    {
      key: 'hello',
      done: feed.length > 0,
      title: 'Say hello on the Commons',
      payoff: 'The first post is what makes the feed feel like a neighborhood, not a form.',
      detail: feed.length ? `${feed.length} ${feed.length === 1 ? 'post' : 'posts'}` : 'Nothing posted yet',
      sees: 'Your note at the top of the Commons when they open the app for the first time.',
      cta: 'Write a post',
      act: () => set({ tab: 'commons', boardMode: false, composeOpen: true, ...closeGuide }),
      items: feed.slice(0, 3).map((p) => `${p.authorName}: ${p.body.slice(0, 60)}${p.body.length > 60 ? '…' : ''}`),
    },
  ];

  return { steps, communityName: member?.communityName || 'your community', isBoard: member?.role === 'board' };
}
