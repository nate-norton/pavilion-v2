import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Search } from './Search';
import { Notifications } from './Notifications';
import { Chat } from './Chat';
import { Documents } from './Documents';
import { Meeting } from './Meeting';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('search filters the index', () => {
  act(() => usePavStore.getState().set({ searchOpen: true }));
  render(<Search />);
  fireEvent.change(screen.getByPlaceholderText(/docs, decisions, people/i), { target: { value: 'ladder' } });
  expect(screen.getByText(/tom b\. · #18/i)).toBeInTheDocument();
});

it('muting a category hides its notifications', () => {
  act(() => usePavStore.getState().set({ notifOpen: true }));
  render(<Notifications />);
  expect(screen.getByText(/pool furniture vote closes thursday/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^hoa$/i }));
  expect(screen.queryByText(/pool furniture vote closes thursday/i)).not.toBeInTheDocument();
});

it('chat sends and receives canned reply', async () => {
  act(() => usePavStore.getState().set({ chatWith: 'tom' }));
  render(<Chat />);
  fireEvent.change(screen.getByPlaceholderText(/message…/i), { target: { value: 'Thanks Tom!' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/message…/i), { key: 'Enter' });
  expect(screen.getByText('Thanks Tom!')).toBeInTheDocument();
  expect(await screen.findByText(/see you around the ridge/i, {}, { timeout: 2500 })).toBeInTheDocument();
});

it('doc search filters sections and diff toggles', () => {
  act(() => usePavStore.getState().set({ docsOpen: true, docReader: true }));
  render(<Documents />);
  fireEvent.change(screen.getByPlaceholderText(/search within this document/i), { target: { value: 'quiet' } });
  expect(screen.getByText(/§5 · living/i)).toBeInTheDocument();
  expect(screen.queryByText(/§7 · leasing/i)).not.toBeInTheDocument();
});

it('meeting hand-raise joins queue and proxy can be assigned', () => {
  act(() => usePavStore.getState().set({ meetingOpen: true }));
  render(<Meeting />);
  fireEvent.click(screen.getByRole('button', { name: /raise your hand/i }));
  expect(screen.getByText(/#3 in the comment queue/i)).toBeInTheDocument();
});
