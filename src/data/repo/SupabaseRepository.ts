import type { SupabaseClient } from '@supabase/supabase-js';
import { SLOTS, DAYS, ARC_TYPES, HH, ONBOARD_CIRCLES, QA, MAP_LAYERS, NOTIF_CATS } from '..';
import type {
  Amenity, Vendor, DirEntry, FreeItem, Doc, DocSection, Notif, Circle,
  PortfolioEntry, AgingBucket, Pin, MapLayer, SearchItem, ChatSeed, QA as QAType,
  HHOption, OnboardCircle, Comment, ChatMsg, GroupData,
} from '../types';
import type { Database } from './database.types';
import { getSupabaseClient } from './supabaseClient';
import type { ArcState, ArcStep, BoardTriage, CommunityEvent, Decision, DuesState, DuesStatement, DuesStatus, FeedPost, KnownIssue, MemberContext, NewGroup, NewReservation, ReservationState, Repository, SpecialAssessment, ViolationNotice, VoteChoice, VotesState } from './Repository';

type MockChatMap = Record<string, ChatMsg[]>;
type GroupMap = Record<string, GroupData>;

function timeLabel(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h < 12 ? 'AM' : 'PM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m} ${ap}`;
}

/**
 * Live backend. Implements the same Repository contract the screens use, so
 * nothing in the UI changes. App-wide config (time slots, form options, the
 * scripted AI Q&A) is returned as constants; community-scoped reference data
 * that doesn't have tables yet returns empty (the app shows empty states);
 * the groups slice reads/writes real rows and assembles them into GroupData.
 *
 * Reads are RLS-scoped: with no signed-in member, every community query returns
 * nothing — which is exactly the empty state. Auth (next) populates the context.
 */
export class SupabaseRepository implements Repository {
  private client: SupabaseClient<Database>;
  private profileId: string | null = null;
  private communityId: string | null = null;
  private unitId: string | null = null;
  private hydrated = false;

  private cache = {
    member: null as MemberContext | null,
    dues: { current: null, cardTitle: '', cardSub: '', cardBtn: '', history: [] } as DuesState,
    votes: { open: null } as VotesState,
    violation: null as ViolationNotice | null,
    assessment: null as SpecialAssessment | null,
    arc: { requests: [], unseenApproval: null } as ArcState,
    events: [] as CommunityEvent[],
    feed: [] as FeedPost[],
    triage: { openCount: 0, summary: 'Triage queue is clear', hasItems: false } as BoardTriage,
    issues: [] as KnownIssue[],
    decisions: [] as Decision[],
    reservation: { booked: false, summary: null } as ReservationState,
    comments: [] as Comment[],
    chats: {} as MockChatMap,
    groups: {} as GroupMap,
  };
  private listeners = new Set<() => void>();

  constructor(client?: SupabaseClient<Database>) {
    this.client = client ?? getSupabaseClient();
    this.client.auth.onAuthStateChange(() => { void this.refresh(); });
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (!this.hydrated) { this.hydrated = true; void this.refresh(); }
    return () => { this.listeners.delete(listener); };
  };
  private notify() { this.listeners.forEach((l) => l()); }

