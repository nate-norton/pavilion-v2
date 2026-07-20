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
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          background: gradient ? 'linear-gradient(90deg,rgb(var(--ember)),#F97B4B)' : color,
          transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  );
}
