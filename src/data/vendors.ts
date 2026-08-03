import type { Vendor } from './types';

export const VENDORS: Vendor[] = [
  { name: 'GreenScape', sub: 'Landscaping · contract thru 2027', last: 'irrigation valve, Jun 24', ins: true, icon: 'ph-fill ph-plant', color: 'rgb(var(--sage))', bg: 'rgb(var(--mint))' },
  { name: 'AquaFix', sub: 'Pool & spa service', last: 'gate latch, Thu Jul 3', ins: true, icon: 'ph-fill ph-swimming-pool', color: 'rgb(var(--sky))', bg: 'rgb(var(--skypale))' },
  { name: 'BrightPath Electric', sub: 'Electrical & lighting', last: 'streetlight #M-88', ins: false, icon: 'ph-fill ph-lightning', color: 'rgb(var(--gold))', bg: 'rgb(var(--goldpale))' },
];

export const SLOTS: string[] = ['8–10 AM', '10–12 PM', '12–2 PM', '2–4 PM', '4–6 PM', '6–8 PM'];
export const DAYS: string[] = ['Today · 1', 'Wed · 2', 'Thu · 3', 'Fri · 4'];

export const ARC_TYPES: string[] = ['Paint', 'Fence', 'Deck & pergola', 'Landscaping', 'Solar', 'Other'];

export const HH: import('./types').HHOption[] = [
  { key: 'partner', label: 'Partner', icon: 'ph-fill ph-users' },
  { key: 'kids', label: 'Kids at home', icon: 'ph-fill ph-baby' },
  { key: 'renter', label: 'Renter', icon: 'ph-fill ph-key' },
  { key: 'pets', label: 'Pets', icon: 'ph-fill ph-paw-print' },
];

export const ONBOARD_CIRCLES: import('./types').OnboardCircle[] = [
  { key: 'garden', label: 'Garden', icon: 'ph-fill ph-plant' },
  { key: 'pickle', label: 'Pickleball', icon: 'ph-fill ph-tennis-ball' },
  { key: 'book', label: 'Book club', icon: 'ph-fill ph-book-open' },
  { key: 'parents', label: 'Parents', icon: 'ph-fill ph-baby-carriage' },
  { key: 'trail', label: 'Trail crew', icon: 'ph-fill ph-mountains' },
  { key: 'poker', label: 'Poker night', icon: 'ph-fill ph-spade' },
];
