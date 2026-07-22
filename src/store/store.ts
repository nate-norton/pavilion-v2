import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { QA } from '../data';

// Mutable domain entities now live in the data layer (the contract the
// repository implements). Re-exported here for existing importers.
export type { ChatMsg, Comment, GroupPoll, GroupEvent, GroupPin, GroupData } from '../data/types';

export interface AiMsg {
  me: boolean;
  text: string;
  cite: string | null;
  askBoard?: boolean;
}

export interface HHState {
  partner: boolean;
  kids: boolean;
  renter: boolean;
  pets: boolean;
}

export interface CirclesState {
  garden: boolean;
  pickle: boolean;
  book: boolean;
  parents: boolean;
  trail: boolean;
  poker: boolean;
}

export interface PavData {
  epoch: number;
  tab: string;
  role: string;
  voted: 'yes' | 'no' | null;
  arcSeen: boolean;
  rsvpFood: boolean;
  rsvpMovie: boolean;
  liked: boolean;
  offered: boolean;
  filter: string;
  amenIdx: number | null;
  slotIdx: number | null;
  bookingConfirmed: boolean;
  dayIdx: number;
  durIdx: number;
  waitlisted: Record<string, boolean>;
  aiOpen: boolean;
  typing: boolean;
  aiInput: string;
  msgs: AiMsg[];
  paySheetOpen: boolean;
  paid: boolean;
  autopay: boolean;
  planActive: boolean;
  apPaused: boolean;
  arcSheetOpen: boolean;
  arcType: string | null;
  arcDesc: string;
  arcSubmitted: boolean;
  arcApprovedByBoard: boolean;
  boardMode: boolean;
  boardTab: string;
  reportTicketed: boolean;
  gateScheduled: boolean;
  reminderSent: boolean;
  bcText: string;
  broadcastSent: boolean;
  m89Assigned: boolean;
  courtesySent: boolean;
  invApproved: boolean;
  minutesPublished: boolean;
  obOpen: boolean;
  obStep: number;
  hh: HHState;
  circles: CirclesState;
  obAutopay: boolean;
  myPlaceOpen: boolean;
  mapOpen: boolean;
  mapLayer: string;
  selPin: string | null;
  commonsView: string;
  nudgeDismissed: boolean;
  claimed: Record<string, boolean>;
  circJoined: Record<string, boolean>;
  largeType: boolean;
  brandTheme: string;
  notifOpen: boolean;
  notifsRead: boolean;
  mutedCats: Record<string, boolean>;
  chatWith: string | null;
  chatInput: string;
  msgsOpen: boolean;
  docsOpen: boolean;
  docReader: boolean;
  docReaderKey: string;
  docQ: string;
  diffOpen: boolean;
  circleOpen: boolean;
  rsvpGarden: boolean;
  eventsOpen: boolean;
  rsvpPool: boolean;
  volPopcorn: boolean;
  meetingOpen: boolean;
  handRaised: boolean;
  proxyOpen: boolean;
  proxyPick: string | null;
  reportOpen: boolean;
  reportType: string | null;
  reportDesc: string;
  reportSubmitted: boolean;
  passOpen: boolean;
  passName: string;
  passPlate: string;
  passDur: number;
  passIssued: boolean;
  passTexted: boolean;
  loginOpen: boolean;
  commentsOpen: boolean;
  commentInput: string;
  alertDismissed: boolean;
  searchOpen: boolean;
  searchQ: string;
  violSheetOpen: boolean;
  violFixed: boolean;
  calAdded: boolean;
  voteDraftOpen: boolean;
  voteQ: string;
  voteOptA: string;
  voteOptB: string;
  votePosted: boolean;
  memberAdded: boolean;
  portfolioOpen: boolean;
  saSheetOpen: boolean;
  saPaid: boolean;
  saPlan: boolean;
  tenantRegistered: boolean;
  exportOpen: boolean;
  exportDone: string | null;
  activeCommunity: number;
  // detail sheets
  arcDetailId: string | null;
  issueDetailId: string | null;
  paymentDetailIdx: number | null;
  decisionDetailIdx: number | null;
  composeOpen: boolean;
  manageAmenOpen: boolean;
  vehicleAdded: boolean;
  petAdded: boolean;
  arcNeedsInfo: boolean;
  digestScheduled: boolean;
  langOpen: boolean;
  // photo attachment state
  arcPhoto1: boolean;
  arcPhoto2: boolean;
  reportPhoto: boolean;
  composePhoto: boolean;
  // payment method picker
  payMethodOpen: boolean;
  payMethod: string;
  // circle detail
  circlePostLiked: Record<string, boolean>;
  // new message
  newMsgOpen: boolean;
  activeGroup: string | null;
  groupChatInput: string;
  createGroupOpen: boolean;
  createGroupName: string;
  createGroupDesc: string;
  createGroupIcon: string;
  createGroupColor: string;
  // scenario flags
  showDelinquent: boolean;
  showSpecialAssessment: boolean;
  showViolation: boolean;
  showAlert: boolean;
}

