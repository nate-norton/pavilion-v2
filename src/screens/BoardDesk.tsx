import { useRef, useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { usePavStore } from '../store/store';
import { useVendors, useAging, useVotes, useAssessment, useBoardTriage, useTriageItems, useBoardArcQueue, useInvites, useBoardChat, useBoardViolations, useUnits, useAdminMembers, useAuditLog, useBoardBookings, useMeetings, useRepository } from '../data/repo';
import type { ThreadComment, TriageItem } from '../data/repo';

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
  const [voteKind, setVoteKind] = useState<'yesno' | 'options'>('yesno');
  const [voteOpts, setVoteOpts] = useState<string[]>(['', '']);
  const [voteMulti, setVoteMulti] = useState(false);
  const [voteDays, setVoteDays] = useState<number | null>(7);
  const [arcDecideId, setArcDecideId] = useState<string | null>(null);
  const [arcNote, setArcNote] = useState('');
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);
  const [rosterOpenId, setRosterOpenId] = useState<string | null>(null);
  const [rosterUnit, setRosterUnit] = useState('');
  const [violDraftOpen, setViolDraftOpen] = useState(false);
  const [violUnitId, setViolUnitId] = useState('');
  const [violTitle, setViolTitle] = useState('');
  const [violDesc, setViolDesc] = useState('');
  const [violSeverity, setViolSeverity] = useState<'courtesy' | 'warning' | 'fine'>('courtesy');
  const [violFine, setViolFine] = useState('');
  const [meetDraftOpen, setMeetDraftOpen] = useState(false);
  const [meetTitle, setMeetTitle] = useState('');
  const [meetWhen, setMeetWhen] = useState('');
  const [meetWhere, setMeetWhere] = useState('');
  const [meetAgenda, setMeetAgenda] = useState('');
  const minutesFileRef = useRef<HTMLInputElement>(null);
  const [evDraftOpen, setEvDraftOpen] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evWhen, setEvWhen] = useState('');
  const [evWhere, setEvWhere] = useState('');
  const boardViolations = useBoardViolations();
  const units = useUnits();
  const adminMembers = useAdminMembers();
  const auditLog = useAuditLog();
  const boardBookings = useBoardBookings();
  const meetings = useMeetings();
  const [invEmail, setInvEmail] = useState('');
  const [invUnit, setInvUnit] = useState('');
  const [invRole, setInvRole] = useState<'resident' | 'board'>('resident');
  const [invBusy, setInvBusy] = useState(false);
  const invites = useInvites();
  const boardChat = useBoardChat();
  const triage = useBoardTriage();
  const { open: vote, openAll: openVotes } = useVotes();
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
  const canPostVote = state.voteQ.trim().length > 0
    && (demo || voteKind === 'yesno' || voteOpts.filter((o) => o.trim()).length >= 2);

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
            BOARD
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

      {/*
        Collected has no live source yet, and a tile that can only ever render
        an em-dash is decoration. It shows where there is a number behind it
        and the row closes to two columns where there isn't.
      */}
      <div className={'grid gap-[9px] mb-3 ' + (demo ? 'grid-cols-3' : 'grid-cols-2')}>
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
        {demo && (
          <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            <p className="m-0 mb-0.5 text-[10px] font-bold uppercase" style={{ letterSpacing: '0.08em', color: 'rgb(var(--stone))' }}>
              Collected
            </p>
            <p className="m-0 font-serif text-lg text-navy">96%</p>
          </div>
        )}
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
              triageItems.map((t) => <TriageCard key={t.id} item={t} />)
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
                  <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sagedark))' }}>
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
                    <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sagedark))' }}>
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
                  <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sagedark))' }}>
                    AquaFix ✓
                    <br />
                    Thu, Jul 3
                  </span>
                )}
              </div>
            </div>
            </>)}
          </div>

          {!demo && (<>
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
                            {[inv.unitLabel, inv.role === 'board' ? 'Board' : 'Resident', inv.expiresLabel].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {inv.status === 'pending' || inv.status === 'expired' ? (
                          <>
                            <button
                              onClick={() => {
                                void navigator.clipboard?.writeText(`https://app.pavilion.community/?invite=${inv.code}`);
                                setCopiedInvite(inv.id);
                                setTimeout(() => setCopiedInvite(null), 2000);
                              }}
                              className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1"
                              style={{ color: copiedInvite === inv.id ? 'rgb(var(--sage))' : 'rgb(var(--terracotta))' }}
                            >
                              {copiedInvite === inv.id ? 'Copied ✓' : 'Copy link'}
                            </button>
                            {inv.status === 'expired' ? (
                              <button
                                onClick={() => void repo.renewInvite(inv.id)}
                                className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 text-navy"
                              >
                                Renew
                              </button>
                            ) : (
                              <button
                                onClick={() => void repo.revokeInvite(inv.id)}
                                className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 text-stone"
                              >
                                Revoke
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
                            Joined ✓
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-2.5 mb-0 text-[11px] font-semibold text-stone">
                  They can sign in with this email, or use the copied invite link with any email.
                </p>
              </div>

              {/* Roster — role, unit, and status admin */}
              {adminMembers.length > 0 && (
                <div className="bg-paper rounded-[18px] p-4 mt-3" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                  <p className="m-0 mb-1.5 text-[13.5px] font-bold text-navy">Roster</p>
                  {adminMembers.map((m) => (
                    <div key={m.membershipId} className="py-2" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="m-0 text-[12.5px] font-bold text-navy truncate">
                            {m.name}
                            {m.status !== 'active' && <span className="ml-1.5 text-[10.5px] font-extrabold text-stone">INACTIVE</span>}
                          </p>
                          <p className="m-0 text-[11px] font-semibold text-stone">
                            {[m.unitLabel || 'No unit', m.role === 'board' ? 'Board' : 'Resident'].join(' · ')}
                          </p>
                        </div>
                        <button
                          onClick={() => setRosterOpenId(rosterOpenId === m.membershipId ? null : m.membershipId)}
                          className="border-none bg-transparent text-[11.5px] font-extrabold cursor-pointer p-1 text-navy"
                        >
                          {rosterOpenId === m.membershipId ? 'Close' : 'Manage'}
                        </button>
                      </div>
                      {rosterOpenId === m.membershipId && (
                        <div className="mt-2 animate-fadeup">
                          <div className="flex gap-1.5 mb-2">
                            <button
                              onClick={() => void repo.setMemberRole(m.membershipId, m.role === 'board' ? 'resident' : 'board')}
                              className="flex-1 rounded-full py-1.5 text-[11px] font-extrabold cursor-pointer bg-transparent text-navy"
                              style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                            >
                              Make {m.role === 'board' ? 'resident' : 'board'}
                            </button>
                            <button
                              onClick={() => void repo.setMemberStatus(m.membershipId, m.status === 'active' ? 'inactive' : 'active')}
                              className="flex-1 rounded-full py-1.5 text-[11px] font-extrabold cursor-pointer bg-transparent"
                              style={{ border: '1.5px solid rgb(var(--navy) / 0.2)', color: m.status === 'active' ? 'rgb(var(--terracotta))' : 'rgb(var(--sage))' }}
                            >
                              {m.status === 'active' ? 'Deactivate' : 'Reactivate'}
                            </button>
                          </div>
                          <div className="flex gap-1.5">
                            <input
                              value={rosterUnit}
                              onChange={(e) => setRosterUnit(e.target.value)}
                              placeholder={m.unitLabel || 'Assign a unit'}
                              className="flex-1 rounded-[11px] px-3 py-1.5 text-[12px] font-bold text-navy outline-none min-w-0"
                              style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                            />
                            <button
                              onClick={() => { if (rosterUnit.trim()) { void repo.assignMemberUnit(m.membershipId, rosterUnit); setRosterUnit(''); } }}
                              className="border-0 rounded-[11px] px-3 text-[11px] font-extrabold cursor-pointer bg-navy text-cream"
                            >
                              Move
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Compliance — issue and track violations */}
            <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
              Compliance
            </p>
            <div className="bg-paper rounded-[18px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              {boardViolations.map((v) => (
                <div key={v.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[12.5px] font-bold text-navy truncate">{v.title}</p>
                    <p className="m-0 text-[11px] font-semibold text-stone">
                      {[v.unitLabel, v.severity === 'fine' ? `Fine ${v.fineLabel}` : v.severity === 'warning' ? 'Warning' : 'Courtesy', v.status === 'fixed' ? 'Marked fixed by resident' : 'Open'].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <button
                    onClick={() => void repo.resolveViolation(v.id)}
                    className="rounded-full px-3 py-1.5 text-[11px] font-extrabold cursor-pointer bg-transparent text-navy flex-shrink-0"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                  >
                    Resolve
                  </button>
                </div>
              ))}
              {!violDraftOpen ? (
                <button
                  onClick={() => setViolDraftOpen(true)}
                  className="w-full rounded-full py-2.5 mt-2 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                  style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
                >
                  + Issue a notice
                </button>
              ) : (
                <div className="mt-2 animate-fadeup">
                  <select
                    value={violUnitId}
                    onChange={(e) => setViolUnitId(e.target.value)}
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  >
                    <option value="">Pick a unit…</option>
                    {units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}
                  </select>
                  <input
                    value={violTitle}
                    onChange={(e) => setViolTitle(e.target.value)}
                    placeholder="Notice — e.g. Trash bins out past pickup day"
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <input
                    value={violDesc}
                    onChange={(e) => setViolDesc(e.target.value)}
                    placeholder="Details the resident will see (optional)"
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <div className="flex gap-1.5 mb-2">
                    {(['courtesy', 'warning', 'fine'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setViolSeverity(s)}
                        className="flex-1 rounded-full py-2 text-[11.5px] font-extrabold cursor-pointer capitalize"
                        style={violSeverity === s
                          ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', border: '1.5px solid rgb(var(--navy))' }
                          : { background: 'transparent', color: 'rgb(var(--navy))', border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {violSeverity === 'fine' && (
                    <input
                      value={violFine}
                      onChange={(e) => setViolFine(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="Fine amount — e.g. 50"
                      className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                      style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                    />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViolDraftOpen(false)}
                      className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!violUnitId || !violTitle.trim()) return;
                        void repo.createViolation({
                          unitId: violUnitId, title: violTitle, description: violDesc,
                          severity: violSeverity, fineCents: Math.round((parseFloat(violFine) || 0) * 100),
                        }).then(() => {
                          setViolDraftOpen(false); setViolTitle(''); setViolDesc(''); setViolUnitId(''); setViolFine(''); setViolSeverity('courtesy');
                        }).catch(() => {});
                      }}
                      className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                      style={{ background: violUnitId && violTitle.trim() ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))' }}
                    >
                      Issue notice
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bookings across the community */}
            {boardBookings.length > 0 && (
              <>
                <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                  Bookings
                </p>
                <div className="bg-paper rounded-[18px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                  {boardBookings.map((b, i) => (
                    <div key={b.id} className="flex items-center gap-2 py-1.5" style={i < boardBookings.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.06)' } : undefined}>
                      <p className="m-0 flex-1 text-[12.5px] font-bold text-navy truncate">{b.amenity}</p>
                      <p className="m-0 text-[11.5px] font-semibold text-stone">{b.dayLabel} · {b.slotLabel} · {b.memberName}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Meetings — schedule + publish minutes */}
            <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
              Meetings
            </p>
            <div className="bg-paper rounded-[18px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
              {meetings.map((m) => (
                <div key={m.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[12.5px] font-bold text-navy truncate">{m.title}</p>
                    <p className="m-0 text-[11px] font-semibold text-stone">{[m.whenLabel, m.whereLabel].filter(Boolean).join(' · ')}</p>
                  </div>
                  {m.minutesUrl ? (
                    <a href={m.minutesUrl} target="_blank" rel="noreferrer" className="text-[11.5px] font-extrabold no-underline flex-shrink-0" style={{ color: 'rgb(var(--terracotta))' }}>
                      Minutes →
                    </a>
                  ) : (
                    <>
                      <input
                        ref={minutesFileRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void repo.publishMinutes(m.id, f).catch(() => {});
                        }}
                      />
                      <button
                        onClick={() => minutesFileRef.current?.click()}
                        className="rounded-full px-3 py-1.5 text-[11px] font-extrabold cursor-pointer bg-transparent text-navy flex-shrink-0"
                        style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                      >
                        Publish minutes
                      </button>
                    </>
                  )}
                </div>
              ))}
              {!meetDraftOpen ? (
                <button
                  onClick={() => setMeetDraftOpen(true)}
                  className="w-full rounded-full py-2.5 mt-2 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                  style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
                >
                  + Schedule a meeting
                </button>
              ) : (
                <div className="mt-2 animate-fadeup">
                  <input
                    value={meetTitle}
                    onChange={(e) => setMeetTitle(e.target.value)}
                    placeholder="Title — e.g. July board meeting"
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <div className="flex gap-2 mb-2">
                    <input
                      value={meetWhen}
                      onChange={(e) => setMeetWhen(e.target.value)}
                      placeholder="When — Tue Aug 4, 7 PM"
                      className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                      style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                    />
                    <input
                      value={meetWhere}
                      onChange={(e) => setMeetWhere(e.target.value)}
                      placeholder="Where"
                      className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                      style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                    />
                  </div>
                  <input
                    value={meetAgenda}
                    onChange={(e) => setMeetAgenda(e.target.value)}
                    placeholder="Agenda items, comma-separated"
                    className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                    style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMeetDraftOpen(false)}
                      className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!meetTitle.trim()) return;
                        void repo.createMeeting({ title: meetTitle, whenLabel: meetWhen, whereLabel: meetWhere, agenda: meetAgenda.split(',') })
                          .then(() => { setMeetDraftOpen(false); setMeetTitle(''); setMeetWhen(''); setMeetWhere(''); setMeetAgenda(''); })
                          .catch(() => {});
                      }}
                      className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                      style={{ background: meetTitle.trim() ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              )}
              <p className="mt-2.5 mb-0 text-[11px] font-semibold text-stone">
                Residents see meetings on the HOA tab; published minutes land in Documents.
              </p>
            </div>

            {/* Recent board activity (audit trail) */}
            {auditLog.length > 0 && (
              <>
                <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                  Recent activity
                </p>
                <div className="bg-paper rounded-[18px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                  {auditLog.slice(0, 8).map((a, i) => (
                    <p key={a.id} className="m-0 py-1.5 text-[12px] font-semibold text-navy" style={i < Math.min(auditLog.length, 8) - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.06)' } : undefined}>
                      <strong>{a.actorName}</strong> · {a.action}{a.detail ? ` — ${a.detail}` : ''}{' '}
                      <span className="text-stone">· {a.time}</span>
                    </p>
                  ))}
                </div>
              </>
            )}
          </>)}

          {vote && (<>
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Vote monitor
          </p>
          <div className="bg-navy rounded-[20px] p-[18px] mb-[22px] text-cream">
            <p className="m-0 mb-1 font-serif text-base">{demo ? `${vote.title} · closes Thu` : vote.title}</p>
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
            <div className="flex justify-center"><PhIcon name="ph-fill ph-tray" size={22} color="rgb(var(--claypale))" /></div>
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
              {boardArcQueue.map((r, i) => {
                const settled = r.status === 'approved' || r.status === 'declined';
                const pill = r.status === 'approved'
                  ? { label: 'Approved', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' }
                  : r.status === 'declined'
                    ? { label: 'Declined', bg: 'rgb(var(--blush))', color: 'rgb(var(--terracotta))' }
                    : r.status === 'info_requested'
                      ? { label: 'Info requested', bg: 'rgb(var(--goldpale))', color: 'rgb(var(--golddark))' }
                      : null;
                const deciding = arcDecideId === r.id;
                return (
                  <div
                    key={r.id}
                    className="py-[11px]"
                    style={i < boardArcQueue.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}
                  >
                    <div className="flex items-center gap-[11px]">
                      <PhIcon
                        name={r.approved ? 'ph-fill ph-seal-check' : 'ph-fill ph-pencil-ruler'}
                        size={17}
                        color={r.approved ? 'rgb(var(--sage))' : 'rgb(var(--skydeep))'}
                        className="flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-bold text-navy">{r.ref} · {r.title}</p>
                        <p className="m-0 text-[11px] font-semibold text-stone">
                          {r.unitLabel}
                          {r.attachmentUrls.length > 0 && (
                            <>
                              {' · '}
                              {r.attachmentUrls.map((u, j) => (
                                <a key={u} href={u} target="_blank" rel="noreferrer" className="font-extrabold no-underline" style={{ color: 'rgb(var(--terracotta))' }}>
                                  file {j + 1}{j < r.attachmentUrls.length - 1 ? ', ' : ''}
                                </a>
                              ))}
                            </>
                          )}
                        </p>
                      </div>
                      {settled || r.status === 'info_requested' ? (
                        <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold flex-shrink-0" style={{ background: pill!.bg, color: pill!.color }}>
                          {pill!.label}
                        </span>
                      ) : (
                        <button
                          onClick={() => { setArcDecideId(deciding ? null : r.id); setArcNote(''); }}
                          className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
                        >
                          {deciding ? 'Cancel' : 'Decide'}
                        </button>
                      )}
                    </div>
                    {deciding && (
                      <div className="mt-2.5 animate-fadeup">
                        <input
                          value={arcNote}
                          onChange={(e) => setArcNote(e.target.value)}
                          placeholder="Note — conditions, reason, or what's missing (optional for approval)"
                          className="w-full rounded-[11px] px-3 py-2.5 text-[12.5px] font-bold text-navy outline-none mb-2"
                          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => { setArcDecideId(null); void repo.decideArc(r.id, 'approved', '', arcNote); }}
                            className="flex-1 border-0 rounded-full py-2 text-[11.5px] font-extrabold cursor-pointer text-white"
                            style={{ background: 'rgb(var(--sage))' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { if (arcNote.trim()) { setArcDecideId(null); void repo.decideArc(r.id, 'declined', arcNote); } }}
                            className="flex-1 border-0 rounded-full py-2 text-[11.5px] font-extrabold cursor-pointer text-white"
                            style={{ background: arcNote.trim() ? 'rgb(var(--terracotta))' : 'rgb(var(--sandpale))' }}
                            title="A decline needs a reason"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => { if (arcNote.trim()) { setArcDecideId(null); void repo.decideArc(r.id, 'info_requested', arcNote); } }}
                            className="flex-1 rounded-full py-2 text-[11.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                            style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                            title="Tell them what's missing"
                          >
                            Needs info
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold bg-sand" style={{ color: 'rgb(var(--stone))' }}>
                Jun 12
              </span>
            </div>
            <div className="flex items-center gap-[11px] py-[11px]">
              <PhIcon name="ph-fill ph-seal-check" size={17} color="rgb(var(--sage))" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-115 · Fence stain, Cedar · #33</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-bold bg-sand" style={{ color: 'rgb(var(--stone))' }}>
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
          <div className="flex justify-center"><PhIcon name="ph-fill ph-coins" size={22} color="rgb(var(--claypale))" /></div>
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
                <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sagedark))' }}>
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
                  <p className="m-0 mb-0.5 text-[13px] font-bold text-sagedarkdark">
                    Ballot is open — &quot;{voteQPreview}&quot;
                  </p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--sagedark))' }}>
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
                    Yes/no or multiple choice — results tally live
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
                <div className="flex gap-2 mb-3">
                  {(['yesno', 'options'] as const).map((k) => (
                    <button
                      key={k}
                      onClick={() => setVoteKind(k)}
                      className="flex-1 rounded-[11px] py-2 text-[12px] font-extrabold cursor-pointer"
                      style={voteKind === k
                        ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', border: '1.5px solid rgb(var(--navy))' }
                        : { background: 'transparent', color: 'rgb(var(--navy))', border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      {k === 'yesno' ? 'Yes / No' : 'Multiple choice'}
                    </button>
                  ))}
                </div>
                {voteKind === 'yesno' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Options</p>
                    {voteOpts.map((opt, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          value={opt}
                          onChange={(e) => setVoteOpts(voteOpts.map((o, j) => (j === i ? e.target.value : o)))}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                          style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                        />
                        {voteOpts.length > 2 && (
                          <button
                            onClick={() => setVoteOpts(voteOpts.filter((_, j) => j !== i))}
                            className="w-9 rounded-[11px] border-0 cursor-pointer flex items-center justify-center"
                            style={{ background: 'rgb(var(--sandpale))' }}
                          >
                            <PhIcon name="ph-bold ph-x" size={12} color="rgb(var(--stone))" />
                          </button>
                        )}
                      </div>
                    ))}
                    {voteOpts.length < 6 && (
                      <button
                        onClick={() => setVoteOpts([...voteOpts, ''])}
                        className="w-full rounded-[11px] py-2 mb-2 text-[12px] font-extrabold cursor-pointer bg-transparent text-navy"
                        style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
                      >
                        + Add option
                      </button>
                    )}
                    <button
                      onClick={() => setVoteMulti(!voteMulti)}
                      className="flex items-center gap-2 mb-3 bg-transparent border-0 p-0 cursor-pointer text-[12px] font-bold text-navy"
                    >
                      <span className="w-4 h-4 rounded-[5px] flex items-center justify-center" style={{ border: '1.5px solid rgb(var(--navy) / 0.3)', background: voteMulti ? 'rgb(var(--navy))' : 'transparent' }}>
                        {voteMulti && <PhIcon name="ph-bold ph-check" size={10} color="rgb(var(--cream))" />}
                      </span>
                      Allow picking more than one
                    </button>
                  </>
                )}
                <p className="m-0 mb-[7px] text-[11.5px] font-bold text-navy">Closes</p>
                <div className="flex gap-2 mb-3">
                  {([['3 days', 3], ['1 week', 7], ['2 weeks', 14], ['No deadline', null]] as const).map(([label, days]) => (
                    <button
                      key={label}
                      onClick={() => setVoteDays(days)}
                      className="flex-1 rounded-[11px] py-2 text-[11.5px] font-extrabold cursor-pointer"
                      style={voteDays === days
                        ? { background: 'rgb(var(--navy))', color: 'rgb(var(--cream))', border: '1.5px solid rgb(var(--navy))' }
                        : { background: 'transparent', color: 'rgb(var(--navy))', border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {!voteConfirm ? (
                  <button
                    onClick={() => canPostVote && setVoteConfirm(true)}
                    disabled={!canPostVote}
                    className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                    style={{ background: canPostVote ? 'rgb(var(--emberdeep))' : 'rgb(var(--sandpale))', color: canPostVote ? 'rgb(var(--white))' : 'rgb(var(--stonelight))' }}
                  >
                    Open the ballot
                  </button>
                ) : (
                  <div className="flex gap-2 animate-fadeup">
                    <button
                      onClick={() => {
                        setVoteConfirm(false);
                        void repo.openVote({
                          question: state.voteQ,
                          yesLabel: state.voteOptA,
                          noLabel: state.voteOptB,
                          kind: voteKind,
                          options: voteOpts.map((o) => o.trim()).filter(Boolean),
                          multi: voteMulti,
                          closesAt: voteDays ? new Date(Date.now() + voteDays * 86400_000).toISOString() : null,
                        })
                          .then(() => set({ votePosted: true }))
                          .catch(() => {}); // failure surfaced via the app toast
                      }}
                      className="flex-1 border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                      style={{ background: 'rgb(var(--emberdeep))', color: 'rgb(var(--white))' }}
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

          {/* Open ballots — live tallies + close */}
          {openVotes.length > 0 && (
            <>
              <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
                Open ballots
              </p>
              <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
                {openVotes.map((v, i) => (
                  <div key={v.id} className="py-2" style={i < openVotes.length - 1 ? { borderBottom: '1px solid rgb(var(--navy) / 0.07)' } : undefined}>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="m-0 text-[13px] font-bold text-navy truncate">{v.title}</p>
                        <p className="m-0 text-[11.5px] font-semibold text-stone">
                          {v.kind === 'options'
                            ? v.options.map((o) => `${o.label} ${o.tally}`).join(' · ')
                            : `${v.yesLabel} ${v.yesCount} · ${v.noLabel} ${v.noCount}`}
                          {` · quorum ${v.quorumCount}/${v.quorumTotal}`}
                        </p>
                      </div>
                      <button
                        onClick={() => void repo.closeVote(v.id)}
                        className="rounded-full px-3 py-1.5 text-[11.5px] font-extrabold cursor-pointer bg-transparent text-navy flex-shrink-0"
                        style={{ border: '1.5px solid rgb(var(--navy) / 0.2)' }}
                      >
                        Close ballot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Community event */}
          <p className="m-0 mb-2.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--stone))' }}>
            Events
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
            {!evDraftOpen ? (
              <button
                onClick={() => setEvDraftOpen(true)}
                className="w-full rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                style={{ border: '1.5px dashed rgb(var(--navy) / 0.25)' }}
              >
                + Create a community event
              </button>
            ) : (
              <div className="animate-fadeup">
                <input
                  value={evTitle}
                  onChange={(e) => setEvTitle(e.target.value)}
                  placeholder="Title — e.g. Summer BBQ at the clubhouse"
                  className="w-full rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none mb-2"
                  style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
                />
                <div className="flex gap-2 mb-2">
                  <input
                    value={evWhen}
                    onChange={(e) => setEvWhen(e.target.value)}
                    placeholder="When — Sat Aug 9 · 5 PM"
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
                    onClick={() => setEvDraftOpen(false)}
                    className="flex-1 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                    style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!evTitle.trim()) return;
                      void repo.createEvent({ title: evTitle, whenLabel: evWhen, whereLabel: evWhere })
                        .then(() => { setEvDraftOpen(false); setEvTitle(''); setEvWhen(''); setEvWhere(''); })
                        .catch(() => {});
                    }}
                    className="flex-1 border-0 rounded-full py-2.5 text-[12.5px] font-extrabold cursor-pointer text-cream"
                    style={{ background: evTitle.trim() ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))' }}
                  >
                    Publish event
                  </button>
                </div>
              </div>
            )}
            <p className="mt-2.5 mb-0 text-[11px] font-semibold text-stone">
              Shows on every resident&apos;s Today screen with one-tap RSVP.
            </p>
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
                  style={{ background: canBc ? 'rgb(var(--emberdeep))' : 'rgb(var(--sandpale))', color: canBc ? 'rgb(var(--white))' : 'rgb(var(--stonelight))', cursor: canBc ? 'pointer' : 'default' }}
                >
                  Send to 136 households
                </button>
              </div>
            )}
            {state.broadcastSent && (
              <div className="rounded-[13px] p-3.5 flex items-center gap-2.5 animate-fadeup" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="rgb(var(--sage))" className="flex-shrink-0" />
                <span className="text-[13px] font-bold text-sagedarkdark">
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
                        style={{ background: canPostVote ? 'rgb(var(--emberdeep))' : 'rgb(var(--sandpale))', color: canPostVote ? 'rgb(var(--white))' : 'rgb(var(--stonelight))' }}
                      >
                        Open the ballot
                      </button>
                    ) : (
                      <div className="flex gap-2 animate-fadeup">
                        <button
                          onClick={() => { postVote(); setVoteConfirm(false); }}
                          className="flex-1 border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                          style={{ background: 'rgb(var(--emberdeep))', color: 'rgb(var(--white))' }}
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
                  <p className="m-0 mb-0.5 text-[13px] font-bold text-sagedarkdark">
                    Ballot is open — &quot;{voteQPreview}&quot;
                  </p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--sagedark))' }}>
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
                <span className="text-[11.5px] font-bold flex-shrink-0 text-right" style={{ color: 'rgb(var(--sagedark))' }}>
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

/**
 * One live triage report: status flow (open → ticketed → in progress →
 * resolved), urgency badge, and an expandable panel with photos, vendor
 * assignment, private board notes, and the reporter thread.
 */
function TriageCard({ item: t }: { item: TriageItem }) {
  const repo = useRepository();
  const [open, setOpen] = useState(false);
  const [vendor, setVendor] = useState(t.vendor);
  const [notes, setNotes] = useState(t.boardNotes);
  const [thread, setThread] = useState<ThreadComment[]>([]);
  const [reply, setReply] = useState('');

  const resolved = t.status === 'resolved';
  const working = t.status === 'in_progress';
  const ticketed = t.status === 'ticketed' || t.status === 'assigned';

  const loadThread = () => { void repo.listReportComments(t.id).then(setThread); };
  const toggle = () => { if (!open) loadThread(); setOpen(!open); };
  const sendReply = () => {
    if (!reply.trim()) return;
    void repo.addReportComment(t.id, reply).then(() => { setReply(''); loadThread(); }).catch(() => {});
  };

  const urgencyPill = t.urgency === 'urgent'
    ? { label: 'URGENT', bg: 'rgb(var(--blush))', color: 'rgb(var(--terracotta))' }
    : t.urgency === 'low'
      ? { label: 'LOW', bg: 'rgb(var(--sand))', color: 'rgb(var(--stone))' }
      : null;

  return (
    <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
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
        <button onClick={toggle} className="flex-1 min-w-0 border-0 bg-transparent p-0 text-left cursor-pointer">
          <p className="m-0 mb-0.5 text-[13.5px] font-bold text-navy">
            {urgencyPill && (
              <span className="rounded-full px-[7px] py-[2px] text-[9.5px] font-extrabold mr-1.5 align-middle" style={{ background: urgencyPill.bg, color: urgencyPill.color, letterSpacing: '0.06em' }}>
                {urgencyPill.label}
              </span>
            )}
            {t.title}
          </p>
          <p className="m-0 text-xs font-semibold text-stone">
            {t.sub}{t.location ? ` · ${t.location}` : ''}{t.vendor ? ` · ${t.vendor}` : ''}
          </p>
        </button>
        {t.status === 'open' && (
          <button
            onClick={() => void repo.setReportStatus(t.id, 'ticketed')}
            className="border-0 rounded-full px-[13px] py-2 text-xs font-extrabold cursor-pointer flex-shrink-0 bg-navy text-cream"
          >
            Create ticket
          </button>
        )}
        {(ticketed || working) && (
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

      {open && (
        <div className="mt-3 animate-fadeup" style={{ borderTop: '1px solid rgb(var(--navy) / 0.07)', paddingTop: 12 }}>
          {t.photoUrls.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pav-scroll">
              {t.photoUrls.map((u) => (
                <a key={u} href={u} target="_blank" rel="noreferrer" className="flex-shrink-0">
                  <img src={u} alt="Attached photo" className="rounded-[11px] block" style={{ height: 84, width: 84, objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          )}
          {!resolved && (
            <div className="flex gap-2 mb-2.5">
              <input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Assign — vendor or person"
                className="flex-1 rounded-[11px] px-3 py-2 text-[12.5px] font-bold text-navy outline-none min-w-0"
                style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
              />
              <button
                onClick={() => { if (vendor.trim()) void repo.assignReport(t.id, vendor); }}
                className="border-0 rounded-[11px] px-3 text-[11.5px] font-extrabold cursor-pointer bg-navy text-cream flex-shrink-0"
              >
                Assign
              </button>
            </div>
          )}
          <div className="flex gap-2 mb-2.5">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Board-only notes"
              className="flex-1 rounded-[11px] px-3 py-2 text-[12.5px] font-bold text-navy outline-none min-w-0"
              style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
            />
            <button
              onClick={() => void repo.setReportNotes(t.id, notes)}
              className="rounded-[11px] px-3 text-[11.5px] font-extrabold cursor-pointer bg-transparent text-navy flex-shrink-0"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              Save
            </button>
          </div>
          {thread.map((c) => (
            <p key={c.id} className="m-0 mb-1 text-[12px] font-semibold text-navy">
              <strong>{c.me ? 'You' : c.authorName}:</strong> {c.body}{' '}
              <span className="text-stone" style={{ fontSize: 10.5 }}>· {c.time}</span>
            </p>
          ))}
          <div className="flex gap-2 mt-1.5">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendReply(); }}
              placeholder="Message the reporter…"
              className="flex-1 rounded-full px-3 py-2 text-[12.5px] font-bold text-navy outline-none min-w-0"
              style={{ border: '1px solid rgb(var(--navy) / 0.12)', background: 'rgb(var(--parchment))' }}
            />
            <button
              type="button"
              aria-label="Send reply"
              onClick={sendReply}
              className="w-8 h-8 border-0 rounded-full cursor-pointer flex items-center justify-center flex-shrink-0"
              style={{ background: reply.trim() ? 'rgb(var(--navy))' : 'rgb(var(--sandpale))' }}
            >
              <PhIcon name="ph-fill ph-paper-plane-right" size={12} color="rgb(var(--cream))" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
