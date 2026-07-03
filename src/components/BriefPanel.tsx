import { usePavStore } from '../store/store';
import { PhIcon } from './PhIcon';
import { Toggle } from './Toggle';

const ROLES: { key: string; label: string }[] = [
  { key: 'owner', label: 'Owner' },
  { key: 'tenant', label: 'Tenant' },
  { key: 'manager', label: 'Manager' },
];

const SCENARIOS: { key: 'showSpecialAssessment' | 'showDelinquent' | 'showViolation' | 'showAlert'; label: string }[] = [
  { key: 'showSpecialAssessment', label: 'Special assessment' },
  { key: 'showDelinquent', label: 'Delinquent' },
  { key: 'showViolation', label: 'Violation' },
  { key: 'showAlert', label: 'Alert' },
];

/**
 * Left-column demo-controls panel (reworded from the prototype's design-brief
 * panel, lines 44-66). Hidden on viewports <=500px.
 */
export function BriefPanel() {
  const role = usePavStore((s) => s.role);
  const pickRole = usePavStore((s) => s.pickRole);
  const set = usePavStore((s) => s.set);
  const showSpecialAssessment = usePavStore((s) => s.showSpecialAssessment);
  const showDelinquent = usePavStore((s) => s.showDelinquent);
  const showViolation = usePavStore((s) => s.showViolation);
  const showAlert = usePavStore((s) => s.showAlert);

  const scenarioValues: Record<string, boolean> = {
    showSpecialAssessment,
    showDelinquent,
    showViolation,
    showAlert,
  };

  return (
    <div className="hidden min-[501px]:flex w-[296px] shrink-0 flex-col gap-4">
      <div>
        <p className="m-0 mb-2 text-[11px] font-extrabold tracking-[0.14em] uppercase text-terracotta">
          Pavilion v9 demo
        </p>
        <h1 className="m-0 font-serif font-normal text-[30px] leading-[1.16] text-navy">
          The neighborhood, not the paperwork.
        </h1>
      </div>

      <div className="bg-paper border border-navy/10 rounded-[14px] px-4 py-3.5">
        <p className="m-0 mb-2.5 text-[11px] font-extrabold tracking-[0.12em] uppercase text-stone">View as</p>
        <div className="flex gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => pickRole(r.key)}
              className={
                'flex-1 rounded-[10px] py-2 text-[12px] font-extrabold cursor-pointer font-sans ' +
                (role === r.key ? 'bg-navy text-cream border-0' : 'bg-transparent text-navy border')
              }
              style={role === r.key ? undefined : { borderColor: 'rgba(26,51,82,0.2)', borderWidth: 1.5 }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-paper border border-navy/10 rounded-[14px] px-4 py-3.5">
        <p className="m-0 mb-2.5 text-[11px] font-extrabold tracking-[0.12em] uppercase text-stone">Scenarios</p>
        <div className="flex flex-col gap-2.5">
          {SCENARIOS.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-bold text-bark">{s.label}</span>
              <Toggle on={scenarioValues[s.key]} onToggle={() => set({ [s.key]: !scenarioValues[s.key] })} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => set({ obOpen: true, obStep: 0 })}
        className="border-0 bg-navy text-cream rounded-[13px] px-4 py-3.5 text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2"
      >
        <PhIcon name="ph-fill ph-play" size={14} />
        Preview new-resident onboarding
      </button>

      <button
        type="button"
        onClick={() => set({ loginOpen: true })}
        className="bg-transparent text-navy rounded-[13px] px-4 py-3 text-[13.5px] font-extrabold cursor-pointer font-sans flex items-center justify-center gap-2"
        style={{ border: '1.5px solid rgba(26,51,82,0.2)' }}
      >
        <PhIcon name="ph-fill ph-sign-in" size={14} />
        Preview sign-in screen
      </button>
    </div>
  );
}
