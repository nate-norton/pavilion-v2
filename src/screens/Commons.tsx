import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { PhotoPlaceholder } from '../components/PhotoPlaceholder';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { SegmentedControl } from '../components/SegmentedControl';
import { StackedPanel } from '../components/StackedCard';
import { useDirectory, useFreeItems, useComments, useGroups, useFeed, useMember, useChatSeed, useLoadState, useRepository } from '../data/repo';
import type { FeedPost, ThreadComment } from '../data/repo';
import { usePavStore } from '../store/store';
import { confirmDestructive } from '../components/ConfirmSheet';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';

const SEG_OPTIONS = [
  { key: 'feed', label: 'Feed' },
  { key: 'circles', label: 'Groups' },
  { key: 'dir', label: 'People' },
  { key: 'free', label: 'Free stuff' },
];

/** Group colours are `rgb(var(--x))` tokens; a pale bed of the same hue is the alpha form. */
const tintOf = (color: string) => color.replace(/\)\s*$/, ' / 0.12)');

const META = 'm-0 text-[12.5px] font-semibold text-slate';
const TITLE = 'm-0 text-[13.5px] font-bold text-navy leading-[1.3]';
const ICON_BTN = 'border-none bg-transparent flex items-center gap-1.5 cursor-pointer font-sans min-h-[44px] px-1 -my-2';
const PRIMARY_PILL = 'border-none rounded-full px-3.5 text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 bg-skydeep text-mist min-h-[40px]';

