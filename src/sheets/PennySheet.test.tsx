import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { PennySheet } from './PennySheet';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('QA chip plays scripted answer with citation', async () => {
  act(() => usePavStore.getState().set({ pennyOpen: true }));
  render(<PennySheet />);
  fireEvent.click(screen.getByRole('button', { name: /can i paint my fence black/i }));
  expect(await screen.findByText(/short answer: not black/i, {}, { timeout: 2000 })).toBeInTheDocument();
  expect(screen.getByText(/cc&rs §4\.2/i)).toBeInTheDocument();
});

it('free-typed question gets the honest fallback with escalation', async () => {
  act(() => usePavStore.getState().set({ pennyOpen: true }));
  render(<PennySheet />);
  fireEvent.change(screen.getByPlaceholderText(/ask about rules/i), { target: { value: 'Can I build a moat?' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/ask about rules/i), { key: 'Enter' });
  expect(await screen.findByText(/i won't guess/i, {}, { timeout: 2000 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /pass this to the board/i })).toBeInTheDocument();
});
