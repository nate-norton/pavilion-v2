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
}

/** The votes surface. `open` is null when nothing is on the ballot (empty state). */
export interface VotesState {
  open: OpenVote | null;
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
  status: string;     // open | ticketed | assigned | resolved
  ref: string;        // '#M-92' once ticketed
}

/** An ARC request in the board's live queue, across all units. */
export interface BoardArcItem {
  id: string;
  ref: string;
  title: string;
  unitLabel: string;
  approved: boolean;
}

/** Resident-submitted report (private to the board). */
export interface NewReport {
  kind: string;        // 'Maintenance' | 'Safety' | …
  description: string;
}

/** Resident-submitted ARC request. */
export interface NewArcRequest {
  type: string;        // 'Paint' | 'Fence' | …
  description: string;
}

/** Board-opened community ballot. */
export interface NewVote {
  question: string;
  yesLabel: string;
  noLabel: string;
}

/** The signed-in member's identity + their place in the community. */
export interface MemberContext {
  name: string;
  initial: string;
  color: string;
  role: 'resident' | 'board';
  communityName: string;
  unitLabel: string;
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
  /** Cast this member's ballot on the open vote. */
  castVote(voteId: string, choice: VoteChoice): Promise<void>;

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
  /** Board: advance a report (create ticket / resolve). */
  setReportStatus(id: string, status: 'ticketed' | 'resolved'): Promise<void>;
  /** The board's live triage rows (empty in demo — scripted cards render instead). */
  getTriageItems(): TriageItem[];
  /** The member's own reports (live MyPlace "My requests"; empty in demo). */
  getMyReports(): TriageItem[];

  /** Submit an ARC request for the member's unit. */
  createArcRequest(input: NewArcRequest): Promise<void>;
  /** Board: approve (or decline) an ARC request; approval logs a decision. */
  decideArc(id: string, approve: boolean): Promise<void>;
  /** The board's live ARC queue across all units (empty in demo). */
  getBoardArcQueue(): BoardArcItem[];

  /** Post to the Commons feed as the signed-in member. */
  createFeedPost(body: string): Promise<void>;

  /** Board: open a community ballot. */
  openVote(input: NewVote): Promise<void>;

  /** Member marks their own courtesy notice fixed (self-cure). */
  markViolationFixed(): Promise<void>;

  /** Community events (empty for a fresh community). */
  getEvents(): CommunityEvent[];
  /** Commons feed posts (empty for a fresh community). */
  getFeed(): FeedPost[];

  // Reservations
  /** The community's bookable amenities, reactive (empty for a fresh community). */
  getAmenities(): Amenity[];
  listAmenities(): Promise<Amenity[]>;
  /** Board: add a bookable amenity. */
  createAmenity(input: { name: string; sub: string; rules: string; icon: string }): Promise<void>;
  /** Board: retire an amenity (soft — it stops showing, history survives). */
  retireAmenity(id: string): Promise<void>;
  getReservationSlots(): Promise<string[]>;
  getReservationDays(): Promise<string[]>;
  getReservation(): ReservationState;
  createReservation(input: NewReservation): Promise<void>;
  cancelReservation(): Promise<void>;

  // Feed comments
  getComments(): Comment[];
  addComment(text: string): Promise<void>;

  // Direct messages
  getChats(): Record<string, ChatMsg[]>;
  /** `reply` (default true) triggers the scripted neighbor reply; photos pass false. */
  sendChatMessage(chatKey: string, text: string, reply?: boolean): Promise<void>;

  // Groups & group chats
  getGroups(): Record<string, GroupData>;
  sendGroupMessage(groupKey: string, text: string): Promise<void>;
  /** Returns the new group's key so the caller can open it. */
  createGroup(input: NewGroup): Promise<string>;
  toggleGroupJoin(groupKey: string): Promise<void>;
  toggleGroupMute(groupKey: string): Promise<void>;
  voteGroupPoll(groupKey: string, pollId: string, option: string): Promise<void>;
  rsvpGroupEvent(groupKey: string, eventId: string): Promise<void>;

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
