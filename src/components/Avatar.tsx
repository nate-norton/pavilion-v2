export interface AvatarProps {
  initial: string;
  color: string;
  size?: number;
}

/** Circular initial avatar, e.g. lines 295/315. */
export function Avatar({ initial, color, size = 32 }: AvatarProps) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 font-bold text-cream"
      style={{ width: size, height: size, background: color, fontSize: size * 0.375 }}
    >
      {initial}
    </div>
  );
}
