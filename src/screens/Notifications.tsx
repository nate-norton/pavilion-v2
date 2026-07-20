import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
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
  const allMuted = today.length === 0 && earlier.length === 0;

  const renderRow = (nt: Notif) => (
    <div
      key={nt.key}
      onClick={() => routeNotif(nt.go)}
      className="flex items-center gap-3 cursor-pointer"
      style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '13px 14px' }}
    >
      <div className="w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: nt.bg }}>
        <PhIcon name={nt.icon} size={18} color={nt.color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="m-0 mb-px text-[13px] font-bold text-navy leading-[1.3]">{nt.title}</p>
        <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
          {nt.sub} · {nt.cat}
        </p>
      </div>
      {nt.unread && !state.notifsRead && (
        <span data-testid="notif-dot" className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--ember))' }} />
      )}
      <PhIcon name="ph ph-caret-right" size={13} color="rgb(var(--taupedim))" className="flex-shrink-0" />
    </div>
  );

  return (
    <div
      data-screen-label="Notifications"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--cream))', padding: '60px 18px 40px' }}
    >
      <div className="flex items-center justify-between mb-3">
        <BackButton onClick={() => set({ notifOpen: false })} className="" />
        <button
          type="button"
          onClick={() => set({ notifsRead: true })}
          className="border-none bg-transparent text-[12.5px] font-extrabold cursor-pointer font-sans p-0"
          style={{ color: 'rgb(var(--sky))' }}
        >
          Mark all read
        </button>
      </div>
      <h1 className="m-0 mb-4 font-serif font-normal text-[26px] text-navy">Activity</h1>

      {today.length > 0 && (
        <div>
          <p className="m-0 mb-[9px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Today
          </p>
          <div className="flex flex-col gap-[9px] mb-5">{today.map(renderRow)}</div>
        </div>
      )}

      {earlier.length > 0 && (
        <div>
          <p className="m-0 mb-[9px] text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Earlier
          </p>
          <div className="flex flex-col gap-[9px] mb-5">{earlier.map(renderRow)}</div>
        </div>
      )}

      {allMuted && (
        <div className="text-center" style={{ padding: '22px 16px 26px' }}>
          <PhIcon name="ph ph-bell-slash" size={32} color="rgb(var(--stonelight))" className="inline-block" />
          <p className="mt-[9px] mb-0.5 text-sm font-bold text-navy">Quiet in here</p>
          <p className="m-0 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
            Every category is muted. Turn one back on below.
          </p>
        </div>
      )}

      <div
        style={{
          background: 'rgb(var(--paper))',
          border: '1px solid rgb(var(--navy) / 0.08)',
          borderRadius: 18,
          padding: '15px 16px',
          
        }}
      >
        <p className="m-0 mb-[3px] font-serif text-[15px] text-navy">What reaches you</p>
        <p className="m-0 mb-3 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
          Tap to mute a category — urgent safety alerts always come through.
        </p>
        <div className="flex gap-2 flex-wrap">
          {NOTIF_CATS.map((c) => {
            const muted = !!state.mutedCats[c];
            return (
              <button
                key={c}
                type="button"
                onClick={() => set({ mutedCats: { ...state.mutedCats, [c]: !state.mutedCats[c] } })}
                className="inline-flex items-center gap-1.5 border-none rounded-full text-xs font-extrabold cursor-pointer font-sans"
                style={{
                  background: muted ? 'rgb(var(--sand))' : 'rgb(var(--mint))',
                  color: muted ? 'rgb(var(--stone))' : 'rgb(var(--sagedark))',
                  padding: '8px 13px',
                }}
              >
                <PhIcon name={muted ? 'ph-fill ph-bell-slash' : 'ph-fill ph-bell'} size={13} />
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 mb-0 text-center text-[11.5px] font-bold" style={{ color: 'rgb(var(--stonelight))' }}>
        The weekly digest reaches every household — even neighbors not on the app.
      </p>
    </div>
  );
}
