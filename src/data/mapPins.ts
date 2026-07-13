import type { Pin, MapLayer } from './types';

export const PINS: Pin[] = [
  { key: 'taco', x: '58%', y: '14%', icon: 'ph-fill ph-storefront', color: '#E06A3E', layer: 'events', title: 'Taco cart · 5–8 PM today', sub: 'Clubhouse forecourt · 12 going', action: 'Today', go: 'today' },
  { key: 'pool', x: '19%', y: '44%', icon: 'ph-fill ph-swimming-pool', color: '#4A90E2', layer: 'amenities', title: 'Pool & cabana', sub: '12 there now · 4 slots open', action: 'Book', go: 'reserve' },
  { key: 'tennis', x: '80%', y: '50%', icon: 'ph-fill ph-tennis-ball', color: '#2A9D5C', layer: 'amenities', title: 'Tennis courts', sub: 'Court 2 open right now', action: 'Book', go: 'reserve' },
  { key: 'garden', x: '68%', y: '84%', icon: 'ph-fill ph-plant', color: '#74B992', layer: 'amenities', title: 'Community garden', sub: 'Free tomato starts · plot 4', action: 'Circle', go: 'commons' },
  { key: 'gate', x: '24%', y: '52%', icon: 'ph-fill ph-warning', color: '#D9A441', layer: 'alerts', title: 'Pool gate repair · Thu AM', sub: 'Brief closure while AquaFix visits', action: 'Details', go: 'reserve' },
  { key: 'new', x: '30%', y: '76%', icon: 'ph-fill ph-hand-waving', color: '#D9A441', layer: 'events', title: 'The Okafors · #42', sub: 'Moved in this week — say hi', action: 'Say hi', go: 'chat-okafor' },
];

export const MAP_LAYERS: MapLayer[] = [['all', 'All', 'ph-fill ph-stack'], ['amenities', 'Amenities', 'ph-fill ph-swimming-pool'], ['events', 'Events', 'ph-fill ph-calendar-dots'], ['alerts', 'Alerts', 'ph-fill ph-warning']];