/** The Commons screen — ported from prototype lines 279-521. */
export function Commons() {
  const commonsView = usePavStore((s) => s.commonsView);
  const liked = usePavStore((s) => s.liked);
  const commentsOpen = usePavStore((s) => s.commentsOpen);
  const offered = usePavStore((s) => s.offered);
  const rsvpMovie = usePavStore((s) => s.rsvpMovie);
  const claimed = usePavStore((s) => s.claimed);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const demo = repo.isDemo();
  const DIR = useDirectory();
  const FREE = useFreeItems();
  const comments = useComments();
  const groups = useGroups();
  const feed = useFeed();
  const member = useMember();
  const chatIndex = useChatSeed();
  // Board members can fill the empty directory themselves; residents cannot.
  const isBoard = !demo && member?.role === 'board';
  const feedLoad = useLoadState('feed');
  const unreadTotal = Object.values(chatIndex).reduce((n, e) => n + (e.unread || 0), 0);
  // The demo comment draft is local: a keystroke used to re-render every
  // whole-store subscriber. It reaches the repository only on send.
  const [comment, setComment] = useState('');

  const addComment = () => {
    const t = comment.trim();
    if (!t) return;
    setComment('');
    void repo.addComment(t).catch(() => { setComment(t); reportedByDataLayer(); });
  };

  const likeCount = 14 + (liked ? 1 : 0);
  const commentCount = comments.length;
  const movieGoing = 23 + (rsvpMovie ? 1 : 0);

  // One hero per screen. Live: the board's pinned post, if there is one.
  // Otherwise the composer is the raised surface — the ask on this tab is to share.
  const featured = demo ? null : feed.find((p) => p.pinned) ?? null;
  const rest = featured ? feed.filter((p) => p.id !== featured.id) : feed;

  const composer = (
    <Card
      elevation={featured ? 'flat' : 'raised'}
      padding="none"
      onClick={() => set({ composeOpen: true })}
      className="px-3.5 py-3 mb-2"
    >
      <span className="flex items-center gap-2.5 min-h-[36px]">
        <Avatar initial={member?.initial ?? 'A'} color={member?.color ?? 'rgb(var(--skydeep))'} size={32} />
        <span className="flex-1 text-[13.5px] text-slate font-semibold">Share something…</span>
        <PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--slate))" />
      </span>
    </Card>
  );

  return (
    <div className="pav-tabscroll absolute inset-0 overflow-y-auto pav-scroll" style={{ padding: 'calc(64px + var(--pav-chrome-top)) 18px var(--pav-screen-bottom)' }}>
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">The Commons</h1>
      <p className="m-0 mb-3.5 text-[13.5px] text-slatedeep font-semibold">What neighbors are sharing this week.</p>

      <div className="mb-4">
        <SegmentedControl options={SEG_OPTIONS} value={commonsView} onChange={(key) => set({ commonsView: key })} variant="light" />
      </div>

      {commonsView === 'feed' && (
        <div>
          {featured && <LivePostCard post={featured} isBoard={member?.role === 'board'} featured />}
          {composer}
          <button
            type="button"
            onClick={() => set({ reportOpen: true })}
            className="flex items-center gap-1.5 mb-4 border-none bg-transparent cursor-pointer px-1 min-h-[44px] text-left w-full font-sans"
          >
            <PhIcon name="ph-fill ph-shield-check" size={13} color="rgb(var(--slate))" className="flex-shrink-0" />
            <span className="flex-1 text-[12px] text-slate font-bold leading-[1.4]">
              See a problem? Report it privately to the board — never the feed.
            </span>
            <span className="text-[12px] font-extrabold flex-shrink-0 text-accent">
              Report →
            </span>
          </button>

          <div className="flex flex-col gap-3">
            {feed.length === 0 ? (
              <EmptyState
                icon="ph-fill ph-chats-circle"
                title="Nothing shared yet"
                body="Be the first to share something with your neighbors."
                status={feedLoad}
                actionLabel="Share something"
                onAction={() => set({ composeOpen: true })}
              />
            ) : !demo ? (
              // Live: real feed posts with reactions, comments, photos, pins.
              rest.map((p) => <LivePostCard key={p.id} post={p} isBoard={member?.role === 'board'} />)
            ) : (<>
            <Card padding="none" className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar initial="M" color="rgb(var(--accent))" size={36} />
                <div className="flex-1 min-w-0">
                  <p className={TITLE}>Maria R.</p>
                  <p className={META}>#7 · 2h</p>
                </div>
                <Pill label="Shoutout" tone="info" size="md" />
              </div>
              <p className="m-0 mb-3 text-[13.5px] leading-[1.55] font-semibold text-ink">
                Huge thanks to Tom at #18 for helping clear my gutters before Sunday&apos;s storm. This street is lucky to
                have you.
              </p>
              <PhotoPlaceholder label="photo — clean gutters, proud Tom" height={88} />
              <div className="flex items-center gap-4 mt-3">
                <button
                  type="button"
                  aria-pressed={liked}
                  onClick={() => set({ liked: !liked })}
                  className={ICON_BTN}
                >
                  <PhIcon name={liked ? 'ph-fill ph-heart' : 'ph ph-heart'} size={19} color={liked ? 'rgb(var(--accent))' : 'rgb(var(--slate))'} className={liked ? 'animate-heartpop' : undefined} />
                  <span className="text-[13px] font-bold text-slate">{likeCount}</span>
                  <span className="sr-only">{liked ? 'likes, you liked this' : 'likes'}</span>
                </button>
                <button
                  type="button"
                  aria-expanded={commentsOpen}
                  onClick={() => set({ commentsOpen: !commentsOpen })}
                  className={ICON_BTN}
                >
                  <PhIcon name="ph ph-chat-circle" size={19} color="rgb(var(--slate))" />
                  <span className="text-[13px] font-bold text-slate">{commentCount}</span>
                  <span className="sr-only">comments</span>
                </button>
              </div>
              {commentsOpen && (
                <div className="mt-3 pt-3 animate-fadeup" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
                  <div className="flex flex-col gap-2.5 mb-2.5">
                    {comments.map((cm, i) => (
                      <div key={i} className="flex gap-2.5 items-start">
                        <Avatar initial={cm.who} color={cm.color} size={26} />
                        <div className="bg-mist rounded-xl px-2.5 py-2 flex-1 min-w-0">
                          <p className="m-0 mb-0.5 text-[12px] font-bold text-navy">{cm.who}</p>
                          <p className="m-0 text-[12.5px] leading-[1.45] font-semibold text-ink break-words">
                            {cm.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Field
                      label="Add a comment"
                      hideLabel
                      className="flex-1 min-w-0"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                      placeholder="Add a comment…"
                      maxLength={1000}
                      autoComplete="off"
                      style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))', borderRadius: 22, padding: '10px 14px', fontSize: 12.5 }}
                    />
                    <button
                      type="button"
                      aria-label="Post comment"
                      onClick={addComment}
                      className="w-11 h-11 border-none bg-transparent flex items-center justify-center cursor-pointer flex-shrink-0 -mr-1"
                    >
                      <span className="w-9 h-9 rounded-full bg-skydeep flex items-center justify-center">
                        <PhIcon name="ph-fill ph-paper-plane-right" size={14} color="rgb(var(--mist))" />
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </Card>

            <Card padding="none" className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar initial="D" color="rgb(var(--sky))" size={36} />
                <div className="flex-1 min-w-0">
                  <p className={TITLE}>Dev P.</p>
                  <p className={META}>#23 · 5h</p>
                </div>
                <Pill label="Help & Borrow" tone="neutral" size="md" />
              </div>
              <p className="m-0 mb-3 text-[13.5px] leading-[1.55] font-semibold text-ink">
                Anyone have an 8-ft ladder I could borrow Sunday? Painting the trim — ARC-approved, promise.
              </p>
              {offered ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sagedark" role="status">
                  <PhIcon name="ph-fill ph-check-circle" size={16} />
                  You offered yours — Dev will message you
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => set({ offered: true })}
                  className="rounded-full bg-transparent px-3.5 text-[13px] font-extrabold text-navy cursor-pointer font-sans min-h-[40px]"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                >
                  I&apos;ve got one
                </button>
              )}
            </Card>

            <Card padding="none" className="overflow-hidden">
              <PhotoPlaceholder label="event photo — movie night" height={96} />
              <div className="px-4 py-3.5">
                <div className="flex items-center justify-between gap-2.5 mb-1">
                  <p className="m-0 text-[12.5px] font-bold text-accent">Sat, Jul 5 · Dusk · The Green</p>
                  <Pill label="Social Committee" tone="neutral" size="md" />
                </div>
                <p className="m-0 mb-1 font-serif text-[19px] leading-[1.2] text-navy">Movie on the lawn</p>
                <div className="flex items-center justify-between gap-2.5 mt-2.5">
                  <p className={`${META} font-bold`}>{movieGoing} going · bring a blanket</p>
                  {/* RSVP is the one sunset fill on this screen — the brand sheet's own use for it. */}
                  <button
                    type="button"
                    aria-pressed={rsvpMovie}
                    onClick={() => set({ rsvpMovie: !rsvpMovie })}
                    className={`border-none text-white rounded-full px-3.5 text-[12.5px] font-extrabold cursor-pointer font-sans flex items-center gap-1.5 min-h-[40px] ${rsvpMovie ? 'bg-sagedark' : 'bg-sunsetdeep'}`}
                  >
                    {rsvpMovie && <PhIcon name="ph-fill ph-check" size={13} />}
                    {rsvpMovie ? 'Going' : 'RSVP'}
                  </button>
                </div>
              </div>
            </Card>

            <Card padding="none" className="p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Avatar initial="G" color="rgb(var(--sage))" size={36} />
                <div className="flex-1 min-w-0">
                  <p className={TITLE}>Garden Circle</p>
                  <p className={META}>1d</p>
                </div>
                <button
                  type="button"
                  onClick={() => set({ activeGroup: 'gr-garden' })}
                  className="border-none rounded-full px-3 text-[12px] font-extrabold cursor-pointer font-sans min-h-[36px]"
                  style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' }}
                >
                  Open group →
                </button>
              </div>
              <p className="m-0 text-[13.5px] leading-[1.55] font-semibold text-ink">
                Tomato starts are free on the bench by plot 4 — first come, first served. Saturday work party, 9 AM.
              </p>
            </Card>
            </>)}
          </div>
        </div>
      )}

      {commonsView === 'circles' && (() => {
        const allGroups = Object.values(groups).filter((g) => !g.isGroupChat);
        const joined = allGroups.filter((g) => g.joined);
        const discover = allGroups.filter((g) => !g.joined);
        return (
          <div className="animate-fadeup">
            {allGroups.length === 0 && (
              <EmptyState
                icon="ph-fill ph-users-three"
                title="No groups yet"
                body="Groups are where a shared interest turns into a standing plan — a book club, a running crew, the garden."
                actionLabel="Start a group"
                onAction={() => set({ createGroupOpen: true })}
              />
            )}
            {joined.length > 0 && (
              <section className="mb-5">
                <SectionHeading title="Yours" meta={`${joined.length} group${joined.length === 1 ? '' : 's'} you belong to`} />
                <div className="flex flex-col gap-2.5">
                  {joined.map((g) => {
                    const openPolls = g.polls.filter((p) => !p.myVote).length;
                    const upcomingEvents = g.events.filter((e) => !e.rsvped).length;
                    const lastMsg = g.messages[g.messages.length - 1];
                    return (
                      <Card key={g.key} padding="none" onClick={() => set({ activeGroup: g.key })} className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: tintOf(g.color) }}>
                            <PhIcon name={g.icon} size={20} color={g.color} />
                          </span>
                          <span className="flex-1 min-w-0 block">
                            <span className={`${TITLE} flex items-center gap-1.5`}>
                              {g.name}
                              {g.muted && <PhIcon name="ph-fill ph-bell-slash" size={11} color="rgb(var(--slate))" />}
                              {g.muted && <span className="sr-only">(muted)</span>}
                            </span>
                            <span className={`${META} block overflow-hidden text-ellipsis whitespace-nowrap`}>
                              {lastMsg ? lastMsg.text : `${g.memberCount} ${g.memberCount === 1 ? 'member' : 'members'}`}
                            </span>
                            {(openPolls > 0 || upcomingEvents > 0) && (
                              <span className="flex gap-1.5 mt-1.5">
                                {openPolls > 0 && <Pill label={`${openPolls} poll${openPolls > 1 ? 's' : ''} to answer`} tone="warning" size="md" />}
                                {upcomingEvents > 0 && <Pill label={`${upcomingEvents} event${upcomingEvents > 1 ? 's' : ''}`} tone="info" size="md" />}
                              </span>
                            )}
                          </span>
                          <span className="text-[12.5px] font-extrabold flex-shrink-0 text-accent">Open →</span>
                        </span>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {discover.length > 0 && (
              <section className="mb-5">
                <SectionHeading title="Discover" meta={`${discover.length} more group${discover.length === 1 ? '' : 's'} in your community`} />
                <div className="flex flex-col gap-2.5">
                  {discover.map((g) => {
                    const nextEvent = g.events[0];
                    return (
                      <Card key={g.key} padding="none" className="px-4 py-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => set({ activeGroup: g.key })}
                          className="flex-1 min-w-0 flex items-center gap-3 border-none bg-transparent p-0 text-left cursor-pointer font-sans min-h-[44px]"
                        >
                          <span className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: tintOf(g.color) }}>
                            <PhIcon name={g.icon} size={20} color={g.color} />
                          </span>
                          <span className="flex-1 min-w-0 block">
                            <span className={`${TITLE} block`}>{g.name}</span>
                            <span className={`${META} block`}>
                              {g.memberCount} {g.memberCount === 1 ? 'member' : 'members'}{nextEvent ? ` · ${nextEvent.title}` : ''}
                            </span>
                          </span>
                        </button>
                        <button
                          type="button"
                          aria-label={`Join ${g.name}`}
                          onClick={() => void repo.toggleGroupJoin(g.key).catch(reportedByDataLayer)}
                          className={PRIMARY_PILL}
                        >
                          Join
                        </button>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            <button type="button"
              onClick={() => set({ createGroupOpen: true })}
              className="w-full border-none font-sans bg-transparent text-left rounded-[18px] p-4 flex items-center gap-3 cursor-pointer"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}
            >
              <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-skyborder">
                <PhIcon name="ph-bold ph-plus" size={18} color="rgb(var(--skydeep))" />
              </div>
              <div className="flex-1">
                <p className={TITLE}>Start a group</p>
                <p className={META}>
                  Any interest counts — 5 neighbors makes it official
                </p>
              </div>
            </button>
          </div>
        );
      })()}

      {commonsView === 'dir' && (
        <div className="animate-fadeup">
          <StackedPanel tint="skydeep" className="mb-3.5" flush>
            <button type="button"
              onClick={() => set({ msgsOpen: true })}
              className="w-full border-none font-sans text-left bg-transparent px-4 py-3.5 flex items-center gap-3 cursor-pointer min-h-[44px]"
            >
              <PhIcon name="ph-fill ph-chats-circle" size={22} color="rgb(var(--peach))" className="flex-shrink-0" />
              <span className="flex-1 min-w-0 block">
                <span className="block text-[13.5px] font-bold text-mist">Messages</span>
                <span className="block text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
                  {demo
                    ? '3 unread from your neighbors'
                    : unreadTotal > 0
                      ? `${unreadTotal} unread from your neighbors`
                      : 'Chat privately with your neighbors'}
                </span>
              </span>
              {(demo || unreadTotal > 0) && (
                <Pill label={String(demo ? 3 : unreadTotal)} tone="chrome" size="md" />
              )}
            </button>
          </StackedPanel>
          <div className="flex items-start gap-1.5 mx-1 mb-3.5">
            <PhIcon name="ph-fill ph-lock-simple" size={12} color="rgb(var(--slate))" className="mt-0.5" />
            <p className="m-0 text-[12px] text-slate font-bold leading-[1.4]">
              Only neighbors who opt in appear here. You&apos;re visible as &quot;
              {demo ? 'Alex · #27' : [member?.name, member?.unitLabel].filter(Boolean).join(' · ')}&quot;.
            </p>
          </div>
          {DIR.length === 0 && (
            <EmptyState
              icon="ph-fill ph-users-three"
              title="No neighbors here yet"
              body={
                isBoard
                  ? 'Invite your neighbors and the directory fills itself as they join and opt in.'
                  : 'Neighbors appear as they join and opt in to the directory.'
              }
              actionLabel={isBoard ? 'Send invites' : undefined}
              onAction={isBoard ? () => set({ boardMode: true, boardTab: 'desk' }) : undefined}
            />
          )}
          <div className="flex flex-col gap-2.5">
            {DIR.map((d) => (
              <Card key={d.key} padding="none" className="px-4 py-3.5">
                <button type="button" onClick={() => set({ chatWith: d.key })} className="w-full flex items-center gap-2.5 mb-2.5 cursor-pointer border-none bg-transparent text-left font-sans p-0 min-h-[44px]">
                  <Avatar initial={d.initial} color={d.color} size={40} />
                  <span className="flex-1 min-w-0 block">
                    <span className={`${TITLE} block`}>
                      {d.name} <span className="font-semibold text-slate">· {d.unit}</span>
                    </span>
                    <span className={`${META} block`}>{d.note}</span>
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {d.tags.length > 0 ? (
                    <span className="flex-1 text-[12px] font-bold rounded-lg px-2.5 py-1.5 text-skydeep bg-skypale">
                      {d.tags.join(' · ')}
                    </span>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <button
                    type="button"
                    onClick={() => set({ chatWith: d.key })}
                    className={PRIMARY_PILL}
                  >
                    Send message
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {commonsView === 'free' && (
        <div className="animate-fadeup">
          <div className="flex items-start gap-1.5 mx-1 mb-3.5">
            <PhIcon name="ph-fill ph-recycle" size={12} color="rgb(var(--slate))" className="mt-0.5" />
            <p className="m-0 text-[12px] text-slate font-bold leading-[1.4]">
              Give it away, don&apos;t throw it away. Claimed items get picked up from the porch.
            </p>
          </div>
          {FREE.length === 0 && (
            <EmptyState
              icon="ph-fill ph-gift"
              title="Nothing listed right now"
              body="Have something to give away? Listings are on the way."
            />
          )}
          <div className="grid grid-cols-2 gap-2.5">
            {FREE.map((f) => {
              const isClaimed = !!claimed[f.key];
              return (
                <Card key={f.key} padding="none" className="overflow-hidden">
                  <PhotoPlaceholder label={f.ph} height={74} />
                  <div className="px-3 pt-2.5 pb-3">
                    <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy leading-[1.25]">{f.title}</p>
                    <p className={`${META} mb-2.5`}>
                      {isClaimed ? `Pick up: porch · ${f.giver}` : f.giver}
                    </p>
                    <button
                      type="button"
                      aria-disabled={isClaimed}
                      onClick={() => { if (!isClaimed) set({ claimed: { ...claimed, [f.key]: true } }); }}
                      className="w-full border-none rounded-[10px] text-[12.5px] font-extrabold font-sans min-h-[40px]"
                      style={isClaimed
                        ? { background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', cursor: 'default' }
                        : { background: 'rgb(var(--skydeep))', color: 'rgb(var(--mist))', cursor: 'pointer' }}
                    >
                      {isClaimed ? 'Claimed ✓' : 'Claim'}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One live feed post: pinned badge, photos, hearts, a comment thread that
 * expands in place, delete-own (board can delete/pin any).
 *
 * `featured` is the board's pinned post rendered as the tab's one hero — a
 * sky-washed StackedPanel instead of a flat card. Its meta reads in skydeep,
 * the wash's own dark twin, never grey.
 */
function LivePostCard({ post: p, isBoard, featured = false }: { post: FeedPost; isBoard: boolean; featured?: boolean }) {
  const repo = useRepository();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<ThreadComment[]>([]);
  const [threadFailed, setThreadFailed] = useState(false);
  const [reply, setReply] = useState('');

  const loadThread = () => {
    setThreadFailed(false);
    void repo.listPostComments(p.id).then(setThread).catch(() => setThreadFailed(true));
  };
  const toggleComments = () => { if (!open) loadThread(); setOpen(!open); };
  // A failed reply stays in the box; the data layer has already said why.
  const sendReply = () => {
    if (!reply.trim()) return;
    void repo.addPostComment(p.id, reply).then(() => { setReply(''); loadThread(); }).catch(reportedByDataLayer);
  };
  const deletePost = () => confirmDestructive({
    title: 'Delete this post?',
    body: 'It disappears from the feed for everyone, along with its comments and reactions.',
    confirmLabel: 'Delete post',
    onConfirm: () => {
      void repo.deleteFeedPost(p.id).then(() => emitAppSuccess('Post deleted.')).catch(reportedByDataLayer);
    },
  });

  const metaColor = featured ? 'text-skydeep' : 'text-slate';
  const rule = featured ? '1px solid rgb(var(--skydeep) / 0.18)' : '1px solid rgb(var(--navy) / 0.07)';

  const body = (
    <>
      {p.pinned && (
        <p className={`m-0 mb-2 text-[12.5px] font-bold flex items-center gap-1 ${featured ? 'text-skydeep' : 'text-golddark'}`}>
          <PhIcon name="ph-fill ph-push-pin" size={12} color={featured ? 'rgb(var(--skydeep))' : 'rgb(var(--golddark))'} /> Pinned by the board
        </p>
      )}
      <div className="flex items-center gap-2.5 mb-2.5">
        <Avatar initial={p.authorInitial} color={p.authorColor} size={36} />
        <div className="flex-1 min-w-0">
          <p className={TITLE}>{p.authorName}</p>
          <p className={`m-0 text-[12.5px] font-semibold ${metaColor}`}>
            {p.unitLabel ? `${p.unitLabel} · ` : ''}{p.timeLabel}{p.tagLabel ? ` · ${p.tagLabel}` : ''}
          </p>
        </div>
        {isBoard && (
          <button
            type="button"
            onClick={() => void repo.togglePinPost(p.id).catch(reportedByDataLayer)}
            aria-pressed={p.pinned}
            aria-label={p.pinned ? 'Unpin this post' : 'Pin this post to the top'}
            className="w-11 h-11 -my-2 border-0 bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0"
          >
            <PhIcon name={p.pinned ? 'ph-fill ph-push-pin-slash' : 'ph ph-push-pin'} size={15} color="rgb(var(--slate))" />
          </button>
        )}
        {(p.mine || isBoard) && (
          <button
            type="button"
            onClick={deletePost}
            aria-label="Delete this post"
            className="w-11 h-11 -my-2 -mr-2 border-0 bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0"
          >
            <PhIcon name="ph-fill ph-trash" size={14} color="rgb(var(--slate))" />
          </button>
        )}
      </div>
      {p.body && <p className="m-0 text-[13.5px] leading-[1.55] font-semibold text-ink break-words">{p.body}</p>}
      {(p.photoUrls ?? []).map((u, i, arr) => (
        <img
          key={u}
          src={u}
          alt={arr.length > 1 ? `Photo ${i + 1} of ${arr.length} from ${p.authorName}'s post` : `Photo from ${p.authorName}'s post`}
          loading="lazy"
          decoding="async"
          className="mt-2.5 rounded-[13px] w-full block"
          style={{ maxHeight: 260, objectFit: 'cover' }}
        />
      ))}
      <div className="flex items-center gap-4 mt-3">
        <button
          type="button"
          onClick={() => void repo.togglePostLike(p.id).catch(reportedByDataLayer)}
          aria-pressed={p.likedByMe}
          aria-label={`${p.likedByMe ? 'Unlike' : 'Like'}${p.likes ? ` · ${p.likes}` : ''}`}
          className={ICON_BTN}
        >
          <PhIcon
            name={p.likedByMe ? 'ph-fill ph-heart' : 'ph ph-heart'}
            size={18}
            color={p.likedByMe ? 'rgb(var(--accent))' : 'rgb(var(--slate))'}
            className={p.likedByMe ? 'animate-heartpop' : undefined}
          />
          <span className={`text-[12.5px] font-bold ${metaColor}`}>{p.likes || ''}</span>
        </button>
        <button
          type="button"
          onClick={toggleComments}
          aria-expanded={open}
          aria-label={`Comments${p.commentCount ? ` · ${p.commentCount}` : ''}`}
          className={ICON_BTN}
        >
          <PhIcon name="ph ph-chat-circle" size={18} color="rgb(var(--slate))" />
          <span className={`text-[12.5px] font-bold ${metaColor}`}>{p.commentCount || ''}</span>
        </button>
      </div>
      {open && (
        <div className="mt-2.5 animate-fadeup" style={{ borderTop: rule, paddingTop: 10 }}>
          {threadFailed && (
            <p className="m-0 mb-1.5 text-[12.5px] font-bold" style={{ color: 'rgb(var(--reddeep))' }}>
              Couldn’t load the comments.{' '}
              <button type="button" onClick={loadThread} className="border-none bg-transparent p-0 underline cursor-pointer font-sans text-[12.5px] font-bold" style={{ color: 'rgb(var(--reddeep))' }}>Try again</button>
            </p>
          )}
          {thread.map((c) => (
            <p key={c.id} className="m-0 mb-1 text-[12.5px] font-semibold text-navy break-words">
              <strong>{c.me ? 'You' : c.authorName}:</strong> {c.body}{' '}
              <span className={`text-[12px] ${metaColor}`}>· {c.time}</span>
            </p>
          ))}
          <div className="flex gap-2 mt-1.5 items-center">
            <Field
              label={`Reply to ${p.authorName}`}
              hideLabel
              className="flex-1 min-w-0"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
              placeholder="Add a comment…"
              maxLength={1000}
              autoComplete="off"
              style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))', borderRadius: 22, padding: '10px 14px', fontSize: 12.5 }}
            />
            <button
              type="button"
              aria-label="Post comment"
              aria-disabled={!reply.trim()}
              onClick={sendReply}
              className="w-11 h-11 border-0 bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0 -mr-1"
            >
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: reply.trim() ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))' }}>
                <PhIcon name="ph-fill ph-paper-plane-right" size={13} color={reply.trim() ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))'} />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (featured) {
    return <StackedPanel tint="sky" className="mb-3">{body}</StackedPanel>;
  }
  return <Card padding="none" className="p-4">{body}</Card>;
}
