import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { SectionHeading } from '../components/SectionHeading';
import { usePavStore } from '../store/store';
import { useNotifications, useNotifCategories } from '../data/repo';
import type { Notif } from '../data/types';

/** Notifications / Activity screen — ported from prototype lines 1834-1900. */
export function Notifications() {
  const state = usePavStore();
  const { set } = state;
  const NOTIFS = useNotifications();
  const NOTIF_CATS = useNotifCategories();

  if (!state.notifOpen) return null;

  // Prototype routeNotif (line 3123) sets tab:go verbatim; in our typed port
  // go==='events' opens the Events overlay instead (deviation, see task report).
  const routeNotif = (go: string) => {
    if (go === 'events') set({ notifOpen: false, notifsRead: true, eventsOpen: true });
    else set({ notifOpen: false, notifsRead: true, tab: go });
  };

  const visible = (when: string) => NOTIFS.filter((nt) => nt.when === when && !state.mutedCats[nt.cat]);
  const today = visible('today');
  const earlier = visible('earlier');
  const nothingVisible = today.length === 0 && earlier.length === 0;
  // "Every category is muted" is only true when there was something to mute.
  const allMuted = nothingVisible && NOTIFS.length > 0;
  const nothingYet = NOTIFS.length === 0;
  const unread = NOTIFS.filter((nt) => nt.unread && !state.mutedCats[nt.cat]).length;

  const renderRow = (nt: Notif) => (
    <Card key={nt.key} padding="none" onClick={() => routeNotif(nt.go)} className="flex items-center gap-3" style={{ padding: '13px 14px' }}>
      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: nt.bg }} aria-hidden="true">
        <PhIcon name={nt.icon} size={18} color={nt.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.3]">{nt.title}</p>
        <p className="m-0 text-[12px] font-semibold text-slate">
          {nt.sub} · {nt.cat}
        </p>
      </div>
      {nt.unread && !state.notifsRead && (
        <span data-testid="notif-dot" className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--sunset))' }} aria-label="Unread" role="img" />
      )}
      <PhIcon name="ph ph-caret-right" size={13} color="rgb(var(--slatedim))" className="flex-shrink-0" />
    </Card>
  );

  return (
    <div
      data-screen-label="Notifications"
      className="pav-scroll pav-fixed absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--mist))', padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <div className="flex items-center justify-between mb-3">
        <BackButton onClick={() => set({ notifOpen: false })} className="" />
        {unread > 0 && !state.notifsRead && (
          <button
            type="button"
            onClick={() => set({ notifsRead: true })}
            className="border-none bg-transparent text-[13px] font-extrabold cursor-pointer font-sans px-2 -mr-2 min-h-[44px] text-skydeep"
          >
            Mark all read
          </button>
        )}
      </div>
      <h1 className="m-0 mb-4 font-serif font-normal text-[24px] text-navy">Activity</h1>

      {today.length > 0 && (
        <div className="mb-5">
          <SectionHeading title="Today" meta={`${today.length} ${today.length === 1 ? 'update' : 'updates'}`} />
          <div className="flex flex-col gap-[9px]">{today.map(renderRow)}</div>
        </div>
      )}

      {earlier.length > 0 && (
        <div className="mb-5">
          <SectionHeading title="Earlier" />
          <div className="flex flex-col gap-[9px]">{earlier.map(renderRow)}</div>
        </div>
      )}

      {nothingYet && (
        <div className="mb-4">
          <EmptyState
            icon="ph ph-bell"
            title="Nothing yet"
            body="Votes, dues, requests and neighborhood news show up here as they happen."
          />
        </div>
      )}

      {allMuted && (
        <div className="text-center" style={{ padding: '22px 16px 26px' }}>
          <PhIcon name="ph ph-bell-slash" size={32} color="rgb(var(--slatelight))" className="inline-block" />
          <p className="mt-[9px] mb-0.5 text-sm font-bold text-navy">Quiet in here</p>
          <p className="m-0 text-[12.5px] font-semibold text-slate">
            Every category is muted. Turn one back on below.
          </p>
        </div>
      )}

      <Card>
        <SectionHeading title="What reaches you" meta="Tap to mute a category — urgent safety alerts always come through." />
        <div className="flex gap-2 flex-wrap">
          {NOTIF_CATS.map((c) => {
            const muted = !!state.mutedCats[c];
            return (
              <button
                key={c}
                type="button"
                aria-pressed={!muted}
                onClick={() => set({ mutedCats: { ...state.mutedCats, [c]: !state.mutedCats[c] } })}
                className="inline-flex items-center gap-1.5 border-none rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans px-3.5 min-h-[40px]"
                style={{
                  background: muted ? 'rgb(var(--skyborder))' : 'rgb(var(--mint))',
                  color: muted ? 'rgb(var(--slatedark))' : 'rgb(var(--sagedark))',
                }}
              >
                <PhIcon name={muted ? 'ph-fill ph-bell-slash' : 'ph-fill ph-bell'} size={13} />
                {c}
              </button>
            );
          })}
        </div>
      </Card>
      <p className="mt-4 mb-0 text-center text-[12px] font-bold text-slatelight">
        The weekly digest reaches every household — even neighbors not on the app.
      </p>
    </div>
  );
}
