import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Hoa } from './Hoa';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('voting yes shows receipt and tally', () => {
  render(<Hoa />);
  fireEvent.click(screen.getByRole('button', { name: /yes, replace it/i }));
  expect(screen.getByText(/ballot receipt #r-0482/i)).toBeInTheDocument();
  expect(screen.getByText(/62 · 70%/)).toBeInTheDocument();
});

it('known issues reflect board progress', () => {
  act(() => usePavStore.getState().set({ gateScheduled: true }));
  render(<Hoa />);
  expect(screen.getByText(/aquafix · thu jul 3/i)).toBeInTheDocument();
});
