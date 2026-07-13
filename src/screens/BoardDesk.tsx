import { useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { usePavStore } from '../store/store';
import { getTriage, getBoardOpenCount, getQuorum } from '../store/selectors';
import { VENDORS, AGING } from '../data';

const BOARD_SEGS = [
  { key: 'desk', label: 'Desk' },
  { key: 'req', label: 'Requests' },
  { key: 'money', label: 'Money' },
  { key: 'comms', label: 'Comms' },
];

/** Board desk screen — ported from prototype lines 830-1278. */
export function BoardDesk() {
  const state = usePavStore();
  const { set } = state;

  const [voteConfirm, setVoteConfirm] = useState(false);

  if (!state.boardMode) return null;

  const exitBoard = () => set({ boardMode: false });
  const triage = getTriage(state);
  const boardOpenN = getBoardOpenCount(state);
  const quorum = getQuorum(state);

  const arcNewTitle = state.arcType || 'Exterior update';
  const arcDescTrim = state.arcDesc.trim();
  const arcDescSnippet = arcDescTrim ? (arcDescTrim.length > 42 ? arcDescTrim.slice(0, 42) + '…' : arcDescTrim) : 'no description';
  const arcAwaitingBoard = state.arcSubmitted && !state.arcApprovedByBoard;
  const reportTypeLabel = state.reportType || 'Issue';
  const nonVoters = 136 - quorum.count;
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
        <span className="rounded-full px-3 py-[5px] text-[10.5px] font-extrabold bg-navy text-cream" style={{ letterSpacing: '0.1em' }}>
          TREASURER
        </span>
      </div>
      <h1 className="m-0 mb-1 font-serif font-normal text-[28px] text-navy">Board desk</h1>
      <p className="m-0 mb-3.5 text-[13.5px] font-semibold" style={{ color: '#7A7365' }}>
        {triage.summary}
      </p>

      <div className="grid grid-cols-3 gap-[9px] mb-3">
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-extrabold uppercase" style={{ letterSpacing: '0.08em', color: '#C75A31' }}>
            Open
          </p>
          <p className="m-0 font-serif text-lg text-navy">{boardOpenN}</p>
        </div>
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-extrabold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
            Quorum
          </p>
          <p className="m-0 font-serif text-lg text-navy">{quorum.pct}%</p>
        </div>
        <div className="bg-paper rounded-[15px] p-[11px_10px] text-center" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
          <p className="m-0 mb-0.5 text-[10px] font-extrabold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
            Collected
          </p>
          <p className="m-0 font-serif text-lg text-navy">96%</p>
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
          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Triage
          </p>
          <div className="flex flex-col gap-2.5 mb-[22px]">
            {/* Streetlight */}
            <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBEDE4' }}>
                  <PhIcon name="ph-fill ph-siren" size={20} color="#C75A31" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13.5px] font-extrabold text-navy">Streetlight out on Alder Way</p>
                  <p className="m-0 text-xs font-semibold" style={{ color: '#8A8375' }}>
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
                  <span className="text-[11.5px] font-extrabold flex-shrink-0 text-right" style={{ color: '#2A9D5C' }}>
                    #M-88 ✓
                    <br />
                    BrightPath Electric
                  </span>
                )}
              </div>
            </div>

            {/* Dynamic #M-89 */}
            {state.reportSubmitted && (
              <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBEDE4' }}>
                    <PhIcon name="ph-fill ph-wrench" size={20} color="#C75A31" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 mb-0.5 text-[13.5px] font-extrabold text-navy">{reportTypeLabel} · #M-89</p>
                    <p className="m-0 text-xs font-semibold" style={{ color: '#8A8375' }}>
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
                    <span className="text-[11.5px] font-extrabold flex-shrink-0 text-right" style={{ color: '#2A9D5C' }}>
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
              <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#EAF3FD' }}>
                    <PhIcon name="ph-fill ph-pencil-ruler" size={20} color="#3A73B5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 mb-0.5 text-[13.5px] font-extrabold text-navy">ARC #A-121 · {arcNewTitle}</p>
                    <p className="m-0 text-xs font-semibold" style={{ color: '#8A8375' }}>
                      #27 Alder Way · submitted today · {arcDescSnippet}
                    </p>
                  </div>
                </div>
                {arcAwaitingBoard && (
                  <div className="flex gap-2">
                    <button
                      onClick={boardApproveArc}
                      className="flex-1 border-0 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer text-white"
                      style={{ background: '#2A9D5C' }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => set({ arcNeedsInfo: true })}
                      className="flex-1 rounded-[11px] py-2.5 text-[12.5px] font-extrabold cursor-pointer bg-transparent text-navy"
                      style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
                    >
                      {state.arcNeedsInfo ? 'Info requested ✓' : 'Needs info'}
                    </button>
                  </div>
                )}
                {state.arcApprovedByBoard && (
                  <div className="rounded-[11px] px-3 py-2.5 flex items-center gap-2 animate-fadeup" style={{ background: '#E9F6EE' }}>
                    <PhIcon name="ph-fill ph-seal-check" size={16} color="#2A9D5C" />
                    <span className="text-[12.5px] font-extrabold" style={{ color: '#228049' }}>
                      Approved — resident notified, decisions log updated
                    </span>
                  </div>
                )}
              </div>
            )}
            {!state.arcSubmitted && (
              <div className="rounded-[18px] px-4 py-[13px] flex items-center gap-2.5 bg-sand">
                <PhIcon name="ph-fill ph-pencil-ruler" size={17} color="#8A8375" />
                <p className="m-0 text-[12.5px] font-bold" style={{ color: '#8A8375' }}>
                  ARC queue is clear — new requests land here instantly
                </p>
              </div>
            )}

            {/* Pool gate */}
            <div className="bg-paper rounded-[18px] p-[15px_16px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#E9F6EE' }}>
                  <PhIcon name="ph-fill ph-wrench" size={20} color="#2A9D5C" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 mb-0.5 text-[13.5px] font-extrabold text-navy">Pool gate latch sticking</p>
                  <p className="m-0 text-xs font-semibold" style={{ color: '#8A8375' }}>
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
                  <span className="text-[11.5px] font-extrabold flex-shrink-0 text-right" style={{ color: '#2A9D5C' }}>
                    AquaFix ✓
                    <br />
                    Thu, Jul 3
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Vote monitor
          </p>
          <div className="bg-navy rounded-[20px] p-[18px] mb-[22px] text-cream">
            <p className="m-0 mb-1 font-serif text-base">Pool furniture · closes Thu</p>
            <div className="flex items-center justify-between my-2.5 mb-1.5">
              <span className="text-[11.5px] font-extrabold" style={{ color: 'rgba(245,240,230,0.8)' }}>
                QUORUM
              </span>
              <span className="text-[11.5px] font-extrabold" style={{ color: 'rgba(245,240,230,0.8)' }}>
                {quorum.count} of 136 households
              </span>
            </div>
            <div className="mb-[13px]">
              <ProgressBar pct={quorum.pct} height={8} track="rgba(245,240,230,0.15)" gradient />
            </div>
            {!state.reminderSent && (
              <button
                onClick={sendReminder}
                className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-cream"
                style={{ border: '1.5px solid rgba(245,240,230,0.3)' }}
              >
                Nudge {nonVoters} households who haven&apos;t voted
              </button>
            )}
            {state.reminderSent && (
              <div className="rounded-xl px-3.5 py-[11px] flex items-center gap-[9px] animate-fadeup" style={{ background: 'rgba(42,157,92,0.18)', border: '1px solid rgba(42,157,92,0.4)' }}>
                <PhIcon name="ph-fill ph-paper-plane-tilt" size={16} color="#6fd39c" />
                <span className="text-[12.5px] font-extrabold">Reminder queued for tonight&apos;s digest — app, email &amp; SMS</span>
              </div>
            )}
          </div>
        </div>
      )}

      {state.boardTab === 'req' && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            ARC queue
          </p>
          <div className="bg-paper rounded-[18px] px-4 mb-5" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {arcAwaitingBoard && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
                <PhIcon name="ph-fill ph-pencil-ruler" size={17} color="#3A73B5" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[13px] font-extrabold text-navy">#A-121 · {arcNewTitle} · #27</p>
                  <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
                    Submitted today · pre-approved palette
                  </p>
                </div>
                <button
                  onClick={boardApproveArc}
                  className="border-0 rounded-full px-3 py-[7px] text-[11.5px] font-extrabold cursor-pointer flex-shrink-0 text-white"
                  style={{ background: '#2A9D5C' }}
                >
                  Approve
                </button>
              </div>
            )}
            {state.arcApprovedByBoard && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
                <PhIcon name="ph-fill ph-seal-check" size={17} color="#2A9D5C" className="flex-shrink-0" />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-121 · {arcNewTitle} · #27</p>
                <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-extrabold" style={{ background: '#E9F6EE', color: '#228049' }}>
                  Approved today
                </span>
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <PhIcon name="ph-fill ph-seal-check" size={17} color="#2A9D5C" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-118 · Backyard pergola · #27</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-extrabold bg-sand" style={{ color: '#6E6759' }}>
                Jun 12
              </span>
            </div>
            <div className="flex items-center gap-[11px] py-[11px]">
              <PhIcon name="ph-fill ph-seal-check" size={17} color="#2A9D5C" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#A-115 · Fence stain, Cedar · #33</p>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-extrabold bg-sand" style={{ color: '#6E6759' }}>
                May 30
              </span>
            </div>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Maintenance
          </p>
          <div className="bg-paper rounded-[18px] px-4 mb-5" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {state.reportSubmitted && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
                <PhIcon name="ph-fill ph-wrench" size={17} color="#C75A31" className="flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[13px] font-extrabold text-navy">#M-89 · {reportTypeLabel} · #27</p>
                  <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
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
                  <span className="text-[11px] font-extrabold flex-shrink-0" style={{ color: '#2A9D5C' }}>
                    GreenScape ✓
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <PhIcon name="ph-fill ph-wrench" size={17} color="#2A9D5C" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-extrabold text-navy">Pool gate latch · 2 reports</p>
                <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
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
                <span className="text-[11px] font-extrabold flex-shrink-0" style={{ color: '#2A9D5C' }}>
                  AquaFix · Thu ✓
                </span>
              )}
            </div>
            {state.reportTicketed && (
              <div className="flex items-center gap-[11px] py-[11px]" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
                <PhIcon name="ph-fill ph-lightbulb" size={17} color="#D9A441" className="flex-shrink-0" />
                <p className="m-0 flex-1 text-[13px] font-bold text-navy">#M-88 · Streetlight, Alder Way</p>
                <span className="text-[11px] font-extrabold flex-shrink-0" style={{ color: '#2A9D5C' }}>
                  BrightPath ✓
                </span>
              </div>
            )}
            <div className="flex items-center gap-[11px] py-[11px]">
              <PhIcon name="ph-fill ph-check-circle" size={17} color="#A39B8B" className="flex-shrink-0" />
              <p className="m-0 flex-1 text-[13px] font-bold" style={{ color: '#8A8375' }}>
                #M-86 · Irrigation valve · closed Jun 24
              </p>
            </div>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Violations · courtesy-first
          </p>
          <div className="bg-paper rounded-[18px] p-4" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex items-center gap-[11px] pb-3 mb-3" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <PhIcon name="ph-fill ph-trash" size={17} color="#D9A441" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] font-extrabold text-navy">Trash bins visible from street · #14</p>
                <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
                  Courtesy notice sent Jun 27 · auto-closes if fixed by Jul 8
                </p>
              </div>
              <span className="rounded-full px-[9px] py-[3px] text-[10.5px] font-extrabold flex-shrink-0" style={{ background: '#FBF3E0', color: '#A87B1F' }}>
                No fee
              </span>
            </div>
            <p className="m-0 text-xs font-semibold" style={{ color: '#8A8375' }}>
              <span className="font-extrabold" style={{ color: '#228049' }}>
                2 self-cured this month
              </span>{' '}
              · zero fines issued in 2026 · every notice cites the exact CC&amp;R section
            </p>
          </div>

          <p className="mt-5 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Vendors
          </p>
          <div className="bg-paper rounded-[18px] px-4" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {VENDORS.map((v, i) => {
              const insLabel = v.ins ? 'COI on file ✓' : 'COI expires Aug 1';
              const insBg = v.ins ? '#E9F6EE' : '#FBF3E0';
              const insColor = v.ins ? '#228049' : '#A87B1F';
              return (
                <div
                  key={v.name}
                  className="flex items-center gap-[11px] py-3"
                  style={i < VENDORS.length - 1 ? { borderBottom: '1px solid rgba(26,51,82,0.06)' } : undefined}
                >
                  <div className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: v.bg }}>
                    <PhIcon name={v.icon} size={17} color={v.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] font-extrabold text-navy">{v.name}</p>
                    <p className="m-0 text-[11px] font-semibold" style={{ color: '#8A8375' }}>
                      {v.sub} · last: {v.last}
                    </p>
                  </div>
                  <span className="rounded-full px-[9px] py-[3px] text-[10px] font-extrabold flex-shrink-0" style={{ background: insBg, color: insColor }}>
                    {insLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {state.boardTab === 'money' && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            July collections
          </p>
          <div className="bg-paper rounded-[20px] p-[18px] mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex items-baseline justify-between gap-2.5 mb-2.5">
              <p className="m-0 font-serif text-[22px] text-navy">96% collected</p>
              <p className="m-0 text-xs font-bold" style={{ color: '#8A8375' }}>
                $38.9K of $40.5K
              </p>
            </div>
            <div className="mb-3">
              <ProgressBar pct={96} height={10} color="#2A9D5C" track="#EDE6D6" />
            </div>
            <p className="m-0 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
              4 households late · courtesy reminders sent Jun 28 · no late fees yet
            </p>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Late — courtesy first
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#9 · 30 days</p>
              <span className="text-[12.5px] font-extrabold" style={{ color: '#C75A31' }}>
                $570
              </span>
            </div>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#33 · 8 days</p>
              <span className="text-[12.5px] font-extrabold text-navy">$285</span>
            </div>
            <div className="flex items-center gap-[11px] pb-2.5 mb-2.5" style={{ borderBottom: '1px solid rgba(26,51,82,0.07)' }}>
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#51 · 5 days</p>
              <span className="text-[12.5px] font-extrabold text-navy">$285</span>
            </div>
            <div className="flex items-center gap-[11px] mb-[13px]">
              <p className="m-0 flex-1 text-[13px] font-bold text-navy">#60 · 3 days</p>
              <span className="text-[12.5px] font-extrabold text-navy">$285</span>
            </div>
            {!state.courtesySent && (
              <button
                onClick={sendCourtesy}
                className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
                style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
              >
                Send courtesy reminders — no fees, per §9
              </button>
            )}
            {state.courtesySent && (
              <div className="rounded-xl px-3.5 py-[11px] flex items-center gap-[9px] animate-fadeup" style={{ background: '#E9F6EE' }}>
                <PhIcon name="ph-fill ph-paper-plane-tilt" size={16} color="#2A9D5C" />
                <span className="text-[12.5px] font-extrabold" style={{ color: '#228049' }}>
                  4 gentle reminders queued — a payment plan link included
                </span>
              </div>
            )}
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Budget vs. actual · 50% through the year
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-extrabold text-navy">Landscaping</span>
                <span className="text-[11.5px] font-extrabold" style={{ color: '#8A8375' }}>
                  52% of $75.6K
                </span>
              </div>
              <ProgressBar pct={52} height={8} color="#2A9D5C" track="#EDE6D6" />
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-extrabold text-navy">Utilities</span>
                <span className="text-[11.5px] font-extrabold" style={{ color: '#8A8375' }}>
                  48% of $46.7K
                </span>
              </div>
              <ProgressBar pct={48} height={8} color="#2A9D5C" track="#EDE6D6" />
            </div>
            <div className="mb-3">
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-extrabold text-navy">Insurance</span>
                <span className="text-[11.5px] font-extrabold" style={{ color: '#8A8375' }}>
                  50% of $52.4K
                </span>
              </div>
              <ProgressBar pct={50} height={8} color="#2A9D5C" track="#EDE6D6" />
            </div>
            <div>
              <div className="flex justify-between mb-[5px]">
                <span className="text-[12.5px] font-extrabold text-navy">Repairs &amp; maintenance</span>
                <span className="text-[11.5px] font-extrabold" style={{ color: '#A87B1F' }}>
                  61% of $31.2K · watch
                </span>
              </div>
              <ProgressBar pct={61} height={8} color="#D9A441" track="#EDE6D6" />
            </div>
          </div>

          {state.showSpecialAssessment && (
            <>
              <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
                Special assessment · roof reserve
              </p>
              <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
                <div className="flex items-baseline justify-between gap-2.5 mb-2.5">
                  <p className="m-0 font-serif text-xl text-navy">$42.7K of $61.2K</p>
                  <p className="m-0 text-xs font-bold" style={{ color: '#8A8375' }}>
                    70% pledged
                  </p>
                </div>
                <div className="mb-3">
                  <ProgressBar pct={70} height={10} color="#C75A31" track="#EDE6D6" />
                </div>
                <p className="m-0 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
                  96 paid in full · 22 on installments · 18 not started · due Aug 1
                </p>
              </div>
            </>
          )}

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Aging report
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {AGING.map((a) => (
              <div key={a.bucket} className="mb-[11px]">
                <div className="flex justify-between items-baseline mb-[5px]">
                  <span className="text-[12.5px] font-extrabold text-navy">{a.bucket}</span>
                  <span className="text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
                    {a.amt} · {a.n}
                  </span>
                </div>
                <ProgressBar pct={parseInt(a.w, 10)} height={7} color={a.c} track="#EDE6D6" />
              </div>
            ))}
            <button
              onClick={openExport}
              className="w-full rounded-xl py-3 text-[13px] font-extrabold cursor-pointer bg-transparent text-navy mt-1.5 flex items-center justify-center gap-2"
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
            >
              <PhIcon name="ph-fill ph-export" size={15} />
              Export ledger — QuickBooks or CSV
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Approvals
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#EAF3FD' }}>
                <PhIcon name="ph-fill ph-invoice" size={19} color="#3A73B5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13.5px] font-extrabold text-navy">AquaFix · $340.00</p>
                <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
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
                <span className="text-[11.5px] font-extrabold flex-shrink-0 text-right" style={{ color: '#2A9D5C' }}>
                  2 of 3 ✓
                  <br />
                  ACH Thursday
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {state.boardTab === 'comms' && (
        <div className="animate-fadeup">
          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Broadcast
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {!state.broadcastSent && (
              <div>
                <textarea
                  value={state.bcText}
                  onChange={(e) => set({ bcText: e.target.value })}
                  placeholder="Announce something to every household…"
                  className="w-full rounded-[13px] px-3.5 py-3 text-[13.5px] font-semibold text-navy outline-none resize-none"
                  style={{ minHeight: 74, border: '1px solid rgba(26,51,82,0.12)', background: '#F9F5EC' }}
                />
                <div className="flex items-center gap-2 my-2.5 mb-3">
                  <PhIcon name="ph-fill ph-broadcast" size={14} color="#8A8375" className="flex-shrink-0" />
                  <p className="m-0 text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
                    Posts to the Commons + email digest — reaches all 136 households, including the 41% not on the app
                  </p>
                </div>
                <button
                  onClick={sendBroadcast}
                  disabled={!canBc}
                  className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold"
                  style={{ background: canBc ? '#E06A3E' : '#DDD5C2', color: canBc ? '#fff' : '#A39B8B', cursor: canBc ? 'pointer' : 'default' }}
                >
                  Send to 136 households
                </button>
              </div>
            )}
            {state.broadcastSent && (
              <div className="rounded-[13px] p-3.5 flex items-center gap-2.5 animate-fadeup" style={{ background: '#E9F6EE' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="#2A9D5C" className="flex-shrink-0" />
                <span className="text-[13px] font-extrabold" style={{ color: '#228049' }}>
                  Sent — live in the Commons, email digest goes out at 6 PM
                </span>
              </div>
            )}
          </div>

          <p className="mt-[22px] mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Put it to a vote
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            {!state.votePosted && (
              <div>
                {state.voteDraftOpen && (
                  <div className="animate-fadeup">
                    <p className="m-0 mb-[7px] text-[11.5px] font-extrabold text-navy">Question</p>
                    <textarea
                      value={state.voteQ}
                      onChange={(e) => set({ voteQ: e.target.value })}
                      placeholder="e.g. Should we add a second EV charger in Lot B?"
                      className="w-full rounded-[13px] px-[13px] py-[11px] text-[13.5px] font-semibold text-navy outline-none resize-none mb-3"
                      style={{ minHeight: 58, border: '1px solid rgba(26,51,82,0.12)', background: '#F9F5EC' }}
                    />
                    <p className="m-0 mb-[7px] text-[11.5px] font-extrabold text-navy">Choices</p>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={state.voteOptA}
                        onChange={(e) => set({ voteOptA: e.target.value })}
                        className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                        style={{ border: '1px solid rgba(26,51,82,0.12)', background: '#F9F5EC' }}
                      />
                      <input
                        value={state.voteOptB}
                        onChange={(e) => set({ voteOptB: e.target.value })}
                        className="flex-1 rounded-[11px] px-3 py-2.5 text-[13px] font-bold text-navy outline-none min-w-0"
                        style={{ border: '1px solid rgba(26,51,82,0.12)', background: '#F9F5EC' }}
                      />
                    </div>
                    <div className="rounded-xl px-[13px] py-[11px] mb-3" style={{ background: '#F9F5EC' }}>
                      <p className="m-0 mb-[5px] text-[10.5px] font-extrabold uppercase" style={{ letterSpacing: '0.08em', color: '#8A8375' }}>
                        Residents will see
                      </p>
                      <p className="m-0 text-[13px] font-extrabold text-navy" style={{ lineHeight: 1.35 }}>
                        {voteQPreview}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <PhIcon name="ph-fill ph-users-three" size={14} color="#8A8375" className="flex-shrink-0" />
                      <p className="m-0 text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
                        Opens to all 136 households · 7-day window · quorum 50%+1 · one ballot each
                      </p>
                    </div>
                    {!voteConfirm ? (
                      <button
                        onClick={() => canPostVote && setVoteConfirm(true)}
                        disabled={!canPostVote}
                        className="w-full border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                        style={{ background: canPostVote ? '#E06A3E' : '#DDD5C2', color: canPostVote ? '#fff' : '#A39B8B' }}
                      >
                        Open the ballot
                      </button>
                    ) : (
                      <div className="flex gap-2 animate-fadeup">
                        <button
                          onClick={() => { postVote(); setVoteConfirm(false); }}
                          className="flex-1 border-0 rounded-[13px] py-[13px] text-sm font-extrabold cursor-pointer"
                          style={{ background: '#E06A3E', color: '#fff' }}
                        >
                          Confirm — open to 136 households
                        </button>
                        <button
                          onClick={() => setVoteConfirm(false)}
                          className="rounded-[13px] px-4 py-[13px] text-sm font-extrabold cursor-pointer bg-transparent text-navy"
                          style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
                        >
                          Back
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {!state.voteDraftOpen && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBEDE4' }}>
                      <PhIcon name="ph-fill ph-check-square" size={20} color="#C75A31" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="m-0 mb-px text-[13.5px] font-extrabold text-navy">Draft a community vote</p>
                      <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
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
              <div className="rounded-[13px] p-3.5 flex items-start gap-2.5 animate-fadeup" style={{ background: '#E9F6EE' }}>
                <PhIcon name="ph-fill ph-check-circle" size={20} color="#2A9D5C" className="flex-shrink-0 mt-px" />
                <div>
                  <p className="m-0 mb-0.5 text-[13px] font-extrabold" style={{ color: '#228049' }}>
                    Ballot is open — &quot;{voteQPreview}&quot;
                  </p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#5F8A6F' }}>
                    Live on every resident&apos;s Today screen · closes in 7 days · you&apos;ll see the tally here
                  </p>
                </div>
              </div>
            )}
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Friday digest · drafted by Penny
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex flex-col gap-2 mb-3">
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-check-square" size={14} color="#C75A31" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold" style={{ color: '#3E4C63' }}>
                  Pool furniture vote closes Thursday — 61 in so far
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-popcorn" size={14} color="#D9A441" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold" style={{ color: '#3E4C63' }}>
                  Movie on the lawn Saturday at dusk — popcorn volunteers needed
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <PhIcon name="ph-fill ph-wrench" size={14} color="#2A9D5C" className="mt-0.5 flex-shrink-0" />
                <p className="m-0 text-[12.5px] font-bold" style={{ color: '#3E4C63' }}>
                  Pool gate repair Thursday morning — brief closure
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <PhIcon name="ph-fill ph-broadcast" size={13} color="#8A8375" className="flex-shrink-0" />
              <p className="m-0 text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
                Reaches all 136 households: 80 app · 44 email · 12 print
              </p>
            </div>
            <button
              onClick={() => set({ digestScheduled: true })}
              className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{
                border: '1.5px solid rgba(26,51,82,0.15)',
                ...(state.digestScheduled ? { background: '#E9F6EE', borderColor: '#2A9D5C', color: '#228049' } : {}),
              }}
            >
              {state.digestScheduled ? 'Scheduled for Friday 8 AM ✓' : 'Edit & schedule for Friday 8 AM'}
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Annual meeting prep · Jul 15
          </p>
          <div className="bg-paper rounded-[20px] p-4 mb-[22px]" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex flex-col gap-[9px] mb-3">
              <div className="flex gap-2.5 items-center">
                <PhIcon name="ph ph-dots-six-vertical" size={14} color="#C9C1B0" />
                <span className="flex-1 text-[13px] font-bold text-navy">2027 budget ratification</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <PhIcon name="ph ph-dots-six-vertical" size={14} color="#C9C1B0" />
                <span className="flex-1 text-[13px] font-bold text-navy">Board election — 2 seats, 3 candidates</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <PhIcon name="ph ph-dots-six-vertical" size={14} color="#C9C1B0" />
                <span className="flex-1 text-[13px] font-bold text-navy">Pool furniture vote — results</span>
              </div>
              <div className="flex gap-2.5 items-center">
                <PhIcon name="ph ph-dots-six-vertical" size={14} color="#C9C1B0" />
                <span className="flex-1 text-[13px] font-bold text-navy">Open comment (2 min each)</span>
              </div>
            </div>
            <div className="rounded-[11px] px-3 py-2.5 flex items-center gap-2.5 mb-3" style={{ background: '#FBF3E0' }}>
              <PhIcon name="ph-fill ph-tray" size={15} color="#A87B1F" className="flex-shrink-0" />
              <span className="text-xs font-extrabold" style={{ color: '#A87B1F' }}>
                2 resident-submitted agenda items to review
              </span>
            </div>
            <button
              onClick={openMeeting}
              className="w-full rounded-xl py-[11px] text-[13px] font-extrabold cursor-pointer bg-transparent text-navy"
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
            >
              Open meeting mode →
            </button>
          </div>

          <p className="m-0 mb-2.5 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#8A8375' }}>
            Minutes
          </p>
          <div className="bg-paper rounded-[20px] p-4" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[13px] flex items-center justify-center flex-shrink-0" style={{ background: '#FBEDE4' }}>
                <PhIcon name="ph-fill ph-sparkle" size={19} color="#C75A31" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-[13.5px] font-extrabold text-navy">June 18 minutes — drafted by Penny</p>
                <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
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
                <span className="text-[11.5px] font-extrabold flex-shrink-0 text-right" style={{ color: '#2A9D5C' }}>
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
