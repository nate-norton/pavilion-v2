import type { ChatSeed, GroupChat } from './types';

export const CHAT_SEED: ChatSeed = {
  tom: { name: 'Tom B.', unit: '#18', color: '#4A90E2', initial: 'T', seed: "Ladder's in the garage — come grab it whenever.", time: 'Mon 4:12 PM', unread: 0 },
  rosa: { name: 'Rosa M.', unit: '#12', color: '#C75A31', initial: 'R', seed: 'Hi Alex! GutterPros number is pinned on my profile if you ever need it.', time: 'Sun 9:02 AM', unread: 1 },
  priya: { name: 'Priya S.', unit: '#31', color: '#2A9D5C', initial: 'P', seed: 'Hey Alex — trail crew meets Sunday 8 AM if you want in.', time: 'Sat 6:30 PM', unread: 0 },
  okafor: { name: 'The Okafors', unit: '#42', color: '#D9A441', initial: 'O', seed: 'Hey neighbor! Still buried in boxes over here but loving it so far.', time: 'Fri 1:15 PM', unread: 2 },
};

export const GROUP_CHATS: GroupChat[] = [
  { key: 'gc-block-party', name: 'Block Party Planning', icon: 'ph-fill ph-confetti', color: '#C75A31', members: ['Tom B.', 'Rosa M.', 'You', '+4'], seed: 'Rosa: Who\'s bringing the speaker?', time: 'Today 11:30 AM', unread: 3 },
  { key: 'gc-trail-crew', name: 'Trail Crew', icon: 'ph-fill ph-tree', color: '#2A9D5C', members: ['Priya S.', 'Tom B.', 'You', '+6'], seed: 'Priya: Sunday 8 AM still on — meet at trailhead', time: 'Yesterday 6:15 PM', unread: 0 },
  { key: 'gc-dog-owners', name: 'Dog Owners', icon: 'ph-fill ph-dog', color: '#D9A441', members: ['The Okafors', 'Rosa M.', 'You', '+8'], seed: 'Rosa: Anyone else see a coyote near lot C?', time: 'Yesterday 2:40 PM', unread: 1 },
];

export const GROUPS: GroupChat[] = [
  { key: 'gr-garden', name: 'Garden Club', icon: 'ph-fill ph-plant', color: '#74B992', members: ['12 members'], seed: 'Free tomato starts at plot 4 — first come first served!', time: 'Today 9:00 AM', unread: 2 },
  { key: 'gr-parents', name: 'Parents & Kids', icon: 'ph-fill ph-baby', color: '#4A90E2', members: ['18 members'], seed: 'Movie night this Friday — Encanto on the lawn', time: 'Mon 3:45 PM', unread: 0 },
  { key: 'gr-pickle', name: 'Pickleball', icon: 'ph-fill ph-tennis-ball', color: '#E06A3E', members: ['9 members'], seed: 'Court 2 open tomorrow 6-8 AM if anyone wants in', time: 'Sun 10:20 AM', unread: 0 },
];
