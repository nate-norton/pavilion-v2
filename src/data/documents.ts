import type { Doc, DocSection } from './types';

export const DOCS: Doc[] = [
  { key: 'ccrs', title: 'CC&Rs', sub: 'Covenants & restrictions · 48 pp · rev. Mar 2026', icon: 'ph-fill ph-scroll' },
  { key: 'bylaws', title: 'Bylaws', sub: 'Governance & elections · 22 pp', icon: 'ph-fill ph-bank' },
  { key: 'budget', title: '2026 Budget', sub: 'Adopted Nov 2025 · 8 pp', icon: 'ph-fill ph-chart-pie-slice' },
  { key: 'minutes', title: 'Meeting minutes', sub: 'June 18 board meeting · 4 pp', icon: 'ph-fill ph-note-pencil' },
  { key: 'reserve', title: 'Reserve study', sub: 'Jan 2026 · full 30-yr forecast', icon: 'ph-fill ph-chart-line-up' },
];

export const DOC_SECTIONS: DocSection[] = [
  { tag: '§4', name: 'Exteriors', accent: 'rgb(var(--terracotta))', kw: 'exterior arc paint fence color palette cedar sage clay structure', body: 'ex' },
  { tag: '§5', name: 'Living', accent: 'rgb(var(--stone))', kw: 'quiet hours hens chickens roosters coop fireworks noise pets', body: 'liv' },
  { tag: '§7', name: 'Leasing', accent: 'rgb(var(--stone))', kw: 'lease rent tenant register short-term term months', body: 'lease' },
  { tag: '§9', name: 'Assessments', accent: 'rgb(var(--stone))', kw: 'dues assessment fee late reserve courtesy payment', body: 'assess' },
];
