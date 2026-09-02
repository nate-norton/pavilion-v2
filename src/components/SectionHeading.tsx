import type { ReactNode } from 'react';

/*
 * SectionHeading — a section title that carries its own weight.
 *
 * Every section on Board Desk, HOA and My Place was introduced by an 11px
 * uppercase slate eyebrow (87 of them across the app) and nothing else, so
 * a section holding a $570 delinquency and a section holding an empty log
 * had identical presence. The display face exists for exactly this job:
 * the title tier is 17px Nunito Black (DESIGN.md), and the count or context
 * that used to be the eyebrow becomes a meta line *after* the title, where
 * it reads as information rather than as a label.
 *
 * `action` is the optional right-hand control: "See all", "Manage", a count
 * pill. Keep it to one.
 */
export interface SectionHeadingProps {
  title: string;
  /** Count or context: "3 open", "Closes Thursday", "Published minutes land in Documents". */
  meta?: ReactNode;
  action?: ReactNode;
  /** 'title' = 17px (default, sections inside a screen). 'subtitle' = 19px (top-level groups). */
  level?: 'title' | 'subtitle';
  className?: string;
}

export function SectionHeading({ title, meta, action, level = 'title', className }: SectionHeadingProps) {
  const size = level === 'subtitle' ? 'text-[19px]' : 'text-[17px]';
  return (
    <div className={['flex items-end justify-between gap-3 mb-2.5', className ?? ''].join(' ').trim()}>
      <div className="min-w-0">
        <h2 className={`m-0 font-serif font-normal ${size} leading-[1.25] text-navy`}>{title}</h2>
        {meta && <p className="m-0 mt-0.5 text-[13px] font-semibold text-slate leading-[1.4]">{meta}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
