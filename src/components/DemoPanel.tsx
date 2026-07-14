import { usePavStore, dataDefaults, overlaysClosed } from '../store/store';
import { Toggle } from './Toggle';

const ROLES = [
  { key: 'owner', label: 'Owner' },
  { key: 'tenant', label: 'Tenant' },
  { key: 'manager', label: 'Manager' },
] as const;

const SCENARIOS = [
  { key: 'showDelinquent' as const, label: 'Past-due dues' },
  { key: 'showSpecialAssessment' as const, label: 'Roof assessment' },
  { key: 'showViolation' as const, label: 'Violation notice' },
  { key: 'showAlert' as const, label: 'Water shutoff alert' },
];

export function DemoPanel() {
  const role = usePavStore((s) => s.role);
  const paid = usePavStore((s) => s.paid);
  const voted = usePavStore((s) => s.voted);
  const boardMode = usePavStore((s) => s.boardMode);
  const set = usePavStore((s) => s.set);
  const pickRole = usePavStore((s) => s.pickRole);

  const showDelinquent = usePavStore((s) => s.showDelinquent);
  const showSpecialAssessment = usePavStore((s) => s.showSpecialAssessment);
  const showViolation = usePavStore((s) => s.showViolation);
  const showAlert = usePavStore((s) => s.showAlert);

  const scenarioValues: Record<string, boolean> = {
    showDelinquent,
    showSpecialAssessment,
    showViolation,
    showAlert,
  };

  const reset = () => {
    localStorage.removeItem('pavilion-demo');
    usePavStore.setState({ ...dataDefaults, epoch: usePavStore.getState().epoch + 1 });
  };

  const replayOnboarding = () => {
    set({ ...overlaysClosed, obOpen: true, obStep: 0 });
  };

  return (
    <div className="hidden lg:flex flex-col gap-5 w-[260px] flex-shrink-0 select-none">
      <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] font-bold text-bark/50 uppercase tracking-wider mb-3">
          Role
        </p>
        <div className="flex gap-1.5">
          {ROLES.map((r) => (
            <button
              key={r.key}
              onClick={() => pickRole(r.key)}
              className="flex-1 rounded-xl py-2 text-[13px] font-bold transition-colors"
              style={{
                background: role === r.key ? '#1A3352' : 'rgba(26,51,82,0.06)',
                color: role === r.key ? '#FFFEFA' : '#1A3352',
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] font-bold text-bark/50 uppercase tracking-wider mb-3">
          Scenarios
        </p>
        <div className="flex flex-col gap-3">
          {SCENARIOS.map((s) => (
            <div key={s.key} className="flex items-center justify-between">
              <span className="text-[13px] text-navy font-semibold">{s.label}</span>
              <Toggle
                on={scenarioValues[s.key]}
                onToggle={() => set({ [s.key]: !scenarioValues[s.key] })}
                size="sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] font-bold text-bark/50 uppercase tracking-wider mb-3">
          State
        </p>
        <div className="flex flex-wrap gap-1.5">
          <StatePill label={paid ? 'Paid' : 'Unpaid'} active={paid} />
          <StatePill label={voted ? `Voted ${voted}` : 'Not voted'} active={!!voted} />
          <StatePill label={boardMode ? 'Board mode' : 'Resident'} active={boardMode} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={replayOnboarding}
          className="w-full rounded-xl py-2.5 text-[13px] font-bold text-navy border-2 border-navy/15 hover:bg-navy/5 transition-colors"
        >
          Replay onboarding
        </button>
        <button
          onClick={reset}
          className="w-full rounded-xl py-2.5 text-[13px] font-bold text-ember border-2 border-ember/20 hover:bg-ember/5 transition-colors"
        >
          Reset demo
        </button>
      </div>
    </div>
  );
}

function StatePill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className="rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        background: active ? 'rgba(42,157,92,0.12)' : 'rgba(26,51,82,0.06)',
        color: active ? '#2A9D5C' : '#8A7F6F',
      }}
    >
      {label}
    </span>
  );
}
