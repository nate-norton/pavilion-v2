import type {
  Amenity, Vendor, DirEntry, FreeItem, Doc, DocSection, Notif, Circle,
  PortfolioEntry, AgingBucket, Pin, MapLayer, SearchItem, ChatSeed, QA,
  HHOption, OnboardCircle,
} from '../types';

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
export interface Repository {
  // Reservations
  listAmenities(): Promise<Amenity[]>;
  getReservationSlots(): Promise<string[]>;
  getReservationDays(): Promise<string[]>;

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
