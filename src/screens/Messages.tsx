import { useState } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { CHAT_SEED, GROUP_CHATS, GROUPS } from '../data';

type MsgTab = 'direct' | 'group-chats' | 'groups';

export function Messages() {
  const state = usePavStore();
  const { set } = state;
  const [msgTab, setMsgTab] = useState<MsgTab>('direct');

  if (!state.msgsOpen || state.chatWith) return null;

  const tabs: { key: MsgTab; label: string }[] = [
    { key: 'direct', label: 'Direct' },
    { key: 'group-chats', label: 'Group chats' },
    { key: 'groups', label: 'Groups' },
  ];

  return (
    <div
      data-screen-label="Messages"
      className="pav-scroll absolute inset-0 z-[77] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ msgsOpen: false })} />
      <div className="flex items-center justify-between mb-1">
        <h1 className="m-0 font-serif font-normal text-[26px] text-navy">Messages</h1>
        <button
          type="button"
          onClick={() => set({ newMsgOpen: true })}
          className="w-9 h-9 rounded-full border-none flex items-center justify-center cursor-pointer bg-navy"
        >
          <PhIcon name="ph-bold ph-pencil-simple-line" size={16} color="#F5F0E6" />
        </button>
      </div>
      <p className="m-0 mb-3 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
        Neighbor-to-neighbor. Private, and never in the feed.
      </p>

      <div className="flex gap-1.5 mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setMsgTab(t.key)}
            className="border-none rounded-full px-3 py-[7px] text-[12px] font-extrabold cursor-pointer"
            style={
              msgTab === t.key
                ? { background: '#1A3352', color: '#F5F0E6' }
                : { background: 'rgba(26,51,82,0.06)', color: '#1A3352' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {state.newMsgOpen && (
        <div className="rounded-2xl mb-4 overflow-hidden animate-fadeup" style={{ border: '1px solid rgba(26,51,82,0.1)' }}>
          <p className="m-0 px-3.5 pt-3 pb-2 text-[11px] font-bold uppercase text-stone" style={{ letterSpacing: '0.12em' }}>
            Start a conversation
          </p>
          {Object.entries(CHAT_SEED).map(([k, p]) => (
            <div
              key={k}
              onClick={() => set({ chatWith: k, msgsOpen: false, newMsgOpen: false })}
              className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer bg-[#FFFEFA]"
              style={{ borderTop: '1px solid rgba(26,51,82,0.06)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs flex-shrink-0"
                style={{ background: p.color }}
              >
                {p.initial}
              </div>
              <p className="m-0 text-[13px] font-bold text-navy">{p.name} <span className="font-semibold text-stonelight">· {p.unit}</span></p>
            </div>
          ))}
        </div>
      )}

      {msgTab === 'direct' && (
        <div className="flex flex-col gap-[9px]">
          {Object.entries(CHAT_SEED).map(([k, p]) => {
            const mine = state.chats[k] || [];
            const last = mine.length ? mine[mine.length - 1] : { text: p.seed, me: false };
            const preview = (last.me ? 'You: ' : '') + last.text;
            const lastTime = mine.length ? mine[mine.length - 1].time || 'now' : p.time;
            return (
              <div
                key={k}
                onClick={() => set({ chatWith: k, msgsOpen: false })}
                className="flex items-center gap-3 cursor-pointer"
                style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 14px' }}
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
                      <span className="font-semibold" style={{ color: '#A39B8B' }}>
                        · {p.unit}
                      </span>
                    </p>
                    <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#A39B8B' }}>
                      {lastTime}
                    </span>
                  </div>
                  <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#8A8375' }}>
                    {preview}
                  </p>
                </div>
                {p.unread > 0 && (
                  <span data-testid="msg-unread" className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: '#E06A3E' }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {msgTab === 'group-chats' && (
        <div className="flex flex-col gap-[9px]">
          {GROUP_CHATS.map((gc) => (
            <div
              key={gc.key}
              className="flex items-center gap-3 cursor-pointer"
              style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 14px' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: gc.color + '18' }}
              >
                <PhIcon name={gc.icon} size={20} color={gc.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="m-0 flex-1 text-sm font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {gc.name}
                  </p>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#A39B8B' }}>
                    {gc.time}
                  </span>
                </div>
                <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#8A8375' }}>
                  {gc.seed}
                </p>
                <p className="mt-1 mb-0 text-[11px] font-bold" style={{ color: '#A39B8B' }}>
                  {gc.members.join(', ')}
                </p>
              </div>
              {gc.unread > 0 && (
                <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0 px-1.5" style={{ background: '#E06A3E' }}>
                  {gc.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {msgTab === 'groups' && (
        <div className="flex flex-col gap-[9px]">
          {GROUPS.map((g) => (
            <div
              key={g.key}
              className="flex items-center gap-3 cursor-pointer"
              style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '13px 14px' }}
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: g.color + '18' }}
              >
                <PhIcon name={g.icon} size={20} color={g.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="m-0 flex-1 text-sm font-bold text-navy min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
                    {g.name}
                  </p>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: '#A39B8B' }}>
                    {g.time}
                  </span>
                </div>
                <p className="mt-0.5 mb-0 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap" style={{ color: '#8A8375' }}>
                  {g.seed}
                </p>
                <p className="mt-1 mb-0 text-[11px] font-bold" style={{ color: '#A39B8B' }}>
                  {g.members.join(', ')}
                </p>
              </div>
              {g.unread > 0 && (
                <span className="min-w-[20px] h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white flex-shrink-0 px-1.5" style={{ background: '#E06A3E' }}>
                  {g.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
