import {
  AMENS, SLOTS, DAYS, VENDORS, ARC_TYPES, HH, ONBOARD_CIRCLES, QA, DIR, FREE,
  PINS, MAP_LAYERS, PORTFOLIO, AGING, CIRC, NOTIFS, NOTIF_CATS, CHAT_SEED,
  DOCS, DOC_SECTIONS, SEARCH,
} from '..';
import type { AdminMember, ArcRequest, ArcState, AuditEntry, BoardArcItem, BoardBooking, BoardMessage, BoardTriage, BoardViolation, ClosedVote, CommunityEvent, Decision, DuesState, DuesStatement, FeedPost, Invite, KnownIssue, Meeting, MemberContext, Membership, NewGroup, NewReservation, OpenVote, Repository, RepositorySnapshot, SnapshotReadable, SpecialAssessment, TriageItem, UnitRef, ViolationNotice, VoteChoice, VotesState } from './Repository';
import type { GroupData } from '../types';
import { mockDomain } from './mockDomainStore';
import { usePavStore } from '../../store/store';

/** The demo persona (stable reference for useSyncExternalStore). */
const DEMO_MEMBER: MemberContext = {
  name: 'Alex Rivera', initial: 'A', color: 'rgb(var(--navy))', role: 'board',
  communityName: 'Juniper Ridge', unitLabel: '#27 Alder Way',
};
const DEMO_MEMBERSHIPS: Membership[] = [
  { communityId: 'juniper-ridge', communityName: DEMO_MEMBER.communityName, role: DEMO_MEMBER.role, unitLabel: DEMO_MEMBER.unitLabel },
];

/** Demo events + feed — always-on ambient content (stable refs). Empty in live. */
const DEMO_EVENTS: CommunityEvent[] = [
  { id: 'taco', title: 'Taco cart at the clubhouse', whenLabel: 'Today · 5–8 PM', whereLabel: 'Clubhouse', going: 12, photoLabel: '', tagLabel: '', featured: true },
  { id: 'movie', title: 'Movie on the lawn', whenLabel: 'Sat, Jul 5 · Dusk · The Green', whereLabel: 'The Green', going: 23, photoLabel: 'event photo — movie night', tagLabel: 'Social Committee', featured: false },
];
const DEMO_FEED: FeedPost[] = [
  { id: 'maria', authorName: 'Maria R.', authorInitial: 'M', authorColor: 'rgb(var(--accent))', unitLabel: '#7', timeLabel: '2h', kind: 'shoutout', tagLabel: 'Shoutout', body: 'Huge thanks to Tom at #18 for helping clear my gutters before Sunday’s storm.', photoLabel: 'photo — clean gutters, proud Tom' },
  { id: 'dev', authorName: 'Dev P.', authorInitial: 'D', authorColor: 'rgb(var(--sky))', unitLabel: '#23', timeLabel: '5h', kind: 'borrow', tagLabel: 'Help & Borrow', body: 'Anyone have an 8-ft ladder I could borrow Sunday?', photoLabel: '' },
  { id: 'movie', authorName: 'Social Committee', authorInitial: 'S', authorColor: 'rgb(var(--navy))', unitLabel: '', timeLabel: '', kind: 'event', tagLabel: 'Social Committee', body: 'Movie on the lawn', photoLabel: 'event photo — movie night' },
];

/** Demo decisions log (stable ref). Live reads the `decisions` table. */
const DEMO_DECISIONS: Decision[] = [
  { id: 'fence', dateLabel: 'JUN 18', text: 'Approved fence colors expanded to five', pillLabel: 'Passed 91–22', passed: true },
  { id: 'snow', dateLabel: 'MAY 30', text: 'Snow-removal contract renewed, 2 yrs', pillLabel: 'Passed 104–9', passed: true },
  { id: 'bumps', dateLabel: 'MAY 12', text: 'Speed bumps on Alder Way', pillLabel: 'Declined 48–71', passed: false },
];

