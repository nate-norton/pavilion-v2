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

it('Sheet dismisses when the handle is dragged down past the threshold, and springs back otherwise', () => {
  const onClose = vi.fn();
  render(<Sheet open onClose={onClose}><p>Body</p></Sheet>);
  const handle = screen.getByTestId('sheet-handle');
  fireEvent.pointerDown(handle, { pointerId: 1, clientY: 100, button: 0, pointerType: 'touch' });
  fireEvent.pointerMove(handle, { pointerId: 1, clientY: 130 });
  fireEvent.pointerUp(handle, { pointerId: 1, clientY: 130 });
  expect(onClose).not.toHaveBeenCalled();
  fireEvent.pointerDown(handle, { pointerId: 2, clientY: 100, button: 0, pointerType: 'touch' });
  fireEvent.pointerMove(handle, { pointerId: 2, clientY: 300 });
  fireEvent.pointerUp(handle, { pointerId: 2, clientY: 300 });
  expect(onClose).toHaveBeenCalledTimes(1);
});
