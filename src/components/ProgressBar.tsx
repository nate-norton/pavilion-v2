export interface ProgressBarProps {
  pct: number;
  color?: string;
  track?: string;
  height?: number;
  gradient?: boolean;
}

/** Rounded animated progress bar; gradient variant uses the ember->orange sweep. */
export function ProgressBar({ pct, color = 'rgb(var(--navy))', track = 'rgb(var(--navy) / 0.1)', height = 10, gradient }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: track }}
    >
      {/*
        Fills the track and scales down, rather than animating `width`.
        Animating width lays out every frame; scaleX composites, so the
        quorum bar on the vote card stays smooth on a mid-range phone.
        `transform-origin: left` keeps it growing from the left edge.
      */}
      <div
        className="h-full w-full rounded-full origin-left"
        style={{
          transform: `scaleX(${clamped / 100})`,
          background: gradient ? 'linear-gradient(90deg,rgb(var(--sunset)),rgb(var(--sunsetbright)))' : color,
          transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  );
}
