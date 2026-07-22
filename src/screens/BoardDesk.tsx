import { useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { usePavStore } from '../store/store';
import { useVendors, useAging, useVotes, useAssessment, useBoardTriage, useTriageItems, useBoardArcQueue, useInvites, useBoardChat, useRepository } from '../data/repo';

const BOARD_SEGS = [
  { key: 'desk', label: 'Desk' },
  { key: 'req', label: 'Requests' },
  { key: 'money', label: 'Money' },
  { key: 'comms', label: 'Comms' },
];

/** Board desk screen — ported from prototype lines 830-1278. */
export function BoardDesk() {
  const state = usePavStore();
  const VENDORS = useVendors();
  const AGING = useAging();
  const { set } = state;

  const [voteConfirm, setVoteConfirm] = useState(false);
  const [invEmail, setInvEmail] = useState('');
  const [invUnit, setInvUnit] = useState('');
  const [invRole, setInvRole] = useState<'resident' | 'board'>('resident');
  const [invBusy, setInvBusy] = useState(false);
  const invites = useInvites();
  const boardChat = useBoardChat();
  const triage = useBoardTriage();
  const { open: vote } = useVotes();
  const assessment = useAssessment();
  // The demo's Requests/Money/Comms are scripted; live renders real queues
  // (triage, ARC, votes) and hides panels with no data domain yet.
  const repo = useRepository();
  const demo = repo.isDemo();
  const triageItems = useTriageItems();
  const boardArcQueue = useBoardArcQueue();

  // Board chat card rows: General pinned first, then topics by latest activity.
  const topicMap = new Map<string, typeof boardChat>([['General', []]]);
  boardChat.forEach((m) => {
    const k = m.topic ?? 'General';
    if (!topicMap.has(k)) topicMap.set(k, []);
    topicMap.get(k)!.push(m);
  });
  const [generalThread, ...restThreads] = [...topicMap.entries()];
  restThreads.sort((a, b) =>
    boardChat.lastIndexOf(b[1][b[1].length - 1]) - boardChat.lastIndexOf(a[1][a[1].length - 1]));
  const boardTopics = [generalThread, ...restThreads];

  if (!state.boardMode) return null;

  const exitBoard = () => set({ boardMode: false });
  const boardOpenN = triage.openCount;
  const quorum = { count: vote?.quorumCount ?? 0, pct: vote?.quorumPct ?? 0 };
  const quorumTotal = vote?.quorumTotal ?? 136;

  const arcNewTitle = state.arcType || 'Exterior update';
  const arcDescTrim = state.arcDesc.trim();
  const arcDescSnippet = arcDescTrim ? (arcDescTrim.length > 42 ? arcDescTrim.slice(0, 42) + '…' : arcDescTrim) : 'no description';
  const arcAwaitingBoard = state.arcSubmitted && !state.arcApprovedByBoard;
  const reportTypeLabel = state.reportType || 'Issue';
  const nonVoters = quorumTotal - quorum.count;
  const canBc = state.bcText.trim().length > 0;
  const voteQPreview = state.voteQ.trim() || 'Your question appears here';
  const canPostVote = state.voteQ.trim().length > 0;

  const createTicket = () => set({ reportTicketed: true });
  const assignM89 = () => set({ m89Assigned: true });
  const boardApproveArc = () => set({ arcApprovedByBoard: true });
  const scheduleVendor = () => set({ gateScheduled: true });
  const sendReminder = () => set({ reminderSent: true });
  const sendCourtesy = () => set({ courtesySent: true });
  const openExport = () => set({ exportOpen: true, exportDone: null });
  const approveInv = () => set({ invApproved: true });
  const sendBroadcast = state.sendBroadcast;
  const openVoteDraft = () => set({ voteDraftOpen: true, votePosted: false });
  const postVote = state.postVote;
  const openMeeting = () => set({ meetingOpen: true });
  const publishMinutes = () => set({ minutesPublished: true });

  return (
    <div
      data-testid="board-desk"
      className="absolute inset-0 z-[75] bg-cream overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: '64px 18px 44px' }}
    >
      <div className="flex items-center justify-between gap-2.5 mb-2.5">
        <button
          onClick={exitBoard}
          className="border-0 bg-transparent flex items-center gap-[5px] text-[13px] font-extrabold cursor-pointer p-0 text-stone"
        >
          <PhIcon name="ph-bold ph-arrow-left" size={14} />
          Resident view
        </button>
        <div className="flex flex-col items-end gap-1.5">
          <span className="rounded-full px-3 py-[5px] text-[10.5px] font-bold bg-navy text-cream" style={{ letterSpacing: '0.1em' }}>
            TREASURER
          </span>
          {!demo && (
            <button
              onClick={() => set({ boardChatOpen: true, boardChatTopic: null })}
              className="flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[11px] font-extrabold cursor-pointer bg-paper text-navy"
              style={{ border: '1px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-fill ph-chats-circle" size={13} color="rgb(var(--navy))" />
              Board chat
            </button>
          )}
        </div>
      </div>
      <h1 className="m-0 mb-1 font-serif font-normal text-[28px] text-navy">Board desk</h1>
      <p className="m-0 mb-3.5 text-[13.5px] font-semibold text-taupe">
        {triage.summary}
      </p>

      <div className="grid grid-cols-3 gap-[9px] mb-3">
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--terracotta))' }}>
            Open
          </p>
          <p className="m-0 font-serif text-lg text-navy">{boardOpenN}</p>
        </div>
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--stone))' }}>
            Quorum
          </p>
          <p className="m-0 font-serif text-lg text-navy">{quorum.pct}%</p>
        </div>
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--stone))' }}>
            Collected
          </p>
          <p className="m-0 font-serif text-lg text-navy">{demo ? '96%' : '—'}</p>
        </div>
      </div>

      <div className="mb-[18px]">
        <SegmentedControl
          options={BOARD_SEGS}
          value={state.boardTab}
          onChange={(key) => set({ boardTab: key })}
          variant="dark"
        />
      </div>

      {state.boardTab === 'desk' && (
        <div>
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Triage
          </p>
          <div className="flex flex-col gap-2.5 mb-[22px]">
            {!triage.hasItems ? (
              <div className="rounded-[18px] px-4 py-[13px] flex items-center gap-2.5 bg-sand">
                <PhIcon name="ph-fill ph-check-circle" size={17} color="rgb(var(--sage))" />
                <p className="m-0 text-[12.5px] font-bold text-stone">
                  Triage queue is clear — resident reports land here instantly
                </p>
              </div>
            ) : !demo ? (
              // Live: the real report queue with board actions.
              triageItems.map((t) => {
                const resolved = t.status === 'resolved';
                const ticketed = t.status === 'ticketed' || t.status === 'assigned';
                return (
                  <div key={t.id} className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0"
                        style={{ background: resolved ? 'rgb(var(--mint))' : 'rgb(var(--blush))' }}
                      >
                        <PhIcon
                          name={resolved ? 'ph-fill ph-check-circle' : 'ph-fill ph-siren'}
                          size={20}
                          color={resolved ? 'rgb(var(--sage))' : 'rgb(var(--terracotta))'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">{t.title}</p>
                        <p className="m-0 text-xs font-semibold text-stone">{t.sub}</p>
                      </div>
                      {t.status === 'open' && (
                        <button
                          onClick={() => void repo.setReportStatus(t.id, 'ticketed')}
                          className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                        >
                          Create ticket
                        </button>
                      )}
                      {ticketed && (
                        <button
                          onClick={() => void repo.setReportStatus(t.id, 'resolved')}
                          className="rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-transparent text-navy"
                          style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                        >
                          {t.ref ? `${t.ref} · Resolve` : 'Resolve'}
                        </button>
                      )}
                      {resolved && (
                        <span className="text-[11.5px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--sage))' }}>
                          Resolved ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (<>
            {/* Streetlight */}
            <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--blush))' }}>
                  <PhIcon name="ph-fill ph-siren" size={20} color="rgb(var(--terracotta))" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">Streetlight out on Alder Way</p>
                  <p className="m-0 text-xs font-semibold text-stone">
                    Reported privately by #31 · 2h ago
                  </p>
                </div>
                {!state.reportTicketed && (
                  <button
                    onClick={createTicket}
                    className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                  >
                    Create ticket
                  </button>
                )}
                {state.reportTicketed && (
                  <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sage))' }}>
                    #M-88 ✓
                    <br />
                    BrightPath Electric
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic #M-89 */}
            {state.reportSubmitted && (
              <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--blush))' }}>
                    <PhIcon name="ph-fill ph-wrench" size={20} color="rgb(var(--terracotta))" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">{reportTypeLabel} · #M-89</p>
                    <p className="m-0 text-xs font-semibold text-stone">
                      Reported privately by #27 · just now
                    </p>
                  </div>
                  {!state.m89Assigned && (
                    <button
                      onClick={assignM89}
                      className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                    >
                      Assign vendor
                    </button>
                  )}
                  {state.m89Assigned && (
                    <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sage))' }}>
                      GreenScape ✓
                      <br />
                      Mon, Jul 6
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Dynamic ARC #A-121 */}
            {state.arcSubmitted && (
              <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
                    <PhIcon name="ph-fill ph-pencil-ruler" size={20} color="rgb(var(--skydeep))" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">ARC #A-121 · {arcNewTitle}</p>
                    <p className="m-0 text-xs font-semibold text-stone">
                      #27 Alder Way · submitted today · {arcDescSnippet}
                    </p>
                  </div>
                </div>
                {arcAwaitingBoard && (
                  <div className="flex gap-2">
                    <button
                      onClick={boardApproveArc}
                      className="flex-1 border-0 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer text-white"
                      style={{ background: 'rgb(var(--sage))' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => set({ arcNeedsInfo: true })}
                      className="flex-1 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      {state.arcNeedsInfo ? 'Info requested ✓' : 'Needs info'}
                    </button>
                  </div>
                )}
                {state.arcApprovedByBoard && (
                  <div className="rounded-[11px] px-3 py-2.5 flex items-center gap-2 animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                    <PhIcon name="ph-fill ph-seal-check" size={16} color="rgb(var(--sage))" />
                    <span className="text-[12.5px] font-bold text-sagedark">
                      Approved — resident notified, decisions log updated
                    </span>
                  </div>
                )}
              </div>
            )}
            {!state.arcSubmitted && (
              <div className="rounded-[18px] px-4 py-[13px] flex items-center gap-2.5 bg-sand">
                <PhIcon name="ph-fill ph-pencil-ruler" size={17} color="rgb(var(--stone))" />
                <p className="m-0 text-[12.5px] font-bold text-stone">
                  ARC queue is clear — new requests land here instantly
                </p>
              </div>
            )}

            {/* Pool gate */}
            <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--mint))' }}>
                  <PhIcon name="ph-fill ph-wrench" size={20} color="rgb(var(--sage))" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">Pool gate latch sticking</p>
                  <p className="m-0 text-xs font-semibold text-stone">
                    2 reports this week · non-urgent
                  </p>
                </div>
                {!state.gateScheduled && (
                  <button
                    onClick={scheduleVendor}
                    className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                  >
                    Schedule
                  </button>
                )}
                {state.gateScheduled && (
                  <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sage))' }}>
                    AquaFix ✓
                    <br />
                    Thu, Jul 3
                  </span>
                )}
              </div>
            </div>
            </>)}
          </div>

          {!demo && (
            <div className="mb-[22px]">
              <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                Board chat
              </p>
              <div className="bg-paper rounded-[18px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <PhIcon name="ph-fill ph-lock-simple" size={13} color="rgb(var(--stone))" className="flex-shrink-0" />
                  <p className="m-0 text-[11.5px] font-bold text-stone">
                    Private to board members — residents never see this.
                  </p>
                </div>
                {boardTopics.map(([name, msgs]) => {
                  const last = msgs[msgs.length - 1];
                  return (
                    <button
                      key={name}
                      onClick={() => set({ boardChatOpen: true, boardChatTopic: name })}
                      className="w-full flex items-center gap-2.5 py-2.5 px-0 border-0 bg-transparent cursor-pointer text-left"
                      style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-[11px] flex items-center justify-center flex-shrink-0"
                        style={{ background: name === 'General' ? 'rgb(var(--navy))' : 'rgb(var(--parchment))' }}
                      >
                        <PhIcon
                          name={name === 'General' ? 'ph-fill ph-push-pin' : 'ph-fill ph-hash'}
                          size={13}
                          color={name === 'General' ? 'rgb(var(--cream))' : 'rgb(var(--navy))'}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-bold text-navy">{name}</p>
                        <p className="m-0 text-[11.5px] font-semibold text-stone truncate">
                          {last ? `${last.me ? 'You' : last.authorName}: ${last.text}` : 'No messages yet'}
                        </p>
                      </div>
                      <PhIcon name="ph-bold ph-caret-right" size={12} color="rgb(var(--stonelight))" className="flex-shrink-0" />
                    </button>
                  );
                })}
                <button
                  onClick={() => set({ boardChatOpen: true, boardChatTopic: null })}
                  className="w-full rounded-full py-2.5 mt-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                  style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
                >
                  + New topic
                </button>
              </div>

              <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                Members
              </p>
              <div className="bg-paper rounded-[18px] p-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                <p className="m-0 mb-2.5 text-[13.5px] font-bold text-navy">Invite a neighbor</p>
                <input
                  value={invEmail}
                  onChange={(e) => setInvEmail(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                <div className="flex gap-2 mb-2.5">
                  <input
                    value={invUnit}
                    onChange={(e) => setInvUnit(e.target.value)}
                    placeholder="Unit — e.g. #14 Alder Way"
                    className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <button
                    onClick={() => setInvRole(invRole === 'resident' ? 'board' : 'resident')}
                    className="rounded-[11px] px-3 py-2.5 text-[12px] font-extrabold cursor-pointer bg-transparent text-navy flex-shrink-0"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    {invRole === 'resident' ? 'Resident' : 'Board'}
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (!invEmail.trim() || invBusy) return;
                    setInvBusy(true);
                    void repo.createInvite({ email: invEmail, unitLabel: invUnit, role: invRole })
                      .then(() => { setInvEmail(''); setInvUnit(''); setInvRole('resident'); })
                      .catch(() => {})
                      .finally(() => setInvBusy(false));
                  }}
                  className="w-full border-0 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer"
                  style={{
                    background: invEmail.trim() && !invBusy ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))',
                    color: invEmail.trim() && !invBusy ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
                  }}
                >
                  {invBusy ? 'Inviting…' : 'Send invite'}
                </button>
                {invites.length > 0 && (
                  <div className="mt-3 pt-2" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)' }}>
                    {invites.map((inv) => (
                      <div key={inv.id} className="flex items-center gap-2 py-1.5">
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-[12.5px] font-bold text-navy truncate">{inv.email}</p>
                          <p className="m-0 text-[11px] font-semibold text-stone">
                            {[inv.unitLabel, inv.role === 'board' ? 'Board' : 'Resident'].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {inv.status === 'pending' ? (
                          <button
                            onClick={() => void repo.revokeInvite(inv.id)}
                            className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 text-stone"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--sage))' }}>
                            Joined ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2.5 mb-0 text-[11px] font-semibold text-stone">
                  They sign in at app.pavilion.community with this email and land in the community automatically.
                </p>
              </div>
            </div>
          )}

          {vote && (<>
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Vote monitor
          </p>
          <div className="bg-navy rounded-[20px] p-[18px] mb-[22px] text-cream">
            <p className="m-0 mb-1 font-serif text-base">{vote.title} · closes Thu</p>
            <div className="flex items-center justify-between my-2.5 mb-1.5">
              <span className="text-[11.5px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
                QUORUM
              </span>
              <span className="text-[11.5px] font-bold" style={{ color: 'rgb(var(--cream) / 0.8)' }}>
                {quorum.count} of {quorumTotal} households
              </span>
            </div>
            <div className="mb-[13px]">
              <ProgressBar pct={quorum.pct} height={8} track="rgb(var(--cream) / 0.15)" gradient />
            </div>
            {!state.reminderSent && (
              <button
                onClick={sendReminder}
                className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-cream"
                style={{ border: '1.5px solid rgb(var(--cream) / 0.3)' }}
              >
                Nudge {nonVoters} households who haven&apos;t voted
              </button>
            )}
            {state.reminderSent && (
              <div className="rounded-xl px-3.5 py-[11px] flex items-center gap-[9px] animate-fadeup" style={{ background: 'rgb(var(--sage) / 0.18)', border: '1px solid rgb(var(--sage) / 0.4)' }}>
                <PhIcon name="ph-fill ph-paper-plane-tilt" size={16} color="rgb(var(--sagebright))" />
                <span className="text-[12.5px] font-bold">Reminder queued for tonight&apos;s digest — app, email &amp; SMS</span>
              </div>
            )}
          </div>
          </>)}
        </div>
      )}

      {state.boardTab === 'req' && !demo && (
        boardArcQueue.length === 0 ? (
          <div className="bg-paper rounded-[18px] px-4 py-[18px] text-center animate-fadeup" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <PhIcon name="ph-fill ph-tray" size={22} color="rgb(var(--claypale))" />
            <p className="m-0 mt-2 text-[13px] font-bold text-navy">No requests yet</p>
            <p className="m-0 mt-0.5 text-[12px] font-semibold text-stone">
              ARC requests land here as residents submit them.
            </p>
          </div>
        ) : (
          <div className="animate-fadeup">
            <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
              ARC queue
            </p>
            <div className="bg-paper rounded-[18px] px-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              {boardArcQueue.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-[11px] py-[11px]"
                  style={i < boardArcQueue.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
                >
                  <PhIcon
                    name={r.approved ? 'ph-fill ph-seal-check' : 'ph-fill ph-pencil-ruler'}
                    size={17}
                    color={r.approved ? 'rgb(var(--sage))' : 'rgb(var(--skydeep))'}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] font-bold text-navy">{r.ref} · {r.title}</p>
                    <p className="m-0 text-[11px] font-semibold text-stone">{r.unitLabel}</p>
                  </div>
                  {r.approved ? (
                    <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0" style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' }}>
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => void repo.decideArc(r.id, true)}
                      className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 text-white"
                      style={{ background: 'rgb(var(--sage))' }}
                    >
                      Approve
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      )}
      {state.boardTab === 'req' && demo && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            ARC queue
          </p>
          <div className="bg-paper rounded-[18px] px-4 mb-5" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {arcAwaitingBoard && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
                <PhIcon name="ph-fill ph-pencil-ruler" size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[13px] font-bold text-navy">#A-121 · {arcNewTitle} · #27</p>
                  <p className="m-0 text-[11px] font-semibold text-stone">
                    Submitted today · pre-approved palette
                  </p>
                </div>
                <button
                  onClick={boardApproveArc}
                  className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 text-white"
                  style={{ background: 'rgb(var(--sage))' }}
                >
                  Approve
                </button>
              </div>
            )}
            {state.arcApprovedByBoard && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
                <PhIcon name="ph-fill ph-seal-check" size={17} color="rgb(var(--sage))" className="flex-shrink-0" />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-121 · {arcNewTitle} · #27</p>
                <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold" style={{ background: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' }}>
                  Approved today
                </span>
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <PhIcon name="ph-fill ph-seal-check" size={17} color="rgb(var(--sage))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-118 · Backyard pergola · #27</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold bg-sand" style={{ color: 'rgb(var(--barkgray))' }}>
                Jun 12
              </span>
            </div>
            <div className="flex items-center gap-[11px] py-[11px]">
              <PhIcon name="ph-fill ph-seal-check" size={17} color="rgb(var(--sage))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-115 · Fence stain, Cedar · #33</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold bg-sand" style={{ color: 'rgb(var(--barkgray))' }}>
                May 30
              </span>
            </div>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Maintenance
          </p>
          <div className="bg-paper rounded-[18px] px-4 mb-5" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {state.reportSubmitted && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
                <PhIcon name="ph-fill ph-wrench" size={17} color="rgb(var(--terracotta))" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[13px] font-bold text-navy">#M-89 · {reportTypeLabel} · #27</p>
                  <p className="m-0 text-[11px] font-semibold text-stone">
                    Private report · today
                  </p>
                </div>
                {!state.m89Assigned && (
                  <button
                    onClick={assignM89}
                    className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                  >
                    Assign
                  </button>
                )}
                {state.m89Assigned && (
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--sage))' }}>
                    GreenScape ✓
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <PhIcon name="ph-fill ph-wrench" size={17} color="rgb(var(--sage))" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">Pool gate latch · 2 reports</p>
                <p className="m-0 text-[11px] font-semibold text-stone">
                  Non-urgent
                </p>
              </div>
              {!state.gateScheduled && (
                <button
                  onClick={scheduleVendor}
                  className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                >
                  Schedule
                </button>
              )}
              {state.gateScheduled && (
                <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--sage))' }}>
                  AquaFix · Thu ✓
                </span>
              )}
            </div>
            {state.reportTicketed && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
                <PhIcon name="ph-fill ph-lightbulb" size={17} color="rgb(var(--gold))" className="flex-shrink-0" />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy">#M-88 · Streetlight, Alder Way</p>
                <span className="text-[11px] font-bold flex-shrink-0" style={{ color: 'rgb(var(--sage))' }}>
                  BrightPath ✓
                </span>
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]">
              <PhIcon name="ph-fill ph-check-circle" size={17} color="rgb(var(--stonelight))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-stone">
                #M-86 · Irrigation valve · closed Jun 24
              </p>
            </div>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Violations · courtesy-first
          </p>
          <div className="bg-paper rounded-[18px] p-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex items-center gap-[11px] pb-3 mb-3" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <PhIcon name="ph-fill ph-trash" size={17} color="rgb(var(--gold))" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-bold text-navy">Trash bins visible from street · #14</p>
                <p className="m-0 text-[11px] font-semibold text-stone">
                  Courtesy notice sent Jun 27 · auto-closes if fixed by Jul 8
                </p>
              </div>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0" style={{ background: 'rgb(var(--goldpale))', color: 'rgb(var(--golddark))' }}>
                No fee
              </span>
            </div>
            <p className="m-0 text-xs font-semibold text-stone">
              <span className="font-bold text-sagedark">
                2 self-cured this month
              </span>{' '}
              · zero fines issued in 2026 · every notice cites the exact CC&amp;R section
            </p>
          </div>

          <p className="mt-5 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Vendors
          </p>
          <div className="bg-paper rounded-[18px] px-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {VENDORS.map((v, i) => {
              const insLabel = v.ins ? 'COI on file ✓' : 'COI expires Aug 1';
              const insBg = v.ins ? 'rgb(var(--mint))' : 'rgb(var(--goldpale))';
              const insColor = v.ins ? 'rgb(var(--sagedark))' : 'rgb(var(--golddark))';
              return (
                <div
                  key={v.name}
                  className="flex items-center gap-[11px] py-3"
                  style={i < VENDORS.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.06)' } : undefined}
                >
                  <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: v.bg }}>
                    <PhIcon name={v.icon} size={17} color={v.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] font-bold text-navy">{v.name}</p>
                    <p className="m-0 text-[11px] font-semibold text-stone">
                      {v.sub} · last: {v.last}
                    </p>
                  </div>
                  <span className="rounded-full px-[9px] py-[3px] text-[10px] font-bold flex-shrink-0" style={{ background: insBg, color: insColor }}>
                    {insLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.boardTab === 'money' && !demo && (
        <div className="bg-paper rounded-[18px] px-4 py-[18px] text-center animate-fadeup" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <PhIcon name="ph-fill ph-coins" size={22} color="rgb(var(--claypale))" />
          <p className="m-0 mt-2 text-[13px] font-bold text-navy">No financials yet</p>
          <p className="m-0 mt-0.5 text-[12px] font-semibold text-stone">
            Collections, budget tracking, and the aging report switch on once dues are issued.
          </p>
        </div>
      )}
      {state.boardTab === 'money' && demo && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            July collections
          </p>
          <div className="bg-paper rounded-[20px] p-[18px] mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex items-baseline justify-between gap-2.5 mb-2.5">
              <p className="m-0 font-serif text-[22px] text-navy">96% collected</p>
              <p className="m-0 text-xs font-bold text-stone">
                $38.9K of $40.5K
              </p>
            </div>
            <div className="mb-3">
              <ProgressBar pct={96} height={10} color="rgb(var(--sage))" track="rgb(var(--sand))" />
            </div>
            <p className="m-0 text-[12.5px] font-semibold text-stone">
              4 households late · courtesy reminders sent Jun 28 · no late fees yet
            </p>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Late — courtesy first
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#9 · 30 days</p>
              <span className="text-[12.5px] font-bold" style={{ color: 'rgb(var(--terracotta))' }}>
                $570
              </span>
            </div>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#33 · 8 days</p>
              <span className="text-[12.5px] font-bold text-navy">$285</span>
            </div>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#51 · 5 days</p>
              <span className="text-[12.5px] font-bold text-navy">$285</span>
            </div>
            <div className="flex items-center gap-[11px] mb-[13px]">
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#60 · 3 days</p>
              <span className="text-[12.5px] font-bold text-navy">$285</span>
            </div>
            {!state.courtesySent && (
              <button
                onClick={sendCourtesy}
                className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
                style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
              >
                Send courtesy reminders — no fees, per §9
              </button>
            )}
            {state.courtesySent && (
              <div className="rounded-xl px-3.5 py-[11px] flex items-center gap-[9px] animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-paper-plane-tilt" size={16} color="rgb(var(--sage))" />
                <span className="text-[12.5px] font-bold text-sagedark">
                  4 gentle reminders queued — a payment plan link included
                </span>
              </div>
            )}
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Budget vs. actual · 50% through the year
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-bold text-navy">Landscaping</span>
                <span className="text-[11.5px] font-bold text-stone">
                  52% of $75.6K
                </span>
              </div>
              <ProgressBar pct={52} height={8} color="rgb(var(--sage))" track="rgb(var(--sand))" />
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-bold text-navy">Utilities</span>
                <span className="text-[11.5px] font-bold text-stone">
                  48% of $46.7K
                </span>
              </div>
              <ProgressBar pct={48} height={8} color="rgb(var(--sage))" track="rgb(var(--sand))" />
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-bold text-navy">Insurance</span>
                <span className="text-[11.5px] font-bold text-stone">
                  50% of $52.4K
                </span>
              </div>
              <ProgressBar pct={50} height={8} color="rgb(var(--sage))" track="rgb(var(--sand))" />
            </div>
            <div>
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-bold text-navy">Repairs &amp; maintenance</span>
                <span className="text-[11.5px] font-bold" style={{ color: 'rgb(var(--golddark))' }}>
                  61% of $31.2K · watch
                </span>
              </div>
              <ProgressBar pct={61} height={8} color="rgb(var(--gold))" track="rgb(var(--sand))" />
            </div>
          </div>

          {assessment && (
            <>
              <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                Special assessment · roof reserve
              </p>
              <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                <div className="flex items-baseline justify-between gap-2.5 mb-2.5">
                  <p className="m-0 font-serif text-xl text-navy">$42.7K of $61.2K</p>
                  <p className="m-0 text-xs font-bold text-stone">
                    70% pledged
                  </p>
                </div>
                <div className="mb-3">
                  <ProgressBar pct={70} height={10} color="rgb(var(--terracotta))" track="rgb(var(--sand))" />
                </div>
                <p className="m-0 text-[12.5px] font-semibold text-stone">
                  96 paid in full · 22 on installments · 18 not started · due Aug 1
                </p>
              </div>
            </>
          )}

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Aging report
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {AGING.map((a) => (
              <div key={a.bucket} className="mb-[11px]">
                <div className="flex justify-between items-baseline mb-[5px]">
                  <span className="text-[12.5px] font-bold text-navy">{a.bucket}</span>
                  <span className="text-[11.5px] font-bold text-stone">
                    {a.amt} · {a.n}
                  </span>
                </div>
                <ProgressBar pct={parseInt(a.w, 10)} height={7} color={a.c} track="rgb(var(--sand))" />
              </div>
            ))}
            <button
              onClick={openExport}
              className="w-full rounded-xl py-3 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy mt-1.5 flex items-center justify-center gap-2"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-fill ph-export" size={15} />
              Export ledger — QuickBooks or CSV
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Approvals
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
                <PhIcon name="ph-fill ph-invoice" size={19} color="rgb(var(--skydeep))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13.5px] font-bold text-navy">AquaFix · $340.00</p>
                <p className="m-0 text-[11.5px] font-semibold text-stone">
                  Pool gate latch · needs 2 of 3 board signatures · 1 signed
                </p>
              </div>
              {!state.invApproved && (
                <button
                  onClick={approveInv}
                  className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                >
                  Sign
                </button>
              )}
              {state.invApproved && (
                <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sage))' }}>
                  2 of 3 ✓
                  <br />
                  ACH Thursday
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {state.boardTab === 'comms' && !demo && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Put it to a vote
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {state.votePosted ? (
              <div className="rounded-[13px] p-3.5 flex items-start gap-2.5 animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="rgb(var(--sage))" className="flex-shrink-0 mt-px" />
                <div>
                  <p className="m-0 mb-0.5 text-[13px] font-bold text-sagedark">
                    Ballot is open — &quot;{voteQPreview}&quot;
                  </p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--sagegray))' }}>
                    Live on every resident&apos;s Today screen · watch the tally on the Desk tab
                  </p>
                  <button
                    onClick={() => set({ votePosted: false, voteDraftOpen: false, voteQ: '' })}
                    className="mt-2 border-0 bg-transparent p-0 text-[11.5px] font-extrabold cursor-pointer"
                    style={{ color: 'rgb(var(--sagedark))' }}
                  >
                    Draft another →
                  </button>
                </div>
              </div>
            ) : !state.voteDraftOpen ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--blush))' }}>
                  <PhIcon name="ph-fill ph-check-square" size={20} color="rgb(var(--terracotta))" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-px text-[13.5px] font-bold text-navy">Draft a community vote</p>
                  <p className="m-0 text-[11.5px] font-semibold text-stone">
                    Ask a yes/no or A/B question — results tally live
                  </p>
                </div>
                <button
                  onClick={openVoteDraft}
                  className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                >
                  New vote
                </button>
              </div>
            ) : (
              <div className="animate-fadeup">
                <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Question</p>
                <textarea
                  value={state.voteQ}
                  onChange={(e) => set({ voteQ: e.target.value })}
                  placeholder="e.g. Should we add a second EV charger in Lot B?"
                  className="w-full rounded-[13px] px-[13px] py-[11px] text-[13.5px] font-semibold text-navy outline-none resize-none mb-3"
                  style={{ minHeight: 58, border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Choices</p>
                <div className="flex gap-2 mb-3">
                  <input
                    value={state.voteOptA}
                    onChange={(e) => set({ voteOptA: e.target.value })}
                    className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <input
                    value={state.voteOptB}
                    onChange={(e) => set({ voteOptB: e.target.value })}
                    className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                </div>
                {!voteConfirm ? (
                  <button
                    onClick={() => canPostVote && setVoteConfirm(true)}
                    disabled={!canPostVote}
                    className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                    style={{ background: canPostVote ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))', color: canPostVote ? 'rgb(var(--white))' : 'rgb(var(--stonelight))' }}
                  >
                    Open the ballot
                  </button>
                ) : (
                  <div className="flex gap-2 animate-fadeup">
                    <button
                      onClick={() => {
                        setVoteConfirm(false);
                        void repo.openVote({ question: state.voteQ, yesLabel: state.voteOptA, noLabel: state.voteOptB })
                          .then(() => set({ votePosted: true }))
                          .catch(() => {}); // failure surfaced via the app toast
                      }}
                      className="flex-1 border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                      style={{ background: 'rgb(var(--ember))', color: 'rgb(var(--white))' }}
                    >
                      Confirm — open to all households
                    </button>
                    <button
                      onClick={() => setVoteConfirm(false)}
                      className="rounded-[13px] px-4 py-[13px] text-sm font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {state.boardTab === 'comms' && demo && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Broadcast
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {!state.broadcastSent && (
              <div>
                <textarea
                  value={state.bcText}
                  onChange={(e) => set({ bcText: e.target.value })}
                  placeholder="Announce something to every household…"
                  className="w-full rounded-[13px] px-3.5 py-3 text-[13.5px] font-semibold text-navy outline-none resize-none"
                  style={{ minHeight: 74, border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                <div className="flex items-center gap-2 my-2.5 mb-3">
                  <PhIcon name="ph-fill ph-broadcast" size={14} color="rgb(var(--stone))" className="flex-shrink-0" />
                  <p className="m-0 text-[11.5px] font-bold text-stone">
                    Posts to the Commons + email digest — reaches all 136 households, including the 41% not on the app
                  </p>
                </div>
                <button
                  onClick={sendBroadcast}
                  disabled={!canBc}
                  className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold"
                  style={{ background: canBc ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))', color: canBc ? 'rgb(var(--white))' : 'rgb(var(--stonelight))', cursor: canBc ? 'pointer' : 'default' }}
                >
                  Send to 136 households
                </button>
              </div>
            )}
            {state.broadcastSent && (
              <div className="rounded-[13px] p-3.5 flex items-center gap-2.5 animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="rgb(var(--sage))" className="flex-shrink-0" />
                <span className="text-[13px] font-bold text-sagedark">
                  Sent — live in the Commons, email digest goes out at 6 PM
                </span>
              </div>
            )}
          </div>

          <p className="mt-[22px] mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Put it to a vote
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {!state.votePosted && (
              <div>
                {state.voteDraftOpen && (
                  <div className="animate-fadeup">
                    <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Question</p>
                    <textarea
                      value={state.voteQ}
                      onChange={(e) => set({ voteQ: e.target.value })}
                      placeholder="e.g. Should we add a second EV charger in Lot B?"
                      className="w-full rounded-[13px] px-[13px] py-[11px] text-[13.5px] font-semibold text-navy outline-none resize-none mb-3"
                      style={{ minHeight: 58, border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                    />
                    <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Choices</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={state.voteOptA}
                        onChange={(e) => set({ voteOptA: e.target.value })}
                        className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                      />
                      <input
                        value={state.voteOptB}
                        onChange={(e) => set({ voteOptB: e.target.value })}
                        className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                        style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                      />
                    </div>
                    <div className="rounded-xl px-[13px] py-[11px] mb-3" style={{ background: 'rgb(var(--parchment))' }}>
                      <p className="m-0 mb-[5px] text-[10.5px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--stone))' }}>
                        Residents will see
                      </p>
                      <p className="m-0 text-[13px] font-bold text-navy" style={{ lineHeight: 1.35 }}>
                        {voteQPreview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <PhIcon name="ph-fill ph-users-three" size={14} color="rgb(var(--stone))" className="flex-shrink-0" />
                      <p className="m-0 text-[11.5px] font-bold text-stone">
                        Opens to all 136 households · 7-day window · quorum 50%+1 · one ballot each
                      </p>
                    </div>
                    {!voteConfirm ? (
                      <button
                        onClick={() => canPostVote && setVoteConfirm(true)}
                        disabled={!canPostVote}
                        className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                        style={{ background: canPostVote ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))', color: canPostVote ? 'rgb(var(--white))' : 'rgb(var(--stonelight))' }}
                      >
                        Open the ballot
                      </button>
                    ) : (
                      <div className="flex gap-2 animate-fadeup">
                        <button
                          onClick={() => { postVote(); setVoteConfirm(false); }}
                          className="flex-1 border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                          style={{ background: 'rgb(var(--ember))', color: 'rgb(var(--white))' }}
                        >
                          Confirm — open to 136 households
                        </button>
                        <button
                          onClick={() => setVoteConfirm(false)}
                          className="rounded-[13px] px-4 py-[13px] text-sm font-extrabold cursor-pointer bg-transparent text-navy"
                          style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {!state.voteDraftOpen && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--blush))' }}>
                      <PhIcon name="ph-fill ph-check-square" size={20} color="rgb(var(--terracotta))" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 mb-px text-[13.5px] font-bold text-navy">Draft a community vote</p>
                      <p className="m-0 text-[11.5px] font-semibold text-stone">
                        Ask a yes/no or A/B question — results tally live
                      </p>
                    </div>
                    <button
                      onClick={openVoteDraft}
                      className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                    >
                      New vote
                    </button>
                  </div>
                )}
              </div>
            )}
            {state.votePosted && (
              <div className="rounded-[13px] p-3.5 flex items-start gap-2.5 animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="rgb(var(--sage))" className="flex-shrink-0 mt-px" />
                <div>
                  <p className="m-0 mb-0.5 text-[13px] font-bold text-sagedark">
                    Ballot is open — &quot;{voteQPreview}&quot;
                  </p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--sagegray))' }}>
                    Live on every resident&apos;s Today screen · closes in 7 days · you&apos;ll see the tally here
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Friday digest · drafted by AI
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-check-square" size={14} color="rgb(var(--terracotta))" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold text-ink">
                  Pool furniture vote closes Thursday — 61 in so far
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-popcorn" size={14} color="rgb(var(--gold))" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold text-ink">
                  Movie on the lawn Saturday at dusk — popcorn volunteers needed
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-wrench" size={14} color="rgb(var(--sage))" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold text-ink">
                  Pool gate repair Thursday morning — brief closure
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <PhIcon name="ph-fill ph-broadcast" size={13} color="rgb(var(--stone))" className="flex-shrink-0" />
              <p className="m-0 text-[11.5px] font-bold text-stone">
                Reaches all 136 households: 80 app · 44 email · 12 print
              </p>
            </div>
            <button
              onClick={() => set({ digestScheduled: true })}
              className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{
                border: '1.5px solid rgb(var(--navy) / 0.15)',
                ...(state.digestScheduled ? { background: 'rgb(var(--mint))', borderColor: 'rgb(var(--sage))', color: 'rgb(var(--sagedark))' } : {}),
              }}
            >
              {state.digestScheduled ? 'Scheduled for Friday 8 AM ✓' : 'Edit & schedule for Friday 8 AM'}
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Annual meeting prep · Jul 15
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex flex-col gap-[9px] mb-3">
              <div className="flex gap-2.5 items-center">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--taupedim))' }} />
                <span className="flex-1 text-[13px] font-bold text-navy">2027 budget ratification</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--taupedim))' }} />
                <span className="flex-1 text-[13px] font-bold text-navy">Board election — 2 seats, 3 candidates</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--taupedim))' }} />
                <span className="flex-1 text-[13px] font-bold text-navy">Pool furniture vote — results</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: 'rgb(var(--taupedim))' }} />
                <span className="flex-1 text-[13px] font-bold text-navy">Open comment (2 min each)</span>
              </div>
            </div>
            <div className="rounded-[11px] px-3 py-2.5 flex items-center gap-2.5 mb-3" style={{ background: 'rgb(var(--goldpale))' }}>
              <PhIcon name="ph-fill ph-tray" size={15} color="rgb(var(--golddark))" className="flex-shrink-0" />
              <span className="text-xs font-bold" style={{ color: 'rgb(var(--golddark))' }}>
                2 resident-submitted agenda items to review
              </span>
            </div>
            <button
              onClick={openMeeting}
              className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              Open meeting mode →
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Minutes
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--blush))' }}>
                <PhIcon name="ph-fill ph-sparkle" size={19} color="rgb(var(--terracotta))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13.5px] font-bold text-navy">June 18 minutes — drafted by AI</p>
                <p className="m-0 text-[11.5px] font-semibold text-stone">
                  From the meeting recording · 4 pp · needs your review
                </p>
              </div>
              {!state.minutesPublished && (
                <button
                  onClick={publishMinutes}
                  className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                >
                  Publish
                </button>
              )}
              {state.minutesPublished && (
                <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sage))' }}>
                  Published ✓
                  <br />
                  in Documents
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
