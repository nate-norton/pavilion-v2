import { useState, useEffect, useRef } from 'react';
import { emitAppSuccess, reportedByDataLayer } from '../lib/errorBus';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { confirmDestructive } from '../components/ConfirmSheet';
import { EmptyState } from '../components/EmptyState';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';
import { useGroups, useRepository } from '../data/repo';

type Tab = 'chat' | 'polls' | 'events' | 'members';

const PRIMARY = 'border-none rounded-full text-[13.5px] font-extrabold cursor-pointer font-sans bg-skydeep text-mist min-h-[44px]';
const OUTLINE = 'rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans bg-transparent text-navy min-h-[44px]';
const OUTLINE_STYLE = { border: '1.5px solid rgb(var(--navy) / 0.15)' } as const;
const DASHED = 'w-full rounded-full mb-3 text-[12.5px] font-extrabold cursor-pointer font-sans bg-transparent text-navy min-h-[44px]';
const DASHED_STYLE = { border: '1.5px dashed rgb(var(--navy) / 0.25)' } as const;

export function GroupDetail() {
  const activeGroup = usePavStore((s) => s.activeGroup);
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const groups = useGroups();
  const { voteGroupPoll, rsvpGroupEvent, toggleGroupJoin, toggleGroupMute } = repo;
  const [tab, setTab] = useState<Tab>('chat');
  // Drafts are local: a keystroke used to re-render every whole-store subscriber.
  const [draft, setDraft] = useState('');
  const [pollDraftOpen, setPollDraftOpen] = useState(false);
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState<string[]>(['', '']);
  const [evDraftOpen, setEvDraftOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evWhen, setEvWhen] = useState('');
  const [evWhere, setEvWhere] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const group = activeGroup ? groups[activeGroup] : null;

  const sendGroupMessage = () => {
    const t = draft.trim();
    if (!t || !activeGroup) return;
    setDraft('');
    void repo.sendGroupMessage(activeGroup, t).catch(() => { setDraft(t); reportedByDataLayer(); });
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && tab === 'chat') el.scrollTop = el.scrollHeight;
  }, [group?.messages, tab]);

  if (!activeGroup || !group) return null;

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'chat', label: 'Chat', icon: 'ph-fill ph-chat-circle' },
    { key: 'polls', label: 'Polls', icon: 'ph-fill ph-chart-bar-horizontal', count: group.polls.filter((p) => !p.myVote).length },
    { key: 'events', label: 'Events', icon: 'ph-fill ph-calendar-dots', count: group.events.length },
    { key: 'members', label: 'Members', icon: 'ph-fill ph-users', count: group.memberCount },
  ];

  const totalVotes = (votes: Record<string, number>) => Object.values(votes).reduce((a, b) => a + b, 0);
  const join = () => void toggleGroupJoin(group.key).catch(reportedByDataLayer);
  const leave = () => confirmDestructive({
    title: `Leave ${group.name}?`,
    body: 'You stop getting its messages, polls and events. You can join again any time.',
    confirmLabel: 'Leave group',
    onConfirm: () => {
      void toggleGroupJoin(group.key).then(() => emitAppSuccess(`You left ${group.name}.`)).catch(reportedByDataLayer);
    },
  });
  const archive = () => confirmDestructive({
    title: `Archive ${group.name}?`,
    body: 'It disappears from the Commons and Messages for everyone. The history is kept, not deleted.',
    confirmLabel: 'Archive group',
    onConfirm: () => {
      void repo.archiveGroup(group.key)
        .then(() => { set({ activeGroup: null }); emitAppSuccess(`${group.name} archived.`); })
        .catch(reportedByDataLayer);
    },
  });
  const pollReady = pollQ.trim().length > 0 && pollOpts.filter((o) => o.trim()).length >= 2;
  const resetPoll = () => { setPollDraftOpen(false); setPollQ(''); setPollOpts(['', '']); };
  const resetEvent = () => { setEvDraftOpen(false); setEvTitle(''); setEvWhen(''); setEvWhere(''); };

  return (
    <div
      data-screen-label="Group Detail"
      className="pav-fixed absolute inset-0 z-[78] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--mist))' }}
    >
      {/* Header: the group is the hero of its own screen — one chrome panel, then the tabs. */}
      <div style={{ padding: 'calc(50px + var(--pav-chrome-top)) 12px 0' }}>
        <StackedPanel tint="skydeep" flush className="mb-3">
          <div className="flex items-center gap-2 pl-1 pr-3 py-3">
            <button
              type="button"
              aria-label="Back"
              onClick={() => set({ activeGroup: null })}
              className="w-11 h-11 border-none bg-transparent cursor-pointer flex items-center justify-center flex-shrink-0 rounded-full"
            >
              <PhIcon name="ph-bold ph-arrow-left" size={18} color="rgb(var(--mist))" />
            </button>
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgb(var(--mist) / 0.16)' }}
            >
              <PhIcon name={group.icon} size={22} color="rgb(var(--peach))" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="m-0 font-serif font-normal text-[19px] leading-[1.2] text-mist overflow-hidden text-ellipsis whitespace-nowrap">{group.name}</h1>
              <p className="m-0 text-[12.5px] font-bold" style={{ color: 'rgb(var(--mist) / 0.85)' }}>
                {group.memberCount} member{group.memberCount === 1 ? '' : 's'}{group.isGroupChat ? ' · group chat' : ' · community group'}
                {group.muted ? ' · muted' : ''}
              </p>
            </div>
            {group.joined && (
              <button
                type="button"
                aria-pressed={group.muted}
                aria-label={group.muted ? 'Unmute notifications' : 'Mute notifications'}
                onClick={() => void toggleGroupMute(group.key).catch(reportedByDataLayer)}
                className="w-11 h-11 border-none bg-transparent flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: group.muted ? 'rgb(var(--peach))' : 'rgb(var(--mist) / 0.16)' }}
                >
                  <PhIcon
                    name={group.muted ? 'ph-fill ph-bell-slash' : 'ph-fill ph-bell'}
                    size={16}
                    color={group.muted ? 'rgb(var(--navy))' : 'rgb(var(--mist))'}
                  />
                </span>
              </button>
            )}
          </div>
          {group.description && !group.joined && (
            <p className="m-0 px-4 pb-3.5 -mt-1 text-[13px] font-semibold leading-[1.45]" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
              {group.description}
            </p>
          )}
        </StackedPanel>

        <div className="px-1.5">
          {/* Pinned message */}
          {group.pins.length > 0 && (
            <Card tint="goldpale" padding="none" className="px-3 py-2.5 mb-3 flex items-start gap-2" style={{ borderColor: 'rgb(var(--gold) / 0.3)' }}>
              <PhIcon name="ph-fill ph-push-pin" size={14} color="rgb(var(--golddark))" className="mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="m-0 text-[12.5px] font-bold text-navy leading-[1.4]">{group.pins[0].text}</p>
                <p className="m-0 text-[12px] font-semibold mt-0.5 text-golddark">
                  Pinned by {group.pins[0].author} · {group.pins[0].time}
                </p>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <div role="tablist" aria-label={`${group.name} sections`} className="flex gap-0" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.08)' }}>
            {tabs.map((t) => {
              const on = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(t.key)}
                  className="flex-1 flex items-center justify-center gap-1.5 border-none bg-transparent cursor-pointer font-sans min-h-[44px] pb-1"
                  style={{ borderBottom: on ? '2px solid rgb(var(--skydeep))' : '2px solid transparent' }}
                >
                  <PhIcon name={t.icon} size={13} color={on ? 'rgb(var(--skydeep))' : 'rgb(var(--slate))'} />
                  <span className={`text-[12.5px] font-bold ${on ? 'text-skydeep' : 'text-slate'}`}>{t.label}</span>
                  {t.count && t.count > 0 ? (
                    <span
                      className="min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[11.5px] font-extrabold px-1"
                      style={{ background: on ? 'rgb(var(--skydeep))' : 'rgb(var(--skywash))', color: on ? 'rgb(var(--mist))' : 'rgb(var(--slatedark))' }}
                    >
                      {t.count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          {!group.joined ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center" style={{ gap: 10 }}>
              <PhIcon name={group.icon} size={40} color={group.color} />
              <p className="m-0 text-[14px] font-bold text-navy">Join {group.name} to read and send messages</p>
              <p className="m-0 text-[12.5px] font-semibold text-slate">Members see the chat, polls and events. Anyone in the community can join.</p>
            </div>
          ) : (
            <>
              <div ref={listRef} className="pav-scroll flex-1 overflow-y-auto flex flex-col gap-2.5" style={{ padding: '16px 18px' }} aria-live="polite">
                {group.messages.length === 0 ? (
                  <EmptyState
                    icon="ph-fill ph-chats-circle"
                    title="No messages yet"
                    body={`Say hello — everyone in ${group.name} sees what you post here.`}
                  />
                ) : (
                  group.messages.map((m, i) => (
                    <div key={i} className="flex flex-col" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          maxWidth: '80%',
                          background: m.me ? 'rgb(var(--skydeep))' : 'rgb(var(--paper))',
                          color: m.me ? 'rgb(var(--mist))' : 'rgb(var(--navy))',
                          border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                          borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                          padding: '10px 13px',
                        }}
                      >
                        <p className="m-0 text-[13.5px] leading-[1.45] font-semibold break-words">{m.text}</p>
                      </div>
                      <span className="text-[12px] font-bold text-slate" style={{ margin: '3px 4px 0' }}>
                        {m.time || ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 items-center bg-paper" style={{ padding: '10px 18px calc(22px + var(--pav-safe-bottom))', borderTop: '1px solid rgb(var(--navy) / 0.08)' }}>
                <Field
                  label={`Message ${group.name}`}
                  hideLabel
                  className="flex-1 min-w-0"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendGroupMessage(); }}
                  placeholder="Message the group…"
                  maxLength={2000}
                  autoComplete="off"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--mistpale))', borderRadius: 22, padding: '10px 16px' }}
                />
                <button
                  type="button"
                  aria-label="Send"
                  onClick={sendGroupMessage}
                  className="w-11 h-11 border-none rounded-full bg-skydeep flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--mist))" />
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* Polls tab */}
      {tab === 'polls' && (
        <div className="pav-scroll flex-1 overflow-y-auto" style={{ padding: '16px 18px' }}>
          {!repo.isDemo() && group.joined && (
            !pollDraftOpen ? (
              <button type="button" onClick={() => setPollDraftOpen(true)} className={DASHED} style={DASHED_STYLE}>
                + Start a poll
              </button>
            ) : (
              <Card padding="none" className="p-3.5 mb-3 animate-fadeup">
                <h2 className="m-0 mb-3 font-serif font-normal text-[17px] text-navy">New poll</h2>
                <Field label="Question" value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="e.g. Which Saturday works for the cleanup?" autoFocus className="mb-2.5" maxLength={200} />
                {pollOpts.map((o, i) => (
                  <Field
                    key={i}
                    label={`Option ${i + 1}`}
                    value={o}
                    onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))}
                    className="mb-2.5"
                    maxLength={80}
                  />
                ))}
                {pollOpts.length < 5 && (
                  <button type="button" onClick={() => setPollOpts([...pollOpts, ''])} className={`${OUTLINE} w-full mb-2.5`} style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}>
                    + Add option
                  </button>
                )}
                <p className="m-0 mb-2.5 text-[12px] font-semibold text-slate">A question and at least two options. Members vote once each.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={resetPoll} className={`${OUTLINE} flex-1`} style={OUTLINE_STYLE}>
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={!pollReady}
                    onClick={() => {
                      if (!pollReady) return;
                      void repo.createGroupPoll(group.key, pollQ, pollOpts).then(resetPoll).catch(reportedByDataLayer);
                    }}
                    className={`${PRIMARY} flex-1`}
                    style={pollReady ? undefined : { background: 'rgb(var(--skyrule))', color: 'rgb(var(--slatedark))', cursor: 'default' }}
                  >
                    Start poll
                  </button>
                </div>
              </Card>
            )
          )}
          {group.polls.length === 0 ? (
            <EmptyState
              icon="ph-fill ph-chart-bar"
              title="No polls yet"
              body={group.joined ? 'Polls are a quick way to settle a date or a choice with the whole group.' : 'Join the group to see and answer its polls.'}
            />
          ) : (
            group.polls.map((poll) => {
              const total = totalVotes(poll.votes);
              return (
                <Card key={poll.id} padding="none" className="mb-3 overflow-hidden">
                  <div className="px-4 pt-3.5 pb-1">
                    <p className="m-0 text-[13.5px] font-bold text-navy">{poll.question}</p>
                    <p className="m-0 text-[12.5px] font-semibold mt-0.5 mb-2.5 text-slate">
                      {poll.author} · {poll.time} · {total} vote{total !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="px-4 pb-3.5 flex flex-col gap-2" role={poll.myVote ? undefined : 'group'} aria-label={poll.myVote ? undefined : poll.question}>
                    {poll.options.map((opt) => {
                      const count = poll.votes[opt] || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isMyVote = poll.myVote === opt;
                      const canVote = !poll.myVote && group.joined;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={!canVote}
                          aria-pressed={poll.myVote ? isMyVote : undefined}
                          onClick={() => { if (canVote) void voteGroupPoll(group.key, poll.id, opt).catch(reportedByDataLayer); }}
                          className="relative rounded-xl text-left overflow-hidden font-sans min-h-[44px]"
                          style={{
                            padding: '10px 14px',
                            cursor: canVote ? 'pointer' : 'default',
                            background: isMyVote ? 'rgb(var(--skypale))' : 'rgb(var(--navy) / 0.04)',
                            border: isMyVote ? '1.5px solid rgb(var(--skydeep))' : '1.5px solid transparent',
                          }}
                        >
                          {poll.myVote && (
                            <div
                              className="absolute inset-0 rounded-xl origin-left"
                              style={{ background: 'rgb(var(--skydeep))', opacity: 0.08, transform: `scaleX(${pct / 100})`, transition: 'transform 0.4s ease' }}
                            />
                          )}
                          <div className="relative flex items-center justify-between gap-2">
                            <span className="text-[13px] font-bold text-navy flex items-center gap-1.5">
                              {isMyVote && <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--skydeep))" />}
                              {opt}
                            </span>
                            {poll.myVote && (
                              <span className="text-[12.5px] font-extrabold text-slatedark">{pct}%</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Events tab */}
      {tab === 'events' && (
        <div className="pav-scroll flex-1 overflow-y-auto" style={{ padding: '16px 18px' }}>
          {!repo.isDemo() && group.joined && (
            !evDraftOpen ? (
              <button type="button" onClick={() => setEvDraftOpen(true)} className={DASHED} style={DASHED_STYLE}>
                + Plan an event
              </button>
            ) : (
              <Card padding="none" className="p-3.5 mb-3 animate-fadeup">
                <h2 className="m-0 mb-3 font-serif font-normal text-[17px] text-navy">New event</h2>
                <Field label="What" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="e.g. Saturday trail cleanup" autoFocus className="mb-2.5" maxLength={120} />
                <div className="flex gap-2 mb-2.5">
                  <Field label="When" value={evWhen} onChange={(e) => setEvWhen(e.target.value)} placeholder="Sat 9 AM" className="flex-1 min-w-0" maxLength={60} />
                  <Field label="Where" value={evWhere} onChange={(e) => setEvWhere(e.target.value)} placeholder="The Green" className="flex-1 min-w-0" maxLength={80} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={resetEvent} className={`${OUTLINE} flex-1`} style={OUTLINE_STYLE}>
                    Discard
                  </button>
                  <button
                    type="button"
                    disabled={!evTitle.trim()}
                    onClick={() => {
                      if (!evTitle.trim()) return;
                      void repo.createGroupEvent(group.key, evTitle, evWhen, evWhere).then(resetEvent).catch(reportedByDataLayer);
                    }}
                    className={`${PRIMARY} flex-1`}
                    style={evTitle.trim() ? undefined : { background: 'rgb(var(--skyrule))', color: 'rgb(var(--slatedark))', cursor: 'default' }}
                  >
                    Add to the group
                  </button>
                </div>
              </Card>
            )
          )}
          {group.events.length === 0 ? (
            <EmptyState
              icon="ph-fill ph-calendar-dots"
              title="No upcoming events"
              body={group.joined ? 'Events you plan here show up for every member, with a headcount.' : 'Join the group to see its events and RSVP.'}
            />
          ) : (
            group.events.map((evt) => (
              <StackedPanel key={evt.id} tint="skydeep" className="mb-3">
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>{evt.when}</p>
                    <p className="m-0 mb-1 font-serif text-[19px] leading-[1.25] text-mist">{evt.title}</p>
                    <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
                      {evt.where} · {evt.going} going
                    </p>
                  </div>
                  {group.joined && (
                    <button
                      type="button"
                      aria-pressed={evt.rsvped}
                      onClick={() => void rsvpGroupEvent(group.key, evt.id).catch(reportedByDataLayer)}
                      className="border-none rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 flex items-center gap-[5px] min-h-[44px] px-4"
                      style={{ background: 'rgb(var(--peach))', color: 'rgb(var(--navy))' }}
                    >
                      {evt.rsvped && <PhIcon name="ph-fill ph-check" size={13} color="rgb(var(--navy))" />}
                      {evt.rsvped ? 'Going' : "I'm in"}
                    </button>
                  )}
                </div>
              </StackedPanel>
            ))
          )}
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div className="pav-scroll flex-1 overflow-y-auto" style={{ padding: '16px 18px' }}>
          <div className="flex flex-col gap-2">
            {group.members.map((m, i) => (
              <Card key={i} padding="none" className="flex items-center gap-3 px-3.5 py-2.5 min-h-[44px]" style={{ borderRadius: 14 }}>
                <Avatar initial={m.initial} color={m.color} size={36} />
                <p className="m-0 text-[13.5px] font-bold text-navy flex-1">{m.name}</p>
                {m.name === 'You' && <Pill label="You" tone="info" size="md" />}
              </Card>
            ))}
            {group.memberCount > group.members.length && (
              <p className="m-0 text-center text-[12.5px] font-semibold mt-1 text-slate">
                +{group.memberCount - group.members.length} more member{group.memberCount - group.members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {group.joined && (
            <button
              type="button"
              onClick={leave}
              className={`${OUTLINE} w-full mt-4`}
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', color: 'rgb(var(--reddeep))' }}
            >
              Leave {group.name}
            </button>
          )}
          {!repo.isDemo() && group.joined && (
            <>
              <button
                type="button"
                onClick={archive}
                className={`${OUTLINE} w-full mt-2 text-slate`}
                style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}
              >
                Archive group
              </button>
              <p className="m-0 mt-1.5 text-center text-[12px] font-semibold text-slate">
                Hides it for everyone and keeps the history. Only the creator or the board can archive.
              </p>
            </>
          )}
        </div>
      )}

      {/* The one primary action for a non-member, on every tab. */}
      {!group.joined && (
        <div className="bg-paper" style={{ padding: '12px 18px calc(22px + var(--pav-safe-bottom))', borderTop: '1px solid rgb(var(--navy) / 0.08)' }}>
          <button type="button" onClick={join} className={`${PRIMARY} w-full py-3`}>
            Join {group.name}
          </button>
        </div>
      )}
    </div>
  );
}
