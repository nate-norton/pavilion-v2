export interface PhotoPlaceholderProps {
  label: string;
  height?: number;
  tint?: string;
}

/** Striped photo-stand-in block with a mono caption (line 322). */
export function PhotoPlaceholder({ label, height = 88, tint = '#E4DCC8' }: PhotoPlaceholderProps) {
  return (
    <div
      className="rounded-xl flex items-center justify-center"
      style={{
        height,
        background: `repeating-linear-gradient(-45deg,${tint} 0 10px,#EDE6D6 10px 20px)`,
      }}
    >
      <span
        className="font-mono text-[10px] rounded px-2 py-[3px]"
        style={{ color: '#8A8375', background: 'rgba(255,254,250,0.85)' }}
      >
        {label}
      </span>
    </div>
  );
}
