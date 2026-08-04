export interface ToggleProps {
  on: boolean;
  onToggle: () => void;
  size?: 'sm' | 'lg';
  /**
   * Accessible name. Required, not optional: a switch is always rendered
   * beside its label visually, so it is easy to forget that a screen reader
   * hears only "switch, on" with no idea what is on. The autopay switch was
   * exactly this — an unlabelled control authorising a recurring bank debit.
   */
  label: string;
}

/** Track/knob switch (prototype lines 1319-1321). sm = 46x27, lg = 52x30. */
export function Toggle({ on, onToggle, size = 'sm', label }: ToggleProps) {
  const trackW = size === 'lg' ? 52 : 46;
  const trackH = size === 'lg' ? 30 : 27;
  const knob = trackH - 6;
  const travel = trackW - knob - 6;

  return (
    <div
      role="switch"
      aria-checked={on}
      aria-label={label}
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      className="relative rounded-full cursor-pointer flex-shrink-0"
      style={{
        width: trackW,
        height: trackH,
        background: on ? 'rgb(var(--sage))' : 'rgb(var(--navy) / 0.15)',
        transition: 'background 0.2s ease',
      }}
    >
      <span
        className="absolute rounded-full bg-white"
        style={{
          top: 3,
          left: 3,
          width: knob,
          height: knob,
          boxShadow: '0 1px 3px rgb(var(--black) / 0.2)',
          transform: on ? `translateX(${travel}px)` : 'translateX(0)',
          transition: 'transform 0.2s cubic-bezier(0.32,1.2,0.5,1)',
        }}
      />
    </div>
  );
}
