import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BRAND_THEMES } from './themes';

/*
 * The palette rename showed that token names live in three places TypeScript
 * cannot connect: the :root block, `rgb(var(--x))` strings, and object keys
 * that mirror a token name (BRAND_THEMES overrides, StackedCard's TINTS, the
 * Tailwind colour map). A stale name there fails silently — the theme sets a
 * variable nothing reads, or a class is never generated and the element falls
 * back to black. These assertions stand in for the type system.
 */
const SOURCES = import.meta.glob('/src/**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Read from disk: vitest stubs CSS imports to an empty string, so a ?raw
// import of index.css yields nothing and every assertion below goes vacuous.
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

const defined = new Set(
  [...css.matchAll(/^\s*--([a-z0-9-]+)\s*:/gm)].map((m) => m[1]),
);

it('reads the token definitions', () => {
  // Guards the two assertions below: an empty set would make them vacuous.
  expect(defined.size).toBeGreaterThan(40);
  expect(defined.has('navy')).toBe(true);
});

it('every token a brand theme overrides actually exists', () => {
  const stale = BRAND_THEMES.flatMap((t) =>
    Object.keys(t.tokens)
      .filter((k) => !k.startsWith('color-') && !defined.has(k))
      .map((k) => `${t.key}.${k}`),
  );
  expect(stale).toEqual([]);
});

it('every rgb(var(--x)) in the app resolves to a defined token', () => {
  const IGNORE = new Set(['token', 'x', 'stack-tuck', 'tw-shadow-color', 'tx', 'ty', 'rot']);
  const missing = new Set<string>();
  for (const src of Object.values(SOURCES)) {
    for (const m of src.matchAll(/var\(--([a-z0-9-]+)/g)) {
      if (!IGNORE.has(m[1]) && !defined.has(m[1])) missing.add(m[1]);
    }
  }
  expect([...missing].sort()).toEqual([]);
});

it('no utility class names a token that does not exist', () => {
  /*
   * `text-sagedarkdark` shipped on three success headlines in Board Desk:
   * Tailwind never generated the class, so the text fell back to black and
   * nothing failed. The rgb(var(--x)) check above cannot see class names.
   * A class whose colour part *starts with* a real token but is not one
   * (sagedark → sagedarkdark) is the drift this catches; ordinary Tailwind
   * names (text-lg, bg-white, border-0) never start with a token name.
   */
  const stale = new Set<string>();
  const tokens = [...defined];
  for (const src of Object.values(SOURCES)) {
    for (const m of src.matchAll(/\b(?:text|bg|border|from|to|via|ring|fill|stroke)-([a-z]+)\b/g)) {
      const name = m[1];
      if (defined.has(name)) continue;
      if (tokens.some((t) => name.startsWith(t) && name !== t)) stale.add(m[0]);
    }
  }
  expect([...stale].sort()).toEqual([]);
});
