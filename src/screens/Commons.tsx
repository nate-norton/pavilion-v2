import { type KeyboardEvent } from 'react';
import { Avatar } from '../components/Avatar';
import { PhIcon } from '../components/PhIcon';
import { PhotoPlaceholder } from '../components/PhotoPlaceholder';
import { SegmentedControl } from '../components/SegmentedControl';
import { DIR, FREE } from '../data';
import { usePavStore } from '../store/store';

const SEG_OPTIONS = [
  { key: 'feed', label: 'Feed' },
  { key: 'circles', label: 'Groups' },
  { key: 'dir', label: 'People' },
  { key: 'free', label: 'Free stuff' },
];

/** The Commons screen — ported from prototype lines 279-521. */
export function Commons() {
  const state = usePavStore();
  const { set, addComment } = state;

  const likeCount = 14 + (state.liked ? 1 : 0);
  const heartClass = state.liked ? 'ph-fill ph-heart' : 'ph ph-heart';
  const heartColor = state.liked ? 'rgb(var(--ember))' : 'rgb(var(--stone))';

  const commentCount = state.comments.length;
  const movieGoing = 23 + (state.rsvpMovie ? 1 : 0);

  const onCommentKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') addComment();
  };

  return (
    <div className="absolute inset-0 overflow-y-auto pav-scroll" style={{ padding: '64px 18px 150px' }}>
      <h1 className="m-0 mb-1 font-serif font-normal text-[28px] text-navy">The Commons</h1>
      <p className="m-0 mb-3.5 text-[13.5px] text-taupe font-semibold">What neighbors are sharing this week.</p>

      <div className="mb-4">
        <SegmentedControl options={SEG_OPTIONS} value={state.commonsView} onChange={(key) => set({ commonsView: key })} variant="light" />
      </div>

      {state.commonsView === 'feed' && (
        <div>
          <div
            onClick={() => set({ composeOpen: true })}
            className="bg-paper rounded-2xl px-3.5 py-3 mb-2 flex items-center gap-2.5 cursor-pointer"
            style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
          >
            <Avatar initial="A" color="rgb(var(--navy))" size={32} />
            <span className="flex-1 text-[13.5px] text-stonelight font-semibold">Share something…</span>
            <PhIcon name="ph-fill ph-camera" size={18} color="rgb(var(--stonelight))" />
          </div>
          <button
            onClick={() => set({ reportOpen: true })}
            className="flex items-center gap-1.5 mb-4 border-none bg-transparent cursor-pointer px-1 py-0.5 text-left"
          >
            <PhIcon name="ph-fill ph-shield-check" size={13} color="rgb(var(--stone))" className="flex-shrink-0" />
            <span className="text-[11.5px] text-stone font-bold">
              See a problem? Report it privately to the board — never the feed.
            </span>
            <span className="text-[11.5px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--terracotta))' }}>
              Report →
            </span>
          </button>

          <div className="flex flex-col gap-3">
            {(
              <div
                className="bg-paper rounded-[18px] p-4"
                style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Avatar initial="M" color="rgb(var(--terracotta))" size={36} />
                  <div className="flex-1">
                    <p className="m-0 text-[13.5px] font-bold text-navy">
                      Maria R. <span className="font-semibold text-stonelight">· #7 · 2h</span>
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'rgb(var(--blush))', color: 'rgb(var(--terracotta))' }}>
                    Shoutout
                  </span>
                </div>
                <p className="m-0 mb-3 text-sm leading-[1.55]" style={{ color: 'rgb(var(--ink))' }}>
                  Huge thanks to Tom at #18 for helping clear my gutters before Sunday&apos;s storm. This street is lucky to
                  have you.
                </p>
                <PhotoPlaceholder label="photo — clean gutters, proud Tom" height={88} />
                <div className="flex items-center gap-4 mt-3">
                  <button
                    onClick={() => set({ liked: !state.liked })}
                    className="border-none bg-transparent flex items-center gap-1.5 cursor-pointer p-0"
                  >
                    <PhIcon name={heartClass} size={19} color={heartColor} className={state.liked ? 'animate-heartpop' : undefined} />
                    <span className="text-[13px] font-bold text-stone">{likeCount}</span>
                  </button>
                  <button
                    onClick={() => set({ commentsOpen: !state.commentsOpen })}
                    className="border-none bg-transparent flex items-center gap-1.5 cursor-pointer p-0"
                  >
                    <PhIcon name="ph ph-chat-circle" size={19} color="rgb(var(--stone))" />
                    <span className="text-[13px] font-bold text-stone">{commentCount}</span>
                  </button>
                </div>
                {state.commentsOpen && (
                  <div className="mt-3 pt-3 animate-fadeup" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
                    <div className="flex flex-col gap-2.5 mb-2.5">
                      {state.comments.map((cm, i) => (
                        <div key={i} className="flex gap-2.5 items-start">
                          <Avatar initial={cm.who} color={cm.color} size={26} />
                          <div className="bg-cream rounded-xl px-2.5 py-2 flex-1">
                            <p className="m-0 mb-0.5 text-[11.5px] font-bold text-navy">{cm.who}</p>
                            <p className="m-0 text-[12.5px] leading-[1.45] font-semibold" style={{ color: 'rgb(var(--ink))' }}>
                              {cm.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={state.commentInput}
                        onChange={(e) => set({ commentInput: e.target.value })}
                        onKeyDown={onCommentKey}
                        placeholder="Add a comment…"
                        className="flex-1 rounded-full px-3.5 py-2 text-[12.5px] font-semibold text-navy outline-none bg-parchment"
                        style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
                      />
                      <button
                        onClick={() => addComment()}
                        className="w-9 h-9 border-none rounded-full bg-navy flex items-center justify-center cursor-pointer flex-shrink-0"
                      >
                        <PhIcon name="ph-fill ph-paper-plane-right" size={14} color="rgb(var(--cream))" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {(
              <div
                className="bg-paper rounded-[18px] p-4"
                style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Avatar initial="D" color="rgb(var(--sky))" size={36} />
                  <div className="flex-1">
                    <p className="m-0 text-[13.5px] font-bold text-navy">
                      Dev P. <span className="font-semibold text-stonelight">· #23 · 5h</span>
                    </p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))' }}>
                    Help &amp; Borrow
                  </span>
                </div>
                <p className="m-0 mb-3 text-sm leading-[1.55]" style={{ color: 'rgb(var(--ink))' }}>
                  Anyone have an 8-ft ladder I could borrow Sunday? Painting the trim — ARC-approved, promise.
                </p>
                {state.offered ? (
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-sage">
                    <PhIcon name="ph-fill ph-check-circle" size={16} />
                    You offered yours — Dev will message you
                  </span>
                ) : (
                  <button
                    onClick={() => set({ offered: true })}
                    className="rounded-full bg-transparent px-3.5 py-2 text-[13px] font-extrabold text-navy cursor-pointer"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    I&apos;ve got one
                  </button>
                )}
              </div>
            )}

            {(
              <div
                className="bg-paper rounded-[18px] overflow-hidden"
                style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
              >
                <PhotoPlaceholder label="event photo — movie night" height={96} />
                <div className="px-4 py-3.5">
                  <div className="flex items-center justify-between gap-2.5 mb-1.5">
                    <p className="m-0 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--terracotta))' }}>
                      Sat, Jul 5 · Dusk · The Green
                    </p>
                    <span className="rounded-full px-2.5 py-1 text-[11px] font-bold bg-sand text-bark">
                      Social Committee
                    </span>
                  </div>
                  <p className="m-0 mb-1 font-serif text-[17px] text-navy">Movie on the lawn</p>
                  <div className="flex items-center justify-between gap-2.5 mt-2.5">
                    <p className="m-0 text-[12.5px] text-stone font-bold">{movieGoing} going · bring a blanket</p>
                    {state.rsvpMovie ? (
                      <button
                        onClick={() => set({ rsvpMovie: !state.rsvpMovie })}
                        className="border-none text-white rounded-full px-3.5 py-2 text-[12.5px] font-extrabold cursor-pointer flex items-center gap-1.5 bg-sage"
                      >
                        <PhIcon name="ph-fill ph-check" size={13} />
                        Going
                      </button>
                    ) : (
                      <button
                        onClick={() => set({ rsvpMovie: !state.rsvpMovie })}
                        className="border-none text-cream rounded-full px-3.5 py-2 text-[12.5px] font-extrabold cursor-pointer bg-navy"
                      >
                        RSVP
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {(
              <div
                className="bg-paper rounded-[18px] p-4"
                style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Avatar initial="G" color="rgb(var(--sage))" size={36} />
                  <div className="flex-1">
                    <p className="m-0 text-[13.5px] font-bold text-navy">
                      Garden Circle <span className="font-semibold text-stonelight">· 1d</span>
                    </p>
                  </div>
                  <button
                    onClick={() => set({ activeGroup: 'gr-garden' })}
                    className="border-none rounded-full px-2.5 py-1 text-[11px] font-extrabold cursor-pointer"
                    style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' }}
                  >
                    Group →
                  </button>
                </div>
                <p className="m-0 text-sm leading-[1.55]" style={{ color: 'rgb(var(--ink))' }}>
                  Tomato starts are free on the bench by plot 4 — first come, first served. Saturday work party, 9 AM.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {state.commonsView === 'circles' && (() => {
        const allGroups = Object.values(state.groups).filter((g) => !g.isGroupChat);
        const joined = allGroups.filter((g) => g.joined);
        const discover = allGroups.filter((g) => !g.joined);
        return (
          <div className="animate-fadeup">
            {joined.length > 0 && (
              <>
                <p className="m-0 mx-1 mb-2.5 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
                  Yours
                </p>
                <div className="flex flex-col gap-2.5 mb-5">
                  {joined.map((g) => {
                    const openPolls = g.polls.filter((p) => !p.myVote).length;
                    const upcomingEvents = g.events.filter((e) => !e.rsvped).length;
                    const lastMsg = g.messages[g.messages.length - 1];
                    return (
                      <div
                        key={g.key}
                        onClick={() => set({ activeGroup: g.key })}
                        className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
                      >
                        <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: g.color + '18' }}>
                          <PhIcon name={g.icon} size={20} color={g.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 mb-px text-sm font-bold text-navy flex items-center gap-1.5">
                            {g.name}
                            {g.muted && <PhIcon name="ph-fill ph-bell-slash" size={11} color="rgb(var(--stonelight))" />}
                          </p>
                          <p className="m-0 text-[11.5px] text-stone font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
                            {lastMsg ? lastMsg.text : `${g.memberCount} members`}
                          </p>
                          {(openPolls > 0 || upcomingEvents > 0) && (
                            <div className="flex gap-2 mt-1">
                              {openPolls > 0 && (
                                <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgb(var(--goldpale))', color: 'rgb(var(--goldmid))' }}>
                                  {openPolls} poll{openPolls > 1 ? 's' : ''}
                                </span>
                              )}
                              {upcomingEvents > 0 && (
                                <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))' }}>
                                  {upcomingEvents} event{upcomingEvents > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="text-[12.5px] font-extrabold flex-shrink-0 text-terracotta">
                          Open →
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {discover.length > 0 && (
              <>
                <p className="m-0 mx-1 mb-2.5 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
                  Discover
                </p>
                <div className="flex flex-col gap-2.5 mb-5">
                  {discover.map((g) => {
                    const nextEvent = g.events[0];
                    return (
                      <div
                        key={g.key}
                        onClick={() => set({ activeGroup: g.key })}
                        className="bg-paper rounded-[18px] px-4 py-3.5 flex items-center gap-3 cursor-pointer"
                        style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
                      >
                        <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: g.color + '18' }}>
                          <PhIcon name={g.icon} size={20} color={g.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="m-0 mb-px text-sm font-bold text-navy">{g.name}</p>
                          <p className="m-0 text-[11.5px] text-stone font-semibold">
                            {g.memberCount} members{nextEvent ? ` · ${nextEvent.title}` : ''}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); state.toggleGroupJoin(g.key); }}
                          className="border-none rounded-full px-3.5 py-2 text-xs font-extrabold cursor-pointer flex-shrink-0"
                          style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
                        >
                          Join
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div
              onClick={() => set({ createGroupOpen: true })}
              className="rounded-[18px] p-4 flex items-center gap-3 cursor-pointer"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}
            >
              <div className="w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 bg-sand">
                <PhIcon name="ph-bold ph-plus" size={18} color="rgb(var(--stone))" />
              </div>
              <div className="flex-1">
                <p className="m-0 mb-px text-sm font-bold text-bark">Start a group</p>
                <p className="m-0 text-[11.5px] text-stonelight font-semibold">
                  Any interest counts — 5 neighbors makes it official
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {state.commonsView === 'dir' && (
        <div className="animate-fadeup">
          <div
            onClick={() => set({ msgsOpen: true })}
            className="bg-navy rounded-2xl px-4 py-3.5 flex items-center gap-3 cursor-pointer mb-3.5"
          >
            <PhIcon name="ph-fill ph-chats-circle" size={22} color="rgb(var(--peach))" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 mb-px text-[13.5px] font-bold text-cream">Messages</p>
              <p className="m-0 text-xs font-semibold" style={{ color: 'rgb(var(--cream) / 0.65)' }}>
                3 unread from your neighbors
              </p>
            </div>
            <span className="rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 bg-ember">
              3
            </span>
          </div>
          <div className="flex items-start gap-1.5 mx-1 mb-3.5">
            <PhIcon name="ph-fill ph-lock-simple" size={12} color="rgb(var(--stone))" className="mt-0.5" />
            <p className="m-0 text-[11.5px] text-stone font-bold">
              Only neighbors who opt in appear here. You&apos;re visible as &quot;Alex · #27&quot;.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            {DIR.map((d) => {
              return (
                <div
                  key={d.key}
                  className="bg-paper rounded-[18px] px-4 py-3.5"
                  style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
                >
                  <div onClick={() => set({ chatWith: d.key })} className="flex items-center gap-2.5 mb-2.5 cursor-pointer">
                    <Avatar initial={d.initial} color={d.color} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-sm font-bold text-navy">
                        {d.name} <span className="font-semibold text-stonelight">· {d.unit}</span>
                      </p>
                      <p className="m-0 text-[11.5px] text-stone font-semibold">{d.note}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="flex-1 text-[11.5px] font-bold rounded-lg px-2.5 py-1.5"
                      style={{ color: 'rgb(var(--skydeep))', background: 'rgb(var(--skypale))' }}
                    >
                      {d.tags.join(' · ')}
                    </span>
                    <button
                      onClick={() => set({ chatWith: d.key })}
                      className="border-none rounded-full px-3 py-2 text-xs font-extrabold cursor-pointer flex-shrink-0"
                      style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
                    >
                      Send message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.commonsView === 'free' && (
        <div className="animate-fadeup">
          <div className="flex items-start gap-1.5 mx-1 mb-3.5">
            <PhIcon name="ph-fill ph-recycle" size={12} color="rgb(var(--stone))" className="mt-0.5" />
            <p className="m-0 text-[11.5px] text-stone font-bold">
              Give it away, don&apos;t throw it away. Claimed items get picked up from the porch.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {FREE.map((f) => {
              const claimed = !!state.claimed[f.key];
              return (
                <div
                  key={f.key}
                  className="bg-paper rounded-[18px] overflow-hidden"
                  style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
                >
                  <PhotoPlaceholder label={f.ph} height={74} />
                  <div className="px-3 pt-2.5 pb-3">
                    <p className="m-0 mb-0.5 text-[13px] font-bold text-navy leading-[1.25]">{f.title}</p>
                    <p className="m-0 mb-2.5 text-[11px] text-stone font-semibold">
                      {claimed ? `Pick up: porch · ${f.giver}` : f.giver}
                    </p>
                    <button
                      onClick={() => set({ claimed: { ...state.claimed, [f.key]: true } })}
                      className="w-full border-none rounded-[10px] py-2 text-xs font-extrabold cursor-pointer"
                      style={claimed ? { background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' } : { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
                    >
                      {claimed ? 'Claimed ✓' : 'Claim'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
