import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';

/*
 * Field — a labelled form control.
 *
 * 58 of the app's 79 inputs were named only by their placeholder, which
 * disappears on the first keystroke (WCAG 1.3.1 / 3.3.2). This wraps the
 * existing input recipe (mistpale bed, 12% navy hairline, 11px radius)
 * with a visible label, an optional hint, and an error line that the
 * control references, so nothing here depends on the placeholder.
 *
 * The label sits above the control at 12.5px bold, the size the app already
 * uses for secondary copy, so a form reads as a form rather than as a
 * column of grey boxes.
 */
const CONTROL =
  'w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none font-sans min-w-0 min-h-[44px]';
const CONTROL_STYLE = { border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))' } as const;
const CONTROL_ERROR_STYLE = { border: '1px solid rgb(var(--reddeep) / 0.6)', background: 'rgb(var(--mistpale))' } as const;

interface Common {
  label: string;
  /** Visually hide the label (it stays in the accessibility tree). For dense rows where the label is obvious from context. */
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
}

type InputField = Common & { as?: 'input' } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>;
type TextareaField = Common & { as: 'textarea' } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;
type SelectField = Common & { as: 'select'; children: ReactNode } & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'>;

export type FieldProps = InputField | TextareaField | SelectField;

export function Field(props: FieldProps) {
  const id = useId();
  const { label, hideLabel, hint, error, className, ...rest } = props;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;
  const style = error ? CONTROL_ERROR_STYLE : CONTROL_STYLE;

  let control: ReactNode;
  if (rest.as === 'textarea') {
    const { as: _as, ...ta } = rest;
    control = (
      <textarea id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined}
        className={`${CONTROL} resize-none leading-[1.45]`} style={style} {...ta} />
    );
  } else if (rest.as === 'select') {
    const { as: _as, children, ...sel } = rest;
    control = (
      <select id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined}
        className={CONTROL} style={style} {...sel}>
        {children}
      </select>
    );
  } else {
    const { as: _as, ...inp } = rest;
    control = (
      <input id={id} aria-describedby={describedBy} aria-invalid={error ? true : undefined}
        className={CONTROL} style={style} {...inp} />
    );
  }

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={hideLabel ? 'sr-only' : 'block mb-1.5 text-[12.5px] font-bold text-slatedark'}
      >
        {label}
      </label>
      {control}
      {hint && !error && (
        <p id={hintId} className="m-0 mt-1.5 text-[12px] font-semibold text-slate leading-[1.4]">{hint}</p>
      )}
      {error && (
        <p id={errorId} className="m-0 mt-1.5 text-[12px] font-bold leading-[1.4]" style={{ color: 'rgb(var(--reddeep))' }}>
          {error}
        </p>
      )}
    </div>
  );
}
