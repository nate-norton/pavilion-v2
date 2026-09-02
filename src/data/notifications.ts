import type { Notif } from './types';

export const NOTIFS: Notif[] = [
  { key: 'vote', icon: 'ph-fill ph-check-square', color: 'rgb(var(--accent))', bg: 'rgb(var(--accenttint))', title: 'Pool furniture vote closes Thursday', sub: '2h ago', cat: 'HOA', when: 'today', go: 'hoa', unread: true },
  { key: 'taco', icon: 'ph-fill ph-storefront', color: 'rgb(var(--sunset))', bg: 'rgb(var(--accenttint))', title: 'Taco cart tonight — 12 neighbors going', sub: '4h ago', cat: 'Events', when: 'today', go: 'events', unread: true },
  { key: 'arc', icon: 'ph-fill ph-seal-check', color: 'rgb(var(--sky))', bg: 'rgb(var(--skypale))', title: 'Pergola request approved', sub: 'Yesterday', cat: 'ARC', when: 'earlier', go: 'hoa', unread: true },
  { key: 'movie', icon: 'ph-fill ph-popcorn', color: 'rgb(var(--gold))', bg: 'rgb(var(--goldpale))', title: 'Movie on the lawn — Saturday at dusk', sub: 'Yesterday', cat: 'Events', when: 'earlier', go: 'events', unread: false },
  { key: 'digest', icon: 'ph-fill ph-newspaper', color: 'rgb(var(--slate))', bg: 'rgb(var(--skyborder))', title: 'Your June digest: 4 decisions, 6 events', sub: 'Jun 30', cat: 'Digest', when: 'earlier', go: 'hoa', unread: false },
  { key: 'gate', icon: 'ph-fill ph-wrench', color: 'rgb(var(--sage))', bg: 'rgb(var(--mint))', title: 'Pool gate repair scheduled for Thursday', sub: 'Jun 29', cat: 'Maintenance', when: 'earlier', go: 'hoa', unread: false },
];

export const NOTIF_CATS: string[] = ['HOA', 'Events', 'ARC', 'Maintenance', 'Digest'];
