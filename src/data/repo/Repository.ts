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

  /** Community events (empty for a fresh community). */
  getEvents(): CommunityEvent[];
  /** Commons feed posts (empty for a fresh community). */
  getFeed(): FeedPost[];

  // Reservations
  listAmenities(): Promise<Amenity[]>;
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
