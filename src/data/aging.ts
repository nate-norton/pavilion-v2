import type { AgingBucket } from './types';

export const AGING: AgingBucket[] = [
  { bucket: 'Current', amt: '$38,900', n: '128 homes', w: '96%', c: 'rgb(var(--sage))' },
  { bucket: '1–30 days', amt: '$855', n: '3 homes', w: '32%', c: 'rgb(var(--gold))' },
  { bucket: '31–60 days', amt: '$285', n: '1 home', w: '14%', c: 'rgb(var(--peach))' },
  { bucket: '61–90 days', amt: '$0', n: 'none', w: '0%', c: 'rgb(var(--accent))' },
  { bucket: '90+ days', amt: '$0', n: 'none', w: '0%', c: 'rgb(var(--reddeep))' },
];
