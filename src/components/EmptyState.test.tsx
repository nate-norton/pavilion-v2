import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from './EmptyState';

const retry = vi.fn();
vi.mock('../data/repo', () => ({ useRepository: () => ({ retry }) }));

const base = { icon: 'ph-fill ph-scales', title: 'No open votes', body: 'Ballots appear here.' };

describe('EmptyState', () => {
  it('reports an absence only once the data has arrived', () => {
    render(<EmptyState {...base} status="ready" />);
    expect(screen.getByText('No open votes')).toBeTruthy();
  });

  it('does not claim emptiness while still loading', () => {
    render(<EmptyState {...base} status="loading" />);
    // The whole point: a slow request must never render as "nothing here".
    expect(screen.queryByText('No open votes')).toBeNull();
    expect(screen.getByText('Loading…')).toBeTruthy();
  });

  it('distinguishes a failed request from an empty one, and offers retry', () => {
    render(<EmptyState {...base} status="error" />);
    expect(screen.queryByText('No open votes')).toBeNull();
    expect(screen.getByText(/this isn’t empty/)).toBeTruthy();
    fireEvent.click(screen.getByText('Try again'));
    expect(retry).toHaveBeenCalled();
  });

  it('offers the action only when the viewer can act', () => {
    const onAction = vi.fn();
    const { rerender } = render(<EmptyState {...base} />);
    expect(screen.queryByText('Open a vote')).toBeNull();
    rerender(<EmptyState {...base} actionLabel="Open a vote" onAction={onAction} />);
    fireEvent.click(screen.getByText('Open a vote'));
    expect(onAction).toHaveBeenCalled();
  });
});
