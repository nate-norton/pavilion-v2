import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import App from './App';
import { usePavStore, initialState } from './store/store';

it('renders the Pavilion shell', () => {
  render(<App />);
  expect(screen.getByTestId('phone-frame')).toBeInTheDocument();
});

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('nav dock switches tabs', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /commons/i }));
  expect(usePavStore.getState().tab).toBe('commons');
});

it('role chips switch role and reset to today', () => {
  render(<App />);
  act(() => usePavStore.getState().set({ tab: 'commons' }));
  fireEvent.click(screen.getByRole('button', { name: /tenant/i }));
  expect(usePavStore.getState().role).toBe('tenant');
  expect(usePavStore.getState().tab).toBe('today');
});
