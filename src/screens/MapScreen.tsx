import type { CSSProperties } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useMapPins, useMapLayers, useMember } from '../data/repo';

const HOUSE: CSSProperties = {
  width: 26,
  height: 20,
  borderRadius: 5,
  background: 'rgb(var(--paper))',
  border: '1px solid rgb(var(--navy) / 0.1)',
};

/** Community map screen — ported from prototype lines 1771-1832. */
export function MapScreen() {
  const state = usePavStore();
  const PINS = useMapPins();
  const MAP_LAYERS = useMapLayers();
  const member = useMember();
  const { set } = state;

  if (!state.mapOpen) return null;

  const visiblePins = PINS.filter((p) => state.mapLayer === 'all' || p.layer === state.mapLayer);
  const pinCountLabel = visiblePins.length + (visiblePins.length === 1 ? ' pin' : ' pins');
  const selPinObj = PINS.find((p) => p.key === state.selPin) ?? null;

  const doPinAction = () => {
    if (!selPinObj) return;
    if (selPinObj.go.startsWith('chat-')) {
      const chatKey = selPinObj.go.replace('chat-', '');
      set({ chatWith: chatKey, mapOpen: false, selPin: null });
    } else {
      set({ mapOpen: false, selPin: null, tab: selPinObj.go });
    }
  };

  return (
    <div
      data-screen-label="Map"
      className="absolute inset-0 z-[76] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--mist))' }}
    >
      <div className="flex items-center justify-between gap-2.5" style={{ padding: '58px 18px 0' }}>
        <BackButton onClick={() => set({ mapOpen: false, selPin: null })} className="" />
        <span
          className="rounded-full text-[11px] font-bold text-navy"
          style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', padding: '5px 11px' }}
        >
          {pinCountLabel}
        </span>
      </div>
      <div style={{ padding: '10px 18px 0' }}>
        <h1 className="m-0 mb-[3px] font-serif font-normal text-[24px] text-navy">{member?.communityName || 'Juniper Ridge'}</h1>
        <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
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
                  border: on ? '1px solid rgb(var(--navy))' : '1px solid rgb(var(--navy) / 0.12)',
                  background: on ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                  color: on ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))',
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
        style={{ margin: '12px 14px 16px', background: 'rgb(var(--skywash))', border: '1px solid rgb(var(--navy) / 0.08)' }}
      >
        <div
          className="absolute left-0 right-0"
          style={{ top: '30%', height: 22, background: 'rgb(var(--mistlight))', borderTop: '1px solid rgb(var(--navy) / 0.06)', borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}
        />
        <div
          className="absolute left-0 right-0"
          style={{ top: '64%', height: 22, background: 'rgb(var(--mistlight))', borderTop: '1px solid rgb(var(--navy) / 0.06)', borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}
        />
        <div
          className="absolute top-0 bottom-0"
          style={{ left: '44%', width: 22, background: 'rgb(var(--mistlight))', borderLeft: '1px solid rgb(var(--navy) / 0.06)', borderRight: '1px solid rgb(var(--navy) / 0.06)' }}
        />
        <div
          className="absolute flex items-center justify-center"
          style={{ left: '53%', top: '5%', width: '36%', height: '16%', background: 'rgb(var(--sagepale))', borderRadius: 18 }}
        >
          <span className="text-[9.5px] font-bold" style={{ color: 'rgb(var(--sagedark))', letterSpacing: '0.1em' }}>
            THE GREEN
          </span>
        </div>
        <div className="absolute" style={{ left: '7%', top: '39%', width: '24%', height: '11%', background: 'rgb(var(--skytint))', borderRadius: 14 }} />
        <div className="absolute flex gap-1.5" style={{ left: '6%', top: '12%' }}>
          <span style={HOUSE} />
          <span style={HOUSE} />
          <span style={HOUSE} />
          <span style={HOUSE} />
        </div>
        <div className="absolute flex gap-1.5" style={{ left: '50%', top: '44%' }}>
          <span style={HOUSE} />
          <span
            className="flex items-center justify-center text-[10px] font-bold text-mist"
            style={{ width: 26, height: 20, borderRadius: 5, background: 'rgb(var(--skydeep))' }}
          >
            27
          </span>
          <span style={HOUSE} />
        </div>
        <div className="absolute" style={{ left: '50%', top: '44%', transform: 'translate(4px,24px)' }}>
          <span className="text-[10px] font-bold text-navy">You</span>
        </div>
        <div className="absolute flex gap-1.5" style={{ left: '6%', top: '82%' }}>
          <span style={HOUSE} />
          <span
            className="flex items-center justify-center text-[10px] font-bold text-white"
            style={{ width: 26, height: 20, borderRadius: 5, background: 'rgb(var(--gold))' }}
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
            background: 'rgb(var(--paper) / 0.92)',
            border: '1px solid rgb(var(--navy) / 0.08)',
            borderRadius: 12,
            padding: '9px 11px',
            boxShadow: '0 4px 12px -6px rgb(var(--navy) / 0.2)',
          }}
        >
          {[
            ['rgb(var(--sky))', 'Amenities'],
            ['rgb(var(--sunset))', 'Events'],
            ['rgb(var(--gold))', 'Alerts'],
          ].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <span className="w-[9px] h-[9px] rounded-full" style={{ background: c }} />
              <span className="text-[9.5px] font-bold" style={{ color: 'rgb(var(--slatedark))' }}>
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
              border: '3px solid rgb(var(--paper))',
              boxShadow: '0 4px 10px rgb(var(--navy) / 0.25)',
            }}
          >
            <PhIcon name={p.icon} size={15} color="rgb(var(--white))" />
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
              background: 'rgb(var(--paper))',
              border: '1px solid rgb(var(--navy) / 0.1)',
              borderRadius: 16,
              padding: '13px 14px',
              boxShadow: '0 10px 30px -10px rgb(var(--navy) / 0.3)',
            }}
          >
            <div
              className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: selPinObj.color }}
            >
              <PhIcon name={selPinObj.icon} size={18} color="rgb(var(--white))" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.25]">{selPinObj.title}</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                {selPinObj.sub}
              </p>
            </div>
            <button
              type="button"
              onClick={doPinAction}
              className="border-none bg-skydeep text-mist rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
              style={{ padding: '8px 14px' }}
            >
              {selPinObj.action}
            </button>
            <button
              type="button"
              aria-label="Close pin"
              onClick={() => set({ selPin: null })}
              className="border-none w-[26px] h-[26px] rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
              style={{ background: 'rgb(var(--skyborder))' }}
            >
              <PhIcon name="ph-bold ph-x" size={11} color="rgb(var(--slatedark))" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
