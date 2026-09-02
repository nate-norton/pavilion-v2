import { PhIcon } from '../components/PhIcon';
import { Toggle } from '../components/Toggle';
import { Card } from '../components/Card';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';
import { useHouseholdOptions, useOnboardCircles } from '../data/repo';

/*
 * Selected option tiles and chips sit on skydeep — chrome, not navy, since
 * navy is the text colour in this system. Unselected ones are paper with a
 * navy hairline; the 1.5px border is kept on both so nothing shifts on tap.
 */
const OPTION_ON = { border: '1.5px solid rgb(var(--skydeep))', background: 'rgb(var(--skydeep))', color: 'rgb(var(--white))' } as const;
const OPTION_OFF = { border: '1.5px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', color: 'rgb(var(--navy))' } as const;

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
      className="pav-fixed absolute inset-0 z-[95] bg-mist flex flex-col"
      style={{ padding: 'calc(60px + var(--pav-chrome-top)) 24px calc(26px + var(--pav-safe-bottom))' }}
    >
      <div className="flex items-center justify-between mb-7">
        <div className="flex gap-1.5" aria-label={`Step ${step + 1} of 5`} role="img">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="inline-block rounded-full"
              style={{
                width: i === step ? 22 : 7,
                height: 7,
                background: i <= step ? 'rgb(var(--skydeep))' : 'rgb(var(--navy) / 0.15)',
                transition: 'all 0.25s ease',
              }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={close}
          className="min-h-[44px] border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans px-2 -mr-2"
          style={{ color: 'rgb(var(--slate))' }}
        >
          Skip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pav-scroll">
        {step === 0 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-3 font-serif font-normal text-[36px] leading-[1.1] text-navy">
              Welcome home, Alex.
            </h1>
            <p className="m-0 mb-7 text-[14.5px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
              Let's set up your place — it takes about a minute, and you'll never fill out a paper form again.
            </p>
            <StackedPanel tint="skydeep">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgb(var(--mist) / 0.14)' }}
                >
                  <PhIcon name="ph-fill ph-house-line" size={22} color="rgb(var(--peach))" />
                </div>
                <div className="min-w-0">
                  <p className="m-0 font-serif text-[24px] leading-[1.2] text-mist">Juniper Ridge</p>
                  <p className="m-0 mt-0.5 text-[13px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
                    Est. 1994
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-3 mt-4 pt-3.5"
                style={{ borderTop: '1px solid rgb(var(--mist) / 0.18)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[14px] font-bold text-mist">#27 Alder Way</p>
                  <p className="m-0 mt-0.5 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
                    Owner-occupied · deed verified
                  </p>
                </div>
                <PhIcon name="ph-fill ph-check-circle" size={22} color="rgb(var(--peach))" className="flex-shrink-0" />
              </div>
            </StackedPanel>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[24px] leading-[1.2] text-navy">
              Who's in the household?
            </h1>
            <p className="m-0 mb-6 text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
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
                    aria-pressed={selected}
                    className="rounded-2xl cursor-pointer font-sans flex flex-col items-center gap-[7px] active:scale-[0.97] transition-colors"
                    style={{ ...(selected ? OPTION_ON : OPTION_OFF), padding: '16px 12px' }}
                  >
                    <PhIcon name={h.icon} size={23} color={selected ? 'rgb(var(--peach))' : 'rgb(var(--skydeep))'} />
                    <span className="text-[13px] font-extrabold">{h.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[24px] leading-[1.2] text-navy">
              What are you into?
            </h1>
            <p className="m-0 mb-6 text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
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
                    aria-pressed={selected}
                    className="min-h-[44px] rounded-full cursor-pointer font-sans flex items-center gap-[7px] text-[13.5px] font-extrabold active:scale-[0.96] transition-colors"
                    style={{ ...(selected ? OPTION_ON : OPTION_OFF), padding: '11px 16px' }}
                  >
                    <PhIcon name={c.icon} size={16} color={selected ? 'rgb(var(--peach))' : 'rgb(var(--skydeep))'} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeup">
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[24px] leading-[1.2] text-navy">
              Dues on autopilot?
            </h1>
            <p className="m-0 mb-6 text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
              Free ACH, receipt every month, and you'll see exactly where each dollar goes.
            </p>
            <Card elevation="raised" padding="lg">
              <div className="flex items-center justify-between gap-2.5 mb-3.5">
                <div>
                  <p className="m-0 font-serif text-[24px] leading-[1.2] text-navy">
                    $285<span className="text-[14px]" style={{ color: 'rgb(var(--slate))' }}>/mo</span>
                  </p>
                  <p className="m-0 mt-0.5 text-[12.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
                    Runs on the 3rd · cancel anytime
                  </p>
                </div>
                <Toggle on={state.obAutopay} onToggle={() => set({ obAutopay: !state.obAutopay })} size="lg" label="Autopay — charge dues automatically each month" />
              </div>
              <div
                className="flex items-center gap-[9px] pt-3.5"
                style={{ borderTop: '1px solid rgb(var(--navy) / 0.08)' }}
              >
                <PhIcon name="ph-fill ph-bank" size={17} color="rgb(var(--skydeep))" />
                <span className="text-[12.5px] font-bold" style={{ color: 'rgb(var(--slatedark))' }}>
                  Juniper Credit Union ····4821
                </span>
              </div>
            </Card>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fadeup">
            <div className="bg-ai w-[62px] h-[62px] rounded-full flex items-center justify-center mb-4">
              <PhIcon name="ph-fill ph-sparkle" size={28} color="rgb(var(--navy))" />
            </div>
            <h1 className="m-0 mb-2.5 font-serif font-normal text-[24px] leading-[1.2] text-navy">
              Meet your AI assistant.
            </h1>
            <p className="m-0 mb-6 text-[14px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
              It's read the CC&Rs so you don't have to. Every answer cites the actual document — no folklore, no
              guessing.
            </p>
            <Card elevation="raised" padding="none" className="max-w-[88%]" style={{ borderRadius: '18px 18px 18px 6px', padding: '13px 15px' }}>
              <p className="m-0 text-[13.5px] leading-[1.5] font-semibold text-navy">
                Yes — chickens are allowed, up to 4 hens, no roosters. Coops need a quick ARC sign-off.
              </p>
              <span
                className="inline-flex items-center gap-[5px] mt-2.5 rounded-lg"
                style={{
                  background: 'rgb(var(--mist))',
                  border: '1px solid rgb(var(--navy) / 0.1)',
                  padding: '5px 9px',
                }}
              >
                <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--accent))" />
                <span className="text-[12px] font-bold" style={{ color: 'rgb(var(--slatedark))' }}>
                  CC&Rs §5.7 · Animals
                </span>
              </span>
            </Card>
          </div>
        )}
      </div>

      <div className="flex gap-2.5 items-center pt-5">
        {canBack && (
          <button
            type="button"
            onClick={back}
            className="min-h-[52px] rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans flex-shrink-0 active:scale-[0.97]"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.2)', background: 'rgb(var(--paper))', color: 'rgb(var(--navy))', padding: '15px 18px' }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          className="flex-1 min-h-[52px] rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: 'none', background: 'rgb(var(--skydeep))', color: 'rgb(var(--white))', padding: '16px 0' }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
