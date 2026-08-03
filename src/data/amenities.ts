import type { Amenity } from './types';

export const AMENS: Amenity[] = [
  { name: 'Pool Cabana', sub: 'Up to 8 guests · 2-hr blocks', icon: 'ph-fill ph-swimming-pool', avail: '4 slots today', taken: [0, 3], occ: '12 there now · lively', occColor: 'rgb(var(--sage))', rules: 'Guests capped at 4 per household · no glass on the deck · lifeguard off-duty after 8 PM' },
  { name: 'Clubhouse', sub: 'Up to 40 · events & parties', icon: 'ph-fill ph-buildings', avail: '2 slots today', taken: [0, 1, 2, 5], occ: 'Empty until 5 PM', occColor: 'rgb(var(--stonelight))', rules: '$100 refundable deposit for private events · cleaned & locked by 10 PM' },
  { name: 'Tennis Court', sub: 'Courts 1 & 2 · 1-hr blocks', icon: 'ph-fill ph-tennis-ball', avail: '6 slots today', taken: [], occ: 'Court 2 open right now', occColor: 'rgb(var(--sage))', rules: 'Non-marking shoes · lights off at 10 PM · open play Saturday mornings' },
  { name: 'Guest Parking', sub: 'Overnight passes · Lot B', icon: 'ph-fill ph-car', avail: '3 passes left', taken: [4], occ: '9 of 12 spots full', occColor: 'rgb(var(--gold))', rules: 'Max 3 nights per pass · plate must match the pass · Lot B only' },
];
