import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Today } from './Today';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('owner sees vote, pay and ARC cards', () => {
  render(<Today />);
  expect(screen.getByText(/replace the pool furniture/i)).toBeInTheDocument();
  expect(screen.getByText(/july dues are ready/i)).toBeInTheDocument();
  expect(screen.getByText(/your pergola was approved/i)).toBeInTheDocument();
});

it('tenant sees rent-goes-to-landlord card, no pay card', () => {
  act(() => usePavStore.getState().set({ role: 'tenant' }));
  render(<Today />);
  expect(screen.getByText(/rent goes to your landlord/i)).toBeInTheDocument();
  expect(screen.queryByText(/july dues are ready/i)).not.toBeInTheDocument();
});

it('say hi button opens chat with Okafors', () => {
  render(<Today />);
  fireEvent.click(screen.getByRole('button', { name: /say hi/i }));
  expect(usePavStore.getState().chatWith).toBe('okafor');
});
