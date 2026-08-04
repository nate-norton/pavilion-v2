import type { Repository } from './Repository';
import { MockRepository } from './MockRepository';
import { SupabaseRepository } from './SupabaseRepository';
import { mockDomain } from './mockDomainStore';

export type { Repository, RepositorySnapshot, MemberContext, DuesState, DuesStatement, DuesStatus, VotesState, OpenVote, VoteChoice, ViolationNotice, SpecialAssessment, ArcState, ArcRequest, ArcStep, CommunityEvent, FeedPost, BoardTriage, KnownIssue, Decision, TriageItem, BoardArcItem, NewReport, NewArcRequest, NewVote, BoardMessage, ThreadComment, VoteOption, ClosedVote, ArcDecision, NewViolation, UnitRef, BoardViolation, AdminMember, BoardBooking, Meeting, AuditEntry, Invite, LoadState, LoadDomain } from './Repository';
export { MockRepository } from './MockRepository';
export { SupabaseRepository } from './SupabaseRepository';
export { RepositoryProvider, useRepository } from './context';
export * from './hooks';

/** Restore the demo's mutable domain data to pristine (used by Reset / Sign out). */
export const resetDemoData = () => mockDomain.reset();

/**
 * Runtime selection of the data backend. `VITE_APP_MODE=demo` (the default)
 * wires the in-memory MockRepository; `live` wires the SupabaseRepository.
 * Keeping this behind one factory is what lets the demo and the real app share
 * every screen and component.
 */
export function createRepository(): Repository {
  const mode = import.meta.env.VITE_APP_MODE ?? 'demo';
  return mode === 'live' ? new SupabaseRepository() : new MockRepository();
}
