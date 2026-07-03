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
});

it('free table claim flips button state', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /^free$/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /^claim$/i })[0]);
  expect(screen.getByText(/claimed ✓/i)).toBeInTheDocument();
});
