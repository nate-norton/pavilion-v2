import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AMENS, SLOTS, DAYS, QA } from '../data';

export interface PennyMsg {
  me: boolean;
  text: string;
  cite: string | null;
  askBoard?: boolean;
}

export interface ChatMsg {
  me: boolean;
  text: string;
  time: string;
}

export interface Comment {
  who: string;
  color: string;
  text: string;
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
  waved: boolean;
  filter: string;
  amenIdx: number | null;
  slotIdx: number | null;
  booked: boolean;
  bookingSummary: string | null;
  dayIdx: number;
  durIdx: number;
  waitlisted: Record<string, boolean>;
  pennyOpen: boolean;
  typing: boolean;
  pennyInput: string;
  msgs: PennyMsg[];
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
  dirWaved: Record<string, boolean>;
  circJoined: Record<string, boolean>;
  largeType: boolean;
  notifOpen: boolean;
  notifsRead: boolean;
  mutedCats: Record<string, boolean>;
  chatWith: string | null;
  chats: Record<string, ChatMsg[]>;
  chatInput: string;
  msgsOpen: boolean;
  docsOpen: boolean;
  docReader: boolean;
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
  loginOpen: boolean;
  commentsOpen: boolean;
  comments: Comment[];
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
  vehicleAdded: boolean;
  petAdded: boolean;
  arcNeedsInfo: boolean;
  digestScheduled: boolean;
  langOpen: boolean;
  // scenario flags
  showDelinquent: boolean;
  showSpecialAssessment: boolean;
  showViolation: boolean;
  showAlert: boolean;
}

export interface PavActions {
  set: (patch: Partial<PavData>) => void;
  book: () => void;
  cancelBooking: () => void;
  submitArc: () => void;
  submitReport: () => void;
  issuePass: () => void;
  sendBroadcast: () => void;
  postVote: () => void;
  sendPennyMessage: (text: string) => void;
  askPennyChip: (key: string) => void;
  askPennyDocsSummary: () => void;
  sendChatMessage: () => void;
  pickRole: (role: string) => void;
  addComment: () => void;
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
  waved: false,
  filter: 'all',
  amenIdx: null,
  slotIdx: null,
  booked: false,
  bookingSummary: null,
  dayIdx: 0,
  durIdx: 1,
  waitlisted: {},
  pennyOpen: false,
  typing: false,
  pennyInput: '',
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
  dirWaved: {},
  circJoined: {},
  largeType: false,
  notifOpen: false,
  notifsRead: false,
  mutedCats: {},
  chatWith: null,
  chats: {},
  chatInput: '',
  msgsOpen: false,
  docsOpen: false,
  docReader: false,
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
  loginOpen: false,
  commentsOpen: false,
  comments: [
    { who: 'Tom B.', color: '#4A90E2', text: 'Anytime, Maria!' },
    { who: 'Priya S.', color: '#2A9D5C', text: 'This is what the Ridge is about.' },
  ],
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
  vehicleAdded: false,
  petAdded: false,
  arcNeedsInfo: false,
  digestScheduled: false,
  langOpen: false,
  // scenario flags
  showDelinquent: false,
  showSpecialAssessment: false,
  showViolation: true,
  showAlert: false,
};

function now(): string {
  const d = new Date();
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12;
  if (h === 0) h = 12;
  return h + ':' + m + ' ' + ap;
}

export const usePavStore = create<PavState>()(persist((set, get) => ({
  ...dataDefaults,

  set: (patch) => set(patch),

  book: () => {
    const st = get();
    if (st.slotIdx == null || st.amenIdx == null) return;
    const a = AMENS[st.amenIdx];
    const dayLabel = DAYS[st.dayIdx].split(' · ')[0];
    set({
      booked: true,
      calAdded: false,
      bookingSummary:
        a.name + ' · ' + dayLabel + ', ' + SLOTS[st.slotIdx] + ' · ' + ['1 hr', '2 hr'][st.durIdx],
    });
  },

  cancelBooking: () => set({ booked: false, bookingSummary: null, slotIdx: null, calAdded: false }),

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

  sendPennyMessage: (text: string) => {
    const t = text.trim();
    if (!t) return;
    const epoch = get().epoch;
    set((s) => ({ msgs: [...s.msgs, { me: true, text: t, cite: null }], pennyInput: '', typing: true }));
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

  askPennyChip: (key: string) => {
    const qa = QA[key];
    if (!qa) return;
    const epoch = get().epoch;
    set((s) => ({ msgs: [...s.msgs, { me: true, text: qa.q, cite: null }], typing: true }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      set((s) => ({ msgs: [...s.msgs, { me: false, text: qa.a, cite: qa.cite }], typing: false }));
    }, 1100);
  },

  askPennyDocsSummary: () => {
    const epoch = get().epoch;
    set((s) => ({
      docsOpen: false,
      docReader: false,
      pennyOpen: true,
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

  sendChatMessage: () => {
    const st = get();
    const t = st.chatInput.trim();
    const k = st.chatWith;
    if (!t || !k) return;
    const tm = now();
    const epoch = st.epoch;
    set((s) => ({
      chats: { ...s.chats, [k]: [...(s.chats[k] || []), { me: true, text: t, time: tm }] },
      chatInput: '',
    }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      set((s) => ({
        chats: {
          ...s.chats,
          [k]: [...(s.chats[k] || []), { me: false, text: 'Sounds good — see you around the Ridge!', time: now() }],
        },
      }));
    }, 1200);
  },

  pickRole: (role: string) => {
    set((s) => ({
      role,
      boardMode: false,
      myPlaceOpen: false,
      portfolioOpen: false,
      tab: 'today',
      epoch: s.epoch + 1,
    }));
  },

  addComment: () => {
    const t = get().commentInput.trim();
    if (!t) return;
    set((s) => ({
      comments: [...s.comments, { who: 'You', color: '#1A3352', text: t }],
      commentInput: '',
    }));
  },
}), {
  name: 'pavilion-demo',
  partialize: (state) => {
    const { typing, pennyInput, chatInput, commentInput, searchQ, docQ, bcText, ...rest } = state;
    return rest;
  },
}));

export const initialState: PavState = usePavStore.getState();