/** Stable empty refs for the live-only board queues (demo renders scripted cards). */
const EMPTY_TRIAGE_ITEMS: TriageItem[] = [];
const EMPTY_BOARD_ARC: BoardArcItem[] = [];
const EMPTY_INVITES: Invite[] = [];
const EMPTY_BOARD_CHAT: BoardMessage[] = [];
const EMPTY_STRINGS: string[] = [];
const EMPTY_UNITS: UnitRef[] = [];
const EMPTY_BOARD_VIOL: BoardViolation[] = [];
const EMPTY_ADMIN: AdminMember[] = [];
const EMPTY_BOOKINGS: BoardBooking[] = [];
const EMPTY_MEETINGS: Meeting[] = [];
const EMPTY_AUDIT: AuditEntry[] = [];
const EMPTY_CLOSED: ClosedVote[] = [];

/** Clock label matching the store's original format (e.g. "3:07 PM"). */
function now(): string {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${ap}`;
}

/**
 * Demo backend. Serves the in-memory `src/data/*` seed data behind the async
 * Repository contract, and exposes a synchronous snapshot() so hooks render
 * instantly (the demo has no real latency). Preserves today's behavior exactly.
 */
export class MockRepository implements Repository, SnapshotReadable {
  subscribe = mockDomain.subscribe;

  isDemo = () => true;

  // The demo derives everything synchronously from the store, so there is no
  // in-flight window and nothing that can fail — an empty list here always
  // means genuinely empty.
  getLoadState = () => 'ready' as const;
  retry = () => {};

  getMember = () => DEMO_MEMBER;
  getMemberships = () => DEMO_MEMBERSHIPS;
  getActiveCommunityId = () => DEMO_MEMBERSHIPS[0].communityId;
  switchCommunity = async () => {};

  getDecisions = () => DEMO_DECISIONS;

  // Write paths delegate to the scripted store actions, so the presenter demo
  // behaves exactly as before. The live board queues stay empty — the demo's
  // Board Desk renders its own scripted triage/queue cards instead.
  createReport = async () => { usePavStore.getState().submitReport(); };
  setReportStatus = async () => {};
  assignReport = async () => {};
  setReportNotes = async () => {};
  listReportComments = async () => [];
  addReportComment = async () => {};
  getTriageItems = () => EMPTY_TRIAGE_ITEMS;
  getMyReports = () => EMPTY_TRIAGE_ITEMS;
  createArcRequest = async () => { usePavStore.getState().submitArc(); };
  decideArc = async () => {};
  getBoardArcQueue = () => EMPTY_BOARD_ARC;
  createFeedPost = async () => {};
  deleteFeedPost = async () => {};
  togglePinPost = async () => {};
  togglePostLike = async () => {};
  listPostComments = async () => [];
  addPostComment = async () => {};
  openVote = async () => { usePavStore.getState().postVote(); };
  castOptionVote = async () => {};
  closeVote = async () => {};
  markViolationFixed = async () => { usePavStore.getState().set({ violFixed: true }); };
  createViolation = async () => {};
  resolveViolation = async () => {};
  getBoardViolations = () => EMPTY_BOARD_VIOL;
  getUnits = () => EMPTY_UNITS;
  getInvites = () => EMPTY_INVITES;
  getBoardChat = () => EMPTY_BOARD_CHAT;   // board chat is live-only
  sendBoardMessage = async () => {};
  deleteBoardMessage = async () => {};
  renameBoardTopic = async () => {};
  archiveBoardTopic = async () => {};
  getArchivedBoardTopics = () => EMPTY_STRINGS;
  markChatRead = () => {};   // demo unread badges are scripted
  deleteChatMessage = async () => {};
  createInvite = async () => {};
  revokeInvite = async () => {};
  renewInvite = async () => {};
  getAdminMembers = () => EMPTY_ADMIN;
  setMemberRole = async () => {};
  setMemberStatus = async () => {};
  assignMemberUnit = async () => {};
  updateProfile = async () => {};
  getDocs = () => DOCS;
  uploadDocument = async () => {};
  deleteDocument = async () => {};
  getMeetings = () => EMPTY_MEETINGS;
  createMeeting = async () => {};
  publishMinutes = async () => {};
  getAuditLog = () => EMPTY_AUDIT;
  toggleEventRsvp = async () => {};
  createEvent = async () => {};
  updateAmenity = async () => {};
  getBoardBookings = () => EMPTY_BOOKINGS;
  createGroupPoll = async () => {};
  createGroupEvent = async () => {};
  archiveGroup = async () => {};

  // Known issues derived from the demo triage flags so the board's actions
  // (create ticket, schedule vendor) reflect on the resident-facing HOA list.
  private issuesCache: { sig: string; value: KnownIssue[] } | null = null;
  getIssues = (): KnownIssue[] => {
    const { reportTicketed, gateScheduled } = usePavStore.getState();
    const sig = `${reportTicketed}|${gateScheduled}`;
    if (this.issuesCache?.sig === sig) return this.issuesCache.value;
    const value: KnownIssue[] = [
      {
        id: 'streetlight', icon: 'ph-fill ph-lightbulb', iconColor: 'rgb(var(--gold))',
        title: 'Streetlight · Alder Way',
        statusLabel: reportTicketed ? 'BrightPath · assigned' : 'In triage',
        tone: reportTicketed ? 'mint' : 'gold', resolved: false,
      },
      {
        id: 'pool-gate', icon: 'ph-fill ph-wrench', iconColor: 'rgb(var(--accent))',
        title: 'Pool gate latch',
        statusLabel: gateScheduled ? 'AquaFix · Thu Jul 3' : 'Reported · 2×',
        tone: gateScheduled ? 'mint' : 'gold', resolved: false,
      },
      {
        id: 'irrigation', icon: 'ph-fill ph-check-circle', iconColor: 'rgb(var(--slatelight))',
        title: 'Irrigation valve · the Green',
        statusLabel: 'Fixed Jun 24', tone: 'skyborder', resolved: true,
      },
    ];
    this.issuesCache = { sig, value };
    return value;
  };

  getEvents = () => DEMO_EVENTS;
  getFeed = () => DEMO_FEED;

  // Board triage derived from the demo scenario flags, mirroring the old
  // getTriage/getBoardOpenCount selectors. The demo always has seed triage
  // items (streetlight + gate), so hasItems is true; live is empty.
  private triageCache: { sig: string; value: BoardTriage } | null = null;
  getBoardTriage = (): BoardTriage => {
    const { reportTicketed, gateScheduled, arcSubmitted, arcApprovedByBoard, reportSubmitted, m89Assigned } = usePavStore.getState();
    const sig = `${reportTicketed}|${gateScheduled}|${arcSubmitted}|${arcApprovedByBoard}|${reportSubmitted}|${m89Assigned}`;
    if (this.triageCache?.sig === sig) return this.triageCache.value;
    const arcOpen = arcSubmitted && !arcApprovedByBoard;
    const left = (reportTicketed ? 0 : 1) + (arcOpen ? 1 : 0) + (gateScheduled ? 0 : 1);
    const openCount = (reportTicketed ? 0 : 1) + (gateScheduled ? 0 : 1) + (arcOpen ? 1 : 0) + (reportSubmitted && !m89Assigned ? 1 : 0);
    const value: BoardTriage = {
      openCount,
      summary: 'Tuesday, July 1 · ' + (left === 0 ? 'triage queue is clear' : left + (left === 1 ? ' item' : ' items') + ' in triage'),
      hasItems: true,
    };
    this.triageCache = { sig, value };
    return value;
  };

  // Dues are derived from the demo scenario flags so the DemoPanel keeps
  // driving the cards. Memoized on the flags so useSyncExternalStore gets a
  // stable reference between unrelated store changes.
  private duesCache: { sig: string; value: DuesState } | null = null;
  getDues = (): DuesState => {
    const { paid, planActive, showDelinquent } = usePavStore.getState();
    const delinquent = showDelinquent && !paid && !planActive;
    const sig = `${paid}|${planActive}|${showDelinquent}`;
    if (this.duesCache?.sig === sig) return this.duesCache.value;

    const july: DuesStatement = {
      id: 'jul', period: 'July', amountLabel: '$285',
      status: paid ? 'paid' : planActive ? 'plan' : delinquent ? 'past_due' : 'due',
      statusLabel: paid ? 'Paid Jul 1 · #P-2231' : planActive ? 'In plan · 3 × $190' : delinquent ? 'Past due' : 'Due Jul 3',
      confirmation: paid ? '#P-2231' : null,
    };
    const june: DuesStatement = {
      id: 'jun', period: 'June', amountLabel: '$285',
      status: !showDelinquent || paid ? 'paid' : planActive ? 'plan' : 'past_due',
      statusLabel: !showDelinquent ? 'Paid Jun 3 · #P-2168' : paid ? 'Paid Jul 1' : planActive ? 'In plan' : 'Past due · 30 days',
      confirmation: !showDelinquent ? '#P-2168' : null,
    };
    const may: DuesStatement = {
      id: 'may', period: 'May', amountLabel: '$285', status: 'paid',
      statusLabel: 'Paid May 3 · #P-2103', confirmation: '#P-2103',
    };
    const april: DuesStatement = {
      id: 'apr', period: 'April', amountLabel: '$285', status: 'paid',
      statusLabel: 'Paid Apr 3 · #P-2041', confirmation: '#P-2041',
    };
    const value: DuesState = {
      current: paid ? null : july,
      cardTitle: planActive && !paid ? 'Payment plan active' : delinquent ? 'Dues are past due' : 'July dues are ready',
      cardSub: planActive && !paid ? '3 × $190 · next runs Jul 3 · no fees'
        : delinquent ? '$570 · 30 days · courtesy period, no fees yet'
          : '$285 · same as June · itemized inside',
      cardBtn: planActive && !paid ? 'View plan' : 'Review & pay',
      history: [july, june, may, april],
    };
    this.duesCache = { sig, value };
    return value;
  };

  // Votes derived from the demo scenario (voted, reminderSent), mirroring the
  // old getQuorum/getTally selectors so the board reminder + ballot flows work.
  private votesCache: { sig: string; value: VotesState } | null = null;
  getVotes = (): VotesState => {
    const { voted, reminderSent } = usePavStore.getState();
    const sig = `${voted}|${reminderSent}`;
    if (this.votesCache?.sig === sig) return this.votesCache.value;

    const quorumCount = 87 + (voted ? 1 : 0) + (reminderSent ? 6 : 0);
    const yesCount = 61 + (voted === 'yes' ? 1 : 0);
    const noCount = 26 + (voted === 'no' ? 1 : 0);
    const open: OpenVote = {
      id: 'pool-furniture',
      title: 'Replace the pool furniture',
      subtitle: '$18,400 from reserves · 3 bids reviewed · lowest responsible bidder',
      closesLabel: 'Open vote · Closes Thu, Jul 3',
      quorumCount, quorumTotal: 136,
      quorumPct: Math.round((quorumCount / 136) * 100),
      yesCount, noCount,
      yesPct: Math.round((yesCount / (yesCount + noCount)) * 100),
      myVote: voted,
      receipt: '#R-0482',
      yesLabel: 'Yes, replace it',
      noLabel: 'No, wait a year',
      kind: 'yesno', multi: false, options: [], myOptionIds: [],
    };
    const value: VotesState = { open, openAll: [open], closed: EMPTY_CLOSED };
    this.votesCache = { sig, value };
    return value;
  };
  castVote = async (_voteId: string, choice: VoteChoice) => {
    usePavStore.getState().set({ voted: choice });
  };

  // Compliance derived from the demo scenario flags (memoized for stable refs).
  private violCache: { sig: string; value: ViolationNotice | null } | null = null;
  getViolation = (): ViolationNotice | null => {
    const { showViolation, violFixed } = usePavStore.getState();
    const sig = `${showViolation}|${violFixed}`;
    if (this.violCache?.sig === sig) return this.violCache.value;
    const value: ViolationNotice | null = !showViolation ? null : {
      id: 'trash-bins',
      title: 'Courtesy notice: trash bins',
      sub: 'No fee · auto-closes if fixed by Jul 8',
      fixed: violFixed,
    };
    this.violCache = { sig, value };
    return value;
  };

  private saCache: { sig: string; value: SpecialAssessment | null } | null = null;
  getAssessment = (): SpecialAssessment | null => {
    const { showSpecialAssessment, saPaid } = usePavStore.getState();
    const sig = `${showSpecialAssessment}|${saPaid}`;
    if (this.saCache?.sig === sig) return this.saCache.value;
    const value: SpecialAssessment | null = !showSpecialAssessment ? null : {
      id: 'roof-reserve',
      title: 'Roof-reserve assessment · $450',
      sub: 'Due Aug 1 · pay now or split into 3',
      paid: saPaid,
    };
    this.saCache = { sig, value };
    return value;
  };

  // ARC derived from the demo scenario (arcSubmitted, arcApprovedByBoard,
  // arcType, arcSeen), memoized so useSyncExternalStore gets a stable ref.
  private arcCache: { sig: string; value: ArcState } | null = null;
  getArc = (): ArcState => {
    const { arcSubmitted, arcApprovedByBoard, arcType, arcSeen } = usePavStore.getState();
    const sig = `${arcSubmitted}|${arcApprovedByBoard}|${arcType}|${arcSeen}`;
    if (this.arcCache?.sig === sig) return this.arcCache.value;

    const pergola: ArcRequest = {
      id: 'A-118', ref: '#A-118', title: 'Backyard pergola', approved: true, statusLabel: 'Approved',
      steps: [
        { label: 'Submitted Jun 12', state: 'done' },
        { label: 'Reviewed Jun 16', state: 'done' },
        { label: 'Approved Jun 18', state: 'done' },
      ],
    };
    const requests: ArcRequest[] = [];
    if (arcSubmitted) {
      requests.push({
        id: 'A-121', ref: '#A-121', title: arcType || 'Exterior update',
        approved: arcApprovedByBoard, statusLabel: arcApprovedByBoard ? 'Approved' : 'In review',
        steps: [
          { label: 'Submitted Jul 1', state: 'done' },
          { label: 'Board review', state: arcApprovedByBoard ? 'done' : 'active' },
          { label: 'Decision', state: arcApprovedByBoard ? 'done' : 'pending' },
        ],
      });
    }
    requests.push(pergola);
    const value: ArcState = {
      requests,
      unseenApproval: arcSeen ? null : { title: 'Your pergola was approved', sub: 'ARC #A-118 · reviewed in 6 days' },
    };
    this.arcCache = { sig, value };
    return value;
  };

  getAmenities = () => AMENS;
  listAmenities = async () => AMENS;
  createAmenity = async () => {};   // board amenity tooling is live-only
  retireAmenity = async () => {};
  getReservationSlots = async () => SLOTS;
  getReservationDays = async () => DAYS;
  getReservation = () => mockDomain.get().reservation;
  createReservation = async ({ amenity, day, slot, hours }: NewReservation) => {
    mockDomain.set({ reservation: { booked: true, summary: `${amenity} · ${day}, ${slot} · ${hours} hr` } });
  };
  cancelReservation = async () => {
    mockDomain.set({ reservation: { booked: false, summary: null } });
  };

  getComments = () => mockDomain.get().comments;
  addComment = async (text: string) => {
    mockDomain.set({ comments: [...mockDomain.get().comments, { who: 'You', color: 'rgb(var(--navy))', text }] });
  };

  getGroups = () => mockDomain.get().groups;

  private patchGroup(groupKey: string, update: (g: GroupData) => GroupData) {
    const groups = mockDomain.get().groups;
    const g = groups[groupKey];
    if (!g) return;
    mockDomain.set({ groups: { ...groups, [groupKey]: update(g) } });
  }

  sendGroupMessage = async (groupKey: string, text: string) => {
    if (!mockDomain.get().groups[groupKey]) return;
    this.patchGroup(groupKey, (g) => ({ ...g, messages: [...g.messages, { me: true, text, time: now() }] }));
    const gen = mockDomain.generation();
    setTimeout(() => {
      if (mockDomain.generation() !== gen) return;
      this.patchGroup(groupKey, (g) => ({ ...g, messages: [...g.messages, { me: false, text: '👍 Sounds good!', time: now() }] }));
    }, 1200);
  };

  createGroup = async ({ name, description, icon, color }: NewGroup) => {
    const key = 'custom-' + Date.now();
    const newGroup: GroupData = {
      key, name, icon, color,
      description: description || 'A new community group',
      memberCount: 1, isGroupChat: false, joined: true, muted: false,
      members: [{ name: 'You', initial: 'A', color: 'rgb(var(--navy))' }],
      messages: [], polls: [], events: [], pins: [],
    };
    mockDomain.set({ groups: { ...mockDomain.get().groups, [key]: newGroup } });
    return key;
  };

  toggleGroupJoin = async (groupKey: string) => {
    this.patchGroup(groupKey, (g) => {
      const joining = !g.joined;
      return {
        ...g,
        joined: joining,
        memberCount: g.memberCount + (joining ? 1 : -1),
        members: joining
          ? [...g.members, { name: 'You', initial: 'A', color: 'rgb(var(--navy))' }]
          : g.members.filter((m) => m.name !== 'You'),
      };
    });
  };

  toggleGroupMute = async (groupKey: string) => {
    this.patchGroup(groupKey, (g) => ({ ...g, muted: !g.muted }));
  };

  voteGroupPoll = async (groupKey: string, pollId: string, option: string) => {
    this.patchGroup(groupKey, (g) => ({
      ...g,
      polls: g.polls.map((p) =>
        p.id === pollId && !p.myVote
          ? { ...p, myVote: option, votes: { ...p.votes, [option]: (p.votes[option] || 0) + 1 } }
          : p),
    }));
  };

  rsvpGroupEvent = async (groupKey: string, eventId: string) => {
    this.patchGroup(groupKey, (g) => ({
      ...g,
      events: g.events.map((e) =>
        e.id === eventId ? { ...e, rsvped: !e.rsvped, going: e.going + (e.rsvped ? -1 : 1) } : e),
    }));
  };

  getChats = () => mockDomain.get().chats;
  sendChatMessage = async (chatKey: string, text: string, reply = true) => {
    const append = (msg: { me: boolean; text: string; time: string }) => {
      const chats = mockDomain.get().chats;
      mockDomain.set({ chats: { ...chats, [chatKey]: [...(chats[chatKey] || []), msg] } });
    };
    append({ me: true, text, time: now() });
    if (!reply) return;
    const gen = mockDomain.generation();
    setTimeout(() => {
      if (mockDomain.generation() !== gen) return; // cancelled by a reset
      append({ me: false, text: 'Sounds good — see you around the Ridge!', time: now() });
    }, 1200);
  };

  listDirectory = async () => DIR;
  getDirectory = () => DIR;
  getChatIndex = () => CHAT_SEED;
  listCircles = async () => CIRC;
  listFreeItems = async () => FREE;
  getChatSeed = async () => CHAT_SEED;

  listVendors = async () => VENDORS;
  listDocuments = async () => DOCS;
  listDocSections = async () => DOC_SECTIONS;
  listArcTypes = async () => ARC_TYPES;
  listPortfolio = async () => PORTFOLIO;
  listAging = async () => AGING;

  listNotifications = async () => NOTIFS;
  listNotifCategories = async () => NOTIF_CATS;
  listMapPins = async () => PINS;
  listMapLayers = async () => MAP_LAYERS;
  getSearchIndex = async () => SEARCH;
  getAiQA = async () => QA;

  listHouseholdOptions = async () => HH;
  listOnboardCircles = async () => ONBOARD_CIRCLES;

  snapshot(): RepositorySnapshot {
    return {
      amenities: AMENS,
      reservationSlots: SLOTS,
      reservationDays: DAYS,
      directory: DIR,
      circles: CIRC,
      freeItems: FREE,
      chatSeed: CHAT_SEED,
      vendors: VENDORS,
      documents: DOCS,
      docSections: DOC_SECTIONS,
      arcTypes: ARC_TYPES,
      portfolio: PORTFOLIO,
      aging: AGING,
      notifications: NOTIFS,
      notifCategories: NOTIF_CATS,
      mapPins: PINS,
      mapLayers: MAP_LAYERS,
      searchIndex: SEARCH,
      aiQA: QA,
      householdOptions: HH,
      onboardCircles: ONBOARD_CIRCLES,
    };
  }
}
