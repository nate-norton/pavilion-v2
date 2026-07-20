export interface Amenity {
  name: string;
  sub: string;
  icon: string;
  avail: string;
  taken: number[];
  occ: string;
  occColor: string;
  rules: string;
}

export interface SearchItem {
  cat: string;
  icon: string;
  title: string;
  sub: string;
  k: string;
}

export interface Vendor {
  name: string;
  sub: string;
  last: string;
  ins: boolean;
  icon: string;
  color: string;
  bg: string;
}

export interface HHOption {
  key: string;
  label: string;
  icon: string;
}

export interface OnboardCircle {
  key: string;
  label: string;
  icon: string;
}

export interface QAEntry {
  q: string;
  a: string;
  cite: string;
}

export type QA = Record<string, QAEntry>;

export interface DirEntry {
  key: string;
  name: string;
  unit: string;
  initial: string;
  color: string;
  tags: string[];
  note: string;
}

export interface FreeItem {
  key: string;
  title: string;
  giver: string;
  ph: string;
}

export interface Pin {
  key: string;
  x: string;
  y: string;
  icon: string;
  color: string;
  layer: string;
  title: string;
  sub: string;
  action: string;
  go: string;
}

export type MapLayer = [string, string, string];

export interface PortfolioEntry {
  name: string;
  doors: number;
  collected: number;
  open: number;
  delinquent: number;
  dues: string;
  tone: string;
}

export interface AgingBucket {
  bucket: string;
  amt: string;
  n: string;
  w: string;
  c: string;
}

export interface Circle {
  key: string;
  name: string;
  sub: string;
  icon: string;
  bg: string;
  color: string;
}

export interface Notif {
  key: string;
  icon: string;
  color: string;
  bg: string;
  title: string;
  sub: string;
  cat: string;
  when: string;
  go: string;
  unread: boolean;
}

export interface ChatSeedEntry {
  name: string;
  unit: string;
  color: string;
  initial: string;
  seed: string;
  time: string;
  unread: number;
}

export type ChatSeed = Record<string, ChatSeedEntry>;

export interface Doc {
  key: string;
  title: string;
  sub: string;
  icon: string;
}

export interface DocSection {
  tag: string;
  name: string;
  accent: string;
  kw: string;
  body: string;
}

// ── Mutable domain entities (owned by the repository / mock domain store) ──

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
