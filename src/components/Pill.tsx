export interface PillProps {
  label: string;
  bg: string;
  color: string;
}

/** Small status pill, e.g. "Shoutout" / "Approved" badges. */
export function Pill({ label, bg, color }: PillProps) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-extrabold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}
