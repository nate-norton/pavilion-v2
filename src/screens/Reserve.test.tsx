import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Reserve } from './Reserve';
import { PassSheet } from '../sheets/PassSheet';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('booking flow: pick slot, book, see confirmation', () => {
  render(<Reserve />);
  fireEvent.click(screen.getByText('Pool Cabana'));
  fireEvent.click(screen.getByRole('button', { name: '4–6 PM' }));
  fireEvent.click(screen.getByRole('button', { name: /book 4–6 pm/i }));
  expect(screen.getByText('Booked!')).toBeInTheDocument();
  expect(screen.getByText(/pool cabana · today, 4–6 pm · 2 hr/i)).toBeInTheDocument();
});

it('taken slot joins waitlist instead of selecting', () => {
  render(<Reserve />);
  fireEvent.click(screen.getByText('Pool Cabana'));
  fireEvent.click(screen.getByRole('button', { name: /8–10 am · taken/i }));
  expect(screen.getByRole('button', { name: /8–10 am · on waitlist/i })).toBeInTheDocument();
});

it('guest pass requires name and plate, then issues', () => {
  render(
    <>
      <Reserve />
      <PassSheet />
    </>
  );
  fireEvent.click(screen.getByText(/expecting visitors/i));
  fireEvent.change(screen.getByLabelText(/guest name/i), { target: { value: 'Jordan' } });
  fireEvent.change(screen.getByLabelText(/license plate/i), { target: { value: '7ABC123' } });
  fireEvent.click(screen.getByRole('button', { name: /issue pass/i }));
  expect(screen.getByText(/pass jr-0142/i)).toBeInTheDocument();
});
