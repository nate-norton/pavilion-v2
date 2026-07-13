import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AMENS, SLOTS, DAYS, QA } from '../data';

export interface AiMsg {
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

export interface GroupPoll {
  id: string;
  question: string;
  options: string[];
  votes: Record<string, number>;
  myVote: string | null;
  author: string;
  time: string;
}

export interface GroupEvent {
  id: string;
  title: string;
  when: string;
  where: string;
  going: number;
  rsvped: boolean;
}

export interface GroupPin {
  id: string;
  text: string;
  author: string;
  time: string;
}

export interface GroupData {
  key: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  memberCount: number;
  isGroupChat: boolean;
  members: { name: string; initial: string; color: string }[];
  messages: ChatMsg[];
  polls: GroupPoll[];
  events: GroupEvent[];
  pins: GroupPin[];
  joined: boolean;
  muted: boolean;
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
  // groups
  groups: Record<string, GroupData>;
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
  book: () => void;
  cancelBooking: () => void;
  submitArc: () => void;
  submitReport: () => void;
  issuePass: () => void;
  sendBroadcast: () => void;
  postVote: () => void;
  sendAiMessage: (text: string) => void;
  askAiChip: (key: string) => void;
  askAiDocsSummary: () => void;
  sendChatMessage: () => void;
  pickRole: (role: string) => void;
  addComment: () => void;
  sendGroupMessage: () => void;
  createGroup: () => void;
  toggleGroupJoin: (groupKey: string) => void;
  toggleGroupMute: (groupKey: string) => void;
  voteGroupPoll: (groupKey: string, pollId: string, option: string) => void;
  rsvpGroupEvent: (groupKey: string, eventId: string) => void;
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
  groups: {
    'gc-block-party': {
      key: 'gc-block-party', name: 'Block Party Planning', icon: 'ph-fill ph-confetti', color: '#C75A31',
      description: 'Coordinating the annual block party — food, music, and good vibes.',
      memberCount: 7, isGroupChat: true, joined: true, muted: false,
      members: [
        { name: 'Tom B.', initial: 'T', color: '#4A90E2' },
        { name: 'Rosa M.', initial: 'R', color: '#C75A31' },
        { name: 'You', initial: 'A', color: '#1A3352' },
        { name: 'Priya S.', initial: 'P', color: '#2A9D5C' },
        { name: 'The Okafors', initial: 'O', color: '#D9A441' },
      ],
      messages: [
        { me: false, text: "We need to figure out the speaker situation", time: 'Today 11:20 AM' },
        { me: false, text: "Who's bringing the speaker?", time: 'Today 11:30 AM' },
      ],
      polls: [{
        id: 'bp-date', question: 'Best date for the block party?', author: 'Rosa M.', time: '2d ago',
        options: ['July 26', 'Aug 2', 'Aug 9'],
        votes: { 'July 26': 2, 'Aug 2': 4, 'Aug 9': 1 }, myVote: null,
      }],
      events: [{
        id: 'bp-setup', title: 'Setup day — tables & lights', when: 'Jul 25 · 4 PM', where: 'Clubhouse lawn', going: 5, rsvped: false,
      }],
      pins: [{ id: 'bp-budget', text: 'Budget: $400 from HOA + $12/household voluntary', author: 'Rosa M.', time: '5d ago' }],
    },
    'gc-trail-crew': {
      key: 'gc-trail-crew', name: 'Trail Crew', icon: 'ph-fill ph-tree', color: '#2A9D5C',
      description: 'Sunday morning trail maintenance and hikes. All levels welcome.',
      memberCount: 9, isGroupChat: true, joined: true, muted: false,
      members: [
        { name: 'Priya S.', initial: 'P', color: '#2A9D5C' },
        { name: 'Tom B.', initial: 'T', color: '#4A90E2' },
        { name: 'You', initial: 'A', color: '#1A3352' },
      ],
      messages: [
        { me: false, text: 'Sunday 8 AM still on — meet at trailhead', time: 'Yesterday 6:15 PM' },
      ],
      polls: [],
      events: [{
        id: 'tc-sunday', title: 'Sunday trail run', when: 'Sun · 8 AM', where: 'North trailhead', going: 6, rsvped: false,
      }],
      pins: [{ id: 'tc-gear', text: 'Bring gloves and clippers if you have them', author: 'Priya S.', time: '1w ago' }],
    },
    'gc-dog-owners': {
      key: 'gc-dog-owners', name: 'Dog Owners', icon: 'ph-fill ph-dog', color: '#D9A441',
      description: 'Playdates, vet recs, and keeping the paths clean.',
      memberCount: 11, isGroupChat: true, joined: true, muted: false,
      members: [
        { name: 'The Okafors', initial: 'O', color: '#D9A441' },
        { name: 'Rosa M.', initial: 'R', color: '#C75A31' },
        { name: 'You', initial: 'A', color: '#1A3352' },
      ],
      messages: [
        { me: false, text: 'Anyone else see a coyote near lot C?', time: 'Yesterday 2:40 PM' },
      ],
      polls: [{
        id: 'do-park', question: 'Should we ask the board for a dog park?', author: 'The Okafors', time: '3d ago',
        options: ['Yes!', 'Not now', 'Need more info'],
        votes: { 'Yes!': 7, 'Not now': 1, 'Need more info': 2 }, myVote: null,
      }],
      events: [{
        id: 'do-play', title: 'Saturday playdate', when: 'Sat · 10 AM', where: 'East field', going: 4, rsvped: false,
      }],
      pins: [],
    },
    'gr-garden': {
      key: 'gr-garden', name: 'Garden Club', icon: 'ph-fill ph-plant', color: '#74B992',
      description: 'Community garden plots, seed swaps, and growing tips.',
      memberCount: 12, isGroupChat: false, joined: true, muted: false,
      members: [
        { name: 'Rosa M.', initial: 'R', color: '#C75A31' },
        { name: 'Priya S.', initial: 'P', color: '#2A9D5C' },
        { name: 'You', initial: 'A', color: '#1A3352' },
      ],
      messages: [
        { me: false, text: 'Free tomato starts at plot 4 — first come first served!', time: 'Today 9:00 AM' },
      ],
      polls: [{
        id: 'gr-water', question: 'Preferred watering schedule?', author: 'Rosa M.', time: '1d ago',
        options: ['Morning only', 'Morning + evening', 'Leave as is'],
        votes: { 'Morning only': 3, 'Morning + evening': 6, 'Leave as is': 2 }, myVote: null,
      }],
      events: [{
        id: 'gr-swap', title: 'Seed swap & potluck', when: 'Jul 20 · 10 AM', where: 'Garden pavilion', going: 8, rsvped: false,
      }],
      pins: [{ id: 'gr-rules', text: 'Plot assignments posted on the shed door. Water your plot or lose it after 2 weeks.', author: 'Rosa M.', time: '2w ago' }],
    },
    'gr-parents': {
      key: 'gr-parents', name: 'Parents & Kids', icon: 'ph-fill ph-baby', color: '#4A90E2',
      description: 'Playdates, babysitter recs, and kid-friendly events.',
      memberCount: 18, isGroupChat: false, joined: false, muted: false,
      members: [
        { name: 'Rosa M.', initial: 'R', color: '#C75A31' },
        { name: 'The Okafors', initial: 'O', color: '#D9A441' },
      ],
      messages: [
        { me: false, text: 'Movie night this Friday — Encanto on the lawn', time: 'Mon 3:45 PM' },
      ],
      polls: [],
      events: [{
        id: 'pk-movie', title: 'Lawn movie night — Encanto', when: 'Fri · 7:30 PM', where: 'Clubhouse lawn', going: 14, rsvped: false,
      }],
      pins: [{ id: 'pk-sitters', text: 'Trusted babysitter list pinned — DM Rosa to add yours', author: 'Rosa M.', time: '1w ago' }],
    },
    'gr-pickle': {
      key: 'gr-pickle', name: 'Pickleball', icon: 'ph-fill ph-tennis-ball', color: '#E06A3E',
      description: 'Casual games, ladder matches, and court reservations.',
      memberCount: 9, isGroupChat: false, joined: false, muted: false,
      members: [
        { name: 'Tom B.', initial: 'T', color: '#4A90E2' },
        { name: 'Priya S.', initial: 'P', color: '#2A9D5C' },
      ],
      messages: [
        { me: false, text: 'Court 2 open tomorrow 6-8 AM if anyone wants in', time: 'Sun 10:20 AM' },
      ],
      polls: [],
      events: [{
        id: 'pk-tourney', title: 'Summer tournament signups', when: 'Aug 3 · 9 AM', where: 'Courts 1-2', going: 6, rsvped: false,
      }],
      pins: [],
    },
  },
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

