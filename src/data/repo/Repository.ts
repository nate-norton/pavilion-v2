import type {
  Amenity, Vendor, DirEntry, FreeItem, Doc, DocSection, Notif, Circle,
  PortfolioEntry, AgingBucket, Pin, MapLayer, SearchItem, ChatSeed, QA,
  HHOption, OnboardCircle, Comment, ChatMsg, GroupData,
} from '../types';

/** Fields the create-group flow collects; membership/seed are filled in. */
export interface NewGroup {
  name: string;
  description: string;
  icon: string;
  color: string;
}

/**
 * The data seam. Screens talk to this interface via hooks (see hooks.ts),
 * never to `src/data/*` or the store's domain data directly. Behind it sits
 * either the MockRepository (demo, in-memory) or — from Phase 2 — a
 * SupabaseRepository (RLS-scoped queries + realtime).
 *
 * Every method is Promise-returning and async-shaped even in the mock, so
 * swapping in the real backend needs no change here or in the screens.
 * Reads are grouped by domain; writes/mutations arrive as those slices move
 * off the Zustand store in later Phase 1 steps.
 */
/** A household's current amenity booking (one active per household). */
export interface ReservationState {
  booked: boolean;
  summary: string | null;
}

/** Resolved booking request — the screen supplies display strings it already has. */
export interface NewReservation {
  amenity: string;
  day: string;
  slot: string;
  hours: 1 | 2;
}

/** A single dues assessment — one row of the member's payment history. */
export type DuesStatus = 'due' | 'paid' | 'past_due' | 'plan';
export interface DuesStatement {
  id: string;
  period: string;         // 'July'
  amountLabel: string;    // '$285'
  status: DuesStatus;
  statusLabel: string;    // 'Due Jul 3' / 'Paid Jun 3 · #P-2168'
  confirmation: string | null;
}

/**
 * The member's dues surface. `current` is the one actionable statement the
 * Today screen offers to pay (null → nothing owed → no card); `history` feeds
 * the MyPlace payments list. The card* strings are the Today headline/subline/
 * button, carried here so the copy stays a data concern (empty in live).
 */
export interface DuesState {
  current: DuesStatement | null;
  cardTitle: string;
  cardSub: string;
  cardBtn: string;
  history: DuesStatement[];
}

/** The board's triage queue summary (empty for a fresh community). */
export interface BoardTriage {
  openCount: number;   // items still needing a board action
  summary: string;     // 'Tuesday, July 1 · N items in triage'
  hasItems: boolean;   // whether the community has any triage items at all
}

/** A community event (Today's featured card, the calendar, the Commons event). */
export interface CommunityEvent {
  id: string;
  title: string;
  whenLabel: string;   // 'Today · 5–8 PM'
  whereLabel: string;
  going: number;
  photoLabel: string;
  tagLabel: string;
  featured: boolean;
  rsvpd?: boolean;     // live: signed-in member is going
}

/** A Commons feed post. Kinds render differently but share these fields. */
export interface FeedPost {
  id: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  unitLabel: string;
  timeLabel: string;
  kind: string;        // shoutout | borrow | event | post
  tagLabel: string;
  body: string;
  photoLabel: string;
  mine?: boolean;         // live: authored by the signed-in member
  pinned?: boolean;       // live: board-pinned announcement
  photoUrls?: string[];   // live: attached images (signed URLs)
  likes?: number;
  likedByMe?: boolean;
  commentCount?: number;
}

/** One architectural-review request on the member's unit. */
export interface ArcStep {
  label: string;
  state: 'done' | 'active' | 'pending';
}
export interface ArcRequest {
  id: string;          // 'A-118'
  ref: string;         // '#A-118'
  title: string;       // 'Backyard pergola'
  approved: boolean;
  statusLabel: string; // 'Approved' / 'In review'
  steps: ArcStep[];
  status?: string;         // live: submitted | in_review | info_requested | approved | declined
  decisionNote?: string;   // live: board's reason on decline / info request
  conditions?: string;     // live: conditions attached to an approval
  attachmentUrls?: string[];
}

