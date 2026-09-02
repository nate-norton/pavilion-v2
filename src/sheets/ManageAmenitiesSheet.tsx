import { useState } from 'react';
import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { Chip } from '../components/Chip';
import { useAmenities, useRepository } from '../data/repo';
import { usePavStore } from '../store/store';

const ICON_OPTIONS = [
  { key: 'ph-fill ph-buildings', label: 'Clubhouse' },
  { key: 'ph-fill ph-swimming-pool', label: 'Pool' },
  { key: 'ph-fill ph-tennis-ball', label: 'Court' },
  { key: 'ph-fill ph-car', label: 'Parking' },
  { key: 'ph-fill ph-tree-evergreen', label: 'Outdoors' },
  { key: 'ph-fill ph-barbell', label: 'Gym' },
];

/** Hour choices for open/close selects (6 AM – 11 PM). */
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const v = i + 6;
  const h = v % 12 === 0 ? 12 : v % 12;
  return { v, label: `${h} ${v < 12 ? 'AM' : 'PM'}` };
});

/** Board-only: add or retire the community's bookable amenities (live mode). */
export function ManageAmenitiesSheet() {
  const open = usePavStore((s) => s.manageAmenOpen);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const amenities = useAmenities();
  const [name, setName] = useState('');
  const [sub, setSub] = useState('');
  const [rules, setRules] = useState('');
  const [icon, setIcon] = useState(ICON_OPTIONS[0].key);
  const [openHour, setOpenHour] = useState(8);
  const [closeHour, setCloseHour] = useState(21);
  const [slotMinutes, setSlotMinutes] = useState<number>(60);
  const [daysAhead, setDaysAhead] = useState<number>(7);
  const [busy, setBusy] = useState(false);

  if (!open) return null;
  const onClose = () => set({ manageAmenOpen: false });

  const canAdd = name.trim().length > 0 && !busy;
  const add = async () => {
    if (!canAdd) return;
    setBusy(true);
    try {
      await repo.createAmenity({ name, sub, rules, icon, openHour, closeHour, slotMinutes, maxDaysAhead: daysAhead });
      setName(''); setSub(''); setRules('');
    } catch { /* failure surfaced via the app toast */ }
    setBusy(false);
  };

  return (
    <Sheet open onClose={onClose} maxHeight="88%">
      <p className="m-0 mb-0.5 font-serif text-xl text-navy">Manage amenities</p>
      <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
        What neighbors can book on the Reserve tab.
      </p>

      {amenities.length > 0 && (
        <div className="mb-4">
          {amenities.map((a, i) => (
            <div
              key={a.id ?? a.name}
              className="flex items-center gap-2.5 py-2.5"
              style={i < amenities.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
            >
              <PhIcon name={a.icon} size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">{a.name}</p>
                {a.sub && <p className="m-0 text-[11px] font-semibold text-stone">{a.sub}</p>}
              </div>
              {a.id && (
                <button
                  onClick={() => void repo.retireAmenity(a.id!)}
                  className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 text-stone"
                >
                  Retire
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="m-0 mb-2 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
        Add an amenity
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name — e.g. Clubhouse"
        className="w-full rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans mb-2.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
      />
      <input
        value={sub}
        onChange={(e) => setSub(e.target.value)}
        placeholder="Short line — e.g. Up to 40 · events & parties"
        className="w-full rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans mb-2.5"
        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
      />
      <textarea
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        placeholder="House rules (optional) — shown when booking"
        className="w-full rounded-[13px] px-3.5 py-3 text-[13px] font-semibold text-navy outline-none font-sans resize-none mb-3"
        style={{ minHeight: 60, border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
      />
      <div className="flex gap-1.5 flex-wrap mb-3">
        {ICON_OPTIONS.map((o) => (
          <Chip key={o.key} label={o.label} active={icon === o.key} onClick={() => setIcon(o.key)} size="md" />
        ))}
      </div>

      {/* Booking configuration */}
      <p className="m-0 mb-2 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
        Booking hours & slots
      </p>
      <div className="flex gap-2 mb-2.5">
        <select
          value={openHour}
          onChange={(e) => setOpenHour(Number(e.target.value))}
          className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
        >
          {HOURS.map((h) => <option key={h.v} value={h.v}>Opens {h.label}</option>)}
        </select>
        <select
          value={closeHour}
          onChange={(e) => setCloseHour(Number(e.target.value))}
          className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none"
          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))' }}
        >
          {HOURS.map((h) => <option key={h.v} value={h.v}>Closes {h.label}</option>)}
        </select>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {([['30 min', 30], ['1 hr', 60], ['2 hr', 120]] as const).map(([label, v]) => (
          <Chip key={v} label={`Slots: ${label}`} active={slotMinutes === v} onClick={() => setSlotMinutes(v)} size="md" />
        ))}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {([['1 week', 7], ['2 weeks', 14], ['30 days', 30]] as const).map(([label, v]) => (
          <Chip key={v} label={`Book ahead: ${label}`} active={daysAhead === v} onClick={() => setDaysAhead(v)} size="md" />
        ))}
      </div>
      <button
        onClick={() => void add()}
        className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold font-sans"
        style={{
          background: canAdd ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))',
          color: canAdd ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
          cursor: canAdd ? 'pointer' : 'default',
        }}
      >
        {busy ? 'Adding…' : 'Add amenity'}
      </button>
    </Sheet>
  );
}
