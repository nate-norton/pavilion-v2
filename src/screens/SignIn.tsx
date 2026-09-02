import { PhIcon } from '../components/PhIcon';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';

/**
 * Full-screen sign-in — ported from prototype lines 2514-2535.
 *
 * The screen used to be one flat sheet of skydeep with mist buttons on it,
 * which left the primary action as the only thing that could not be sky.
 * Now the ground is mist, the community itself is the one saturated
 * surface (a skydeep panel carrying its name), and the primary action is
 * skydeep under white like everywhere else in the app.
 */
export function SignIn() {
  const { loginOpen, set } = usePavStore();

  if (!loginOpen) return null;

  const continueIn = () => set({ loginOpen: false, obOpen: false, tab: 'today' });
  const skip = () => set({ loginOpen: false });

  return (
    <div
      data-screen-label="Sign in"
      className="pav-fixed absolute inset-0 z-[97] bg-mist flex flex-col"
      style={{ padding: 'calc(78px + var(--pav-chrome-top)) 24px calc(30px + var(--pav-safe-bottom))' }}
    >
      <div className="flex-1">
        <div className="bg-ai w-16 h-16 rounded-[20px] flex items-center justify-center mb-6">
          <span className="font-serif text-[36px] text-navy">P</span>
        </div>
        <h1 className="m-0 mb-3 font-serif font-normal text-[36px] leading-[1.1] text-navy">
          The neighborhood, not the paperwork.
        </h1>
        <p className="m-0 mb-7 text-[14.5px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--slatedeep))' }}>
          Pavilion is where Juniper Ridge lives — dues, votes, amenities, and the people next door.
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
                136 homes · Est. 1994
              </p>
            </div>
          </div>
          <p className="m-0 mt-4 pt-3.5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--mist) / 0.95)', borderTop: '1px solid rgb(var(--mist) / 0.18)' }}>
            You were invited by your HOA.
          </p>
        </StackedPanel>
      </div>

      <div className="flex flex-col gap-2.5 pt-6">
        <button
          type="button"
          onClick={continueIn}
          className="min-h-[52px] rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: 'none', background: 'rgb(var(--skydeep))', color: 'rgb(var(--white))', padding: '16px 0' }}
        >
          Continue with email
        </button>
        <button
          type="button"
          onClick={continueIn}
          className="min-h-[52px] rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: '1.5px solid rgb(var(--navy) / 0.2)', background: 'rgb(var(--paper))', color: 'rgb(var(--navy))', padding: '15px 0' }}
        >
          Continue with phone
        </button>
        <button
          type="button"
          onClick={skip}
          className="min-h-[44px] border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans p-2"
          style={{ color: 'rgb(var(--slate))' }}
        >
          Just look around
        </button>
      </div>
    </div>
  );
}