/** The member's ARC surface: their requests + an unseen approval to surface. */
export interface ArcState {
  requests: ArcRequest[];
  /** Drives the Today "approved" card; null when nothing new to surface. */
  unseenApproval: { title: string; sub: string } | null;
}

/** A courtesy notice / violation on the member's unit (null when compliant). */
export interface ViolationNotice {
  id: string;
  title: string;   // 'Courtesy notice: trash bins'
  sub: string;     // 'No fee · auto-closes if fixed by Jul 8'
  fixed: boolean;
  description?: string;   // live: board's detail text
  severity?: string;      // live: courtesy | warning | fine
  photoUrls?: string[];   // live: board's evidence photos
}

/** A one-time special assessment on the member's unit (null when none). */
export interface SpecialAssessment {
  id: string;
  title: string;   // 'Roof-reserve assessment · $450'
  sub: string;     // 'Due Aug 1 · pay now or split into 3'
  paid: boolean;
}

/** A community's single open ballot, plus this member's cast vote (if any). */
export type VoteChoice = 'yes' | 'no';
export interface VoteOption {
  id: string;
  label: string;
  tally: number;
}
export interface OpenVote {
  id: string;
  title: string;
  subtitle: string;
  closesLabel: string;     // 'Open vote · Closes Thu, Jul 3'
  quorumCount: number;     // households counted
  quorumTotal: number;     // households needed
  quorumPct: number;
  yesCount: number;
  noCount: number;
  yesPct: number;
  myVote: VoteChoice | null;
  receipt: string;         // '#R-0482'
  yesLabel: string;        // 'Yes, replace it'
  noLabel: string;         // 'No, wait a year'
  kind: 'yesno' | 'options';
  multi: boolean;
  options: VoteOption[];   // empty for yesno ballots
  myOptionIds: string[];   // this member's picks on an options ballot
}

/** A closed ballot's archived result line. */
export interface ClosedVote {
  id: string;
  title: string;
  resultLabel: string;     // 'Yes 12 · No 4' or 'Pool hours: 9' (winner)
  dateLabel: string;       // 'Closed Jul 20'
}

/** The votes surface. `open` lists every live ballot (first = newest);
 * `closed` is the results history. Both empty for a fresh community. */
export interface VotesState {
  open: OpenVote | null;   // newest open ballot (Today card / vote sheet)
  openAll: OpenVote[];     // every open ballot
  closed: ClosedVote[];
}

/** A community-visible maintenance issue row (HOA "Known issues"). */
export interface KnownIssue {
  id: string;
  icon: string;        // phosphor icon name
  iconColor: string;   // css color for the icon
  title: string;
  statusLabel: string; // 'In triage' / 'BrightPath · assigned' / 'Fixed Jun 24'
  tone: 'gold' | 'mint' | 'sand';  // pill styling: pending / handled / closed
  resolved: boolean;
}

/** One line of the board's decisions log. */
export interface Decision {
  id: string;
  dateLabel: string;   // 'JUN 18'
  text: string;
  pillLabel: string;   // 'Passed 91–22'
  passed: boolean;
}

/** A report in the board's live triage queue (empty in demo — the demo
 * renders its scripted triage cards instead). */
export interface TriageItem {
  id: string;
  title: string;
  sub: string;        // 'Reported privately by #27 · Maintenance'
  status: string;     // open | ticketed | in_progress | resolved
  ref: string;        // '#M-92' once ticketed
  urgency: string;    // low | normal | urgent
  location: string;
  photoUrls: string[];
  boardNotes: string;
  vendor: string;
}

/** One message on a report's private thread (reporter ↔ board). */
export interface ThreadComment {
  id: string;
  authorName: string;
  me: boolean;
  body: string;
  time: string;
}

/** An ARC request in the board's live queue, across all units. */
export interface BoardArcItem {
  id: string;
  ref: string;
  title: string;
  unitLabel: string;
  approved: boolean;
  status: string;          // submitted | in_review | info_requested | approved | declined
  attachmentUrls: string[];
}

