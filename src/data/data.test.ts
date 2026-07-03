import { AMENS, SEARCH, PORTFOLIO, QA, NOTIFS, CHAT_SEED, PINS, AGING, DOCS } from './index';

it('seed data matches the prototype dataset', () => {
  expect(AMENS).toHaveLength(4);
  expect(AMENS[0].name).toBe('Pool Cabana');
  expect(AMENS[0].taken).toEqual([0, 3]);
  expect(SEARCH).toHaveLength(10);
  expect(PORTFOLIO.map(p => p.doors)).toEqual([136, 48, 30]);
  expect(Object.keys(QA)).toEqual(['fence', 'pool', 'rent']);
  expect(NOTIFS).toHaveLength(6);
  expect(Object.keys(CHAT_SEED)).toEqual(['tom', 'rosa', 'priya', 'okafor']);
  expect(PINS).toHaveLength(6);
  expect(AGING).toHaveLength(5);
  expect(DOCS).toHaveLength(5);
});
