import { render, screen, fireEvent } from '@testing-library/react';
import { StackedCard, StackedCards, StackedPanel } from './StackedCard';

it('StackedCard renders eyebrow, title and body', () => {
  render(<StackedCard eyebrow="Fast Sunday" title="Study the chapter" body="Some copy." />);
  expect(screen.getByText('Fast Sunday')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /study the chapter/i })).toBeInTheDocument();
  expect(screen.getByText('Some copy.')).toBeInTheDocument();
});

it('StackedCard is a button only when onClick is given', () => {
  const fn = vi.fn();
  const { rerender } = render(<StackedCard title="Tap me" onClick={fn} />);
  fireEvent.click(screen.getByRole('button', { name: /tap me/i }));
  expect(fn).toHaveBeenCalled();

  rerender(<StackedCard title="Static" />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('StackedCard renders a bottom-bleed image with its caption', () => {
  render(<StackedCard title="Spotlight" image="data:image/png;base64,x" imageCaption="ADA LOVELACE" />);
  expect(screen.getByText('ADA LOVELACE')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: /ada lovelace/i })).toBeInTheDocument();
});

it('StackedCards overlaps later children and skips falsy ones', () => {
  const { container } = render(
    <StackedCards overlap={22}>
      <StackedPanel>First</StackedPanel>
      {false && <StackedPanel>Hidden</StackedPanel>}
      <StackedPanel>Second</StackedPanel>
    </StackedCards>,
  );
  const wrappers = Array.from(container.firstElementChild!.children) as HTMLElement[];
  expect(wrappers).toHaveLength(2); // the falsy child left no gap
  expect(wrappers[0].style.marginTop).toBe('0px');
  expect(wrappers[1].style.marginTop).toBe('-22px');
});

it('StackedCards hands every child but the last the overlap to pad against', () => {
  const { container } = render(
    <StackedCards overlap={18}>
      <StackedPanel>Top</StackedPanel>
      <StackedPanel>Bottom</StackedPanel>
    </StackedCards>,
  );
  const wrappers = Array.from(container.firstElementChild!.children) as HTMLElement[];
  expect(wrappers[0].style.getPropertyValue('--stack-tuck')).toBe('18px');
  expect(wrappers[1].style.getPropertyValue('--stack-tuck')).toBe('0px');
});