/** Resident-submitted report (private to the board). */
export interface NewReport {
  kind: string;        // 'Maintenance' | 'Safety' | …
  description: string;
  urgency?: string;    // low | normal | urgent
  location?: string;
  photos?: File[];
}

/** Resident-submitted ARC request. */
export interface NewArcRequest {
  type: string;        // 'Paint' | 'Fence' | …
  description: string;
  attachments?: File[];
}

/** Board's decision on an ARC request. */
export type ArcDecision = 'approved' | 'declined' | 'info_requested';

/** Board-opened community ballot. yesno keeps the classic two-label form;
 * options carries N choices (multi allows picking several). */
export interface NewVote {
  question: string;
  yesLabel?: string;
  noLabel?: string;
  kind?: 'yesno' | 'options';
  options?: string[];
  multi?: boolean;
  closesAt?: string | null;   // ISO timestamp; null = no deadline
}

/** A board-issued violation (live board flow). */
export interface NewViolation {
  unitId: string;
  title: string;
  description: string;
  severity: string;      // courtesy | warning | fine
  fineCents: number;
  photos?: File[];
}

/** A unit reference for board pickers. */
export interface UnitRef {
  id: string;
  label: string;
}

/** A violation row in the board's compliance list. */
export interface BoardViolation {
  id: string;
  unitLabel: string;
  title: string;
  severity: string;
  status: string;        // open | fixed | resolved
  fineLabel: string;     // '$50' or ''
}

/** A row in the board's member-admin list. */
export interface AdminMember {
  membershipId: string;
  profileId: string;
  name: string;
  unitLabel: string;
  role: 'resident' | 'board';
  status: string;        // active | inactive
}

/** A booking row in the board's all-reservations view. */
export interface BoardBooking {
  id: string;
  amenity: string;
  dayLabel: string;
  slotLabel: string;
  memberName: string;
}

/** A community meeting (board-scheduled; minutes publish into Documents). */
export interface Meeting {
  id: string;
  title: string;
  whenLabel: string;
  whereLabel: string;
  agenda: string[];
  minutesUrl: string | null;
  status: string;        // scheduled | past
}

/** One board action in the audit trail (board-visible). */
export interface AuditEntry {
  id: string;
  actorName: string;
  action: string;
  detail: string;
  time: string;
}

/** One message in the board's private channel (Board Desk chat). */
export interface BoardMessage {
  id: string;
  authorName: string;
  authorInitial: string;
  authorColor: string;
  me: boolean;
  text: string;
  time: string;
  /** Named thread this message belongs to; null = the pinned General thread. */
  topic: string | null;
  photoUrls: string[];
}

/** A pending/accepted invitation to join the community (board-managed). */
export interface Invite {
  id: string;
  email: string;
  unitLabel: string;
  role: 'resident' | 'board';
  status: string;   // pending | accepted | revoked | expired
  code: string;     // shareable claim code (invite link)
  expiresLabel: string;  // 'Expires Aug 5'
}

/** The signed-in member's identity + their place in the community. */
export interface MemberContext {
  name: string;
  initial: string;
  color: string;
  role: 'resident' | 'board';
  communityName: string;
  unitLabel: string;
  phone?: string;
  avatarUrl?: string | null;
  hideDirectory?: boolean;
}

export interface Repository {
  /**
   * Subscribe to mutable-domain changes (bookings, groups, …). Returns an
   * unsubscribe fn. Hooks pair this with the sync getters below via
   * useSyncExternalStore so writes re-render the UI.
   */
  subscribe(listener: () => void): () => void;

  /**
   * Whether this backend serves the scripted presenter demo. Screens use it to
   * gate demo-flavor panels (finance breakdowns, meeting prep, digest drafts)
   * that have no live data domain yet — live shows honest empty states instead.
   */
  isDemo(): boolean;

  /** The current member's identity/community. null until resolved (live mode). */
  getMember(): MemberContext | null;

