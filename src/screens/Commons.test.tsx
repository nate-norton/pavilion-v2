import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Commons } from './Commons';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('like toggles heart count', () => {
  render(<Commons />);
  const like = screen.getByRole('button', { name: /14/ });
  fireEvent.click(like);
  expect(screen.getByText('15')).toBeInTheDocument();
});

it('comment can be added', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /2/ })); // open comments
  fireEvent.change(screen.getByPlaceholderText(/add a comment/i), { target: { value: 'Way to go Tom' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/add a comment/i), { key: 'Enter' });
  expect(screen.getByText('Way to go Tom')).toBeInTheDocument();
  expect(screen.getAllByText('You').length).toBeGreaterThan(0);
});

it('send message button opens chat for directory entry', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /^people$/i }));
  const msgBtn = screen.getAllByRole('button', { name: /^send message$/i })[0];
  fireEvent.click(msgBtn);
  expect(usePavStore.getState().chatWith).toBeTruthy();
});

it('claim is one-directional (no un-claim)', () => {
  render(<Commons />);

  fireEvent.click(screen.getByRole('button', { name: /^free stuff$/i }));
  const claimBtn = screen.getAllByRole('button', { name: /^claim$/i })[0];
  fireEvent.click(claimBtn);
  expect(screen.getByText(/claimed ✓/i)).toBeInTheDocument();
  fireEvent.click(screen.getByText(/claimed ✓/i));
  expect(screen.getByText(/claimed ✓/i)).toBeInTheDocument();
});

it('free table claim flips button state', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /^free stuff$/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /^claim$/i })[0]);
  expect(screen.getByText(/claimed ✓/i)).toBeInTheDocument();
});
