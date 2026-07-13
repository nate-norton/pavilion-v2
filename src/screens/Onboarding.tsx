import type { CSSProperties } from 'react';
import { PhIcon } from '../components/PhIcon';
import { Toggle } from '../components/Toggle';
import { usePavStore } from '../store/store';
import { HH, ONBOARD_CIRCLES } from '../data';

const CARD: CSSProperties = {
  background: '#FFFEFA',
  border: '1px solid rgba(26,51,82,0.08)',
  borderRadius: 18,
  
};

/** Onboarding flow — ported from prototype lines 1451-1549 / JS 3376-3395. */
export function Onboarding() {
  const state = usePavStore();
  const { set } = state;

  if (!state.obOpen) return null;

  const step = state.obStep;
  const canBack = step > 0;
  const nextLabel =
    step === 4 ? 'Take me home' : step === 3 ? (state.obAutopay ? 'Turn on autopay & continue' : 'Skip for now') : 'Continue';

  const next = () => {
    if (step >= 4) set({ obOpen: false, obStep: 0 });
    else set({ obStep: step + 1 });
  };
  const back = () => set({ obStep: Math.max(0, step - 1) });
  const close = () => set({ obOpen: false, obStep: 0 });

  const toggleHh = (key: keyof typeof state.hh) => set({ hh: { ...state.hh, [key]: !state.hh[key] } });
  const toggleCircle = (key: keyof typeof state.circles) =>
    set({ circles: { ...state.circles, [key]: !state.circles[key] } });

  return (
    <div
      data-screen-label="Onboarding"
      className="absolute inset-0 z-[95] bg-cream flex flex-col"
      style={{ padding: '60px 24px 26px' }}
    >
      <div className="flex items-center justify-between mb-[26px]">
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="inline-block rounded-full"
              style={{
                width: i === step ? 22 : 7,
                height: 7,
                background: i === step ? '#1A3352' : i < step ? '#1A3352' : 'rgba(26,51,82,0.15)',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={close}
          className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans p-1"
          style={{ color: '#8A8375' }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pav-scroll">
        {step === 0 && (
          <div className="animate-fadeup">
            <p
              className="m-0 mb-2.5 text-[11px] font-bold uppercase"
              style={{ letterSpacing: '0.14em', color: '#C75A31' }}
            >
              Juniper Ridge · Est. 1994
            </p>
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[34px] leading-[1.15]" style={{ color: '#1A3352' }}>
              Welcome home, Alex.
            </h1>
            <p className="m-0 mb-6 text-[14.5px] leading-[1.55] font-semibold" style={{ color: '#7A7365' }}>
              Let's set up your place — it takes about a minute, and you'll never fill out a paper form again.
            </p>
            <div className="flex items-center gap-[13px] p-4" style={CARD}>
              <div
                className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{ background: '#EDE6D6' }}
              >
                <PhIcon name="ph-fill ph-house-line" size={23} color="#1A3352" />
              </div>
              <div className="flex-1">
                <p className="m-0 mb-0.5 text-[15px] font-bold" style={{ color: '#1A3352' }}>
                  #27 Alder Way
                </p>
                <p className="m-0 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
                  Owner-occupied · deed verified
                </p>
              </div>
              <PhIcon name="ph-fill ph-check-circle" size={22} color="#2A9D5C" className="flex-shrink-0" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: '#1A3352' }}>
              Who's in the household?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: '#7A7365' }}>
              Everyone gets their own login — votes and dues stay with the owner, events and circles are for everyone.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {HH.map((h) => {
                const selected = state.hh[h.key as keyof typeof state.hh];
                return (
                  <button
                    key={h.key}
                    type="button"
                    onClick={() => toggleHh(h.key as keyof typeof state.hh)}
                    className="rounded-2xl cursor-pointer font-sans flex flex-col items-center gap-[7px] active:scale-[0.97]"
                    style={{
                      border: selected ? '1.5px solid #1A3352' : '1.5px solid rgba(26,51,82,0.12)',
                      background: selected ? '#1A3352' : '#FFFEFA',
                      padding: '16px 12px',
                    }}
                  >
                    <PhIcon name={h.icon} size={23} color={selected ? '#E8A788' : '#1A3352'} />
                    <span className="text-[13px] font-extrabold" style={{ color: selected ? '#F5F0E6' : '#1A3352' }}>
                      {h.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: '#1A3352' }}>
              What are you into?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: '#7A7365' }}>
              Pick a circle or two. They're run by neighbors, not the board — and you can leave anytime.
            </p>
            <div className="flex gap-[9px] flex-wrap">
              {ONBOARD_CIRCLES.map((c) => {
                const selected = state.circles[c.key as keyof typeof state.circles];
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => toggleCircle(c.key as keyof typeof state.circles)}
                    className="rounded-full cursor-pointer font-sans flex items-center gap-[7px] text-[13.5px] font-extrabold active:scale-[0.96]"
                    style={{
                      border: selected ? '1.5px solid #1A3352' : '1.5px solid rgba(26,51,82,0.12)',
                      background: selected ? '#1A3352' : '#FFFEFA',
                      color: selected ? '#F5F0E6' : '#1A3352',
                      padding: '11px 16px',
                    }}
                  >
                    <PhIcon name={c.icon} size={16} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: '#1A3352' }}>
              Dues on autopilot?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: '#7A7365' }}>
              Free ACH, receipt every month, and you'll see exactly where each dollar goes.
            </p>
            <div className="p-[18px]" style={CARD}>
              <div className="flex items-center justify-between gap-2.5 mb-3.5">
                <div>
                  <p className="m-0 font-serif text-[26px]" style={{ color: '#1A3352' }}>
                    $285<span className="text-[15px]" style={{ color: '#8A8375' }}>/mo</span>
                  </p>
                  <p className="m-0 text-[12px] font-bold" style={{ color: '#8A8375' }}>
                    Runs on the 3rd · cancel anytime
                  </p>
                </div>
                <Toggle on={state.obAutopay} onToggle={() => set({ obAutopay: !state.obAutopay })} size="lg" />
              </div>
              <div
                className="flex items-center gap-[9px] pt-3.5"
                style={{ borderTop: '1px solid rgba(26,51,82,0.07)' }}
              >
                <PhIcon name="ph-fill ph-bank" size={17} color="#1A3352" />
                <span className="text-[12.5px] font-bold" style={{ color: '#5B554A' }}>
                  Juniper Credit Union ····4821
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fadeup">
            <div
              className="w-[62px] h-[62px] rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(150deg,#F97B4B,#C75A31)' }}
            >
              <PhIcon name="ph-fill ph-sparkle" size={28} color="#fff" />
            </div>
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: '#1A3352' }}>
              Meet Penny.
            </h1>
            <p className="m-0 mb-5 text-[14px] leading-[1.55] font-semibold" style={{ color: '#7A7365' }}>
              She's read the CC&Rs so you don't have to. Every answer cites the actual document — no folklore, no
              guessing.
            </p>
            <div
              className="max-w-[88%] p-[13px_15px]"
              style={{ ...CARD, borderRadius: '18px 18px 18px 6px', padding: '13px 15px' }}
            >
              <p className="m-0 text-[13.5px] leading-[1.5] font-semibold" style={{ color: '#1A3352' }}>
                Yes — chickens are allowed, up to 4 hens, no roosters. Coops need a quick ARC sign-off.
              </p>
              <span
                className="inline-flex items-center gap-[5px] mt-2.5 rounded-lg"
                style={{
                  background: '#F5F0E6',
                  border: '1px solid rgba(26,51,82,0.1)',
                  padding: '5px 9px',
                }}
              >
                <PhIcon name="ph-fill ph-file-text" size={12} color="#C75A31" />
                <span className="text-[11px] font-bold" style={{ color: '#5B554A' }}>
                  CC&Rs §5.7 · Animals
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 items-center pt-3.5">
        {canBack && (
          <button
            type="button"
            onClick={back}
            className="rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans flex-shrink-0 active:scale-[0.97]"
            style={{ border: '1.5px solid rgba(26,51,82,0.15)', background: 'none', color: '#1A3352', padding: '15px 18px' }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-2xl text-[15px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: 'none', background: '#1A3352', color: '#F5F0E6', padding: '16px 0' }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