  /** The member's dues: the actionable statement + payment history (empty in live). */
  getDues(): DuesState;

  /** The community's open ballot + this member's vote (open is null when none). */
  getVotes(): VotesState;
  /** Cast (or change) this member's ballot on a yes/no vote. */
  castVote(voteId: string, choice: VoteChoice): Promise<void>;
  /** Cast (or change) this member's picks on an options ballot. */
  castOptionVote(voteId: string, optionIds: string[]): Promise<void>;
  /** Board: close a ballot — it moves to the results history. */
  closeVote(voteId: string): Promise<void>;

  /** The member's open courtesy notice / violation (null when compliant). */
  getViolation(): ViolationNotice | null;
  /** The member's one-time special assessment (null when none). */
  getAssessment(): SpecialAssessment | null;

  /** The member's ARC requests + any unseen approval (empty for a fresh member). */
  getArc(): ArcState;

  /** The board's triage queue summary (empty for a fresh community). */
  getBoardTriage(): BoardTriage;

  /** Community-visible maintenance issues (from the board's queue; empty when none). */
  getIssues(): KnownIssue[];

  /** The board's decisions log (empty for a fresh community). */
  getDecisions(): Decision[];

  // Write paths. In live these insert/update real rows and re-hydrate; in the
  // demo they drive the same scripted store flags the sheets always set, so
  // the presenter flow is unchanged.
  /** File a private report to the board. */
  createReport(input: NewReport): Promise<void>;
  /** Board: advance a report (create ticket / start work / resolve). */
  setReportStatus(id: string, status: 'ticketed' | 'in_progress' | 'resolved'): Promise<void>;
  /** Board: assign a vendor/person to a report. */
  assignReport(id: string, vendor: string): Promise<void>;
  /** Board: private working notes on a report. */
  setReportNotes(id: string, notes: string): Promise<void>;
  /** The report's private thread (reporter ↔ board). */
  listReportComments(reportId: string): Promise<ThreadComment[]>;
  addReportComment(reportId: string, body: string): Promise<void>;
  /** The board's live triage rows (empty in demo — scripted cards render instead). */
  getTriageItems(): TriageItem[];
  /** The member's own reports (live MyPlace "My requests"; empty in demo). */
  getMyReports(): TriageItem[];

  /** Submit an ARC request for the member's unit. */
  createArcRequest(input: NewArcRequest): Promise<void>;
  /** Board: decide an ARC request — approve (with optional conditions),
   * decline (with reason), or request more info. Approvals log a decision. */
  decideArc(id: string, decision: ArcDecision, note?: string, conditions?: string): Promise<void>;
  /** The board's live ARC queue across all units (empty in demo). */
  getBoardArcQueue(): BoardArcItem[];

  /** Post to the Commons feed as the signed-in member. */
  createFeedPost(body: string, opts?: { kind?: string; photos?: File[] }): Promise<void>;
  /** Delete the member's own post (board can delete any). */
  deleteFeedPost(id: string): Promise<void>;
  /** Board: pin/unpin an announcement to the top of the feed. */
  togglePinPost(id: string): Promise<void>;
  /** Heart/unheart a post. */
  togglePostLike(id: string): Promise<void>;
  listPostComments(postId: string): Promise<ThreadComment[]>;
  addPostComment(postId: string, body: string): Promise<void>;

  /** Board: open a community ballot (two-label yes/no or N options). */
  openVote(input: NewVote): Promise<void>;

  /** Member marks their own courtesy notice fixed (self-cure). */
  markViolationFixed(): Promise<void>;
  /** Board: issue a violation on a unit. */
  createViolation(input: NewViolation): Promise<void>;
  /** Board: close a violation for good. */
  resolveViolation(id: string): Promise<void>;
  /** Board: the community's open/fixed violations across units. */
  getBoardViolations(): BoardViolation[];
  /** Board: the community's units (pickers; live only). */
  getUnits(): UnitRef[];

