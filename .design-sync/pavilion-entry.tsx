// Design-system barrel entry for /design-sync (claude.ai/design).
// Pavilion v2 is an application, not a published component library, so there
// is no dist library entry. This barrel re-exports only the public primitives
// so the compiled bundle (window.PavilionDS) contains the design system —
// not the whole app (screens, store, Supabase client). esbuild bundles this
// directly; react/react-dom are externalized to window.React.
export { Avatar } from '../src/components/Avatar';
export { BackButton } from '../src/components/BackButton';
export { Chip } from '../src/components/Chip';
export { Pill } from '../src/components/Pill';
export { ProgressBar } from '../src/components/ProgressBar';
export { SegmentedControl } from '../src/components/SegmentedControl';
export { StatusTimeline } from '../src/components/StatusTimeline';
export { Toggle } from '../src/components/Toggle';
export { TypingDots } from '../src/components/TypingDots';
export { PhotoPlaceholder } from '../src/components/PhotoPlaceholder';
export { PhIcon } from '../src/components/PhIcon';
// Not carded, but exported so previews/designs can rebrand a subtree live.
export { ThemeProvider } from '../src/theme/ThemeProvider';
