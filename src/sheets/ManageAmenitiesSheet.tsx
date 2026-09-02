import { useState } from 'react';
import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { Chip } from '../components/Chip';
import { Card } from '../components/Card';
import { Field } from '../components/Field';
import { SectionHeading } from '../components/SectionHeading';
import { confirmDestructive } from '../components/ConfirmSheet';
import { useAmenities, useRepository } from '../data/repo';
import { usePavStore } from '../store/store';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';

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

/** A label for a group of chips, styled like Field's own so the form reads as one column. */
function GroupLabel({ id, children }: { id: string; children: string }) {
  return <p id={id} className="m-0 mb-1.5 text-[12.5px] font-bold text-slatedark">{children}</p>;
}

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
  const [addError, setAddError] = useState<string | null>(null);

  if (!open) return null;
  const onClose = () => set({ manageAmenOpen: false });

  const hoursValid = closeHour > openHour;
  const canAdd = name.trim().length > 0 && hoursValid && !busy;
  const add = async () => {
    if (!canAdd) return;
    setBusy(true);
    setAddError(null);
    try {
      await repo.createAmenity({ name, sub, rules, icon, openHour, closeHour, slotMinutes, maxDaysAhead: daysAhead });
      emitAppSuccess(`${name.trim()} is now bookable.`);
      setName(''); setSub(''); setRules('');
    } catch {
      // The data layer has already toasted the cause; the draft stays put.
      setAddError(`${name.trim()} wasn't added. Your details are still here — try again.`);
    }
    setBusy(false);
  };

  const retire = (id: string, label: string) => confirmDestructive({
    title: `Retire ${label}?`,
    body: 'It comes off the Reserve tab for every neighbor. You can add it back later as a new amenity.',
    confirmLabel: 'Retire amenity',
    onConfirm: () => {
      void repo.retireAmenity(id).then(() => emitAppSuccess(`${label} retired.`)).catch(reportedByDataLayer);
    },
  });

  return (
    <Sheet open onClose={onClose} label="Manage amenities" maxHeight="88%">
      <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] text-navy leading-[1.25]">Manage amenities</h2>
      <p className="m-0 mb-4 text-[13px] font-semibold text-slate">
        What neighbors can book on the Reserve tab.
      </p>

      <SectionHeading
        title="Bookable now"
        meta={amenities.length === 0 ? undefined : `${amenities.length} ${amenities.length === 1 ? 'amenity' : 'amenities'}`}
      />
      {amenities.length === 0 ? (
        <p className="m-0 mb-5 text-[13px] font-semibold text-slate">Nothing to book yet. Add the first one below.</p>
      ) : (
        <Card padding="none" className="mb-5">
          {amenities.map((a, i) => (
            <div
              key={a.id ?? a.name}
              className="flex items-center gap-2.5 px-4 py-2"
              style={i < amenities.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
            >
              <PhIcon name={a.icon} size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
              <div className="flex-1 min-w-0 py-1">
                <p className="m-0 text-[13px] font-bold text-navy">{a.name}</p>
                {a.sub && <p className="m-0 text-[12px] font-semibold text-slate">{a.sub}</p>}
              </div>
              {a.id && (
                <button
                  type="button"
                  onClick={() => retire(a.id!, a.name)}
                  className="border-none bg-transparent min-h-[44px] px-2 text-[12.5px] font-extrabold cursor-pointer font-sans text-slatedark"
                >
                  Retire
                </button>
              )}
            </div>
          ))}
        </Card>
      )}

      <SectionHeading title="Add an amenity" />
      <Field
        label="Name"
        value={name}
        onChange={(e) => { setName(e.target.value); setAddError(null); }}
        placeholder="Clubhouse"
        error={addError}
        className="mb-3"
      />
      <Field
        label="Short description"
        hint="One line under the name on the Reserve tab."
        value={sub}
        onChange={(e) => setSub(e.target.value)}
        placeholder="Up to 40 · events & parties"
        className="mb-3"
      />
      <Field
        as="textarea"
        label="House rules"
        hint="Optional. Neighbors read these before they book."
        value={rules}
        onChange={(e) => setRules(e.target.value)}
        rows={3}
        className="mb-3"
      />
      <GroupLabel id="amen-icon-label">Icon</GroupLabel>
      <div role="group" aria-labelledby="amen-icon-label" className="flex gap-1.5 flex-wrap mb-5">
        {ICON_OPTIONS.map((o) => (
          <Chip key={o.key} label={o.label} active={icon === o.key} onClick={() => setIcon(o.key)} size="md" />
        ))}
      </div>

      {/* Booking configuration */}
      <SectionHeading title="Booking hours" />
      <div className="flex gap-2 mb-3">
        <Field
          as="select"
          label="Opens"
          value={openHour}
          onChange={(e) => setOpenHour(Number(e.target.value))}
          className="flex-1 min-w-0"
        >
          {HOURS.map((h) => <option key={h.v} value={h.v}>{h.label}</option>)}
        </Field>
        <Field
          as="select"
          label="Closes"
          value={closeHour}
          onChange={(e) => setCloseHour(Number(e.target.value))}
          error={hoursValid ? undefined : 'Closing time needs to be after opening time.'}
          className="flex-1 min-w-0"
        >
          {HOURS.map((h) => <option key={h.v} value={h.v}>{h.label}</option>)}
        </Field>
      </div>
      <GroupLabel id="amen-slot-label">Booking length</GroupLabel>
      <div role="group" aria-labelledby="amen-slot-label" className="flex gap-1.5 flex-wrap mb-3">
        {([['30 min', 30], ['1 hour', 60], ['2 hours', 120]] as const).map(([label, v]) => (
          <Chip key={v} label={label} active={slotMinutes === v} onClick={() => setSlotMinutes(v)} size="md" />
        ))}
      </div>
      <GroupLabel id="amen-ahead-label">How far ahead neighbors can book</GroupLabel>
      <div role="group" aria-labelledby="amen-ahead-label" className="flex gap-1.5 flex-wrap mb-5">
        {([['1 week', 7], ['2 weeks', 14], ['30 days', 30]] as const).map(([label, v]) => (
          <Chip key={v} label={label} active={daysAhead === v} onClick={() => setDaysAhead(v)} size="md" />
        ))}
      </div>
      <button
        type="button"
        onClick={() => void add()}
        disabled={!canAdd}
        className="w-full border-none rounded-2xl min-h-[48px] py-3 text-[14.5px] font-extrabold font-sans"
        style={{
          background: canAdd ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
          color: canAdd ? 'rgb(var(--white))' : 'rgb(var(--slatedark))',
          cursor: canAdd ? 'pointer' : 'default',
        }}
      >
        {busy ? 'Adding…' : 'Add amenity'}
      </button>
    </Sheet>
  );
}
