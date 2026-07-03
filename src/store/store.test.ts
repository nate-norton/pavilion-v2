import { act } from '@testing-library/react';
import { usePavStore, initialState } from './store';
import { getQuorum, getAttention, getTriage, getTally } from './selectors';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));
const s = () => usePavStore.getState();

it('vote increments quorum and records ballot', () => {
  expect(getQuorum(s()).count).toBe(87);
  act(() => s().set({ voted: 'yes' }));
  expect(getQuorum(s()).count).toBe(88);
  expect(getTally(s()).yesC).toBe(62);
});

it('booking builds summary from amenity, day, slot, duration', () => {
  act(() => s().set({ amenIdx: 0, dayIdx: 2, slotIdx: 4, durIdx: 1 }));
  act(() => s().book());
  expect(s().bookingSummary).toBe('Pool Cabana · Thu, 4–6 PM · 2 hr');
  expect(s().booked).toBe(true);
});

it('ARC flow: submit appears for board, approve flips status', () => {
  act(() => s().set({ arcType: 'Paint' }));
  act(() => s().submitArc());
  expect(s().arcSubmitted).toBe(true);
  expect(getTriage(s()).left).toBe(3); // streetlight + gate + new ARC
  act(() => s().set({ arcApprovedByBoard: true }));
  expect(getTriage(s()).left).toBe(2);
});

it('attention summary reacts to role', () => {
  expect(getAttention(s()).n).toBe(3); // owner: vote + pay + arc
  act(() => s().set({ role: 'tenant' }));
  expect(getAttention(s()).n).toBe(0);
});

it('delinquent scenario computes from flags', () => {
  act(() => s().set({ showDelinquent: true }));
  expect(getQuorum(s()).count).toBe(87);
  expect(s().paid).toBe(false);
});
