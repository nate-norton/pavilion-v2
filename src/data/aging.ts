import type { AgingBucket } from './types';

export const AGING: AgingBucket[] = [
  { bucket: 'Current', amt: '$38,900', n: '128 homes', w: '96%', c: '#2A9D5C' },
  { bucket: '1–30 days', amt: '$855', n: '3 homes', w: '32%', c: '#D9A441' },
  { bucket: '31–60 days', amt: '$285', n: '1 home', w: '14%', c: '#E0863E' },
  { bucket: '61–90 days', amt: '$0', n: 'none', w: '0%', c: '#C75A31' },
  { bucket: '90+ days', amt: '$0', n: 'none', w: '0%', c: '#B23A2B' },
];