  private async resolveContext() {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) { this.profileId = null; this.communityId = null; return; }
    const { data: profile } = await this.client.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
    this.profileId = profile?.id ?? null;
    if (!this.profileId) { this.communityId = null; this.unitId = null; return; }
    const { data: membership } = await this.client.from('memberships')
      .select('community_id, unit_id').eq('profile_id', this.profileId).eq('status', 'active').maybeSingle();
    this.communityId = membership?.community_id ?? null;
    this.unitId = membership?.unit_id ?? null;
  }

  /** Re-read the current user's context + domain slices, then notify. */
  private async refresh() {
    await this.resolveContext();
    await this.hydrateMember();
    await this.hydrateDues();
    await this.hydrateVotes();
    await this.hydrateCompliance();
    await this.hydrateArc();
    await this.hydrateSocial();
    await this.hydrateTriage();
    await this.hydrateDecisions();
    await this.hydrateGroups();
    this.notify();
  }

  isDemo = () => false;

  // ── Board triage + known issues (reports; empty for a fresh community) ──────
  getBoardTriage = () => this.cache.triage;
  getIssues = () => this.cache.issues;

  private async hydrateTriage() {
    if (!this.communityId) {
      this.cache.triage = { openCount: 0, summary: 'Triage queue is clear', hasItems: false };
      this.cache.issues = [];
      return;
    }
    const { data } = await this.client.from('reports')
      .select('id, title, status, vendor')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false })
      .limit(20);
    const rows = data ?? [];
    const openCount = rows.filter((r) => r.status !== 'resolved').length;
    this.cache.triage = {
      openCount,
      summary: openCount === 0 ? 'Triage queue is clear' : `${openCount} ${openCount === 1 ? 'item' : 'items'} in triage`,
      hasItems: rows.length > 0,
    };
    this.cache.issues = rows.map((r): KnownIssue => {
      const resolved = r.status === 'resolved';
      const handled = r.status === 'ticketed' || r.status === 'assigned';
      return {
        id: r.id,
        icon: resolved ? 'ph-fill ph-check-circle' : 'ph-fill ph-wrench',
        iconColor: resolved ? 'rgb(var(--stonelight))' : 'rgb(var(--terracotta))',
        title: r.title,
        statusLabel: resolved ? 'Resolved' : handled ? (r.vendor || 'Ticketed') : 'In triage',
        tone: resolved ? 'sand' : handled ? 'mint' : 'gold',
        resolved,
      };
    });
  }

  // ── Decisions log (empty for a fresh community) ─────────────────────────────
  getDecisions = () => this.cache.decisions;

  private async hydrateDecisions() {
    if (!this.communityId) { this.cache.decisions = []; return; }
    const { data } = await this.client.from('decisions')
      .select('*').eq('community_id', this.communityId).order('sort_order');
    this.cache.decisions = (data ?? []).map((d) => ({
      id: d.id, dateLabel: d.date_label, text: d.text, pillLabel: d.pill_label, passed: d.passed,
    }));
  }

  // ── Social (events + feed; empty for a fresh community) ─────────────────────
  getEvents = () => this.cache.events;
  getFeed = () => this.cache.feed;

  private async hydrateSocial() {
    if (!this.communityId) { this.cache.events = []; this.cache.feed = []; return; }
    const [events, feed] = await Promise.all([
      this.client.from('events').select('*').eq('community_id', this.communityId).order('sort_order'),
      this.client.from('feed_posts').select('*').eq('community_id', this.communityId).order('sort_order'),
    ]);
    this.cache.events = (events.data ?? []).map((e) => ({
      id: e.id, title: e.title, whenLabel: e.when_label, whereLabel: e.where_label,
      going: e.going, photoLabel: e.photo_label, tagLabel: e.tag_label, featured: e.featured,
    }));
    this.cache.feed = (feed.data ?? []).map((p) => ({
      id: p.id, authorName: p.author_name, authorInitial: p.author_initial, authorColor: p.author_color,
      unitLabel: p.unit_label, timeLabel: p.time_label, kind: p.kind, tagLabel: p.tag_label,
      body: p.body, photoLabel: p.photo_label,
    }));
  }

  // ── ARC (real, per-unit; empty for a fresh member) ──────────────────────────
  getArc = () => this.cache.arc;

  private async hydrateArc() {
    if (!this.unitId) { this.cache.arc = { requests: [], unseenApproval: null }; return; }
    const { data: rows } = await this.client.from('arc_requests')
      .select('*').eq('unit_id', this.unitId).order('sort_order');
    this.cache.arc = {
      requests: (rows ?? []).map((r) => ({
        id: r.id,
        ref: r.ref,
        title: r.title,
        approved: r.approved,
        statusLabel: r.status_label,
        steps: (r.steps as unknown as ArcStep[]) ?? [],
      })),
      unseenApproval: null,
    };
  }

  // ── Compliance (violation + special assessment; empty for a fresh member) ───
  getViolation = () => this.cache.violation;
  getAssessment = () => this.cache.assessment;

  private async hydrateCompliance() {
    if (!this.unitId) { this.cache.violation = null; this.cache.assessment = null; return; }
    const [viol, sa] = await Promise.all([
      this.client.from('violations').select('*').eq('unit_id', this.unitId)
        .neq('status', 'resolved').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      this.client.from('special_assessments').select('*').eq('unit_id', this.unitId)
        .eq('status', 'open').order('created_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
    this.cache.violation = viol.data
      ? { id: viol.data.id, title: viol.data.title, sub: viol.data.sub, fixed: viol.data.status === 'fixed' }
      : null;
    this.cache.assessment = sa.data
      ? { id: sa.data.id, title: sa.data.title, sub: sa.data.sub, paid: false }
      : null;
  }

  // ── Votes (real, community-scoped; empty until the board opens a ballot) ────
  getVotes = () => this.cache.votes;

  private async hydrateVotes() {
    if (!this.communityId) { this.cache.votes = { open: null }; return; }
    const { data: vote } = await this.client.from('votes')
      .select('*').eq('community_id', this.communityId).eq('status', 'open')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (!vote) { this.cache.votes = { open: null }; return; }
    let myVote: VoteChoice | null = null;
    if (this.profileId) {
      const { data: ballot } = await this.client.from('vote_ballots')
        .select('choice').eq('vote_id', vote.id).eq('profile_id', this.profileId).maybeSingle();
      myVote = (ballot?.choice as VoteChoice) ?? null;
    }
    const total = vote.yes_count + vote.no_count;
    this.cache.votes = {
      open: {
        id: vote.id,
        title: vote.title,
        subtitle: vote.subtitle,
        closesLabel: vote.closes_label,
        quorumCount: vote.quorum_count,
        quorumTotal: vote.quorum_total,
        quorumPct: vote.quorum_total ? Math.round((vote.quorum_count / vote.quorum_total) * 100) : 0,
        yesCount: vote.yes_count,
        noCount: vote.no_count,
        yesPct: total ? Math.round((vote.yes_count / total) * 100) : 0,
        myVote,
        receipt: vote.receipt,
        yesLabel: vote.yes_label,
        noLabel: vote.no_label,
      },
    };
  }

  castVote = async (voteId: string, choice: VoteChoice) => {
    if (!this.profileId) return;
    await this.client.from('vote_ballots')
      .insert({ vote_id: voteId, profile_id: this.profileId, choice });
    await this.refresh();
  };

  // ── Dues (real, per-unit; empty until the board issues statements) ──────────
  getDues = () => this.cache.dues;

  private async hydrateDues() {
    const empty: DuesState = { current: null, cardTitle: '', cardSub: '', cardBtn: '', history: [] };
    if (!this.unitId) { this.cache.dues = empty; return; }
    const { data: rows } = await this.client.from('dues_statements')
      .select('*').eq('unit_id', this.unitId).order('sort_order');
    if (!rows || rows.length === 0) { this.cache.dues = empty; return; }
    const toStatement = (r: Database['public']['Tables']['dues_statements']['Row']): DuesStatement => ({
      id: r.id,
      period: r.period_label || r.period,
      amountLabel: `$${(r.amount_cents / 100).toLocaleString('en-US')}`,
      status: r.status as DuesStatus,
      statusLabel: r.status_label,
      confirmation: r.confirmation,
    });
    const currentRow = rows.find((r) => r.is_current && r.status !== 'paid');
    this.cache.dues = {
      current: currentRow ? toStatement(currentRow) : null,
      cardTitle: currentRow?.card_title ?? '',
      cardSub: currentRow?.card_sub ?? '',
      cardBtn: currentRow?.card_btn ?? '',
      history: rows.map(toStatement),
    };
  }

  // ── Member identity (real, from profile + membership) ───────────────────────
  getMember = () => this.cache.member;

  private async hydrateMember() {
    if (!this.profileId) { this.cache.member = null; return; }
    const { data: profile } = await this.client.from('profiles')
      .select('name, initial, color').eq('id', this.profileId).maybeSingle();
    if (!profile) { this.cache.member = null; return; }
    const { data: membership } = await this.client.from('memberships')
      .select('role, communities(name), units(label)')
      .eq('profile_id', this.profileId).eq('status', 'active').maybeSingle();
    const community = (membership as { communities: { name: string } | null } | null)?.communities;
    const unit = (membership as { units: { label: string } | null } | null)?.units;
    this.cache.member = {
      name: profile.name,
      initial: profile.initial,
      color: profile.color,
      role: (membership?.role as 'resident' | 'board') ?? 'resident',
      communityName: community?.name ?? '',
      unitLabel: unit?.label ?? '',
    };
  }

  // ── Static config (backend-agnostic) ───────────────────────────────────────
  getReservationSlots = async (): Promise<string[]> => SLOTS;
  getReservationDays = async (): Promise<string[]> => DAYS;
  listArcTypes = async (): Promise<string[]> => ARC_TYPES;
  listNotifCategories = async (): Promise<string[]> => NOTIF_CATS;
  listMapLayers = async (): Promise<MapLayer[]> => MAP_LAYERS;
  listHouseholdOptions = async (): Promise<HHOption[]> => HH;
  listOnboardCircles = async (): Promise<OnboardCircle[]> => ONBOARD_CIRCLES;
  getAiQA = async (): Promise<QAType> => QA;

  // ── Community reference data (no tables yet → empty states) ─────────────────
  listAmenities = async (): Promise<Amenity[]> => [];
  listVendors = async (): Promise<Vendor[]> => [];
  listDirectory = async (): Promise<DirEntry[]> => [];
  listFreeItems = async (): Promise<FreeItem[]> => [];
  listDocuments = async (): Promise<Doc[]> => [];
  listDocSections = async (): Promise<DocSection[]> => [];
  listCircles = async (): Promise<Circle[]> => [];
  listPortfolio = async (): Promise<PortfolioEntry[]> => [];
  listAging = async (): Promise<AgingBucket[]> => [];
  listNotifications = async (): Promise<Notif[]> => [];
  listMapPins = async (): Promise<Pin[]> => [];
  getSearchIndex = async (): Promise<SearchItem[]> => [];
  getChatSeed = async (): Promise<ChatSeed> => ({});

  // ── Reservations (table lands in a later slice) ─────────────────────────────
  getReservation = () => this.cache.reservation;
  createReservation = async (_input: NewReservation) => { void _input; /* TODO: reservations slice */ };
  cancelReservation = async () => { /* TODO: reservations slice */ };

  // ── Feed comments (table lands in a later slice) ────────────────────────────
  getComments = () => this.cache.comments;
  addComment = async (_text: string) => { void _text; /* TODO: comments slice */ };

  // ── Direct messages (table lands in a later slice) ──────────────────────────
  getChats = () => this.cache.chats;
  sendChatMessage = async (_k: string, _t: string, _reply?: boolean) => { void _k; void _t; void _reply; };

  // ── Groups (real, community-scoped) ─────────────────────────────────────────
  getGroups = () => this.cache.groups;

  private async hydrateGroups() {
    const { data: groups, error } = await this.client.from('groups').select('*');
    if (error || !groups || groups.length === 0) { this.cache.groups = {}; return; }
    const ids = groups.map((g) => g.id);
    const [members, messages, polls, events, pins, mutes] = await Promise.all([
      this.client.from('group_members').select('group_id, profiles(name, initial, color)').in('group_id', ids),
      this.client.from('group_messages').select('*').in('group_id', ids).order('created_at'),
      this.client.from('group_polls').select('*, group_poll_votes(profile_id, option)').in('group_id', ids),
      this.client.from('group_events').select('*, group_event_rsvps(profile_id)').in('group_id', ids),
      this.client.from('group_pins').select('*').in('group_id', ids),
      this.client.from('group_mutes').select('group_id, profile_id').in('group_id', ids),
    ]);
    const me = this.profileId;
    const map: GroupMap = {};
    for (const g of groups) {
      const gMembers = (members.data ?? []).filter((m) => m.group_id === g.id);
      const gMutes = (mutes.data ?? []).filter((m) => m.group_id === g.id);
      map[g.id] = {
        key: g.id,
        name: g.name,
        icon: g.icon,
        color: g.color,
        description: g.description,
        memberCount: g.member_count,
        isGroupChat: g.is_group_chat,
        joined: !!me && gMembers.some((m) => (m as { profile_id?: string }).profile_id === me),
        muted: !!me && gMutes.some((m) => m.profile_id === me),
        members: gMembers.flatMap((m) => {
          const p = (m as { profiles: { name: string; initial: string; color: string } | null }).profiles;
          return p ? [{ name: p.name, initial: p.initial, color: p.color }] : [];
        }),
        messages: (messages.data ?? []).filter((x) => x.group_id === g.id)
          .map((x) => ({ me: !!me && x.profile_id === me, text: x.body, time: timeLabel(x.created_at) })),
        polls: (polls.data ?? []).filter((x) => x.group_id === g.id).map((p) => {
          const votes = (p.group_poll_votes ?? []) as { profile_id: string; option: string }[];
          const counts: Record<string, number> = {};
          for (const v of votes) counts[v.option] = (counts[v.option] ?? 0) + 1;
          return {
            id: p.id, question: p.question, options: (p.options as string[]) ?? [],
            votes: counts, myVote: votes.find((v) => v.profile_id === me)?.option ?? null,
            author: p.author, time: timeLabel(p.created_at),
          };
        }),
        events: (events.data ?? []).filter((x) => x.group_id === g.id).map((e) => {
          const rsvps = (e.group_event_rsvps ?? []) as { profile_id: string }[];
          return {
            id: e.id, title: e.title, when: e.when_label, where: e.where_label,
            going: e.going, rsvped: !!me && rsvps.some((r) => r.profile_id === me),
          };
        }),
        pins: (pins.data ?? []).filter((x) => x.group_id === g.id)
          .map((p) => ({ id: p.id, text: p.body, author: p.author, time: timeLabel(p.created_at) })),
      };
    }
    this.cache.groups = map;
  }

  sendGroupMessage = async (groupKey: string, text: string) => {
    if (!this.profileId) return;
    await this.client.from('group_messages').insert({ group_id: groupKey, profile_id: this.profileId, body: text });
    await this.refresh();
  };

  createGroup = async ({ name, description, icon, color }: NewGroup): Promise<string> => {
    if (!this.communityId) return '';
    const { data } = await this.client.from('groups')
      .insert({ community_id: this.communityId, name, description, icon, color, is_group_chat: false, member_count: 1 })
      .select('id').single();
    const id = data?.id ?? '';
    if (id && this.profileId) {
      await this.client.from('group_members').insert({ group_id: id, profile_id: this.profileId });
    }
    await this.refresh();
    return id;
  };

  toggleGroupJoin = async (groupKey: string) => {
    if (!this.profileId) return;
    const existing = this.cache.groups[groupKey];
    if (existing?.joined) {
      await this.client.from('group_members').delete().eq('group_id', groupKey).eq('profile_id', this.profileId);
    } else {
      await this.client.from('group_members').insert({ group_id: groupKey, profile_id: this.profileId });
    }
    await this.refresh();
  };

  toggleGroupMute = async (groupKey: string) => {
    if (!this.profileId) return;
    const existing = this.cache.groups[groupKey];
    if (existing?.muted) {
      await this.client.from('group_mutes').delete().eq('group_id', groupKey).eq('profile_id', this.profileId);
    } else {
      await this.client.from('group_mutes').insert({ group_id: groupKey, profile_id: this.profileId });
    }
    await this.refresh();
  };

  voteGroupPoll = async (_groupKey: string, pollId: string, option: string) => {
    if (!this.profileId) return;
    await this.client.from('group_poll_votes').insert({ poll_id: pollId, profile_id: this.profileId, option });
    await this.refresh();
  };

  rsvpGroupEvent = async (_groupKey: string, eventId: string) => {
    if (!this.profileId) return;
    const { data: existing } = await this.client.from('group_event_rsvps')
      .select('id').eq('event_id', eventId).eq('profile_id', this.profileId).maybeSingle();
    if (existing) {
      await this.client.from('group_event_rsvps').delete().eq('id', existing.id);
    } else {
      await this.client.from('group_event_rsvps').insert({ event_id: eventId, profile_id: this.profileId });
    }
    await this.refresh();
  };
}
