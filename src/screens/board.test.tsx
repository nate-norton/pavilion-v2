import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { BoardDesk } from './BoardDesk';
import { Portfolio } from './Portfolio';
import { ExportSheet } from '../sheets/ExportSheet';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('board can approve the submitted ARC and resident status updates', () => {
  act(() => {
    const st = usePavStore.getState();
    st.set({ arcType: 'Paint' });
    st.submitArc();
    st.set({ boardMode: true });
  });
  render(<BoardDesk />);
  fireEvent.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
  expect(usePavStore.getState().arcApprovedByBoard).toBe(true);
  expect(screen.getByText(/resident notified, decisions log updated/i)).toBeInTheDocument();
});

it('vote nudge adds six households to quorum', () => {
  act(() => usePavStore.getState().set({ boardMode: true }));
  render(<BoardDesk />);
  fireEvent.click(screen.getByRole('button', { name: /nudge 49 households/i }));
  expect(screen.getByText(/93 of 136 households/i)).toBeInTheDocument();
});

it('broadcast requires text then confirms', () => {
  act(() => usePavStore.getState().set({ boardMode: true, boardTab: 'comms' }));
  render(<BoardDesk />);
  fireEvent.change(screen.getByPlaceholderText(/announce something/i), { target: { value: 'Pool closes early Friday' } });
  fireEvent.click(screen.getByRole('button', { name: /send to 136 households/i }));
  expect(screen.getByText(/email digest goes out at 6 pm/i)).toBeInTheDocument();
});

it('portfolio drills into a community board desk', () => {
  act(() => usePavStore.getState().set({ role: 'manager', portfolioOpen: true }));
  render(<Portfolio />);
  fireEvent.click(screen.getByText('Cedar Hollow'));
  expect(usePavStore.getState().boardMode).toBe(true);
  expect(usePavStore.getState().activeCommunity).toBe(1);
});

it('export sheet completes CSV download state', () => {
  act(() => usePavStore.getState().set({ exportOpen: true }));
  render(<ExportSheet />);
  fireEvent.click(screen.getByRole('button', { name: /download csv/i }));
  expect(screen.getByText(/ledger\.csv downloaded/i)).toBeInTheDocument();
});
