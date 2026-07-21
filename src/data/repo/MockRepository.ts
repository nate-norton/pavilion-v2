import {
  AMENS, SLOTS, DAYS, VENDORS, ARC_TYPES, HH, ONBOARD_CIRCLES, QA, DIR, FREE,
  PINS, MAP_LAYERS, PORTFOLIO, AGING, CIRC, NOTIFS, NOTIF_CATS, CHAT_SEED,
  DOCS, DOC_SECTIONS, SEARCH,
} from '..';
import type { MemberContext, NewGroup, NewReservation, Repository, RepositorySnapshot, SnapshotReadable } from './Repository';
import type { GroupData } from '../types';
import { mockDomain } from './mockDomainStore';

/** The demo persona (stable reference for useSyncExternalStore). */
const DEMO_MEMBER: MemberContext = {
  name: 'Alex Rivera', initial: 'A', color: '#1A3352', role: 'board',
  communityName: 'Juniper Ridge', unitLabel: '#27 Alder Way',
};

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

  getMember = () => DEMO_MEMBER;

  listAmenities = async () => AMENS;
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
    mockDomain.set({ comments: [...mockDomain.get().comments, { who: 'You', color: '#1A3352', text }] });
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
      members: [{ name: 'You', initial: 'A', color: '#1A3352' }],
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
          ? [...g.members, { name: 'You', initial: 'A', color: '#1A3352' }]
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
