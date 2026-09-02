import { parseRoster } from './roster';

it('reads unit and email in either order, from commas, tabs or semicolons', () => {
  const { ready, skipped } = parseRoster('#12 Alder Way, cade@example.com\npriya@example.com\t#14 Alder Way\n"#16 Alder Way"; tom@example.com; board');
  expect(skipped).toEqual([]);
  expect(ready).toEqual([
    { email: 'cade@example.com', unitLabel: '#12 Alder Way', role: 'resident' },
    { email: 'priya@example.com', unitLabel: '#14 Alder Way', role: 'resident' },
    { email: 'tom@example.com', unitLabel: '#16 Alder Way', role: 'board' },
  ]);
});

it('reports lines with no email instead of dropping them, and keeps the first of a duplicate', () => {
  const { ready, skipped } = parseRoster('#18 Alder Way\n\nCADE@example.com, #12\ncade@example.com, #99');
  expect(skipped).toEqual([{ line: 1, text: '#18 Alder Way' }]);
  expect(ready).toEqual([{ email: 'cade@example.com', unitLabel: '#12', role: 'resident' }]);
});
