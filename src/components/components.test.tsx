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
  render(<Toggle on={false} onToggle={fn} />);
  fireEvent.click(screen.getByRole('switch'));
  expect(fn).toHaveBeenCalled();
});