export interface PavActions {
  set: (patch: Partial<PavData>) => void;
  submitArc: () => void;
  submitReport: () => void;
  issuePass: () => void;
  sendBroadcast: () => void;
  postVote: () => void;
  sendAiMessage: (text: string) => void;
  askAiChip: (key: string) => void;
  askAiDocsSummary: () => void;
  pickRole: (role: string) => void;
}

export type PavState = PavData & PavActions;

export const dataDefaults: PavData = {
  epoch: 0,
  tab: 'today',
  role: 'owner',
  voted: null,
  arcSeen: false,
  rsvpFood: false,
  rsvpMovie: false,
  liked: false,
  offered: false,
  filter: 'all',
  amenIdx: null,
  slotIdx: null,
  bookingConfirmed: false,
  dayIdx: 0,
  durIdx: 1,
  waitlisted: {},
  aiOpen: false,
  typing: false,
  aiInput: '',
  msgs: [
    {
      me: false,
      text: "Hi Alex — ask me anything about Juniper Ridge. I answer from the community's actual documents and cite my sources.",
      cite: null,
    },
  ],
  paySheetOpen: false,
  paid: false,
  autopay: true,
  planActive: false,
  apPaused: false,
  arcSheetOpen: false,
  arcType: null,
  arcDesc: '',
  arcSubmitted: false,
  arcApprovedByBoard: false,
  boardMode: false,
  boardTab: 'desk',
  reportTicketed: false,
  gateScheduled: false,
  reminderSent: false,
  bcText: '',
  broadcastSent: false,
  m89Assigned: false,
  courtesySent: false,
  invApproved: false,
  minutesPublished: false,
  obOpen: false,
  obStep: 0,
  hh: { partner: true, kids: false, renter: false, pets: false },
  circles: { garden: false, pickle: false, book: false, parents: false, trail: false, poker: false },
  obAutopay: true,
  myPlaceOpen: false,
  mapOpen: false,
  mapLayer: 'all',
  selPin: null,
  commonsView: 'feed',
  nudgeDismissed: false,
  claimed: {},
  circJoined: {},
  largeType: false,
  brandTheme: 'juniper',
  notifOpen: false,
  notifsRead: false,
  mutedCats: {},
  chatWith: null,
  chatInput: '',
  msgsOpen: false,
  docsOpen: false,
  docReader: false,
  docReaderKey: 'ccrs',
  docQ: '',
  diffOpen: false,
  circleOpen: false,
  rsvpGarden: false,
  eventsOpen: false,
  rsvpPool: false,
  volPopcorn: false,
  meetingOpen: false,
  handRaised: false,
  proxyOpen: false,
  proxyPick: null,
  reportOpen: false,
  reportType: null,
  reportDesc: '',
  reportSubmitted: false,
  passOpen: false,
  passName: '',
  passPlate: '',
  passDur: 0,
  passIssued: false,
  passTexted: false,
  loginOpen: false,
  commentsOpen: false,
  commentInput: '',
  alertDismissed: false,
  searchOpen: false,
  searchQ: '',
  violSheetOpen: false,
  violFixed: false,
  calAdded: false,
  voteDraftOpen: false,
  voteQ: '',
  voteOptA: 'Yes',
  voteOptB: 'No',
  votePosted: false,
  memberAdded: false,
  portfolioOpen: false,
  saSheetOpen: false,
  saPaid: false,
  saPlan: false,
  tenantRegistered: false,
  exportOpen: false,
  exportDone: null,
  activeCommunity: 0,
  // detail sheets
  arcDetailId: null,
  issueDetailId: null,
  paymentDetailIdx: null,
  decisionDetailIdx: null,
  composeOpen: false,
  manageAmenOpen: false,
  vehicleAdded: false,
  petAdded: false,
  arcNeedsInfo: false,
  digestScheduled: false,
  langOpen: false,
  // photo attachment state
  arcPhoto1: false,
  arcPhoto2: false,
  reportPhoto: false,
  composePhoto: false,
  // payment method picker
  payMethodOpen: false,
  payMethod: 'jcu',
  // circle detail
  circlePostLiked: {},
  // new message
  newMsgOpen: false,
  // groups
  activeGroup: null,
  groupChatInput: '',
  createGroupOpen: false,
  createGroupName: '',
  createGroupDesc: '',
  createGroupIcon: 'ph-fill ph-users-three',
  createGroupColor: '#1A3352',
  // scenario flags
  showDelinquent: false,
  showSpecialAssessment: false,
  showViolation: true,
  showAlert: false,
};

