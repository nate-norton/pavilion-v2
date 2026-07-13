import type { CSSProperties } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { PINS, MAP_LAYERS } from '../data';

const HOUSE: CSSProperties = {
  width: 26,
  height: 20,
  borderRadius: 5,
  background: '#FFFEFA',
  border: '1px solid rgba(26,51,82,0.1)',
};

/** Community map screen — ported from prototype lines 1771-1832. */
export function MapScreen() {
  const state = usePavStore();
  const { set } = state;

  if (!state.mapOpen) return null;

  const visiblePins = PINS.filter((p) => state.mapLayer === 'all' || p.layer === state.mapLayer);
  const pinCountLabel = visiblePins.length + (visiblePins.length === 1 ? ' pin' : ' pins');
  const selPinObj = PINS.find((p) => p.key === state.selPin) ?? null;

  const doPinAction = () => {
    if (!selPinObj) return;
    if (selPinObj.go === 'wave') set({ waved: true, mapOpen: false, selPin: null, tab: 'today' });
    else set({ mapOpen: false, selPin: null, tab: selPinObj.go });
  };

  return (
    <div
      data-screen-label="Map"
      className="absolute inset-0 z-[76] flex flex-col animate-scpop"
      style={{ background: '#F5F0E6' }}
    >
      <div className="flex items-center justify-between gap-2.5" style={{ padding: '58px 18px 0' }}>
        <BackButton onClick={() => set({ mapOpen: false, selPin: null })} className="" />
        <span
          className="rounded-full text-[11px] font-bold text-navy"
          style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', padding: '5px 11px' }}
        >
          {pinCountLabel}
        </span>
      </div>
      <div style={{ padding: '10px 18px 0' }}>
        <h1 className="m-0 mb-[3px] font-serif font-normal text-[26px] text-navy">Juniper Ridge</h1>
        <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: '#7A7365' }}>
          Tap a pin to see what&apos;s happening.
        </p>
        <div className="flex gap-[7px]">
          {MAP_LAYERS.map(([key, label, icon]) => {
            const on = state.mapLayer === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => set({ mapLayer: key, selPin: null })}
                className="inline-flex items-center gap-[5px] rounded-full text-[11.5px] font-extrabold cursor-pointer font-sans"
                style={{
                  border: on ? '1px solid #1A3352' : '1px solid rgba(26,51,82,0.12)',
                  background: on ? '#1A3352' : '#FFFEFA',
                  color: on ? '#F5F0E6' : '#5B554A',
                  padding: '7px 12px',
                }}
              >
                <PhIcon name={icon} size={13} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stylized map */}
      <div
        className="flex-1 relative rounded-[22px] overflow-hidden"
        style={{ margin: '12px 14px 16px', background: '#EFE8D6', border: '1px solid rgba(26,51,82,0.08)' }}
      >
        <div
          className="absolute left-0 right-0"
          style={{ top: '30%', height: 22, background: '#F7F3EA', borderTop: '1px solid rgba(26,51,82,0.06)', borderBottom: '1px solid rgba(26,51,82,0.06)' }}
        />
        <div
          className="absolute left-0 right-0"
          style={{ top: '64%', height: 22, background: '#F7F3EA', borderTop: '1px solid rgba(26,51,82,0.06)', borderBottom: '1px solid rgba(26,51,82,0.06)' }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{ left: '44%', width: 22, background: '#F7F3EA', borderLeft: '1px solid rgba(26,51,82,0.06)', borderRight: '1px solid rgba(26,51,82,0.06)' }}
        />
        <div
          className="absolute flex items-center justify-center"
          style={{ left: '53%', top: '5%', width: '36%', height: '16%', background: '#DCE9DD', borderRadius: 18 }}
        >
          <span className="text-[9.5px] font-bold" style={{ color: '#5F8A6F', letterSpacing: '0.1em' }}>
            THE GREEN
          </span>
        </div>
        <div className="absolute" style={{ left: '7%', top: '39%', width: '24%', height: '11%', background: '#D8E6F4', borderRadius: 14 }} />
        <div className="absolute flex gap-1.5" style={{ left: '6%', top: '12%' }}>
          <span style={HOUSE} />
          <span style={HOUSE} />
          <span style={HOUSE} />
          <span style={HOUSE} />
        </div>
        <div className="absolute flex gap-1.5" style={{ left: '50%', top: '44%' }}>
          <span style={HOUSE} />
          <span
            className="flex items-center justify-center text-[9px] font-bold text-cream"
            style={{ width: 26, height: 20, borderRadius: 5, background: '#1A3352' }}
          >
            27
          </span>
          <span style={HOUSE} />
        </div>
        <div className="absolute" style={{ left: '50%', top: '44%', transform: 'translate(4px,24px)' }}>
          <span className="text-[9px] font-bold text-navy">You</span>
        </div>
        <div className="absolute flex gap-1.5" style={{ left: '6%', top: '82%' }}>
          <span style={HOUSE} />
          <span
            className="flex items-center justify-center text-[9px] font-bold text-white"
            style={{ width: 26, height: 20, borderRadius: 5, background: '#D9A441' }}
          >
            42
          </span>
          <span style={HOUSE} />
          <span style={HOUSE} />
        </div>

        {/* Legend */}
        <div
          className="absolute flex flex-col gap-1.5"
          style={{
            top: 10,
            right: 10,
            background: 'rgba(255,254,250,0.92)',
            border: '1px solid rgba(26,51,82,0.08)',
            borderRadius: 12,
            padding: '9px 11px',
            boxShadow: '0 4px 12px -6px rgba(26,51,82,0.2)',
          }}
        >
          {[
            ['#4A90E2', 'Amenities'],
            ['#E06A3E', 'Events'],
            ['#D9A441', 'Alerts'],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              <span className="text-[9.5px] font-bold" style={{ color: '#5B554A' }}>
                {l}
              </span>
            </div>
          ))}
        </div>

        {/* Pins */}
        {visiblePins.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-label={p.title}
            onClick={() => set({ selPin: p.key })}
            className="absolute w-[34px] h-[34px] rounded-full flex items-center justify-center cursor-pointer"
            style={{
              left: p.x,
              top: p.y,
              transform: 'translate(-50%,-50%)',
              background: p.color,
              border: '3px solid #FFFEFA',
              boxShadow: '0 4px 10px rgba(26,51,82,0.25)',
            }}
          >
            <PhIcon name={p.icon} size={15} color="#fff" />
          </button>
        ))}

        {/* Selected-pin card */}
        {selPinObj && (
          <div
            className="absolute flex items-center gap-[11px] animate-fadeup"
            style={{
              left: 12,
              right: 12,
              bottom: 12,
              background: '#FFFEFA',
              border: '1px solid rgba(26,51,82,0.1)',
              borderRadius: 16,
              padding: '13px 14px',
              boxShadow: '0 10px 30px -10px rgba(26,51,82,0.3)',
            }}
          >
            <div
              className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: selPinObj.color }}
            >
              <PhIcon name={selPinObj.icon} size={18} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.25]">{selPinObj.title}</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                {selPinObj.sub}
              </p>
            </div>
            <button
              type="button"
              onClick={doPinAction}
              className="border-none bg-navy text-cream rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
              style={{ padding: '8px 14px' }}
            >
              {selPinObj.action}
            </button>
            <button
              type="button"
              aria-label="Close pin"
              onClick={() => set({ selPin: null })}
              className="border-none w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
              style={{ background: '#EDE6D6' }}
            >
              <PhIcon name="ph-bold ph-x" size={11} color="#5B554A" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
