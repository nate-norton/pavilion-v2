import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

/** Full-screen sign-in — ported from prototype lines 2514-2535. */
export function SignIn() {
  const { loginOpen, set } = usePavStore();

  if (!loginOpen) return null;

  const continueIn = () => set({ loginOpen: false, obOpen: false, tab: 'today' });
  const skip = () => set({ loginOpen: false });

  return (
    <div
      data-screen-label="Sign in"
      className="absolute inset-0 z-[97] bg-skydeep flex flex-col"
      style={{ padding: '78px 26px 30px' }}
    >
      <div className="flex-1">
        <div
          className="bg-ai w-16 h-16 rounded-[20px] flex items-center justify-center mb-[22px]"
        >
          <span className="font-serif text-[36px] text-navy">P</span>
        </div>
        <h1 className="m-0 mb-3 font-serif font-normal text-[36px] leading-[1.15] text-mist">
          The neighborhood, not the paperwork.
        </h1>
        <p className="m-0 mb-[22px] text-[14.5px] leading-[1.55] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
          Pavilion is where Juniper Ridge lives — dues, votes, amenities, and the people next door.
        </p>
        <div
          className="rounded-2xl flex items-center gap-3"
          style={{ background: 'rgb(var(--mist) / 0.08)', border: '1px solid rgb(var(--mist) / 0.15)', padding: '14px 16px' }}
        >
          <PhIcon name="ph-fill ph-house-line" size={20} color="rgb(var(--peach))" className="flex-shrink-0" />
          <div>
            <p className="m-0 mb-px text-[13.5px] font-bold text-mist">Juniper Ridge</p>
            <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>
              136 homes · Est. 1994 · you were invited by your HOA
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={continueIn}
          className="rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: 'none', background: 'rgb(var(--mist))', color: 'rgb(var(--navy))', padding: '16px 0' }}
        >
          Continue with email
        </button>
        <button
          type="button"
          onClick={continueIn}
          className="rounded-2xl text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
          style={{ border: '1.5px solid rgb(var(--mist) / 0.3)', background: 'none', color: 'rgb(var(--mist))', padding: '15px 0' }}
        >
          Continue with phone
        </button>
        <button
          type="button"
          onClick={skip}
          className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer font-sans p-2"
          style={{ color: 'rgb(var(--mist) / 0.9)' }}
        >
          Just look around
        </button>
      </div>
    </div>
  );
}
