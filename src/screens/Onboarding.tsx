import type { CSSProperties } from 'react';
import { PhIcon } from '../components/PhIcon';
import { Toggle } from '../components/Toggle';
import { usePavStore } from '../store/store';
import { useHouseholdOptions, useOnboardCircles } from '../data/repo';

const CARD: CSSProperties = {
  background: 'rgb(var(--paper))',
  border: '1px solid rgb(var(--navy) / 0.08)',
  borderRadius: 18,
  
};

/** Onboarding flow — ported from prototype lines 1451-1549 / JS 3376-3395. */
export function Onboarding() {
  const state = usePavStore();
  const HH = useHouseholdOptions();
  const ONBOARD_CIRCLES = useOnboardCircles();
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
                background: i === step ? 'rgb(var(--navy))' : i < step ? 'rgb(var(--navy))' : 'rgb(var(--navy) / 0.15)',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={close}
          className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans p-1"
          style={{ color: 'rgb(var(--stone))' }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pav-scroll">
        {step === 0 && (
          <div className="animate-fadeup">
            <p
              className="m-0 mb-2.5 text-[11px] font-bold uppercase"
              style={{ letterSpacing: '0.14em', color: 'rgb(var(--terracotta))' }}
            >
              Juniper Ridge · Est. 1994
            </p>
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[34px] leading-[1.15]" style={{ color: 'rgb(var(--navy))' }}>
              Welcome home, Alex.
            </h1>
            <p className="m-0 mb-6 text-[14.5px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
              Let's set up your place — it takes about a minute, and you'll never fill out a paper form again.
            </p>
            <div className="flex items-center gap-[13px] p-4" style={CARD}>
              <div
                className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgb(var(--sand))' }}
              >
                <PhIcon name="ph-fill ph-house-line" size={23} color="rgb(var(--navy))" />
              </div>
              <div className="flex-1">
                <p className="m-0 mb-0.5 text-[15px] font-bold" style={{ color: 'rgb(var(--navy))' }}>
                  #27 Alder Way
                </p>
                <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
                  Owner-occupied · deed verified
                </p>
              </div>
              <PhIcon name="ph-fill ph-check-circle" size={22} color="rgb(var(--sage))" className="flex-shrink-0" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: 'rgb(var(--navy))' }}>
              Who's in the household?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
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
                      border: selected ? '1.5px solid rgb(var(--navy))' : '1.5px solid rgb(var(--navy) / 0.12)',
                      background: selected ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                      padding: '16px 12px',
                    }}
                  >
                    <PhIcon name={h.icon} size={23} color={selected ? 'rgb(var(--peach))' : 'rgb(var(--navy))'} />
                    <span className="text-[13px] font-extrabold" style={{ color: selected ? 'rgb(var(--cream))' : 'rgb(var(--navy))' }}>
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
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: 'rgb(var(--navy))' }}>
              What are you into?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
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
                      border: selected ? '1.5px solid rgb(var(--navy))' : '1.5px solid rgb(var(--navy) / 0.12)',
                      background: selected ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                      color: selected ? 'rgb(var(--cream))' : 'rgb(var(--navy))',
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
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: 'rgb(var(--navy))' }}>
              Dues on autopilot?
            </h1>
            <p className="m-0 mb-[22px] text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
              Free ACH, receipt every month, and you'll see exactly where each dollar goes.
            </p>
            <div className="p-[18px]" style={CARD}>
              <div className="flex items-center justify-between gap-2.5 mb-3.5">
                <div>
                  <p className="m-0 font-serif text-[26px]" style={{ color: 'rgb(var(--navy))' }}>
                    $285<span className="text-[15px]" style={{ color: 'rgb(var(--stone))' }}>/mo</span>
                  </p>
                  <p className="m-0 text-[12px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
                    Runs on the 3rd · cancel anytime
                  </p>
                </div>
                <Toggle on={state.obAutopay} onToggle={() => set({ obAutopay: !state.obAutopay })} size="lg" />
              </div>
              <div
                className="flex items-center gap-[9px] pt-3.5"
                style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}
              >
                <PhIcon name="ph-fill ph-bank" size={17} color="rgb(var(--navy))" />
                <span className="text-[12.5px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
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
              style={{ background: 'linear-gradient(150deg,rgb(var(--emberbright)),rgb(var(--terracotta)))' }}
            >
              <PhIcon name="ph-fill ph-sparkle" size={28} color="rgb(var(--white))" />
            </div>
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[28px] leading-[1.2]" style={{ color: 'rgb(var(--navy))' }}>
              Meet your AI assistant.
            </h1>
            <p className="m-0 mb-5 text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
              It's read the CC&Rs so you don't have to. Every answer cites the actual document — no folklore, no
              guessing.
            </p>
            <div
              className="max-w-[88%] p-[13px_15px]"
              style={{ ...CARD, borderRadius: '18px 18px 18px 6px', padding: '13px 15px' }}
            >
              <p className="m-0 text-[13.5px] leading-[1.5] font-semibold" style={{ color: 'rgb(var(--navy))' }}>
                Yes — chickens are allowed, up to 4 hens, no roosters. Coops need a quick ARC sign-off.
              </p>
              <span
                className="inline-flex items-center gap-[5px] mt-2.5 rounded-lg"
                style={{
                  background: 'rgb(var(--cream))',
                  border: '1px solid rgb(var(--navy) / 0.1)',
                  padding: '5px 9px',
                }}
              >
                <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--terracotta))" />
                <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
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
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', background: 'none', color: 'rgb(var(--navy))', padding: '15px 18px' }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          className="flex-1 rounded-2xl text-[15px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: 'none', background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', padding: '16px 0' }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
