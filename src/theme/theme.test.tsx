import { render } from '@testing-library/react';
import { ThemeProvider } from './ThemeProvider';
import { brandTokens } from './themes';

it('ThemeProvider applies token overrides as CSS variables', () => {
  const { container } = render(
    <ThemeProvider tokens={{ sunset: '58 115 181', 'color-accent': 'var(--accent)' }}>
      <span>hi</span>
    </ThemeProvider>,
  );
  const root = container.firstChild as HTMLElement;
  expect(root.style.getPropertyValue('--sunset')).toBe('58 115 181');
  expect(root.style.getPropertyValue('--color-accent')).toBe('var(--accent)');
});

it('default (juniper) brand applies no overrides', () => {
  const { container } = render(
    <ThemeProvider tokens={brandTokens('juniper')}><span>hi</span></ThemeProvider>,
  );
  const root = container.firstChild as HTMLElement;
  expect(root.style.getPropertyValue('--sunset')).toBe('');
});

it('a brand preset remaps the accent family', () => {
  expect(brandTokens('harbor').sunset).toBeTruthy();
  expect(brandTokens('harbor').sunset).not.toBe(brandTokens('meadow').sunset);
});
