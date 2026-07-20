import {
  AMENS, SLOTS, DAYS, VENDORS, ARC_TYPES, HH, ONBOARD_CIRCLES, QA, DIR, FREE,
  PINS, MAP_LAYERS, PORTFOLIO, AGING, CIRC, NOTIFS, NOTIF_CATS, CHAT_SEED,
  DOCS, DOC_SECTIONS, SEARCH,
} from '..';
import type { Repository, RepositorySnapshot, SnapshotReadable } from './Repository';

/**
 * Demo backend. Serves the in-memory `src/data/*` seed data behind the async
 * Repository contract, and exposes a synchronous snapshot() so hooks render
 * instantly (the demo has no real latency). Preserves today's behavior exactly.
 */
export class MockRepository implements Repository, SnapshotReadable {
  listAmenities = async () => AMENS;
  getReservationSlots = async () => SLOTS;
  getReservationDays = async () => DAYS;

  listDirectory = async () => DIR;
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
