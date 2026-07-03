import { PassSheet } from '../sheets/PassSheet';
import { PaySheet } from '../sheets/PaySheet';
import { SASheet } from '../sheets/SASheet';

/**
 * Central mount point for sheets/screens that float above the tab content
 * (Penny sheet, pay sheet, ARC, onboarding, sign-in, etc). Extended by later
 * tasks (9-15).
 */
export function Overlays() {
  return (
    <>
      <PassSheet />
      <PaySheet />
      <SASheet />
    </>
  );
}
