import { useState } from 'react';
import { Avatar } from '../components/Avatar';
import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { usePavStore } from '../store/store';
import { useChatSeed, useChats, useGroups } from '../data/repo';

type MsgTab = 'direct' | 'group-chats' | 'groups';

/** Group colours are `rgb(var(--x))` tokens; a pale bed of the same hue is the alpha form. */
const tintOf = (color: string) => color.replace(/\)\s*$/, ' / 0.12)');

export function Messages() {
  const msgsOpen = usePavStore((s) => s.msgsOpen);
  const chatWith = usePavStore((s) => s.chatWith);
  const activeGroup = usePavStore((s) => s.activeGroup);
  const newMsgOpen = usePavStore((s) => s.newMsgOpen);
  const set = usePavStore((s) => s.set);
  const CHAT_SEED = useChatSeed();
  const chats = useChats();
  const groups = useGroups();
  const [msgTab, setMsgTab] = useState<MsgTab>('direct');

  if (!msgsOpen || chatWith || activeGroup) return null;

  const tabs: { key: MsgTab; label: string }[] = [
    { key: 'direct', label: 'Direct' },
    { key: 'group-chats', label: 'Group chats' },
    { key: 'groups', label: 'Groups' },
  ];

  const groupChats = Object.values(groups).filter((g) => g.isGroupChat);
  const communityGroups = Object.values(groups).filter((g) => !g.isGroupChat);
  const people = Object.entries(CHAT_SEED);

  const gcUnread = groupChats.reduce((n, g) => n + (g.joined && g.messages.length > 0 ? 1 : 0), 0);
  const grUnread = communityGroups.filter((g) => g.joined).length;

  return (
    <div
      data-screen-label="Messages"
      className="pav-scroll pav-fixed absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={() => set({ msgsOpen: false })} />
      <div className="flex items-center justify-between mb-1">
        <h1 className="m-0 font-serif font-normal text-[24px] text-navy">Messages</h1>
        <div className="flex">
          {msgTab !== 'direct' && (
            <button
              type="button"
              aria-label="Create a group"
              onClick={() => set({ createGroupOpen: true })}
              className="w-11 h-11 border-none bg-transparent flex items-center justify-center cursor-pointer"
            >
              <span className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgb(var(--navy) / 0.06)' }}>
                <PhIcon name="ph-bold ph-plus" size={16} color="rgb(var(--skydeep))" />
              </span>
            </button>
          )}
          <button
            type="button"
            aria-label="New message"
            aria-expanded={newMsgOpen}
            onClick={() => set({ newMsgOpen: !newMsgOpen })}
            className="w-11 h-11 -mr-1 border-none bg-transparent flex items-center justify-center cursor-pointer"
          >
            <span className="w-9 h-9 rounded-full flex items-center justify-center bg-skydeep">
              <PhIcon name="ph-bold ph-pencil-simple-line" size={16} color="rgb(var(--mist))" />
            </span>
          </button>
        </div>
      </div>
      <p className="m-0 mb-3 text-[13px] font-semibold text-slatedeep">
        Neighbor-to-neighbor. Private, and never in the feed.
      </p>

      <div className="flex gap-1.5 mb-4 flex-wrap" role="group" aria-label="Show">
        {tabs.map((t) => {
          const badge = t.key === 'group-chats' ? gcUnread : t.key === 'groups' ? grUnread : 0;
          return (
            <Chip
              key={t.key}
              label={badge > 0 && msgTab !== t.key ? `${t.label} · ${badge}` : t.label}
              active={msgTab === t.key}
              onClick={() => setMsgTab(t.key)}
              size="md"
            />
          );
        })}
      </div>

      {newMsgOpen && (
        <Card padding="none" className="mb-4 overflow-hidden animate-fadeup">
          <p className="m-0 px-3.5 pt-3 pb-2 text-[13.5px] font-bold text-navy">Start a conversation</p>
          {people.length === 0 && (
            <p className="m-0 px-3.5 pb-3 text-[12.5px] font-semibold text-slate">
              Neighbors appear here as they join and opt in to the directory.
            </p>
          )}
          {people.map(([k, p]) => (
            <button
              type="button"
              key={k}
              onClick={() => set({ chatWith: k, msgsOpen: false, newMsgOpen: false })}
              className="w-full border-none font-sans text-left flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] cursor-pointer bg-paper"
              style={{ borderTop: '1px solid rgb(var(--navy) / 0.06)' }}
            >
              <Avatar initial={p.initial} color={p.color} size={32} />
              <p className="m-0 text-[13px] font-bold text-navy">{p.name} <span className="font-semibold text-slate">· {p.unit}</span></p>
            </button>
          ))}
        </Card>
      )}

      {/* Direct messages */}
      {msgTab === 'direct' && (
        <div className="flex flex-col gap-[9px]">
          {people.length === 0 && (
            <EmptyState
              icon="ph-fill ph-chats-circle"
              title="No conversations yet"
              body="Message a neighbor from the People tab in the Commons, or start one here once neighbors have joined."
            />
          )}
          {people.map(([k, p]) => {
            const mine = chats[k] || [];
            const last = mine.length ? mine[mine.length - 1] : { text: p.seed, me: false };
            const preview = (last.me ? 'You: ' : '') + last.text;
            const lastTime = mine.length ? mine[mine.length - 1].time || 'now' : p.time;
            return (
              <Card
                key={k}
                padding="none"
                onClick={() => set({ chatWith: k, msgsOpen: false })}
                className="px-3.5 py-3 min-h-[44px]"
                style={{ borderRadius: 16 }}
              >
                <div className="flex items-center gap-3">
                <Avatar initial={p.initial} color={p.color} size={44} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="m-0 flex-1 text-[13.5px] font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                      {p.name}{' '}
                      <span className="font-semibold text-slate">· {p.unit}</span>
                    </p>
                    <span className="text-[12px] font-bold flex-shrink-0 text-slate">{lastTime}</span>
                  </div>
                  <p className={`mt-0.5 mb-0 text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap ${p.unread > 0 ? 'font-bold text-navy' : 'font-semibold text-slate'}`}>
                    {preview}
                  </p>
                </div>
                {p.unread > 0 && (
                  <span data-testid="msg-unread" className="flex-shrink-0">
                    <Pill label={p.unread > 1 ? `${p.unread} new` : 'New'} tone="info" size="md" />
                  </span>
                )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Group chats */}
      {msgTab === 'group-chats' && (
        <div className="flex flex-col gap-[9px]">
          {groupChats.length === 0 ? (
            <EmptyState
              icon="ph-fill ph-chats-circle"
              title="No group chats yet"
              body="A group chat is a private thread for a few neighbors — a street, a carpool, a project."
              actionLabel="Create a group chat"
              onAction={() => set({ createGroupOpen: true })}
            />
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
            <EmptyState
              icon="ph-fill ph-users-three"
              title="No groups yet"
              body="Groups are open to the whole community — anyone can find and join them."
              actionLabel="Start a group"
              onAction={() => set({ createGroupOpen: true })}
            />
          ) : (
            <>
              <SectionHeading title="Community groups" meta={`${communityGroups.filter((g) => g.joined).length} of ${communityGroups.length} joined`} className="mb-0.5" />
              {communityGroups.map((g) => {
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
              })}
            </>
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
    <Card padding="none" onClick={onClick} className="px-3.5 py-3 min-h-[44px]" style={{ borderRadius: 16 }}>
      <div className="flex items-center gap-3">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: tintOf(group.color) }}
      >
        <PhIcon name={group.icon} size={20} color={group.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="m-0 flex-1 text-[13.5px] font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1.5">
            {group.name}
            {group.muted && <PhIcon name="ph-fill ph-bell-slash" size={11} color="rgb(var(--slate))" />}
            {group.muted && <span className="sr-only">(muted)</span>}
          </p>
          <span className="text-[12px] font-bold flex-shrink-0 text-slate">{time}</span>
        </div>
        <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap text-slate">
          {preview}
        </p>
        {(openPolls > 0 || upcomingEvents > 0) && (
          <div className="flex gap-1.5 mt-1.5">
            {openPolls > 0 && <Pill label={`${openPolls} poll${openPolls > 1 ? 's' : ''} to answer`} tone="warning" size="md" />}
            {upcomingEvents > 0 && <Pill label={`${upcomingEvents} event${upcomingEvents > 1 ? 's' : ''}`} tone="info" size="md" />}
          </div>
        )}
      </div>
      {!group.joined && <Pill label="Not joined" tone="neutral" size="md" />}
      </div>
    </Card>
  );
}
