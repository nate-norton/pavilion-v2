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


it('ARC flow: submit appears for board, approve flips status', () => {
  act(() => s().set({ arcType: 'Paint', arcSheetOpen: true }));
  act(() => s().submitArc());
  expect(s().arcSubmitted).toBe(true);
  expect(s().arcSheetOpen).toBe(false);
  expect(getTriage(s()).left).toBe(3); // streetlight + gate + new ARC
  act(() => s().set({ arcApprovedByBoard: true }));
  expect(getTriage(s()).left).toBe(2);
});

it('attention summary reacts to role', () => {
  expect(getAttention(s()).n).toBe(3); // owner: vote + pay + arc
  act(() => s().set({ role: 'tenant' }));
  expect(getAttention(s()).n).toBe(0);
});

it('pickRole closes any open sheets/overlays', () => {
  act(() => s().set({ aiOpen: true, paySheetOpen: true, notifOpen: true, chatWith: 'okafor', activeGroup: 'gr-garden' }));
  act(() => s().pickRole('manager'));
  expect(s().role).toBe('manager');
  expect(s().aiOpen).toBe(false);
  expect(s().paySheetOpen).toBe(false);
  expect(s().notifOpen).toBe(false);
  expect(s().chatWith).toBe(null);
  expect(s().activeGroup).toBe(null);
});

it('delinquent scenario computes from flags', () => {
  act(() => s().set({ showDelinquent: true }));
  expect(getQuorum(s()).count).toBe(87);
  expect(s().paid).toBe(false);
});

it('scripted AI reply no-ops after a store reset mid-flight (epoch guard)', async () => {
  act(() => s().askAiChip('fence'));
  const bumpedEpoch = usePavStore.getState().epoch + 1;
  act(() => usePavStore.setState({ ...initialState, epoch: bumpedEpoch }, true));
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const msgs = usePavStore.getState().msgs;
  expect(msgs.some((m) => m.text.includes('Approved fence colors'))).toBe(false);
});
