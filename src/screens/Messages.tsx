import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useChatSeed, useChats, useGroups } from '../data/repo';

type MsgTab = 'direct' | 'group-chats' | 'groups';

export function Messages() {
  const state = usePavStore();
  const { set } = state;
  const CHAT_SEED = useChatSeed();
  const chats = useChats();
  const groups = useGroups();
  const [msgTab, setMsgTab] = useState<MsgTab>('direct');

  if (!state.msgsOpen || state.chatWith || state.activeGroup) return null;

  const tabs: { key: MsgTab; label: string }[] = [
    { key: 'direct', label: 'Direct' },
    { key: 'group-chats', label: 'Group chats' },
    { key: 'groups', label: 'Groups' },
  ];

  const groupChats = Object.values(groups).filter((g) => g.isGroupChat);
  const communityGroups = Object.values(groups).filter((g) => !g.isGroupChat);

  const gcUnread = groupChats.reduce((n, g) => n + (g.joined && g.messages.length > 0 ? 1 : 0), 0);
  const grUnread = communityGroups.filter((g) => g.joined).length;

  return (
    <div
      data-screen-label="Messages"
      className="pav-scroll absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--cream))', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ msgsOpen: false })} />
      <div className="flex items-center justify-between mb-1">
        <h1 className="m-0 font-serif font-normal text-[26px] text-navy">Messages</h1>
        <div className="flex gap-2">
          {msgTab !== 'direct' && (
            <button
              type="button"
              onClick={() => set({ createGroupOpen: true })}
              className="w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer"
              style={{ background: 'rgb(var(--navy) / 0.06)' }}
            >
              <PhIcon name="ph-bold ph-plus" size={16} color="rgb(var(--navy))" />
            </button>
          )}
          <button
            type="button"
            onClick={() => set({ newMsgOpen: true })}
            className="w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer bg-navy"
          >
            <PhIcon name="ph-bold ph-pencil-simple-line" size={16} color="rgb(var(--cream))" />
          </button>
        </div>
      </div>
      <p className="m-0 mb-3 text-[13px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
        Neighbor-to-neighbor. Private, and never in the feed.
      </p>

      <div className="flex gap-1.5 mb-4">
        {tabs.map((t) => {
          const badge = t.key === 'group-chats' ? gcUnread : t.key === 'groups' ? grUnread : 0;
          return (
            <button
              key={t.key}
              onClick={() => setMsgTab(t.key)}
              className="border-none rounded-full px-3 py-[7px] text-[12px] font-extrabold cursor-pointer flex items-center gap-1.5"
              style={
                msgTab === t.key
                  ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }
                  : { background: 'rgb(var(--navy) / 0.06)', color: 'rgb(var(--navy))' }
              }
            >
              {t.label}
              {badge > 0 && msgTab !== t.key && (
                <span className="w-[7px] h-[7px] rounded-full" style={{ background: 'rgb(var(--ember))' }} />
              )}
            </button>
          );
        })}
      </div>

      {state.newMsgOpen && (
        <div className="rounded-2xl mb-4 overflow-hidden animate-fadeup" style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}>
          <p className="m-0 px-3.5 pt-3 pb-2 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
            Start a conversation
          </p>
          {Object.entries(CHAT_SEED).map(([k, p]) => (
            <button
              type="button"
              key={k}
              onClick={() => set({ chatWith: k, msgsOpen: false, newMsgOpen: false })}
              className="w-full border-none font-sans text-left flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer bg-[rgb(var(--paper))]"
              style={{ borderTop: '1px solid rgb(var(--navy) / 0.06)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0"
                style={{ background: p.color }}
              >
                {p.initial}
              </div>
              <p className="m-0 text-[13px] font-bold text-navy">{p.name} <span className="font-semibold text-stonelight">· {p.unit}</span></p>
            </button>
          ))}
        </div>
      )}

      {/* Direct messages */}
      {msgTab === 'direct' && (
        <div className="flex flex-col gap-[9px]">
          {Object.entries(CHAT_SEED).map(([k, p]) => {
            const mine = chats[k] || [];
            const last = mine.length ? mine[mine.length - 1] : { text: p.seed, me: false };
            const preview = (last.me ? 'You: ' : '') + last.text;
            const lastTime = mine.length ? mine[mine.length - 1].time || 'now' : p.time;
            return (
              <button
                type="button"
                key={k}
                onClick={() => set({ chatWith: k, msgsOpen: false })}
                className="w-full border-none font-sans text-left flex items-center gap-3 cursor-pointer"
                style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '13px 14px' }}
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-base flex-shrink-0"
                  style={{ background: p.color }}
                >
                  {p.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="m-0 flex-1 text-sm font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {p.name}{' '}
                      <span className="font-semibold" style={{ color: 'rgb(var(--stonelight))' }}>
                        · {p.unit}
                      </span>
                    </p>
                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--stonelight))' }}>
                      {lastTime}
                    </span>
                  </div>
                  <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'rgb(var(--stone))' }}>
                    {preview}
                  </p>
                </div>
                {p.unread > 0 && (
                  <span data-testid="msg-unread" className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--ember))' }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Group chats */}
      {msgTab === 'group-chats' && (
        <div className="flex flex-col gap-[9px]">
          {groupChats.length === 0 ? (
            <EmptyState icon="ph ph-chat-circle-dots" text="No group chats yet" actionLabel="Create one" onAction={() => set({ createGroupOpen: true })} />
          ) : (
            groupChats.map((gc) => {
              const lastMsg = gc.messages[gc.messages.length - 1];
              const preview = lastMsg ? lastMsg.text : gc.description;
              const lastTime = lastMsg?.time || '';
              return (
                <GroupRow
                  key={gc.key}
                  group={gc}
                  preview={preview}
                  time={lastTime}
                  onClick={() => set({ activeGroup: gc.key })}
                />
              );
            })
          )}
        </div>
      )}

      {/* Community groups */}
      {msgTab === 'groups' && (
        <div className="flex flex-col gap-[9px]">
          {communityGroups.length === 0 ? (
            <EmptyState icon="ph ph-users-three" text="No groups yet" actionLabel="Start one" onAction={() => set({ createGroupOpen: true })} />
          ) : (
            communityGroups.map((g) => {
              const lastMsg = g.messages[g.messages.length - 1];
              const preview = lastMsg ? lastMsg.text : g.description;
              const lastTime = lastMsg?.time || '';
              return (
                <GroupRow
                  key={g.key}
                  group={g}
                  preview={preview}
                  time={lastTime}
                  onClick={() => set({ activeGroup: g.key })}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function GroupRow({ group, preview, time, onClick }: {
  group: { key: string; name: string; icon: string; color: string; memberCount: number; joined: boolean; muted: boolean; polls: { myVote: string | null }[]; events: { rsvped: boolean }[] };
  preview: string;
  time: string;
  onClick: () => void;
}) {
  const openPolls = group.polls.filter((p) => !p.myVote).length;
  const upcomingEvents = group.events.filter((e) => !e.rsvped).length;

  return (
    <button type="button"
      onClick={onClick}
      className="w-full border-none font-sans bg-transparent text-left flex items-center gap-3 cursor-pointer"
      style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '13px 14px' }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: group.color + '18' }}
      >
        <PhIcon name={group.icon} size={20} color={group.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="m-0 flex-1 text-sm font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1.5">
            {group.name}
            {group.muted && <PhIcon name="ph-fill ph-bell-slash" size={11} color="rgb(var(--stonelight))" />}
          </p>
          <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--stonelight))' }}>
            {time}
          </span>
        </div>
        <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: 'rgb(var(--stone))' }}>
          {preview}
        </p>
        {(openPolls > 0 || upcomingEvents > 0) && (
          <div className="flex gap-2 mt-1">
            {openPolls > 0 && (
              <span className="text-[10.5px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgb(var(--goldpale))', color: 'rgb(var(--goldmid))' }}>
                {openPolls} poll{openPolls > 1 ? 's' : ''}
              </span>
            )}
            {upcomingEvents > 0 && (
              <span className="text-[10.5px] font-bold rounded-full px-2 py-0.5" style={{ background: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))' }}>
                {upcomingEvents} event{upcomingEvents > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
      {!group.joined && (
        <span className="text-[11px] font-bold rounded-full px-2.5 py-1 flex-shrink-0" style={{ background: 'rgb(var(--navy) / 0.06)', color: 'rgb(var(--barkgray))' }}>
          Join
        </span>
      )}
    </button>
  );
}

function EmptyState({ icon, text, actionLabel, onAction }: { icon: string; text: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <PhIcon name={icon} size={36} color="rgb(var(--taupepale))" />
      <p className="m-0 mt-2 text-[13px] font-semibold" style={{ color: 'rgb(var(--stonelight))' }}>{text}</p>
      <button
        onClick={onAction}
        className="mt-3 border-none rounded-full px-4 py-2.5 text-[12.5px] font-extrabold cursor-pointer"
        style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
      >
        {actionLabel}
      </button>
    </div>
  );
}