  // Board chat (private board channel; live only)
  getBoardChat(): BoardMessage[];
  /** topic null/omitted posts to the pinned General thread. */
  sendBoardMessage(text: string, topic?: string | null, photos?: File[]): Promise<void>;
  /** Delete the member's own board-chat message. */
  deleteBoardMessage(id: string): Promise<void>;
  /** Board: rename a topic (all of its messages move with it). */
  renameBoardTopic(oldName: string, newName: string): Promise<void>;
  /** Board: archive a topic — hidden from the list, messages retained. */
  archiveBoardTopic(name: string): Promise<void>;
  /** Topic names archived away (so the list can filter them). */
  getArchivedBoardTopics(): string[];

  // Invites (board-managed; live only — the demo has no join flow)
  getInvites(): Invite[];
  createInvite(input: { email: string; unitLabel: string; role: 'resident' | 'board' }): Promise<void>;
  revokeInvite(id: string): Promise<void>;
  /** Board: push a pending invite's expiry out another 14 days. */
  renewInvite(id: string): Promise<void>;

  // Member & unit admin (board; live only)
  getAdminMembers(): AdminMember[];
  setMemberRole(membershipId: string, role: 'resident' | 'board'): Promise<void>;
  setMemberStatus(membershipId: string, status: 'active' | 'inactive'): Promise<void>;
  assignMemberUnit(membershipId: string, unitLabel: string): Promise<void>;

  // Profile (live only; demo identity is scripted)
  updateProfile(patch: { name?: string; phone?: string; color?: string; hideDirectory?: boolean }): Promise<void>;

  // Documents (live: board-uploaded library; demo: scripted)
  /** Reactive documents list (live re-renders as the library hydrates). */
  getDocs(): Doc[];
  uploadDocument(input: { file: File; name: string; section: string }): Promise<void>;
  deleteDocument(id: string): Promise<void>;

  // Meetings (live; demo meeting prep is scripted)
  getMeetings(): Meeting[];
  createMeeting(input: { title: string; whenLabel: string; whereLabel: string; agenda: string[] }): Promise<void>;
  /** Board: upload minutes — they also land in Documents under Minutes. */
  publishMinutes(meetingId: string, file: File): Promise<void>;

  // Audit trail (board; live only)
  getAuditLog(): AuditEntry[];

  /** Community events (empty for a fresh community). */
  getEvents(): CommunityEvent[];
  /** RSVP / un-RSVP the signed-in member to a community event. */
  toggleEventRsvp(id: string): Promise<void>;
  /** Board: create a community event. */
  createEvent(input: { title: string; whenLabel: string; whereLabel: string; tagLabel?: string }): Promise<void>;
  /** Commons feed posts (empty for a fresh community). */
  getFeed(): FeedPost[];

  // Reservations
  /** The community's bookable amenities, reactive (empty for a fresh community). */
  getAmenities(): Amenity[];
  listAmenities(): Promise<Amenity[]>;
  /** Board: add a bookable amenity (hours/slots/capacity configurable). */
  createAmenity(input: { name: string; sub: string; rules: string; icon: string; openHour?: number; closeHour?: number; slotMinutes?: number; capacity?: number; maxDaysAhead?: number }): Promise<void>;
  /** Board: adjust an amenity's booking configuration. */
  updateAmenity(id: string, patch: Partial<{ name: string; sub: string; rules: string; openHour: number; closeHour: number; slotMinutes: number; capacity: number; maxDaysAhead: number }>): Promise<void>;
  /** Board: retire an amenity (soft — it stops showing, history survives). */
  retireAmenity(id: string): Promise<void>;
  /** Board: every active booking across the community. */
  getBoardBookings(): BoardBooking[];
  getReservationSlots(): Promise<string[]>;
  getReservationDays(): Promise<string[]>;
  getReservation(): ReservationState;
  createReservation(input: NewReservation): Promise<void>;
  cancelReservation(): Promise<void>;

  // Feed comments
  getComments(): Comment[];
  addComment(text: string): Promise<void>;

