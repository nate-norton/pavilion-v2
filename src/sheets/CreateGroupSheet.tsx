import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';

const ICON_OPTIONS = [
  { icon: 'ph-fill ph-users-three', label: 'General' },
  { icon: 'ph-fill ph-football', label: 'Sports' },
  { icon: 'ph-fill ph-cooking-pot', label: 'Food' },
  { icon: 'ph-fill ph-paw-print', label: 'Pets' },
  { icon: 'ph-fill ph-book-open-text', label: 'Book' },
  { icon: 'ph-fill ph-wrench', label: 'DIY' },
  { icon: 'ph-fill ph-music-notes', label: 'Music' },
  { icon: 'ph-fill ph-plant', label: 'Garden' },
];

const COLOR_OPTIONS = ['rgb(var(--navy))', 'rgb(var(--terracotta))', 'rgb(var(--sage))', 'rgb(var(--gold))', 'rgb(var(--sky))', 'rgb(var(--ember))', 'rgb(var(--sagelight))', 'rgb(var(--violet))'];

export function CreateGroupSheet() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();

  const close = () => set({ createGroupOpen: false, createGroupName: '', createGroupDesc: '', createGroupIcon: 'ph-fill ph-users-three', createGroupColor: 'rgb(var(--navy))' });
  const canCreate = state.createGroupName.trim().length > 0;

  const createGroup = async () => {
    if (!canCreate) return;
    const key = await repo.createGroup({
      name: state.createGroupName.trim(),
      description: state.createGroupDesc.trim(),
      icon: state.createGroupIcon,
      color: state.createGroupColor,
    });
    set({ createGroupOpen: false, createGroupName: '', createGroupDesc: '', createGroupIcon: 'ph-fill ph-users-three', createGroupColor: 'rgb(var(--navy))', activeGroup: key });
  };

  return (
    <Sheet open={state.createGroupOpen} onClose={close} maxHeight="85%">
      <div style={{ padding: '22px 22px 32px' }}>
        <h2 className="m-0 mb-1 font-serif font-normal text-[22px] text-navy">Create a group</h2>
        <p className="m-0 mb-5 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
          Neighbors can discover and join your group.
        </p>

        <label className="block text-[11px] font-bold uppercase text-stone mb-1.5" style={{ letterSpacing: '0.12em' }}>
          Group name
        </label>
        <input
          value={state.createGroupName}
          onChange={(e) => set({ createGroupName: e.target.value })}
          placeholder="e.g. Poker Night, Running Club…"
          className="w-full rounded-xl text-[13.5px] font-semibold text-navy outline-none font-sans mb-4 box-border"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', padding: '12px 14px' }}
        />

        <label className="block text-[11px] font-bold uppercase text-stone mb-1.5" style={{ letterSpacing: '0.12em' }}>
          Description
        </label>
        <textarea
          value={state.createGroupDesc}
          onChange={(e) => set({ createGroupDesc: e.target.value })}
          placeholder="What's this group about?"
          rows={2}
          className="w-full rounded-xl text-[13.5px] font-semibold text-navy outline-none font-sans mb-4 resize-none box-border"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', padding: '12px 14px' }}
        />

        <label className="block text-[11px] font-bold uppercase text-stone mb-2" style={{ letterSpacing: '0.12em' }}>
          Icon
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {ICON_OPTIONS.map((opt) => (
            <button
              key={opt.icon}
              type="button"
              onClick={() => set({ createGroupIcon: opt.icon })}
              className="flex items-center gap-1.5 rounded-full border-none px-3 py-2 text-[11.5px] font-bold cursor-pointer"
              style={
                state.createGroupIcon === opt.icon
                  ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }
                  : { background: 'rgb(var(--navy) / 0.06)', color: 'rgb(var(--navy))' }
              }
            >
              <PhIcon name={opt.icon} size={14} color={state.createGroupIcon === opt.icon ? 'rgb(var(--cream))' : 'rgb(var(--navy))'} />
              {opt.label}
            </button>
          ))}
        </div>

        <label className="block text-[11px] font-bold uppercase text-stone mb-2" style={{ letterSpacing: '0.12em' }}>
          Color
        </label>
        <div className="flex gap-2.5 mb-6">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set({ createGroupColor: c })}
              className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center"
              style={{ background: c, outline: state.createGroupColor === c ? '2.5px solid ' + c : 'none', outlineOffset: 2 }}
            >
              {state.createGroupColor === c && <PhIcon name="ph-fill ph-check" size={14} color="rgb(var(--white))" />}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div
          className="rounded-[18px] px-4 py-3.5 mb-5 flex items-center gap-3"
          style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)' }}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: state.createGroupColor + '18' }}
          >
            <PhIcon name={state.createGroupIcon} size={20} color={state.createGroupColor} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-navy">
              {state.createGroupName || 'Your Group'}
            </p>
            <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
              1 member · community group
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={createGroup}
          disabled={!canCreate}
          className="w-full border-none rounded-full py-3.5 text-sm font-extrabold cursor-pointer"
          style={{
            background: canCreate ? 'rgb(var(--navy))' : 'rgb(var(--taupepale))',
            color: canCreate ? 'rgb(var(--cream))' : 'rgb(var(--stonelight))',
          }}
        >
          Create group
        </button>
      </div>
    </Sheet>
  );
}
