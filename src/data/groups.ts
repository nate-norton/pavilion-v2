import type { GroupData } from './types';

/** Seed groups & group-chats for the demo (Juniper Ridge). */
export const GROUPS_SEED: Record<string, GroupData> = {
  'gc-block-party': {
    key: 'gc-block-party', name: 'Block Party Planning', icon: 'ph-fill ph-confetti', color: 'rgb(var(--terracotta))',
    description: 'Coordinating the annual block party — food, music, and good vibes.',
    memberCount: 7, isGroupChat: true, joined: true, muted: false,
    members: [
      { name: 'Tom B.', initial: 'T', color: 'rgb(var(--sky))' },
      { name: 'Rosa M.', initial: 'R', color: 'rgb(var(--terracotta))' },
      { name: 'You', initial: 'A', color: 'rgb(var(--navy))' },
      { name: 'Priya S.', initial: 'P', color: 'rgb(var(--sage))' },
      { name: 'The Okafors', initial: 'O', color: 'rgb(var(--gold))' },
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
    key: 'gc-trail-crew', name: 'Trail Crew', icon: 'ph-fill ph-tree', color: 'rgb(var(--sage))',
    description: 'Sunday morning trail maintenance and hikes. All levels welcome.',
    memberCount: 9, isGroupChat: true, joined: true, muted: false,
    members: [
      { name: 'Priya S.', initial: 'P', color: 'rgb(var(--sage))' },
      { name: 'Tom B.', initial: 'T', color: 'rgb(var(--sky))' },
      { name: 'You', initial: 'A', color: 'rgb(var(--navy))' },
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
    key: 'gc-dog-owners', name: 'Dog Owners', icon: 'ph-fill ph-dog', color: 'rgb(var(--gold))',
    description: 'Playdates, vet recs, and keeping the paths clean.',
    memberCount: 11, isGroupChat: true, joined: true, muted: false,
    members: [
      { name: 'The Okafors', initial: 'O', color: 'rgb(var(--gold))' },
      { name: 'Rosa M.', initial: 'R', color: 'rgb(var(--terracotta))' },
      { name: 'You', initial: 'A', color: 'rgb(var(--navy))' },
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
    key: 'gr-garden', name: 'Garden Club', icon: 'ph-fill ph-plant', color: 'rgb(var(--sagelight))',
    description: 'Community garden plots, seed swaps, and growing tips.',
    memberCount: 12, isGroupChat: false, joined: true, muted: false,
    members: [
      { name: 'Rosa M.', initial: 'R', color: 'rgb(var(--terracotta))' },
      { name: 'Priya S.', initial: 'P', color: 'rgb(var(--sage))' },
      { name: 'You', initial: 'A', color: 'rgb(var(--navy))' },
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
    key: 'gr-parents', name: 'Parents & Kids', icon: 'ph-fill ph-baby', color: 'rgb(var(--sky))',
    description: 'Playdates, babysitter recs, and kid-friendly events.',
    memberCount: 18, isGroupChat: false, joined: false, muted: false,
    members: [
      { name: 'Rosa M.', initial: 'R', color: 'rgb(var(--terracotta))' },
      { name: 'The Okafors', initial: 'O', color: 'rgb(var(--gold))' },
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
    key: 'gr-pickle', name: 'Pickleball', icon: 'ph-fill ph-tennis-ball', color: 'rgb(var(--ember))',
    description: 'Casual games, ladder matches, and court reservations.',
    memberCount: 9, isGroupChat: false, joined: false, muted: false,
    members: [
      { name: 'Tom B.', initial: 'T', color: 'rgb(var(--sky))' },
      { name: 'Priya S.', initial: 'P', color: 'rgb(var(--sage))' },
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
};
