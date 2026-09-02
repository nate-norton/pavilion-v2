import { render, screen, fireEvent } from '@testing-library/react';
import { PhIcon } from './PhIcon';
import { Sheet } from './Sheet';
import { StatusTimeline } from './StatusTimeline';
import { Toggle } from './Toggle';

it('PhIcon maps prototype class strings to phosphor components', () => {
  const { container } = render(<PhIcon name="ph-fill ph-swimming-pool" size={20} />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

it('Sheet renders children when open and closes on scrim click', () => {
  const onClose = vi.fn();
  render(<Sheet open onClose={onClose}><p>Pay dues</p></Sheet>);
  expect(screen.getByText('Pay dues')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('sheet-scrim'));
  expect(onClose).toHaveBeenCalled();
});

it('StatusTimeline renders one node per step', () => {
  render(<StatusTimeline steps={[
    { label: 'Submitted', state: 'done' },
    { label: 'Board review', state: 'active' },
    { label: 'Decision', state: 'pending' },
  ]} />);
  expect(screen.getByText('Board review')).toBeInTheDocument();
});

it('Toggle reflects state and fires', () => {
  const fn = vi.fn();
  render(<Toggle on={false} onToggle={fn} label="Test switch" />);
  fireEvent.click(screen.getByRole('switch'));
  expect(fn).toHaveBeenCalled();
});

it('StatusTimeline segments turn green only when the next step is done', () => {
  // Test with [done, active, pending] - both segments should be grey
  const { rerender } = render(<StatusTimeline steps={[
    { label: 'Submitted', state: 'done' },
    { label: 'Board review', state: 'active' },
    { label: 'Decision', state: 'pending' },
  ]} />);

  const segments = screen.getAllByTestId('timeline-segment');
  expect(segments).toHaveLength(2);
  expect(segments[0]).toHaveStyle({ background: 'rgb(var(--skyline))' }); // grey (tokenized)
  expect(segments[1]).toHaveStyle({ background: 'rgb(var(--skyline))' }); // grey (tokenized)

  // Test with [done, done, done] - both segments should be green
  rerender(<StatusTimeline steps={[
    { label: 'Submitted', state: 'done' },
    { label: 'Board review', state: 'done' },
    { label: 'Decision', state: 'done' },
  ]} />);

  const segmentsGreen = screen.getAllByTestId('timeline-segment');
  expect(segmentsGreen).toHaveLength(2);
  expect(segmentsGreen[0]).toHaveStyle({ background: 'rgb(var(--sage))' }); // green (tokenized)
  expect(segmentsGreen[1]).toHaveStyle({ background: 'rgb(var(--sage))' }); // green (tokenized)
});