  sendGroupMessage: () => {
    const st = get();
    const t = st.groupChatInput.trim();
    const k = st.activeGroup;
    if (!t || !k || !st.groups[k]) return;
    const tm = now();
    const epoch = st.epoch;
    set((s) => ({
      groups: {
        ...s.groups,
        [k]: { ...s.groups[k], messages: [...s.groups[k].messages, { me: true, text: t, time: tm }] },
      },
      groupChatInput: '',
    }));
    setTimeout(() => {
      if (get().epoch !== epoch) return;
      const g = get().groups[k];
      if (!g) return;
      const responder = g.members.find((m) => m.name !== 'You');
      set((s) => ({
        groups: {
          ...s.groups,
          [k]: { ...s.groups[k], messages: [...s.groups[k].messages, { me: false, text: '👍 Sounds good!', time: now() }] },
        },
      }));
      void responder;
    }, 1200);
  },

  createGroup: () => {
    const st = get();
    const name = st.createGroupName.trim();
    if (!name) return;
    const key = 'custom-' + Date.now();
    const newGroup: GroupData = {
      key, name, icon: st.createGroupIcon, color: st.createGroupColor,
      description: st.createGroupDesc.trim() || 'A new community group',
      memberCount: 1, isGroupChat: false, joined: true, muted: false,
      members: [{ name: 'You', initial: 'A', color: '#1A3352' }],
      messages: [], polls: [], events: [], pins: [],
    };
    set((s) => ({
      groups: { ...s.groups, [key]: newGroup },
      createGroupOpen: false, createGroupName: '', createGroupDesc: '', createGroupIcon: 'ph-fill ph-users-three', createGroupColor: '#1A3352',
      activeGroup: key,
    }));
  },

