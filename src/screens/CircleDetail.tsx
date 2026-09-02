import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';

const AVATARS = [
  { initial: 'R', color: 'rgb(var(--accent))' },
  { initial: 'T', color: 'rgb(var(--sky))' },
  { initial: 'P', color: 'rgb(var(--sage))' },
  { initial: 'A', color: 'rgb(var(--skydeep))' },
  { initial: '+20', color: 'rgb(var(--skyborder))' },
];

const POSTS = [
  { id: 'tomato', title: 'Tomato starts — free on the bench by plot 4', author: 'Garden Circle', time: '1d', likes: 9 },
  { id: 'compost', title: 'Compost bin how-to (with photos)', author: 'Rosa M.', time: '4d', likes: 12 },
];

/** Garden Circle detail screen — ported from prototype lines 2043-2086. Demo-only: nothing sets `circleOpen` in live. */
export function CircleDetail() {
  const circleOpen = usePavStore((s) => s.circleOpen);
  const rsvpGarden = usePavStore((s) => s.rsvpGarden);
  const circlePostLiked = usePavStore((s) => s.circlePostLiked);
  const set = usePavStore((s) => s.set);

  if (!circleOpen) return null;

  const gardenGoing = 8 + (rsvpGarden ? 1 : 0);

  return (
    <div
      data-screen-label="Garden Circle"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ circleOpen: false })} />
      <StackedPanel tint="sage" flush className="mb-3.5">
        <div
          className="flex items-center justify-center"
          style={{ height: 96, background: 'repeating-linear-gradient(-45deg,rgb(var(--sagepale)) 0 10px,rgb(var(--mint)) 10px 20px)' }}
          aria-hidden="true"
        >
          <span className="text-[12px] font-bold rounded-[5px] text-sagedark" style={{ background: 'rgb(var(--paper) / 0.85)', padding: '3px 8px' }}>
            photo — the garden in June
          </span>
        </div>
        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between gap-2.5 mb-1">
            <h1 className="m-0 font-serif font-normal text-[24px] text-navy">Garden Circle</h1>
            <Pill label="Joined ✓" tone="success" size="md" />
          </div>
          <p className="m-0 mb-3 text-[12.5px] font-semibold text-sagedark">
            24 members · run by Rosa M. · neighbor-led since 2019
          </p>
          <div className="flex items-center" aria-label="24 members">
            {AVATARS.map((a, i) => (
              <div key={a.initial} className="rounded-full" style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid rgb(var(--sagepale))' }}>
                <Avatar initial={a.initial} color={a.color} size={30} />
              </div>
            ))}
          </div>
        </div>
      </StackedPanel>

      <StackedPanel tint="skydeep" className="mb-3.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
              Next meetup · Sat, 9 AM
            </p>
            <p className="m-0 mb-1 font-serif text-[19px] leading-[1.25] text-mist">Work party — plot row 3</p>
            <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              {gardenGoing} going · gloves provided
            </p>
          </div>
          <button
            type="button"
            aria-pressed={rsvpGarden}
            onClick={() => set({ rsvpGarden: !rsvpGarden })}
            className="border-none rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 flex items-center gap-[5px] min-h-[44px] px-4"
            style={{ background: 'rgb(var(--peach))', color: 'rgb(var(--navy))' }}
          >
            {rsvpGarden && <PhIcon name="ph-fill ph-check" size={13} color="rgb(var(--navy))" />}
            {rsvpGarden ? 'Going' : "I'm in"}
          </button>
        </div>
      </StackedPanel>

      <div className="flex flex-col gap-2.5">
        {POSTS.map((post) => {
          const liked = !!circlePostLiked[post.id];
          return (
            <Card key={post.id} padding="none" className="px-4 py-3.5">
              <p className="m-0 mb-1.5 text-[13.5px] font-bold text-navy leading-[1.35]">{post.title}</p>
              <div className="flex items-center justify-between">
                <p className="m-0 text-[12.5px] font-semibold text-slate">
                  {post.author} · {post.time}
                </p>
                <button
                  type="button"
                  aria-pressed={liked}
                  aria-label={`${liked ? 'Unlike' : 'Like'} · ${post.likes + (liked ? 1 : 0)}`}
                  onClick={() => set({ circlePostLiked: { ...circlePostLiked, [post.id]: !liked } })}
                  className="border-none bg-transparent flex items-center gap-1 cursor-pointer min-h-[44px] -my-2.5 px-1"
                >
                  <PhIcon name={liked ? 'ph-fill ph-heart' : 'ph ph-heart'} size={16} color={liked ? 'rgb(var(--accent))' : 'rgb(var(--slate))'} className={liked ? 'animate-heartpop' : ''} />
                  <span className="text-[12.5px] font-bold" style={{ color: liked ? 'rgb(var(--accent))' : 'rgb(var(--slate))' }}>
                    {post.likes + (liked ? 1 : 0)}
                  </span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
