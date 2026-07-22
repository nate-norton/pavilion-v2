import type { SupabaseClient } from '@supabase/supabase-js';
import { SLOTS, DAYS, ARC_TYPES, HH, ONBOARD_CIRCLES, MAP_LAYERS, NOTIF_CATS } from '..';
import type {
  Amenity, Vendor, DirEntry, FreeItem, Doc, DocSection, Notif, Circle,
  PortfolioEntry, AgingBucket, Pin, MapLayer, SearchItem, ChatSeed, QA as QAType,
  HHOption, OnboardCircle, Comment, ChatMsg, GroupData,
} from '../types';
import type { Database } from './database.types';
import { getSupabaseClient } from './supabaseClient';
import { emitAppError } from '../../lib/errorBus';
import type { ArcState, ArcStep, BoardArcItem, BoardTriage, CommunityEvent, Decision, DuesState, DuesStatement, DuesStatus, FeedPost, Invite, KnownIssue, MemberContext, NewArcRequest, NewGroup, NewReport, NewReservation, NewVote, ReservationState, Repository, SpecialAssessment, TriageItem, ViolationNotice, VoteChoice, VotesState } from './Repository';

type MockChatMap = Record<string, ChatMsg[]>;
type GroupMap = Record<string, GroupData>;

/** Relative age for feed posts: 'Just now' → '5m' → '3h' → '2d'. */
function relTime(iso: string): string {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 90) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

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
    triageItems: [] as TriageItem[],
    myReports: [] as TriageItem[],
    boardArc: [] as BoardArcItem[],
    invites: [] as Invite[],
    amenities: [] as Amenity[],
    reservation: { booked: false, summary: null } as ReservationState,
    comments: [] as Comment[],
    directory: [] as DirEntry[],
    chatIndex: {} as ChatSeed,
    dmThreads: {} as Record<string, string>,  // other profile id → thread id
    chats: {} as MockChatMap,
    groups: {} as GroupMap,
  };
  private listeners = new Set<() => void>();

  constructor(client?: SupabaseClient<Database>) {
    this.client = client ?? getSupabaseClient();
    this.client.auth.onAuthStateChange(() => { void this.refresh(); });
  }

  /**
   * Surface a failed write to the user. Returns true when there was an error
   * (so callers can bail); `fatal` additionally throws so awaited success
   * paths in sheets don't run. RLS-filtered updates don't error — they match
   * zero rows — so update-writes pair this with a returned-row check.
   */
  private failed(action: string, error: { message?: string } | null, fatal = false): boolean {
    if (!error) return false;
    const raw = error.message || '';
    // Translate database jargon into member-facing language.
    const human = /row-level security|permission denied|42501/i.test(raw)
      ? 'you may not have permission.'
      : /Failed to fetch|network|timeout/i.test(raw)
        ? 'check your connection and try again.'
        : raw || 'something went wrong. Try again.';
    const msg = `Couldn't ${action} — ${human}`;
    emitAppError(msg);
    if (fatal) throw new Error(msg);
    return true;
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
    await this.hydrateBoardArc();
    await this.hydrateInvites();
    await this.hydrateAmenities();
    await this.hydrateReservation();
    await this.hydrateDirectory();
    await this.hydrateDms();
    await this.hydrateGroups();
    this.notify();
  }

  isDemo = () => false;

  // ── Board triage + known issues (reports; empty for a fresh community) ──────
  getBoardTriage = () => this.cache.triage;
  getIssues = () => this.cache.issues;
  getTriageItems = () => this.cache.triageItems;
  getMyReports = () => this.cache.myReports;

  createReport = async ({ kind, description }: NewReport) => {
    if (!this.communityId || !this.profileId) return;
    const unitLabel = this.cache.member?.unitLabel;
    const { error } = await this.client.from('reports').insert({
      community_id: this.communityId,
      reporter_profile_id: this.profileId,
      title: description.trim() ? `${kind} · ${description.trim().slice(0, 80)}` : kind,
      reporter_label: `Reported privately${unitLabel ? ` by ${unitLabel}` : ''} · ${kind}`,
      kind,
    });
    this.failed('send your report', error, true);
    await this.hydrateTriage(); this.notify();
  };

  setReportStatus = async (id: string, status: 'ticketed' | 'resolved') => {
    const patch: { status: string; ref?: string } = { status };
    if (status === 'ticketed') {
      const existing = this.cache.triageItems.find((t) => t.id === id);
      if (!existing?.ref) patch.ref = `#M-${100 + this.cache.triageItems.length + 1}`;
    }
    const { data, error } = await this.client.from('reports').update(patch).eq('id', id).select('id');
    if (!this.failed('update the report', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't update the report — you may not have permission.");
    }
    await this.hydrateTriage(); this.notify();
  };

  private async hydrateTriage() {
    if (!this.communityId) {
      this.cache.triage = { openCount: 0, summary: 'Triage queue is clear', hasItems: false };
      this.cache.issues = [];
      this.cache.triageItems = [];
      this.cache.myReports = [];
      return;
    }
    const { data } = await this.client.from('reports')
      .select('id, title, status, vendor, kind, reporter_label, ref, reporter_profile_id')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false })
      .limit(20);
    const rows = data ?? [];
    this.cache.triageItems = rows.map((r) => ({
      id: r.id, title: r.title, sub: r.reporter_label, status: r.status, ref: r.ref,
    }));
    this.cache.myReports = rows
      .filter((r) => r.reporter_profile_id === this.profileId)
      .map((r) => ({ id: r.id, title: r.title, sub: r.reporter_label, status: r.status, ref: r.ref }));
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

  createFeedPost = async (body: string) => {
    if (!this.communityId || !this.cache.member) return;
    const m = this.cache.member;
    const { error } = await this.client.from('feed_posts').insert({
      community_id: this.communityId,
      author_name: m.name,
      author_initial: m.initial,
      author_color: m.color,
      unit_label: m.unitLabel,
      time_label: 'Just now',
      kind: 'post',
      tag_label: '',
      body: body.trim(),
      sort_order: -Math.floor(Date.now() / 1000),  // newest first under order(sort_order)
    });
    this.failed('publish your post', error, true);
    await this.hydrateSocial(); this.notify();
  };

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
      unitLabel: p.unit_label, timeLabel: relTime(p.created_at), kind: p.kind, tagLabel: p.tag_label,
      body: p.body, photoLabel: p.photo_label,
    }));
  }

  // ── ARC (real, per-unit; empty for a fresh member) ──────────────────────────
  getArc = () => this.cache.arc;
  getBoardArcQueue = () => this.cache.boardArc;

  createArcRequest = async ({ type, description }: NewArcRequest) => {
    if (!this.communityId || !this.unitId) return;
    const { count } = await this.client.from('arc_requests')
      .select('id', { count: 'exact', head: true }).eq('community_id', this.communityId);
    const { error } = await this.client.from('arc_requests').insert({
      community_id: this.communityId,
      unit_id: this.unitId,
      ref: `#A-${100 + (count ?? 0) + 1}`,
      title: description.trim() ? `${type} — ${description.trim().slice(0, 60)}` : type,
      status: 'review',
      status_label: 'In review',
      steps: [
        { label: 'Submitted', state: 'done' },
        { label: 'Board review', state: 'active' },
        { label: 'Decision', state: 'pending' },
      ],
    });
    this.failed('submit your request', error, true);
    await this.hydrateArc(); await this.hydrateBoardArc(); this.notify();
  };

  decideArc = async (id: string, approve: boolean) => {
    const item = this.cache.boardArc.find((r) => r.id === id);
    const { data, error } = await this.client.from('arc_requests').update({
      approved: approve,
      status: approve ? 'approved' : 'declined',
      status_label: approve ? 'Approved' : 'Declined',
      steps: [
        { label: 'Submitted', state: 'done' },
        { label: 'Board review', state: 'done' },
        { label: approve ? 'Approved' : 'Declined', state: 'done' },
      ],
    }).eq('id', id).select('id');
    const denied = this.failed('decide the request', error) || (data ?? []).length === 0;
    if (denied && !error) emitAppError("Couldn't decide the request — you may not have permission.");
    if (!denied && item && this.communityId) {
      const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      await this.client.from('decisions').insert({
        community_id: this.communityId,
        date_label: dateLabel,
        text: `ARC ${item.ref} ${approve ? 'approved' : 'declined'} — ${item.title}`,
        pill_label: approve ? 'Approved' : 'Declined',
        passed: approve,
        sort_order: -Math.floor(Date.now() / 1000),
      });
    }
    await this.hydrateArc(); await this.hydrateBoardArc(); await this.hydrateDecisions(); this.notify();
  };

  // ── Invites (board-managed; the claim side lives in AuthGate via RPC) ───────
  getInvites = () => this.cache.invites;

  createInvite = async ({ email, unitLabel, role }: { email: string; unitLabel: string; role: 'resident' | 'board' }) => {
    if (!this.communityId || !this.profileId) return;
    const { error } = await this.client.from('invites').insert({
      community_id: this.communityId,
      email: email.trim().toLowerCase(),
      unit_label: unitLabel.trim(),
      role,
      invited_by: this.profileId,
    });
    this.failed('send the invite', error, true);
    await this.hydrateInvites(); this.notify();
  };

  revokeInvite = async (id: string) => {
    const { data, error } = await this.client.from('invites')
      .update({ status: 'revoked' }).eq('id', id).eq('status', 'pending').select('id');
    if (!this.failed('revoke the invite', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't revoke the invite — it may already be accepted.");
    }
    await this.hydrateInvites(); this.notify();
  };

  private async hydrateInvites() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.invites = []; return; }
    const { data } = await this.client.from('invites')
      .select('id, email, unit_label, role, status')
      .eq('community_id', this.communityId).neq('status', 'revoked')
      .order('created_at', { ascending: false }).limit(20);
    this.cache.invites = (data ?? []).map((i) => ({
      id: i.id, email: i.email, unitLabel: i.unit_label, role: i.role, status: i.status,
    }));
  }

  private async hydrateBoardArc() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.boardArc = []; return; }
    const { data } = await this.client.from('arc_requests')
      .select('id, ref, title, approved, units(label)')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false }).limit(20);
    this.cache.boardArc = (data ?? []).map((r) => ({
      id: r.id, ref: r.ref, title: r.title, approved: r.approved,
      unitLabel: (r as unknown as { units: { label: string } | null }).units?.label ?? '',
    }));
  }

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

  /** Member marks their own courtesy notice fixed (self-cure policy). */
  markViolationFixed = async () => {
    const v = this.cache.violation;
    if (!v) return;
    const { data, error } = await this.client.from('violations')
      .update({ status: 'fixed' }).eq('id', v.id).select('id');
    if (!this.failed('mark it fixed', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't mark it fixed — you may not have permission.");
    }
    await this.hydrateCompliance(); this.notify();
  };

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
    const { error } = await this.client.from('vote_ballots')
      .insert({ vote_id: voteId, profile_id: this.profileId, choice });
    // duplicate ballot = already voted; anything else is worth surfacing
    if (error && !`${error.message}`.includes('duplicate')) this.failed('record your ballot', error);
    await this.hydrateVotes(); this.notify();
  };

  openVote = async ({ question, yesLabel, noLabel }: NewVote) => {
    if (!this.communityId) return;
    const { count } = await this.client.from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', this.communityId).eq('status', 'active');
    const { error } = await this.client.from('votes').insert({
      community_id: this.communityId,
      title: question.trim(),
      subtitle: 'Opened by the board · one ballot per household',
      closes_label: 'Open vote · closes in 7 days',
      quorum_total: count ?? 0,
      yes_label: yesLabel.trim() || 'Yes',
      no_label: noLabel.trim() || 'No',
      receipt: `#R-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'open',
    });
    this.failed('open the ballot', error, true);
    await this.hydrateVotes(); this.notify();
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
  // Scripted assistant Q&A is demo-only; live stubs the AI sheet.
  getAiQA = async (): Promise<QAType> => ({});

  // ── Community reference data (no tables yet → empty states) ─────────────────
  listAmenities = async (): Promise<Amenity[]> => this.cache.amenities;
  listVendors = async (): Promise<Vendor[]> => [];
  listDirectory = async (): Promise<DirEntry[]> => this.cache.directory;
  listFreeItems = async (): Promise<FreeItem[]> => [];
  listDocuments = async (): Promise<Doc[]> => [];
  listDocSections = async (): Promise<DocSection[]> => [];
  listCircles = async (): Promise<Circle[]> => [];
  listPortfolio = async (): Promise<PortfolioEntry[]> => [];
  listAging = async (): Promise<AgingBucket[]> => [];
  listNotifications = async (): Promise<Notif[]> => [];
  listMapPins = async (): Promise<Pin[]> => [];
  getSearchIndex = async (): Promise<SearchItem[]> => [];
  getChatSeed = async (): Promise<ChatSeed> => this.cache.chatIndex;

  // ── Amenities (real, community-scoped; empty until the board adds them) ─────
  getAmenities = () => this.cache.amenities;

  private async hydrateAmenities() {
    if (!this.communityId) { this.cache.amenities = []; return; }
    const { data } = await this.client.from('amenities')
      .select('*').eq('community_id', this.communityId).eq('active', true).order('sort_order');
    this.cache.amenities = (data ?? []).map((a) => ({
      id: a.id, name: a.name, sub: a.sub, icon: a.icon, rules: a.rules,
      avail: a.avail_label, occ: a.occ_label, occColor: '#A39B8B', taken: [],
    }));
  }

  createAmenity = async ({ name, sub, rules, icon }: { name: string; sub: string; rules: string; icon: string }) => {
    if (!this.communityId) return;
    const { error } = await this.client.from('amenities').insert({
      community_id: this.communityId,
      name: name.trim(),
      sub: sub.trim(),
      rules: rules.trim(),
      icon,
      sort_order: this.cache.amenities.length,
    });
    this.failed('add the amenity', error, true);
    await this.hydrateAmenities(); this.notify();
  };

  retireAmenity = async (id: string) => {
    const { data, error } = await this.client.from('amenities')
      .update({ active: false }).eq('id', id).select('id');
    if (!this.failed('retire the amenity', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't retire the amenity — you may not have permission.");
    }
    await this.hydrateAmenities(); this.notify();
  };

  // ── Reservations (real, per-member; no-ops until the table migration lands) ─
  getReservation = () => this.cache.reservation;

  createReservation = async ({ amenity, day, slot, hours }: NewReservation) => {
    if (!this.communityId || !this.profileId) return;
    const { error } = await this.client.from('reservations').insert({
      community_id: this.communityId,
      profile_id: this.profileId,
      amenity,
      day_label: day,
      slot_label: slot,
      hours,
      summary: `${amenity} · ${day} · ${slot}${hours === 2 ? ' · 2h' : ''}`,
    });
    this.failed('book it', error);
    await this.hydrateReservation(); this.notify();
  };

  cancelReservation = async () => {
    if (!this.profileId) return;
    const { error } = await this.client.from('reservations').update({ status: 'cancelled' })
      .eq('profile_id', this.profileId).eq('status', 'booked');
    this.failed('cancel the booking', error);
    await this.hydrateReservation(); this.notify();
  };

  private async hydrateReservation() {
    if (!this.profileId) { this.cache.reservation = { booked: false, summary: null }; return; }
    const { data } = await this.client.from('reservations')
      .select('summary').eq('profile_id', this.profileId).eq('status', 'booked')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    this.cache.reservation = data ? { booked: true, summary: data.summary } : { booked: false, summary: null };
  }

  // ── Feed comments (table lands in a later slice) ────────────────────────────
  getComments = () => this.cache.comments;
  addComment = async (_text: string) => { void _text; /* TODO: comments slice */ };

  // ── Direct messages (table lands in a later slice) ──────────────────────────
  getChats = () => this.cache.chats;
  getDirectory = () => this.cache.directory;
  getChatIndex = () => this.cache.chatIndex;

  /** Fellow community members (everyone active except yourself). */
  private async hydrateDirectory() {
    if (!this.communityId || !this.profileId) { this.cache.directory = []; return; }
    const { data } = await this.client.from('memberships')
      .select('profile_id, profiles(name, initial, color), units(label)')
      .eq('community_id', this.communityId).eq('status', 'active');
    this.cache.directory = (data ?? [])
      .filter((m) => m.profile_id !== this.profileId)
      .flatMap((m) => {
        const p = (m as unknown as { profiles: { name: string; initial: string; color: string } | null }).profiles;
        const u = (m as unknown as { units: { label: string } | null }).units;
        return p ? [{
          key: m.profile_id, name: p.name, initial: p.initial, color: p.color,
          unit: u?.label ?? '', tags: [], note: '',
        }] : [];
      });
  }

  /** Threads + messages, keyed by the other member's profile id; the chat
   * index lists every neighbor so a first message needs no setup. */
  private async hydrateDms() {
    if (!this.profileId) { this.cache.chats = {}; this.cache.chatIndex = {}; this.cache.dmThreads = {}; return; }
    const me = this.profileId;
    const { data: threads } = await this.client.from('dm_threads')
      .select('id, a_profile_id, b_profile_id')
      .or(`a_profile_id.eq.${me},b_profile_id.eq.${me}`);
    const threadIds = (threads ?? []).map((t) => t.id);
    const { data: msgs } = threadIds.length
      ? await this.client.from('dm_messages').select('*').in('thread_id', threadIds).order('created_at')
      : { data: [] };
    const chats: MockChatMap = {};
    const threadByOther: Record<string, string> = {};
    for (const t of threads ?? []) {
      const other = t.a_profile_id === me ? t.b_profile_id : t.a_profile_id;
      threadByOther[other] = t.id;
      chats[other] = (msgs ?? []).filter((x) => x.thread_id === t.id)
        .map((x) => ({ me: x.sender_profile_id === me, text: x.body, time: timeLabel(x.created_at) }));
    }
    const index: ChatSeed = {};
    for (const d of this.cache.directory) {
      const thread = chats[d.key];
      const last = thread?.[thread.length - 1];
      index[d.key] = {
        name: d.name, unit: d.unit, color: d.color, initial: d.initial,
        seed: last?.text ?? 'Say hello 👋', time: last?.time ?? '', unread: 0,
      };
    }
    this.cache.chats = chats;
    this.cache.chatIndex = index;
    this.cache.dmThreads = threadByOther;
  }

  sendChatMessage = async (chatKey: string, text: string, _reply?: boolean) => {
    void _reply; // scripted replies are demo-only
    if (!this.profileId || !this.communityId || !text.trim()) return;
    let threadId = this.cache.dmThreads[chatKey];
    if (!threadId) {
      const { data, error } = await this.client.from('dm_threads')
        .insert({ community_id: this.communityId, a_profile_id: this.profileId, b_profile_id: chatKey })
        .select('id').single();
      if (this.failed('start the conversation', error)) return;
      threadId = data?.id ?? '';
      if (!threadId) return;
    }
    const { error } = await this.client.from('dm_messages')
      .insert({ thread_id: threadId, sender_profile_id: this.profileId, body: text.trim() });
    this.failed('send your message', error);
    await this.hydrateDms(); this.notify();
  };

  // ── Groups (real, community-scoped) ─────────────────────────────────────────
  getGroups = () => this.cache.groups;

  private async hydrateGroups() {
    const { data: groups, error } = await this.client.from('groups').select('*');
    if (error || !groups || groups.length === 0) { this.cache.groups = {}; return; }
    const ids = groups.map((g) => g.id);
    const [members, messages, polls, events, pins, mutes] = await Promise.all([
      this.client.from('group_members').select('group_id, profile_id, profiles(name, initial, color)').in('group_id', ids),
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
    const { data, error } = await this.client.from('groups')
      .insert({ community_id: this.communityId, name, description, icon, color, is_group_chat: false, member_count: 1 })
      .select('id').single();
    this.failed('create the group', error, true);
    const id = data?.id ?? '';
    if (id && this.profileId) {
      const { error: memberErr } = await this.client.from('group_members')
        .insert({ group_id: id, profile_id: this.profileId });
      this.failed('join your new group', memberErr);
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