/**
 * Every overlay/sheet/detail flag collapsed to its closed state. Derived
 * from dataDefaults so any new `*Open` sheet is covered automatically.
 * Spread this to guarantee a clean surface when switching roles, resetting,
 * or replaying onboarding — no stale sheet left floating over the app.
 */
const OVERLAY_DETAIL_KEYS = [
  'chatWith', 'activeGroup', 'arcDetailId', 'issueDetailId',
  'paymentDetailIdx', 'decisionDetailIdx',
] as const;
export const overlaysClosed: Partial<PavData> = (() => {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(dataDefaults)) {
    if (key.endsWith('Open')) out[key] = false;
  }
  for (const key of OVERLAY_DETAIL_KEYS) out[key] = null;
  return out as Partial<PavData>;
})();

export const usePavStore = create<PavState>()(persist((set, get) => ({
  ...dataDefaults,

  set: (patch) => set(patch),

  submitArc: () => {
    if (!get().arcType) return;
    set({ arcSubmitted: true, arcSheetOpen: false });
  },

  submitReport: () => {
    if (!get().reportType) return;
    set({ reportSubmitted: true });
  },

  issuePass: () => {
    const st = get();
    if (st.passName.trim() && st.passPlate.trim()) set({ passIssued: true });
  },

  sendBroadcast: () => {
    if (get().bcText.trim()) set({ broadcastSent: true });
  },

  postVote: () => {
    if (get().voteQ.trim()) set({ votePosted: true });
  },

  sendAiMessage: (text: string) => {
    const t = text.trim();
    if (!t) return;
    const epoch = get().epoch;
    set((s) => ({ msgs: [...s.msgs, { me: true, text: t, cite: null }], aiInput: '', typing: true }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      set((s) => ({
        msgs: [
          ...s.msgs,
          {
            me: false,
            text: "I couldn't find that in Juniper Ridge's documents, so I won't guess. This looks like a call for the board rather than the rulebook — want me to pass it along?",
            cite: null,
            askBoard: true,
          },
        ],
        typing: false,
      }));
    }, 1000);
  },

  askAiChip: (key: string) => {
    const qa = QA[key];
    if (!qa) return;
    const epoch = get().epoch;
    set((s) => ({ msgs: [...s.msgs, { me: true, text: qa.q, cite: null }], typing: true }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      set((s) => ({ msgs: [...s.msgs, { me: false, text: qa.a, cite: qa.cite }], typing: false }));
    }, 1100);
  },

  askAiDocsSummary: () => {
    const epoch = get().epoch;
    set((s) => ({
      docsOpen: false,
      docReader: false,
      aiOpen: true,
      typing: true,
      msgs: [...s.msgs, { me: true, text: 'Summarize the CC&Rs for me', cite: null }],
    }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      set((s) => ({
        typing: false,
        msgs: [
          ...s.msgs,
          {
            me: false,
            text: 'The short version: exterior changes need ARC approval (§4), quiet hours are 10 PM–7 AM (§5.2), up to 4 hens but no roosters (§5.7), leases must run 6+ months (§7.4), and dues fund landscaping, insurance and reserves (§9). Want detail on any section?',
            cite: 'CC&Rs · 48 pages, summarized',
          },
        ],
      }));
    }, 1400);
  },

  pickRole: (role: string) => {
    set((s) => ({
      ...overlaysClosed,
      role,
      boardMode: false,
      tab: 'today',
      epoch: s.epoch + 1,
    }));
  },

}), {
  name: 'pavilion-demo',
  partialize: (state) => {
    const { typing, aiInput, chatInput, groupChatInput, commentInput, searchQ, docQ, bcText, bookingConfirmed, ...rest } = state;
    return rest;
  },
}));

export const initialState: PavState = usePavStore.getState();
