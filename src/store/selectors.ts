import { usePavStore } from './store';
import type { PavState } from './store';

export function getQuorum(state: PavState): { count: number; pct: number } {
  const count = 87 + (state.voted ? 1 : 0) + (state.reminderSent ? 6 : 0);
  const pct = Math.round((count / 136) * 100);
  return { count, pct };
}

export function useQuorum() {
  return usePavStore(getQuorum);
}

export function getAttention(state: PavState): { n: number; summary: string } {
  const isOwner = state.role === 'owner';
  const isManager = state.role === 'manager';
  const ownerTasks = isOwner ? (state.paid ? 0 : 1) + (state.arcSeen ? 0 : 1) : 0;
  const voteTask = (isOwner || isManager) && !state.voted ? 1 : 0;
  const n = voteTask + ownerTasks;
  const summary =
    n === 0
      ? 'All caught up — enjoy the sunshine.'
      : n === 1
        ? 'One thing needs you before Thursday.'
        : n + ' things need you before Thursday.';
  return { n, summary };
}

export function useAttention() {
  return usePavStore(getAttention);
}

export function getTally(state: PavState): { yesC: number; noC: number; yesPct: number } {
  const yesC = 61 + (state.voted === 'yes' ? 1 : 0);
  const noC = 26 + (state.voted === 'no' ? 1 : 0);
  const yesPct = Math.round((yesC / (yesC + noC)) * 100);
  return { yesC, noC, yesPct };
}

export function useTally() {
  return usePavStore(getTally);
}

export function getTriage(state: PavState): { left: number; summary: string } {
  const left =
    (state.reportTicketed ? 0 : 1) +
    (state.arcSubmitted && !state.arcApprovedByBoard ? 1 : 0) +
    (state.gateScheduled ? 0 : 1);
  const summary =
    'Tuesday, July 1 · ' + (left === 0 ? 'triage queue is clear' : left + (left === 1 ? ' item' : ' items') + ' in triage');
  return { left, summary };
}

export function useTriage() {
  return usePavStore(getTriage);
}

export function getBoardOpenCount(state: PavState): number {
  return (
    (state.reportTicketed ? 0 : 1) +
    (state.gateScheduled ? 0 : 1) +
    (state.arcSubmitted && !state.arcApprovedByBoard ? 1 : 0) +
    (state.reportSubmitted && !state.m89Assigned ? 1 : 0)
  );
}

export function useBoardOpenCount() {
  return usePavStore(getBoardOpenCount);
}

export function getDelinquent(state: PavState): boolean {
  return state.showDelinquent && !state.paid && !state.planActive;
}

export function useDelinquent() {
  return usePavStore(getDelinquent);
}