  toggleGroupJoin: (groupKey: string) => {
    const g = get().groups[groupKey];
    if (!g) return;
    const joining = !g.joined;
    set((s) => ({
      groups: {
        ...s.groups,
        [groupKey]: {
          ...g,
          joined: joining,
          memberCount: g.memberCount + (joining ? 1 : -1),
          members: joining
            ? [...g.members, { name: 'You', initial: 'A', color: '#1A3352' }]
            : g.members.filter((m) => m.name !== 'You'),
        },
      },
    }));
  },

  toggleGroupMute: (groupKey: string) => {
    const g = get().groups[groupKey];
    if (!g) return;
    set((s) => ({
      groups: { ...s.groups, [groupKey]: { ...g, muted: !g.muted } },
    }));
  },

  voteGroupPoll: (groupKey: string, pollId: string, option: string) => {
    const g = get().groups[groupKey];
    if (!g) return;
    set((s) => ({
      groups: {
        ...s.groups,
        [groupKey]: {
          ...g,
          polls: g.polls.map((p) =>
            p.id === pollId && !p.myVote
              ? { ...p, myVote: option, votes: { ...p.votes, [option]: (p.votes[option] || 0) + 1 } }
              : p
          ),
        },
      },
    }));
  },

  rsvpGroupEvent: (groupKey: string, eventId: string) => {
    const g = get().groups[groupKey];
    if (!g) return;
    set((s) => ({
      groups: {
        ...s.groups,
        [groupKey]: {
          ...g,
          events: g.events.map((e) =>
            e.id === eventId
              ? { ...e, rsvped: !e.rsvped, going: e.going + (e.rsvped ? -1 : 1) }
              : e
          ),
        },
      },
    }));
  },
}), {
  name: 'pavilion-demo',
  partialize: (state) => {
    const { typing, aiInput, chatInput, groupChatInput, commentInput, searchQ, docQ, bcText, ...rest } = state;
    return rest;
  },
}));

export const initialState: PavState = usePavStore.getState();
