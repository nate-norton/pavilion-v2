import type { Notif } from './types';

export const NOTIFS: Notif[] = [
  { key: 'vote', icon: 'ph-fill ph-check-square', color: '#C75A31', bg: '#FBEDE4', title: 'Pool furniture vote closes Thursday', sub: '2h ago', cat: 'HOA', when: 'today', go: 'hoa', unread: true },
  { key: 'taco', icon: 'ph-fill ph-storefront', color: '#E06A3E', bg: '#FBEDE4', title: 'Taco cart tonight — 12 neighbors going', sub: '4h ago', cat: 'Events', when: 'today', go: 'events', unread: true },
  { key: 'arc', icon: 'ph-fill ph-seal-check', color: '#4A90E2', bg: '#EAF3FD', title: 'Pergola request approved', sub: 'Yesterday', cat: 'ARC', when: 'earlier', go: 'hoa', unread: true },
  { key: 'movie', icon: 'ph-fill ph-popcorn', color: '#D9A441', bg: '#FBF3E0', title: 'Movie on the lawn — Saturday at dusk', sub: 'Yesterday', cat: 'Events', when: 'earlier', go: 'events', unread: false },
  { key: 'digest', icon: 'ph-fill ph-newspaper', color: '#8A8375', bg: '#EDE6D6', title: 'Your June digest: 4 decisions, 6 events', sub: 'Jun 30', cat: 'Digest', when: 'earlier', go: 'hoa', unread: false },
  { key: 'gate', icon: 'ph-fill ph-wrench', color: '#2A9D5C', bg: '#E9F6EE', title: 'Pool gate repair scheduled for Thursday', sub: 'Jun 29', cat: 'Maintenance', when: 'earlier', go: 'hoa', unread: false },
];

export const NOTIF_CATS: string[] = ['HOA', 'Events', 'ARC', 'Maintenance', 'Digest'];
