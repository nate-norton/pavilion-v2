import { useEffect, useState } from 'react';

/**
 * Page mode — the layout the app uses when it is a web page in a phone
 * browser rather than a drawn phone frame.
 *
 * The query is deliberately not a plain width breakpoint. A handset turned to
 * landscape is up to 932px wide but never 500px tall, and it wants page mode
 * as much as it does in portrait; an iPad in landscape is 744px+ tall and
 * correctly keeps the frame. `src/index.css` carries the identical query for
 * the CSS half of this — the two must stay in step.
 */
export const PAGE_MODE_QUERY = '(max-width: 500px), (pointer: coarse) and (max-height: 500px)';

/** True while the app is laid out as a page. False in jsdom and on desktop. */
export function usePageMode(): boolean {
  const [on, setOn] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(PAGE_MODE_QUERY).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(PAGE_MODE_QUERY);
    const onChange = () => setOn(mq.matches);
    mq.addEventListener('change', onChange);
    onChange();
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return on;
}

/*
 * The software keyboard, published as `--pav-keyboard`.
 *
 * Android Chrome is handled by `interactive-widget=resizes-content` in the
 * viewport meta: the layout viewport itself shrinks, fixed chrome rides up
 * with it, and the measurement below correctly reports ~0.
 *
 * iOS has no equivalent. There the keyboard shrinks only the *visual*
 * viewport, so a `position: fixed` composer or nav dock stays pinned to the
 * bottom of a layout viewport that is now behind the keyboard. Measuring the
 * overlap and exposing it as a token lets the handful of elements that care
 * lift themselves, without any of them knowing how the measurement is made.
 */
const KEYBOARD_MIN = 60;

export function useKeyboardInset(): void {
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : undefined;
    if (!vv) return;

    const update = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      // Below the threshold the difference is toolbar animation, not a
      // keyboard; treating that as an inset would make the dock twitch on
      // every scroll.
      const inset = overlap > KEYBOARD_MIN ? Math.round(overlap) : 0;
      document.documentElement.style.setProperty('--pav-keyboard', `${inset}px`);
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.setProperty('--pav-keyboard', '0px');
    };
  }, []);
}
