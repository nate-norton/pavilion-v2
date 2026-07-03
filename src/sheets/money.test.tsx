import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { PaySheet } from './PaySheet';
import { SASheet } from './SASheet';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('pays july dues and shows receipt', () => {
  act(() => usePavStore.getState().set({ paySheetOpen: true }));
  render(<PaySheet />);
  fireEvent.click(screen.getByRole('button', { name: /pay \$285\.00/i }));
  expect(screen.getByText(/receipt #p-2231/i)).toBeInTheDocument();
});

it('delinquent scenario offers 3-payment plan', () => {
  act(() => usePavStore.getState().set({ showDelinquent: true, paySheetOpen: true }));
  render(<PaySheet />);
  expect(screen.getByText(/june \+ july assessments/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /split into 3 payments of \$190/i }));
  expect(screen.getByText(/payment plan is set/i)).toBeInTheDocument();
});

it('special assessment can be paid in full', () => {
  act(() => usePavStore.getState().set({ saSheetOpen: true }));
  render(<SASheet />);
  fireEvent.click(screen.getByRole('button', { name: /pay \$450\.00/i }));
  expect(screen.getByText(/receipt #s-118/i)).toBeInTheDocument();
});
