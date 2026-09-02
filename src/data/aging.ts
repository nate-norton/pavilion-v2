import type { AgingBucket } from './types';

/*
 * Delinquency aging climbs the severity ladder by hue — sage done, gold look,
 * sunset act, red broken — rather than fading one colour, because the buckets
 * mean escalating trouble. The palette swap briefly broke this: --peach became
 * a pale warm that *lightened* mid-ladder, and --accent became sky, putting a
 * blue bucket between two reds.
 */

export const AGING: AgingBucket[] = [
  { bucket: 'Current', amt: '$38,900', n: '128 homes', w: '96%', c: 'rgb(var(--sage))' },
  { bucket: '1–30 days', amt: '$855', n: '3 homes', w: '32%', c: 'rgb(var(--gold))' },
  { bucket: '31–60 days', amt: '$285', n: '1 home', w: '14%', c: 'rgb(var(--sunset))' },
  { bucket: '61–90 days', amt: '$0', n: 'none', w: '0%', c: 'rgb(var(--sunsetdeep))' },
  { bucket: '90+ days', amt: '$0', n: 'none', w: '0%', c: 'rgb(var(--reddeep))' },
];
