import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Onboarding } from './Onboarding';
import { SignIn } from './SignIn';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('onboarding walks all five steps and lands home', () => {
  act(() => usePavStore.getState().set({ obOpen: true, obStep: 0 }));
  render(<Onboarding />);
  expect(screen.getByText(/welcome home, alex/i)).toBeInTheDocument();
  const next = () => fireEvent.click(screen.getByRole('button', { name: /continue|turn on autopay|take me home/i }));
  next(); next(); next(); next(); next();
  expect(usePavStore.getState().obOpen).toBe(false);
});

it('sign-in continue closes to app', () => {
  act(() => usePavStore.getState().set({ loginOpen: true }));
  render(<SignIn />);
  fireEvent.click(screen.getByRole('button', { name: /continue with email/i }));
  expect(usePavStore.getState().loginOpen).toBe(false);
});