  // Direct messages
  /** Reactive chat index: who you can message + last-message preview.
   * Demo: the scripted seed. Live: every other community member, with real
   * thread previews merged in (keys are profile ids). */
  getChatIndex(): ChatSeed;
  /** Reactive community directory (live: fellow members; demo: seed). */
  getDirectory(): DirEntry[];
  getChats(): Record<string, ChatMsg[]>;
  /** Mark a thread read (clears its unread badge; demo no-op). */
  markChatRead(chatKey: string): void;
  /** `reply` (default true) triggers the scripted neighbor reply; photos pass false. */
  sendChatMessage(chatKey: string, text: string, reply?: boolean, photos?: File[]): Promise<void>;
  /** Delete the member's own DM (live only). */
  deleteChatMessage(chatKey: string, messageId: string): Promise<void>;

  // Groups & group chats
  getGroups(): Record<string, GroupData>;
  sendGroupMessage(groupKey: string, text: string): Promise<void>;
  /** Returns the new group's key so the caller can open it. */
  createGroup(input: NewGroup): Promise<string>;
  toggleGroupJoin(groupKey: string): Promise<void>;
  toggleGroupMute(groupKey: string): Promise<void>;
  voteGroupPoll(groupKey: string, pollId: string, option: string): Promise<void>;
  rsvpGroupEvent(groupKey: string, eventId: string): Promise<void>;
  /** Start a poll in a group (live). */
  createGroupPoll(groupKey: string, question: string, options: string[]): Promise<void>;
  /** Schedule a group event (live). */
  createGroupEvent(groupKey: string, title: string, whenLabel: string, whereLabel: string): Promise<void>;
  /** Archive a group (creator or board; hidden from lists, history kept). */
  archiveGroup(groupKey: string): Promise<void>;

  // Community / people
  listDirectory(): Promise<DirEntry[]>;
  listCircles(): Promise<Circle[]>;
  listFreeItems(): Promise<FreeItem[]>;
  getChatSeed(): Promise<ChatSeed>;

  // HOA / board
  listVendors(): Promise<Vendor[]>;
  listDocuments(): Promise<Doc[]>;
  listDocSections(): Promise<DocSection[]>;
  listArcTypes(): Promise<string[]>;
  listPortfolio(): Promise<PortfolioEntry[]>;
  listAging(): Promise<AgingBucket[]>;

  // Cross-cutting
  listNotifications(): Promise<Notif[]>;
  listNotifCategories(): Promise<string[]>;
  listMapPins(): Promise<Pin[]>;
  listMapLayers(): Promise<MapLayer[]>;
  getSearchIndex(): Promise<SearchItem[]>;
  getAiQA(): Promise<QA>;

  // Onboarding config
  listHouseholdOptions(): Promise<HHOption[]>;
  listOnboardCircles(): Promise<OnboardCircle[]>;
}

/**
 * Synchronous seed snapshot, keyed by the same domains the async methods
 * expose. Instant-render backends (the mock) implement this so hooks can seed
 * initial state with no loading flicker; async-only backends omit it and their
 * hooks render once the first fetch resolves.
 */
export interface RepositorySnapshot {
  amenities: Amenity[];
  reservationSlots: string[];
  reservationDays: string[];
  directory: DirEntry[];
  circles: Circle[];
  freeItems: FreeItem[];
  chatSeed: ChatSeed;
  vendors: Vendor[];
  documents: Doc[];
  docSections: DocSection[];
  arcTypes: string[];
  portfolio: PortfolioEntry[];
  aging: AgingBucket[];
  notifications: Notif[];
  notifCategories: string[];
  mapPins: Pin[];
  mapLayers: MapLayer[];
  searchIndex: SearchItem[];
  aiQA: QA;
  householdOptions: HHOption[];
  onboardCircles: OnboardCircle[];
}

export interface SnapshotReadable {
  snapshot(): RepositorySnapshot;
}

export const hasSnapshot = (repo: Repository): repo is Repository & SnapshotReadable =>
  typeof (repo as Partial<SnapshotReadable>).snapshot === 'function';
