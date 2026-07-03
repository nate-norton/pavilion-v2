import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { ArcSheet } from './ArcSheet';
import { ReportSheet } from './ReportSheet';
import { ViolSheet } from './ViolSheet';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('ARC submit is gated on project type', () => {
  act(() => usePavStore.getState().set({ arcSheetOpen: true }));
  render(<ArcSheet />);
  expect(screen.getByRole('button', { name: /pick a project type/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^paint$/i }));
  fireEvent.click(screen.getByRole('button', { name: /submit to the board/i }));
  expect(usePavStore.getState().arcSubmitted).toBe(true);
});

it('report submits privately with ticket number', () => {
  act(() => usePavStore.getState().set({ reportOpen: true }));
  render(<ReportSheet />);
  fireEvent.click(screen.getByRole('button', { name: /maintenance/i }));
  fireEvent.click(screen.getByRole('button', { name: /send privately to the board/i }));
  expect(screen.getByText(/ticket #m-89/i)).toBeInTheDocument();
});

it('violation can be marked fixed', () => {
  act(() => usePavStore.getState().set({ violSheetOpen: true }));
  render(<ViolSheet />);
  fireEvent.click(screen.getByRole('button', { name: /i've taken care of it/i }));
  expect(screen.getByText(/marked fixed/i)).toBeInTheDocument();
});
