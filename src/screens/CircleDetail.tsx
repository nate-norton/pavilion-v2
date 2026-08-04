import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

const AVATARS = [
  { initial: 'R', bg: 'rgb(var(--terracotta))', color: 'rgb(var(--white))' },
  { initial: 'T', bg: 'rgb(var(--sky))', color: 'rgb(var(--white))' },
  { initial: 'P', bg: 'rgb(var(--sage))', color: 'rgb(var(--white))' },
  { initial: 'A', bg: 'rgb(var(--navy))', color: 'rgb(var(--cream))' },
  { initial: '+20', bg: 'rgb(var(--sand))', color: 'rgb(var(--barkgray))' },
];

/** Garden Circle detail screen — ported from prototype lines 2043-2086. */
export function CircleDetail() {
  const state = usePavStore();
  const { set } = state;

  if (!state.circleOpen) return null;

  const gardenGoing = 8 + (state.rsvpGarden ? 1 : 0);

  return (
    <div
      data-screen-label="Garden Circle"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--cream))', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ circleOpen: false })} />
      <div
        className="rounded-[18px] mb-3.5 flex items-center justify-center"
        style={{ height: 96, background: 'repeating-linear-gradient(-45deg,rgb(var(--sagewash)) 0 10px,rgb(var(--sagepale)) 10px 20px)' }}
      >
        <span
          className="font-mono text-[10px] rounded-[5px]"
          style={{ color: 'rgb(var(--sagedark))', background: 'rgb(var(--paper) / 0.85)', padding: '3px 8px' }}
        >
          photo — the garden in June
        </span>
      </div>
      <div className="flex items-center justify-between gap-2.5 mb-1">
        <h1 className="m-0 font-serif font-normal text-[26px] text-navy">Garden Circle</h1>
        <span className="rounded-full text-[11px] font-bold" style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', padding: '5px 12px' }}>
          Joined ✓
        </span>
      </div>
      <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
        24 members · run by Rosa M. · neighbor-led since 2019
      </p>
      <div className="flex items-center mb-4">
        {AVATARS.map((a, i) => (
          <div
            key={a.initial}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold"
            style={{
              background: a.bg,
              color: a.color,
              border: '2px solid rgb(var(--cream))',
              fontSize: a.initial.length > 1 ? 10 : 11,
              marginLeft: i > 0 ? -8 : 0,
            }}
          >
            {a.initial}
          </div>
        ))}
      </div>

      <div className="bg-navy rounded-[18px] p-4 text-cream mb-3.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="m-0 mb-[3px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--peach))' }}>
              Next meetup · Sat, 9 AM
            </p>
            <p className="m-0 mb-[3px] font-serif text-base leading-[1.25]">Work party — plot row 3</p>
            <p className="m-0 text-xs font-semibold" style={{ color: 'rgb(var(--cream) / 0.65)' }}>
              {gardenGoing} going · gloves provided
            </p>
          </div>
          {state.rsvpGarden ? (
            <button
              type="button"
              onClick={() => set({ rsvpGarden: false })}
              className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 flex items-center gap-[5px]"
              style={{ background: 'rgb(var(--sage))', padding: '9px 14px' }}
            >
              <PhIcon name="ph-fill ph-check" size={13} />
              Going
            </button>
          ) : (
            <button
              type="button"
              onClick={() => set({ rsvpGarden: true })}
              className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0"
              style={{ background: 'rgb(var(--emberdeep))', padding: '9px 14px' }}
            >
              I&apos;m in
            </button>
          )}
        </div>
      </div>

      {[
        { id: 'tomato', title: 'Tomato starts — free on the bench by plot 4', author: 'Garden Circle', time: '1d', likes: 9 },
        { id: 'compost', title: 'Compost bin how-to (with photos)', author: 'Rosa M.', time: '4d', likes: 12 },
      ].map((post) => {
        const liked = !!state.circlePostLiked[post.id];
        return (
          <div key={post.id} style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: 15, marginBottom: 10 }}>
            <p className="m-0 mb-1.5 text-[12.5px] font-bold text-navy">{post.title}</p>
            <div className="flex items-center justify-between">
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
                {post.author} · {post.time}
              </p>
              <button
                type="button"
                onClick={() => set({ circlePostLiked: { ...state.circlePostLiked, [post.id]: !liked } })}
                className="border-none bg-transparent flex items-center gap-1 cursor-pointer p-0"
              >
                <PhIcon name={liked ? 'ph-fill ph-heart' : 'ph ph-heart'} size={14} color={liked ? 'rgb(var(--ember))' : 'rgb(var(--stonelight))'} className={liked ? 'animate-heartpop' : ''} />
                <span className="text-[11.5px] font-bold" style={{ color: liked ? 'rgb(var(--ember))' : 'rgb(var(--stonelight))' }}>
                  {post.likes + (liked ? 1 : 0)}
                </span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
