import { useState, useEffect, useRef } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useGroups, useRepository } from '../data/repo';

type Tab = 'chat' | 'polls' | 'events' | 'members';

export function GroupDetail() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const groups = useGroups();
  const { voteGroupPoll, rsvpGroupEvent, toggleGroupJoin, toggleGroupMute } = repo;
  const [tab, setTab] = useState<Tab>('chat');
  const [pollDraftOpen, setPollDraftOpen] = useState(false);
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState<string[]>(['', '']);
  const [evDraftOpen, setEvDraftOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evWhen, setEvWhen] = useState('');
  const [evWhere, setEvWhere] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  const group = state.activeGroup ? groups[state.activeGroup] : null;

  const sendGroupMessage = () => {
    const t = state.groupChatInput.trim();
    if (!t || !state.activeGroup) return;
    repo.sendGroupMessage(state.activeGroup, t);
    set({ groupChatInput: '' });
  };

  useEffect(() => {
    const el = listRef.current;
    if (el && tab === 'chat') el.scrollTop = el.scrollHeight;
  }, [group?.messages, tab]);

  if (!state.activeGroup || !group) return null;

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'chat', label: 'Chat', icon: 'ph-fill ph-chat-circle' },
    { key: 'polls', label: 'Polls', icon: 'ph-fill ph-chart-bar-horizontal', count: group.polls.filter((p) => !p.myVote).length },
    { key: 'events', label: 'Events', icon: 'ph-fill ph-calendar-dots', count: group.events.length },
    { key: 'members', label: 'Members', icon: 'ph-fill ph-users', count: group.memberCount },
  ];

  const totalVotes = (votes: Record<string, number>) => Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div
      data-screen-label="Group Detail"
      className="absolute inset-0 z-[78] flex flex-col animate-scpop"
      style={{ background: 'rgb(var(--cream))' }}
    >
      {/* Header */}
      <div style={{ padding: '58px 18px 0' }}>
        <div className="flex items-center gap-[11px] mb-3">
          <BackButton onClick={() => set({ activeGroup: null })} className="" />
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: group.color + '18' }}
          >
            <PhIcon name={group.icon} size={20} color={group.color} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[14.5px] font-bold text-navy">{group.name}</p>
            <p className="m-0 text-[11px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
              {group.memberCount} members{group.isGroupChat ? ' · group chat' : ' · community group'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => toggleGroupMute(group.key)}
            className="w-8 h-8 rounded-full border-none flex items-center justify-center cursor-pointer"
            style={{ background: group.muted ? 'rgb(var(--blushpale))' : 'rgb(var(--navy) / 0.06)' }}
          >
            <PhIcon
              name={group.muted ? 'ph-fill ph-bell-slash' : 'ph-fill ph-bell'}
              size={15}
              color={group.muted ? 'rgb(var(--terracotta))' : 'rgb(var(--stone))'}
            />
          </button>
        </div>

        {/* Pinned message */}
        {group.pins.length > 0 && (
          <div
            className="rounded-xl px-3 py-2.5 mb-3 flex items-start gap-2"
            style={{ background: 'rgb(var(--goldpale))', border: '1px solid rgb(var(--gold) / 0.2)' }}
          >
            <PhIcon name="ph-fill ph-push-pin" size={13} color="rgb(var(--gold))" className="mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="m-0 text-[12px] font-bold text-navy">{group.pins[0].text}</p>
              <p className="m-0 text-[10.5px] font-semibold mt-0.5" style={{ color: 'rgb(var(--stonelight))' }}>
                Pinned by {group.pins[0].author} · {group.pins[0].time}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.08)' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 flex items-center justify-center gap-1.5 border-none bg-transparent cursor-pointer pb-2.5 pt-1"
              style={{ borderBottom: tab === t.key ? '2px solid rgb(var(--navy))' : '2px solid transparent' }}
            >
              <PhIcon name={t.icon} size={13} color={tab === t.key ? 'rgb(var(--navy))' : 'rgb(var(--stonelight))'} />
              <span className="text-[11.5px] font-bold" style={{ color: tab === t.key ? 'rgb(var(--navy))' : 'rgb(var(--stonelight))' }}>
                {t.label}
              </span>
              {t.count && t.count > 0 ? (
                <span
                  className="min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-extrabold px-1"
                  style={{ background: tab === t.key ? 'rgb(var(--navy))' : 'rgb(var(--taupepale))', color: tab === t.key ? 'rgb(var(--cream))' : 'rgb(var(--barkgray))' }}
                >
                  {t.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          {!group.joined ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6" style={{ gap: 12 }}>
              <PhIcon name={group.icon} size={40} color={group.color} />
              <p className="m-0 text-sm font-bold text-navy text-center">Join {group.name} to send messages</p>
              <p className="m-0 text-[12.5px] font-semibold text-center" style={{ color: 'rgb(var(--stone))' }}>{group.description}</p>
              <button
                onClick={() => toggleGroupJoin(group.key)}
                className="border-none rounded-full px-5 py-2.5 text-sm font-extrabold cursor-pointer mt-1"
                style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
              >
                Join group
              </button>
            </div>
          ) : (
            <>
              <div ref={listRef} className="pav-scroll flex-1 overflow-y-auto flex flex-col gap-2.5" style={{ padding: '16px 18px' }}>
                {group.messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10" style={{ color: 'rgb(var(--stonelight))' }}>
                    <PhIcon name="ph ph-chat-circle-dots" size={32} color="rgb(var(--taupepale))" />
                    <p className="m-0 mt-2 text-[13px] font-semibold">No messages yet — say something!</p>
                  </div>
                ) : (
                  group.messages.map((m, i) => (
                    <div key={i} className="flex flex-col" style={{ alignItems: m.me ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          maxWidth: '80%',
                          background: m.me ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                          color: m.me ? 'rgb(var(--cream))' : 'rgb(var(--navy))',
                          border: m.me ? 'none' : '1px solid rgb(var(--navy) / 0.08)',
                          borderRadius: m.me ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                          padding: '10px 13px',
                        }}
                      >
                        <p className="m-0 text-[13.5px] leading-[1.45] font-semibold">{m.text}</p>
                      </div>
                      <span className="text-[10.5px] font-bold" style={{ margin: '3px 4px 0', color: 'rgb(var(--claygray))' }}>
                        {m.time || ''}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-[9px] items-center" style={{ padding: '10px 18px 26px' }}>
                <input
                  value={state.groupChatInput}
                  onChange={(e) => set({ groupChatInput: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendGroupMessage(); }}
                  placeholder="Message the group…"
                  className="flex-1 rounded-full text-[13.5px] font-semibold text-navy outline-none font-sans min-w-0"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--paper))', padding: '12px 16px' }}
                />
                <button
                  type="button"
                  aria-label="Send"
                  onClick={sendGroupMessage}
                  className="w-11 h-11 border-none rounded-full bg-navy flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <PhIcon name="ph-fill ph-paper-plane-right" size={17} color="rgb(var(--cream))" />
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
              <button
                onClick={() => setPollDraftOpen(true)}
                className="w-full rounded-full py-2.5 mb-3 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
              >
                + Start a poll
              </button>
            ) : (
              <div className="rounded-[18px] p-3.5 mb-3 animate-fadeup" style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.1)' }}>
                <input
                  value={pollQ}
                  onChange={(e) => setPollQ(e.target.value)}
                  placeholder="Question"
                  autoFocus
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                {pollOpts.map((o, i) => (
                  <input
                    key={i}
                    value={o}
                    onChange={(e) => setPollOpts(pollOpts.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={`Option ${i + 1}`}
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                ))}
                {pollOpts.length < 5 && (
                  <button
                    onClick={() => setPollOpts([...pollOpts, ''])}
                    className="w-full rounded-[11px] py-2 mb-2 text-[12px] font-extrabold cursor-pointer bg-transparent text-navy"
                    style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}
                  >
                    + Add option
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setPollDraftOpen(false); setPollQ(''); setPollOpts(['', '']); }}
                    className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!pollQ.trim() || pollOpts.filter((o) => o.trim()).length < 2) return;
                      void repo.createGroupPoll(group.key, pollQ, pollOpts)
                        .then(() => { setPollDraftOpen(false); setPollQ(''); setPollOpts(['', '']); })
                        .catch(() => {});
                    }}
                    className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                    style={{ background: pollQ.trim() && pollOpts.filter((o) => o.trim()).length >= 2 ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
                  >
                    Start poll
                  </button>
                </div>
              </div>
            )
          )}
          {group.polls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: 'rgb(var(--stonelight))' }}>
              <PhIcon name="ph ph-chart-bar-horizontal" size={32} color="rgb(var(--taupepale))" />
              <p className="m-0 mt-2 text-[13px] font-semibold">No polls yet</p>
            </div>
          ) : (
            group.polls.map((poll) => {
              const total = totalVotes(poll.votes);
              return (
                <div
                  key={poll.id}
                  className="rounded-[18px] mb-3 overflow-hidden"
                  style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)' }}
                >
                  <div className="px-4 pt-3.5 pb-1">
                    <p className="m-0 text-[13.5px] font-bold text-navy">{poll.question}</p>
                    <p className="m-0 text-[11px] font-semibold mt-0.5 mb-2.5" style={{ color: 'rgb(var(--stonelight))' }}>
                      {poll.author} · {poll.time} · {total} vote{total !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="px-4 pb-3.5 flex flex-col gap-2">
                    {poll.options.map((opt) => {
                      const count = poll.votes[opt] || 0;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      const isMyVote = poll.myVote === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => { if (!poll.myVote && group.joined) voteGroupPoll(group.key, poll.id, opt); }}
                          className="relative rounded-xl border-none cursor-pointer text-left overflow-hidden"
                          style={{
                            padding: '10px 14px',
                            background: isMyVote ? 'rgb(var(--skypale))' : 'rgb(var(--navy) / 0.04)',
                            border: isMyVote ? '1.5px solid rgb(var(--sky))' : '1.5px solid transparent',
                          }}
                        >
                          {poll.myVote && (
                            <div
                              className="absolute inset-0 rounded-xl"
                              style={{ background: 'rgb(var(--navy))', opacity: 0.06, width: pct + '%', transition: 'width 0.4s ease' }}
                            />
                          )}
                          <div className="relative flex items-center justify-between">
                            <span className="text-[13px] font-bold text-navy flex items-center gap-1.5">
                              {isMyVote && <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sky))" />}
                              {opt}
                            </span>
                            {poll.myVote && (
                              <span className="text-[12px] font-extrabold" style={{ color: 'rgb(var(--stone))' }}>{pct}%</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
              <button
                onClick={() => setEvDraftOpen(true)}
                className="w-full rounded-full py-2.5 mb-3 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
              >
                + Plan an event
              </button>
            ) : (
              <div className="rounded-[18px] p-3.5 mb-3 animate-fadeup" style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.1)' }}>
                <input
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="What — e.g. Saturday trail cleanup"
                  autoFocus
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                <div className="flex gap-2 mb-2">
                  <input
                    value={evWhen}
                    onChange={(e) => setEvWhen(e.target.value)}
                    placeholder="When"
                    className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <input
                    value={evWhere}
                    onChange={(e) => setEvWhere(e.target.value)}
                    placeholder="Where"
                    className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEvDraftOpen(false); setEvTitle(''); setEvWhen(''); setEvWhere(''); }}
                    className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!evTitle.trim()) return;
                      void repo.createGroupEvent(group.key, evTitle, evWhen, evWhere)
                        .then(() => { setEvDraftOpen(false); setEvTitle(''); setEvWhen(''); setEvWhere(''); })
                        .catch(() => {});
                    }}
                    className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                    style={{ background: evTitle.trim() ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
                  >
                    Plan it
                  </button>
                </div>
              </div>
            )
          )}
          {group.events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10" style={{ color: 'rgb(var(--stonelight))' }}>
              <PhIcon name="ph ph-calendar-dots" size={32} color="rgb(var(--taupepale))" />
              <p className="m-0 mt-2 text-[13px] font-semibold">No upcoming events</p>
            </div>
          ) : (
            group.events.map((evt) => (
              <div
                key={evt.id}
                className="bg-navy rounded-[18px] p-4 text-cream mb-3"
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="m-0 mb-[3px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: group.color }}>
                      {evt.when}
                    </p>
                    <p className="m-0 mb-[3px] font-serif text-base leading-[1.25]">{evt.title}</p>
                    <p className="m-0 text-xs font-semibold" style={{ color: 'rgb(var(--cream) / 0.65)' }}>
                      {evt.where} · {evt.going} going
                    </p>
                  </div>
                  {group.joined && (
                    evt.rsvped ? (
                      <button
                        type="button"
                        onClick={() => rsvpGroupEvent(group.key, evt.id)}
                        className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 flex items-center gap-[5px]"
                        style={{ background: 'rgb(var(--sage))', padding: '9px 14px' }}
                      >
                        <PhIcon name="ph-fill ph-check" size={13} />
                        Going
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => rsvpGroupEvent(group.key, evt.id)}
                        className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0"
                        style={{ background: 'rgb(var(--ember))', padding: '9px 14px' }}
                      >
                        I&apos;m in
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Members tab */}
      {tab === 'members' && (
        <div className="pav-scroll flex-1 overflow-y-auto" style={{ padding: '16px 18px' }}>
          <div className="flex flex-col gap-2">
            {group.members.map((m, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
                style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 14, padding: '11px 14px' }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0"
                  style={{ background: m.color }}
                >
                  {m.initial}
                </div>
                <p className="m-0 text-[13.5px] font-bold text-navy flex-1">{m.name}</p>
                {m.name === 'You' && (
                  <span className="text-[11px] font-bold rounded-full px-2.5 py-1" style={{ background: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))' }}>
                    You
                  </span>
                )}
              </div>
            ))}
            {group.memberCount > group.members.length && (
              <p className="m-0 text-center text-[12px] font-semibold mt-1" style={{ color: 'rgb(var(--stonelight))' }}>
                +{group.memberCount - group.members.length} more member{group.memberCount - group.members.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {group.joined && (
            <button
              type="button"
              onClick={() => toggleGroupJoin(group.key)}
              className="w-full mt-4 border-none rounded-xl py-3 text-[13px] font-extrabold cursor-pointer"
              style={{ background: 'rgb(var(--blushpale))', color: 'rgb(var(--terracotta))' }}
            >
              Leave group
            </button>
          )}
          {!repo.isDemo() && group.joined && (
            <button
              type="button"
              onClick={() => void repo.archiveGroup(group.key).then(() => set({ activeGroup: null })).catch(() => {})}
              className="w-full mt-2 bg-transparent rounded-xl py-3 text-[13px] font-extrabold cursor-pointer text-stone"
              style={{ border: '1.5px dashed rgb(var(--navy) / 0.2)' }}
              title="Only the creator or the board can archive"
            >
              Archive group — hides it for everyone, history kept
            </button>
          )}
        </div>
      )}

      {/* Join bar for non-members */}
      {!group.joined && tab !== 'chat' && (
        <div className="flex items-center gap-3" style={{ padding: '12px 18px 26px' }}>
          <button
            onClick={() => toggleGroupJoin(group.key)}
            className="flex-1 border-none rounded-full py-3 text-sm font-extrabold cursor-pointer"
            style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
          >
            Join {group.name}
          </button>
        </div>
      )}
    </div>
  );
}
