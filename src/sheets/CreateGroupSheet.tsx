import { useState } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
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

const COLOR_OPTIONS = [
  { value: 'rgb(var(--navy))', name: 'Navy' },
  { value: 'rgb(var(--accent))', name: 'Blue' },
  { value: 'rgb(var(--sage))', name: 'Green' },
  { value: 'rgb(var(--gold))', name: 'Gold' },
  { value: 'rgb(var(--sky))', name: 'Sky' },
  { value: 'rgb(var(--sunset))', name: 'Sunset' },
  { value: 'rgb(var(--sagelight))', name: 'Mint' },
  { value: 'rgb(var(--violet))', name: 'Violet' },
];

const DEFAULTS = { createGroupName: '', createGroupDesc: '', createGroupIcon: 'ph-fill ph-users-three', createGroupColor: 'rgb(var(--navy))' } as const;

/** Group colours are `rgb(var(--x))` tokens; a pale bed of the same hue is the alpha form. */
const tintOf = (color: string) => color.replace(/\)\s*$/, ' / 0.12)');

export function CreateGroupSheet() {
  const open = usePavStore((s) => s.createGroupOpen);
  const name = usePavStore((s) => s.createGroupName);
  const desc = usePavStore((s) => s.createGroupDesc);
  const icon = usePavStore((s) => s.createGroupIcon);
  const color = usePavStore((s) => s.createGroupColor);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const [busy, setBusy] = useState(false);

  const close = () => set({ createGroupOpen: false, ...DEFAULTS });
  const canCreate = name.trim().length > 0 && !busy;

  // A failed write keeps the sheet open with the draft intact; the data
  // layer has already told the member what went wrong.
  const createGroup = () => {
    if (!canCreate) return;
    setBusy(true);
    void repo.createGroup({ name: name.trim(), description: desc.trim(), icon, color })
      .then((key) => set({ createGroupOpen: false, ...DEFAULTS, activeGroup: key }))
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  return (
    <Sheet
      label="Create a group"
      open={open} onClose={close} maxHeight="85%">
      <div className="pt-1.5 pb-2">
        <h2 className="m-0 mb-1 font-serif font-normal text-[19px] text-navy">Create a group</h2>
        <p className="m-0 mb-4 text-[12.5px] font-semibold text-slatedeep">
          Neighbors can discover and join your group.
        </p>

        <Field
          label="Group name"
          value={name}
          onChange={(e) => set({ createGroupName: e.target.value })}
          placeholder="e.g. Poker Night, Running Club…"
          maxLength={60}
          autoComplete="off"
          className="mb-3.5"
        />

        <Field
          as="textarea"
          label="Description"
          hint="Optional — one line on what the group is for."
          value={desc}
          onChange={(e) => set({ createGroupDesc: e.target.value })}
          rows={2}
          maxLength={200}
          className="mb-3.5"
        />

        <div role="group" aria-labelledby="group-icon" className="mb-3.5">
          <p id="group-icon" className="m-0 mb-2 text-[12.5px] font-bold text-slatedark">Icon</p>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((opt) => (
              <Chip
                key={opt.icon}
                label={opt.label}
                active={icon === opt.icon}
                onClick={() => set({ createGroupIcon: opt.icon })}
                size="md"
                icon={<PhIcon name={opt.icon} size={14} color={icon === opt.icon ? 'rgb(var(--mist))' : 'rgb(var(--navy))'} />}
              />
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="group-color" className="mb-4">
          <p id="group-color" className="m-0 mb-1 text-[12.5px] font-bold text-slatedark">Color</p>
          <div className="flex flex-wrap -mx-1.5">
            {COLOR_OPTIONS.map((c) => {
              const on = color === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={on}
                  onClick={() => set({ createGroupColor: c.value })}
                  className="w-11 h-11 border-none bg-transparent cursor-pointer flex items-center justify-center"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: c.value, outline: on ? '2.5px solid ' + c.value : 'none', outlineOffset: 2 }}
                  >
                    {on && <PhIcon name="ph-fill ph-check" size={14} color="rgb(var(--white))" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <Card padding="none" className="px-4 py-3.5 mb-5 flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: tintOf(color) }}
          >
            <PhIcon name={icon} size={20} color={color} />
          </div>
          <div className="min-w-0">
            <p className="m-0 text-[13.5px] font-bold text-navy overflow-hidden text-ellipsis whitespace-nowrap">
              {name || 'Your group'}
            </p>
            <p className="m-0 text-[12.5px] font-semibold text-slate">
              1 member · community group
            </p>
          </div>
        </Card>

        <button
          type="button"
          onClick={createGroup}
          disabled={!canCreate}
          className="w-full border-none rounded-full py-3.5 text-sm font-extrabold cursor-pointer font-sans min-h-[44px]"
          style={{
            background: canCreate ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
            color: canCreate ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))',
            cursor: canCreate ? 'pointer' : 'default',
          }}
        >
          {busy ? 'Creating…' : name.trim() ? 'Create group' : 'Name the group to create it'}
        </button>
      </div>
    </Sheet>
  );
}
