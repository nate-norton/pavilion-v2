import type { DuesStatus } from '../data/repo/Repository';
import type { PillTone } from '../components/pillTones';

/*
 * The one status → tone map for money.
 *
 * My Place's tile said "due" in sky, its payment list said "due" in gold,
 * and PaymentDetailSheet said it in a third pair; past_due and plan were
 * indistinguishable on two of the three. Every surface that shows a dues
 * status — the Today hero, the My Place panel and history, the detail
 * sheet — reads this map, so a status has exactly one colour.
 *
 * Lives outside the screens because `react/only-export-components`
 * forbids sharing a constant from a component file.
 */
export const DUES_TONE: Record<DuesStatus, PillTone> = {
  paid: 'success',
  due: 'warning',
  past_due: 'danger',
  plan: 'info',
};

/**
 * The five dues categories and their one palette. PaySheet's split bar and
 * PaymentDetailSheet's legend each carried their own copy and disagreed on
 * "Reserves" (skydeep vs navy). Demo-only numbers: live has no itemization.
 */
export const DUES_CATEGORIES = [
  { label: 'Landscaping', amount: '$78', pct: 27, color: 'rgb(var(--sage))' },
  { label: 'Reserves', amount: '$71', pct: 25, color: 'rgb(var(--skydeep))' },
  { label: 'Insurance', amount: '$54', pct: 19, color: 'rgb(var(--sunset))' },
  { label: 'Utilities', amount: '$48', pct: 17, color: 'rgb(var(--gold))' },
  { label: 'Management', amount: '$34', pct: 12, color: 'rgb(var(--slatelight))' },
] as const;
