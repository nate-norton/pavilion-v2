import type { SupabaseClient } from '@supabase/supabase-js';
import { SLOTS, DAYS, ARC_TYPES, HH, ONBOARD_CIRCLES, MAP_LAYERS, NOTIF_CATS } from '..';
import type {
  Amenity, Vendor, DirEntry, FreeItem, Doc, DocSection, Notif, Circle,
  PortfolioEntry, AgingBucket, Pin, MapLayer, SearchItem, ChatSeed, QA as QAType,
  HHOption, OnboardCircle, Comment, ChatMsg, GroupData,
} from '../types';
import type { LoadDomain, LoadState } from './Repository';
import type { Database } from './database.types';
import { getSupabaseClient } from './supabaseClient';
import { emitAppError } from '../../lib/errorBus';
import type { AdminMember, ArcDecision, ArcState, ArcStep, AuditEntry, BoardArcItem, BoardBooking, BoardMessage, BoardTriage, BoardViolation, ClosedVote, CommunityEvent, Decision, DuesState, DuesStatement, DuesStatus, FeedPost, Invite, KnownIssue, Meeting, MemberContext, Membership, NewArcRequest, NewGroup, NewReport, NewReservation, NewViolation, NewVote, ReservationState, Repository, SpecialAssessment, ThreadComment, TriageItem, UnitRef, ViolationNotice, VoteChoice, VotesState } from './Repository';

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
    memberships: [] as Membership[],
    dues: { current: null, cardTitle: '', cardSub: '', cardBtn: '', history: [] } as DuesState,
    votes: { open: null, openAll: [], closed: [] } as VotesState,
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
    boardChat: [] as BoardMessage[],
    archivedTopics: [] as string[],
    boardViolations: [] as BoardViolation[],
    units: [] as UnitRef[],
    adminMembers: [] as AdminMember[],
    docs: [] as Doc[],
    meetings: [] as Meeting[],
    audit: [] as AuditEntry[],
    boardBookings: [] as BoardBooking[],
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
    // Realtime DM delivery (RLS-gated server-side; harmless no-op until the
    // dm_messages table is added to the realtime publication).
    this.client.channel('dm-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, () => {
        void this.hydrateDms().then(() => this.notify());
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'board_messages' }, () => {
        void this.hydrateBoardChat().then(() => this.notify());
      })
      .subscribe();
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

  /** Upload files into the community's private media folder; returns paths. */
  private async uploadFiles(files: File[] | undefined, domain: string): Promise<string[]> {
    if (!files?.length || !this.communityId) return [];
    const paths: string[] = [];
    for (const f of files) {
      const ext = (f.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${this.communityId}/${domain}/${crypto.randomUUID()}.${ext}`;
      const { error } = await this.client.storage.from('media').upload(path, f, { contentType: f.type || undefined });
      if (this.failed('upload the attachment', error)) continue;
      paths.push(path);
    }
    return paths;
  }

  /** Signed URLs (1h) for private media paths; failures fall out silently. */
  private async signUrls(paths: string[]): Promise<Record<string, string>> {
    const unique = [...new Set(paths.filter(Boolean))];
    if (!unique.length) return {};
    const { data } = await this.client.storage.from('media').createSignedUrls(unique, 3600);
    const map: Record<string, string> = {};
    for (const d of data ?? []) if (d.path && d.signedUrl) map[d.path] = d.signedUrl;
    return map;
  }

  /** Ids with a write in flight — guards double-taps on actions that also
   * insert side-effect rows (decisions, documents). */
  private inflight = new Set<string>();

  /**
   * Per-domain hydration status. Everything starts `loading` so a first paint
   * shows skeletons rather than "No open votes"; a hydrator that hits an
   * error marks `error` so the screen can offer a retry instead of an empty
   * state that lies about what exists.
   */
  private loadState: Partial<Record<LoadDomain, LoadState>> = {};

  getLoadState = (domain: LoadDomain): LoadState => this.loadState[domain] ?? 'loading';

  /** Record the outcome of a hydrator. `errors` are the discarded `error`
   * fields from its queries — any one of them makes the domain untrustworthy. */
  private mark(domain: LoadDomain, ...errors: ({ message?: string } | null | undefined)[]) {
    this.loadState[domain] = errors.some(Boolean) ? 'error' : 'ready';
  }


  /**
   * Run `fn` only if no write with this key is already in flight. Real users
   * double-tap — on a slow connection the first response hasn't landed, the
   * button is still live, and the second tap writes a second row. Reservations
   * are the sharp case: no unique constraint backs them, so two taps meant two
   * bookings for one slot, against the "one active booking per household" rule
   * the Reserve screen states.
   */
  private async once(key: string, fn: () => Promise<void>) {
    if (this.inflight.has(key)) return;
    this.inflight.add(key);
    try { await fn(); } finally { this.inflight.delete(key); }
  }

  retry = () => {
    // Clear failed domains back to loading so the UI shows progress, not a
    // stale error, while the refetch is in flight.
    (Object.keys(this.loadState) as LoadDomain[]).forEach((k) => {
      if (this.loadState[k] === 'error') this.loadState[k] = 'loading';
    });
    this.notify();
    void this.refresh();
  };

  /** Fire-and-forget board-action audit entry. */
  private audit(action: string, detail = '') {
    if (!this.communityId || !this.profileId) return;
    void this.client.from('audit_log')
      .insert({ community_id: this.communityId, actor_profile_id: this.profileId, action, detail })
      .then(() => this.hydrateAudit()).then(() => this.notify());
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (!this.hydrated) { this.hydrated = true; void this.refresh(); }
    return () => { this.listeners.delete(listener); };
  };
  private notify() { this.listeners.forEach((l) => l()); }

  /** localStorage key remembering which community this device last showed. */
  private static readonly ACTIVE_KEY = 'pav-community';

  private async resolveContext() {
    const { data: { user } } = await this.client.auth.getUser();
    if (!user) { this.profileId = null; this.communityId = null; this.cache.memberships = []; return; }
    const { data: profile } = await this.client.from('profiles').select('id').eq('user_id', user.id).maybeSingle();
    this.profileId = profile?.id ?? null;
    if (!this.profileId) { this.communityId = null; this.unitId = null; this.cache.memberships = []; return; }
    // Every active membership, newest first: a member can belong to more than
    // one community. The device's remembered pick wins when it's still valid;
    // otherwise the most recently joined — which after an invite claim is the
    // community they just accepted into.
    const { data: rows } = await this.client.from('memberships')
      .select('community_id, unit_id, role, communities(name), units(label)')
      .eq('profile_id', this.profileId).eq('status', 'active')
      .order('created_at', { ascending: false });
    type Row = { community_id: string; unit_id: string | null; role: string;
      communities: { name: string } | null; units: { label: string } | null };
    const list = (rows ?? []) as unknown as Row[];
    this.cache.memberships = list.map((m) => ({
      communityId: m.community_id,
      communityName: m.communities?.name ?? '',
      role: (m.role as 'resident' | 'board') ?? 'resident',
      unitLabel: m.units?.label ?? '',
    }));
    let remembered: string | null = null;
    try { remembered = localStorage.getItem(SupabaseRepository.ACTIVE_KEY); } catch { /* no-op */ }
    const pick = list.find((m) => m.community_id === remembered) ?? list[0] ?? null;
    this.communityId = pick?.community_id ?? null;
    this.unitId = pick?.unit_id ?? null;
  }

  getMemberships = () => this.cache.memberships;
  getActiveCommunityId = () => this.communityId;

  switchCommunity = async (communityId: string) => {
    if (communityId === this.communityId) return;
    if (!this.cache.memberships.some((m) => m.communityId === communityId)) return;
    try { localStorage.setItem(SupabaseRepository.ACTIVE_KEY, communityId); } catch { /* no-op */ }
    await this.refresh();
  };

  /** Re-read the current user's context + domain slices. Notifies after the
   * member context and then after each wave, so the first paint (greeting,
   * shell) never waits on the long tail of domain queries. */
  private async refresh() {
    await this.resolveContext();
    await this.hydrateMember();
    this.notify();
    await Promise.all([
      this.hydrateDues(),
      this.hydrateVotes(),
      this.hydrateCompliance(),
      this.hydrateArc(),
      this.hydrateSocial(),
      this.hydrateTriage(),
      this.hydrateDecisions(),
    ]);
    this.notify();
    await Promise.all([
      this.hydrateBoardArc(),
      this.hydrateInvites(),
      this.hydrateBoardChat(),
      this.hydrateAmenities(),
      this.hydrateReservation(),
      this.hydrateDocs(),
      this.hydrateMeetings(),
    ]);
    this.notify();
    await this.hydrateDirectory();   // dms depend on the directory
    await Promise.all([
      this.hydrateDms(),
      this.hydrateGroups(),
      this.hydrateBoardOps(),
    ]);
    this.notify();
  }

  /** Board-only slices bundled: units, violations, members, bookings, audit. */
  private async hydrateBoardOps() {
    await Promise.all([
      this.hydrateUnits(),
      this.hydrateBoardViolations(),
      this.hydrateAdminMembers(),
      this.hydrateBoardBookings(),
      this.hydrateAudit(),
      this.hydrateArchivedTopics(),
    ]);
  }

  isDemo = () => false;

  // ── Board triage + known issues (reports; empty for a fresh community) ──────
  getBoardTriage = () => this.cache.triage;
  getIssues = () => this.cache.issues;
  getTriageItems = () => this.cache.triageItems;
  getMyReports = () => this.cache.myReports;

  createReport = async (input: NewReport) => {
    await this.once('createReport', () => this.createReportInner(input));
  };

  private createReportInner = async ({ kind, description, urgency, location, photos }: NewReport) => {
    if (!this.communityId || !this.profileId) return;
    const unitLabel = this.cache.member?.unitLabel;
    const paths = await this.uploadFiles(photos, 'reports');
    const { error } = await this.client.from('reports').insert({
      community_id: this.communityId,
      reporter_profile_id: this.profileId,
      title: description.trim() ? `${kind} · ${description.trim().slice(0, 80)}` : kind,
      reporter_label: `Reported privately${unitLabel ? ` by ${unitLabel}` : ''} · ${kind}`,
      kind,
      urgency: urgency ?? 'normal',
      location: location?.trim() ?? '',
      photos: paths,
    });
    this.failed('send your report', error, true);
    await this.hydrateTriage(); this.notify();
  };

  setReportStatus = async (id: string, status: 'ticketed' | 'in_progress' | 'resolved') => {
    const patch: { status: string; ref?: string } = { status };
    if (status === 'ticketed') {
      const existing = this.cache.triageItems.find((t) => t.id === id);
      if (!existing?.ref) patch.ref = `#M-${100 + this.cache.triageItems.length + 1}`;
    }
    const { data, error } = await this.client.from('reports').update(patch).eq('id', id).select('id');
    if (!this.failed('update the report', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't update the report — you may not have permission.");
    }
    this.audit('Report status', `${status} · ${id.slice(0, 8)}`);
    await this.hydrateTriage(); this.notify();
  };

  assignReport = async (id: string, vendor: string) => {
    const { data, error } = await this.client.from('reports')
      .update({ vendor: vendor.trim(), status: 'in_progress' }).eq('id', id).select('id');
    if (!this.failed('assign the report', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't assign the report — you may not have permission.");
    }
    this.audit('Report assigned', vendor.trim());
    await this.hydrateTriage(); this.notify();
  };

  setReportNotes = async (id: string, notes: string) => {
    const { data, error } = await this.client.from('reports')
      .update({ board_notes: notes }).eq('id', id).select('id');
    if (!this.failed('save the note', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't save the note — you may not have permission.");
    }
    await this.hydrateTriage(); this.notify();
  };

  listReportComments = async (reportId: string): Promise<ThreadComment[]> => {
    const { data } = await this.client.from('report_comments')
      .select('id, body, created_at, author_profile_id, profiles(name)')
      .eq('report_id', reportId).order('created_at');
    return (data ?? []).map((c) => ({
      id: c.id,
      authorName: (c as unknown as { profiles: { name: string } | null }).profiles?.name ?? 'Member',
      me: c.author_profile_id === this.profileId,
      body: c.body,
      time: timeLabel(c.created_at),
    }));
  };

  addReportComment = async (reportId: string, body: string) => {
    if (!this.profileId || !body.trim()) return;
    const { error } = await this.client.from('report_comments')
      .insert({ report_id: reportId, author_profile_id: this.profileId, body: body.trim() });
    this.failed('post your reply', error, true);
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
      .select('id, title, status, vendor, kind, reporter_label, ref, reporter_profile_id, urgency, location, photos, board_notes')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false })
      .limit(20);
    const rows = data ?? [];
    const urls = await this.signUrls(rows.flatMap((r) => r.photos));
    const toItem = (r: (typeof rows)[number]): TriageItem => ({
      id: r.id, title: r.title, sub: r.reporter_label, status: r.status, ref: r.ref,
      urgency: r.urgency, location: r.location, boardNotes: r.board_notes, vendor: r.vendor,
      photoUrls: r.photos.map((p) => urls[p]).filter(Boolean),
    });
    this.cache.triageItems = rows.map(toItem);
    this.cache.myReports = rows
      .filter((r) => r.reporter_profile_id === this.profileId)
      .map(toItem);
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
        iconColor: resolved ? 'rgb(var(--slatelight))' : 'rgb(var(--accent))',
        title: r.title,
        statusLabel: resolved ? 'Resolved' : handled ? (r.vendor || 'Ticketed') : 'In triage',
        tone: resolved ? 'skyborder' : handled ? 'mint' : 'gold',
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

  createFeedPost = async (body: string, opts?: { kind?: string; photos?: File[] }) => {
    if (!this.communityId || !this.cache.member || !this.profileId) return;
    const m = this.cache.member;
    const kind = opts?.kind ?? 'post';
    const paths = await this.uploadFiles(opts?.photos, 'feed');
    const TAGS: Record<string, string> = { shoutout: 'Shoutout', borrow: 'Help & Borrow', sale: 'For Sale & Free', post: '' };
    const { error } = await this.client.from('feed_posts').insert({
      community_id: this.communityId,
      author_profile_id: this.profileId,
      author_name: m.name,
      author_initial: m.initial,
      author_color: m.color,
      unit_label: m.unitLabel,
      time_label: 'Just now',
      kind,
      tag_label: TAGS[kind] ?? '',
      body: body.trim(),
      photos: paths,
      sort_order: -Math.floor(Date.now() / 1000),  // newest first under order(sort_order)
    });
    this.failed('publish your post', error, true);
    await this.hydrateSocial(); this.notify();
  };

  deleteFeedPost = async (id: string) => {
    const { data, error } = await this.client.from('feed_posts').delete().eq('id', id).select('id');
    if (!this.failed('delete the post', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't delete the post — you may not have permission.");
    }
    await this.hydrateSocial(); this.notify();
  };

  togglePinPost = async (id: string) => {
    const post = this.cache.feed.find((p) => p.id === id);
    const { data, error } = await this.client.from('feed_posts')
      .update({ pinned: !post?.pinned }).eq('id', id).select('id');
    if (!this.failed('pin the post', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't pin the post — you may not have permission.");
    }
    this.audit(post?.pinned ? 'Post unpinned' : 'Post pinned', post?.body.slice(0, 60) ?? '');
    await this.hydrateSocial(); this.notify();
  };

  togglePostLike = async (id: string) => {
    if (!this.profileId) return;
    const post = this.cache.feed.find((p) => p.id === id);
    if (post?.likedByMe) {
      await this.client.from('post_reactions').delete().eq('post_id', id).eq('profile_id', this.profileId);
    } else {
      const { error } = await this.client.from('post_reactions')
        .insert({ post_id: id, profile_id: this.profileId });
      if (error && !`${error.message}`.includes('duplicate')) this.failed('react', error);
    }
    await this.hydrateSocial(); this.notify();
  };

  listPostComments = async (postId: string): Promise<ThreadComment[]> => {
    const { data } = await this.client.from('post_comments')
      .select('id, body, created_at, author_profile_id, profiles(name)')
      .eq('post_id', postId).order('created_at');
    return (data ?? []).map((c) => ({
      id: c.id,
      authorName: (c as unknown as { profiles: { name: string } | null }).profiles?.name ?? 'Member',
      me: c.author_profile_id === this.profileId,
      body: c.body,
      time: timeLabel(c.created_at),
    }));
  };

  addPostComment = async (postId: string, body: string) => {
    if (!this.profileId || !body.trim()) return;
    const { error } = await this.client.from('post_comments')
      .insert({ post_id: postId, author_profile_id: this.profileId, body: body.trim() });
    this.failed('post your comment', error, true);
    await this.hydrateSocial(); this.notify();
  };

  toggleEventRsvp = async (id: string) => {
    if (!this.profileId) return;
    const ev = this.cache.events.find((e) => e.id === id);
    if (ev?.rsvpd) {
      await this.client.from('event_rsvps').delete().eq('event_id', id).eq('profile_id', this.profileId);
    } else {
      const { error } = await this.client.from('event_rsvps')
        .insert({ event_id: id, profile_id: this.profileId });
      if (error && !`${error.message}`.includes('duplicate')) this.failed('RSVP', error);
    }
    await this.hydrateSocial(); this.notify();
  };

  createEvent = async ({ title, whenLabel, whereLabel, tagLabel }: { title: string; whenLabel: string; whereLabel: string; tagLabel?: string }) => {
    if (!this.communityId) return;
    const { error } = await this.client.from('events').insert({
      community_id: this.communityId,
      title: title.trim(),
      when_label: whenLabel.trim(),
      where_label: whereLabel.trim(),
      tag_label: tagLabel?.trim() ?? '',
      sort_order: -Math.floor(Date.now() / 1000),
    });
    this.failed('create the event', error, true);
    this.audit('Event created', title.trim());
    await this.hydrateSocial(); this.notify();
  };

  private async hydrateSocial() {
    if (!this.communityId) { this.cache.events = []; this.cache.feed = []; this.mark('feed'); return; }
    const [events, feed, myRsvps] = await Promise.all([
      this.client.from('events').select('*').eq('community_id', this.communityId).order('sort_order'),
      this.client.from('feed_posts').select('*, post_reactions(profile_id), post_comments(id)').eq('community_id', this.communityId).order('sort_order'),
      this.profileId
        ? this.client.from('event_rsvps').select('event_id').eq('profile_id', this.profileId)
        : Promise.resolve({ data: [] as { event_id: string }[] }),
    ]);
    const rsvpSet = new Set((myRsvps.data ?? []).map((r) => r.event_id));
    this.cache.events = (events.data ?? []).map((e) => ({
      id: e.id, title: e.title, whenLabel: e.when_label, whereLabel: e.where_label,
      going: e.going, photoLabel: e.photo_label, tagLabel: e.tag_label, featured: e.featured,
      rsvpd: rsvpSet.has(e.id),
    }));
    const feedRows = feed.data ?? [];
    const urls = await this.signUrls(feedRows.flatMap((p) => p.photos));
    const posts = feedRows.map((p) => {
      const reactions = (p as unknown as { post_reactions: { profile_id: string }[] }).post_reactions ?? [];
      const comments = (p as unknown as { post_comments: { id: string }[] }).post_comments ?? [];
      return {
        id: p.id, authorName: p.author_name, authorInitial: p.author_initial, authorColor: p.author_color,
        unitLabel: p.unit_label, timeLabel: relTime(p.created_at), kind: p.kind, tagLabel: p.tag_label,
        body: p.body, photoLabel: p.photo_label,
        mine: !!this.profileId && p.author_profile_id === this.profileId,
        pinned: p.pinned,
        photoUrls: p.photos.map((x) => urls[x]).filter(Boolean),
        likes: reactions.length,
        likedByMe: !!this.profileId && reactions.some((r) => r.profile_id === this.profileId),
        commentCount: comments.length,
      };
    });
    // Pinned announcements float to the top, then newest first.
    this.mark('feed', events.error, feed.error);
    this.cache.feed = [...posts.filter((p) => p.pinned), ...posts.filter((p) => !p.pinned)];
  }

  // ── ARC (real, per-unit; empty for a fresh member) ──────────────────────────
  getArc = () => this.cache.arc;
  getBoardArcQueue = () => this.cache.boardArc;

  createArcRequest = async (input: NewArcRequest) => {
    await this.once('createArcRequest', () => this.createArcRequestInner(input));
  };

  private createArcRequestInner = async ({ type, description, attachments }: NewArcRequest) => {
    if (!this.communityId || !this.unitId) return;
    const { count } = await this.client.from('arc_requests')
      .select('id', { count: 'exact', head: true }).eq('community_id', this.communityId);
    const paths = await this.uploadFiles(attachments, 'arc');
    const { error } = await this.client.from('arc_requests').insert({
      community_id: this.communityId,
      unit_id: this.unitId,
      ref: `#A-${100 + (count ?? 0) + 1}`,
      title: description.trim() ? `${type} — ${description.trim().slice(0, 60)}` : type,
      status: 'review',
      status_label: 'In review',
      attachments: paths,
      steps: [
        { label: 'Submitted', state: 'done' },
        { label: 'Board review', state: 'active' },
        { label: 'Decision', state: 'pending' },
      ],
    });
    this.failed('submit your request', error, true);
    await this.hydrateArc(); await this.hydrateBoardArc(); this.notify();
  };

  decideArc = async (id: string, decision: ArcDecision, note = '', conditions = '') => {
    if (this.inflight.has(id)) return;
    this.inflight.add(id);
    try {
      await this.decideArcInner(id, decision, note, conditions);
    } finally {
      this.inflight.delete(id);
    }
  };

  private decideArcInner = async (id: string, decision: ArcDecision, note = '', conditions = '') => {
    const item = this.cache.boardArc.find((r) => r.id === id);
    const approve = decision === 'approved';
    const label = approve ? 'Approved' : decision === 'declined' ? 'Declined' : 'Info requested';
    const patch = decision === 'info_requested'
      ? {
          status: 'info_requested', status_label: 'Info requested', decision_note: note.trim(),
          steps: [
            { label: 'Submitted', state: 'done' },
            { label: 'Info requested', state: 'active' },
            { label: 'Decision', state: 'pending' },
          ],
        }
      : {
          approved: approve,
          status: decision,
          status_label: label,
          decision_note: note.trim(),
          conditions: conditions.trim(),
          steps: [
            { label: 'Submitted', state: 'done' },
            { label: 'Board review', state: 'done' },
            { label, state: 'done' },
          ],
        };
    const { data, error } = await this.client.from('arc_requests').update(patch).eq('id', id).select('id');
    const denied = this.failed('decide the request', error) || (data ?? []).length === 0;
    if (denied && !error) emitAppError("Couldn't decide the request — you may not have permission.");
    if (!denied && item && this.communityId && decision !== 'info_requested') {
      const dateLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
      await this.client.from('decisions').insert({
        community_id: this.communityId,
        date_label: dateLabel,
        text: `ARC ${item.ref} ${approve ? 'approved' : 'declined'} — ${item.title}`,
        pill_label: label,
        passed: approve,
        sort_order: -Math.floor(Date.now() / 1000),
      });
    }
    this.audit(`ARC ${label.toLowerCase()}`, item ? `${item.ref} ${item.title}` : id.slice(0, 8));
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
    await this.hydrateInvites();
    await this.hydrateBoardChat(); this.notify();
  };

  revokeInvite = async (id: string) => {
    const { data, error } = await this.client.from('invites')
      .update({ status: 'revoked' }).eq('id', id).eq('status', 'pending').select('id');
    if (!this.failed('revoke the invite', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't revoke the invite — it may already be accepted.");
    }
    await this.hydrateInvites();
    await this.hydrateBoardChat(); this.notify();
  };

  renewInvite = async (id: string) => {
    const { data, error } = await this.client.from('invites')
      .update({ expires_at: new Date(Date.now() + 14 * 86400_000).toISOString() })
      .eq('id', id).eq('status', 'pending').select('id');
    if (!this.failed('renew the invite', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't renew the invite — it may already be accepted.");
    }
    await this.hydrateInvites(); this.notify();
  };

  private async hydrateInvites() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.invites = []; return; }
    const { data } = await this.client.from('invites')
      .select('id, email, unit_label, role, status, code, expires_at')
      .eq('community_id', this.communityId).neq('status', 'revoked')
      .order('created_at', { ascending: false }).limit(20);
    this.cache.invites = (data ?? []).map((i) => {
      const expired = i.status === 'pending' && Date.parse(i.expires_at) < Date.now();
      return {
        id: i.id, email: i.email, unitLabel: i.unit_label, role: i.role,
        status: expired ? 'expired' : i.status,
        code: i.code,
        expiresLabel: i.status === 'pending'
          ? `${expired ? 'Expired' : 'Expires'} ${new Date(i.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
          : '',
      };
    });
  }

  // ── Board chat (private board channel) ──────────────────────────────────────
  getBoardChat = () => this.cache.boardChat;

  sendBoardMessage = async (text: string, topic?: string | null, photos?: File[]) => {
    if (!this.communityId || !this.profileId || (!text.trim() && !photos?.length)) return;
    const paths = await this.uploadFiles(photos, 'boardchat');
    const { error } = await this.client.from('board_messages')
      .insert({ community_id: this.communityId, sender_profile_id: this.profileId, body: text.trim(), topic: topic?.trim() || null, photos: paths });
    this.failed('send your message', error);
    await this.hydrateBoardChat(); this.notify();
  };

  deleteBoardMessage = async (id: string) => {
    const { data, error } = await this.client.from('board_messages').delete().eq('id', id).select('id');
    if (!this.failed('delete the message', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't delete the message — only your own messages can be deleted.");
    }
    await this.hydrateBoardChat(); this.notify();
  };

  renameBoardTopic = async (oldName: string, newName: string) => {
    if (!this.communityId || !newName.trim() || oldName === newName.trim()) return;
    const { error } = await this.client.from('board_messages')
      .update({ topic: newName.trim() })
      .eq('community_id', this.communityId).eq('topic', oldName);
    this.failed('rename the topic', error, true);
    // Carry archive state across the rename if it existed.
    await this.client.from('board_topics')
      .update({ name: newName.trim() })
      .eq('community_id', this.communityId).eq('name', oldName);
    await this.hydrateBoardChat(); await this.hydrateArchivedTopics(); this.notify();
  };

  archiveBoardTopic = async (name: string) => {
    if (!this.communityId || !name.trim()) return;
    const { error } = await this.client.from('board_topics')
      .upsert({ community_id: this.communityId, name: name.trim(), archived: true }, { onConflict: 'community_id,name' });
    this.failed('archive the topic', error, true);
    await this.hydrateArchivedTopics(); this.notify();
  };

  getArchivedBoardTopics = () => this.cache.archivedTopics;

  private async hydrateArchivedTopics() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.archivedTopics = []; return; }
    const { data } = await this.client.from('board_topics')
      .select('name').eq('community_id', this.communityId).eq('archived', true);
    this.cache.archivedTopics = (data ?? []).map((t) => t.name);
  }

  private async hydrateBoardChat() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.boardChat = []; return; }
    const { data } = await this.client.from('board_messages')
      .select('id, body, created_at, sender_profile_id, topic, photos, profiles(name, initial, color)')
      .eq('community_id', this.communityId).order('created_at').limit(200);
    const rows = data ?? [];
    const urls = await this.signUrls(rows.flatMap((m) => m.photos));
    this.cache.boardChat = rows.map((m) => {
      const p = (m as unknown as { profiles: { name: string; initial: string; color: string } | null }).profiles;
      return {
        id: m.id,
        authorName: p?.name ?? 'Board member',
        authorInitial: p?.initial ?? 'B',
        authorColor: p?.color ?? 'rgb(var(--navy))',
        me: m.sender_profile_id === this.profileId,
        text: m.body,
        time: timeLabel(m.created_at),
        topic: m.topic,
        photoUrls: m.photos.map((x) => urls[x]).filter(Boolean),
      };
    });
  }

  private async hydrateBoardArc() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.boardArc = []; return; }
    const { data } = await this.client.from('arc_requests')
      .select('id, ref, title, approved, status, attachments, units(label)')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false }).limit(20);
    const rows = data ?? [];
    const urls = await this.signUrls(rows.flatMap((r) => r.attachments));
    this.cache.boardArc = rows.map((r) => ({
      id: r.id, ref: r.ref, title: r.title, approved: r.approved, status: r.status,
      unitLabel: (r as unknown as { units: { label: string } | null }).units?.label ?? '',
      attachmentUrls: r.attachments.map((p) => urls[p]).filter(Boolean),
    }));
  }

  private async hydrateArc() {
    if (!this.unitId) { this.cache.arc = { requests: [], unseenApproval: null }; return; }
    const { data: rows } = await this.client.from('arc_requests')
      .select('*').eq('unit_id', this.unitId).order('sort_order');
    const urls = await this.signUrls((rows ?? []).flatMap((r) => r.attachments));
    this.cache.arc = {
      requests: (rows ?? []).map((r) => ({
        id: r.id,
        ref: r.ref,
        title: r.title,
        approved: r.approved,
        statusLabel: r.status_label,
        steps: (r.steps as unknown as ArcStep[]) ?? [],
        status: r.status,
        decisionNote: r.decision_note,
        conditions: r.conditions,
        attachmentUrls: r.attachments.map((p) => urls[p]).filter(Boolean),
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
    const vUrls = viol.data ? await this.signUrls(viol.data.photos) : {};
    this.cache.violation = viol.data
      ? {
          id: viol.data.id, title: viol.data.title, sub: viol.data.sub, fixed: viol.data.status === 'fixed',
          description: viol.data.description, severity: viol.data.severity,
          photoUrls: viol.data.photos.map((p) => vUrls[p]).filter(Boolean),
        }
      : null;
    this.cache.assessment = sa.data
      ? { id: sa.data.id, title: sa.data.title, sub: sa.data.sub, paid: false }
      : null;
  }

  // ── Board compliance flow (issue / track / resolve violations) ─────────────
  getBoardViolations = () => this.cache.boardViolations;
  getUnits = () => this.cache.units;

  createViolation = async ({ unitId, title, description, severity, fineCents, photos }: NewViolation) => {
    if (!this.communityId) return;
    const paths = await this.uploadFiles(photos, 'violations');
    const sub = severity === 'fine'
      ? `$${(fineCents / 100).toLocaleString('en-US')} fine · contact the board with questions`
      : severity === 'warning'
        ? 'Formal warning · please address promptly'
        : 'No fee · courtesy notice — mark it fixed when addressed';
    const { error } = await this.client.from('violations').insert({
      community_id: this.communityId,
      unit_id: unitId,
      title: title.trim(),
      sub,
      description: description.trim(),
      severity,
      fine_cents: severity === 'fine' ? fineCents : 0,
      photos: paths,
    });
    this.failed('issue the notice', error, true);
    this.audit('Violation issued', title.trim());
    await this.hydrateBoardViolations(); await this.hydrateCompliance(); this.notify();
  };

  resolveViolation = async (id: string) => {
    const { data, error } = await this.client.from('violations')
      .update({ status: 'resolved' }).eq('id', id).select('id');
    if (!this.failed('resolve the notice', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't resolve the notice — you may not have permission.");
    }
    this.audit('Violation resolved', id.slice(0, 8));
    await this.hydrateBoardViolations(); await this.hydrateCompliance(); this.notify();
  };

  private async hydrateBoardViolations() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.boardViolations = []; return; }
    const { data } = await this.client.from('violations')
      .select('id, title, severity, status, fine_cents, units(label)')
      .eq('community_id', this.communityId).neq('status', 'resolved')
      .order('created_at', { ascending: false }).limit(30);
    this.cache.boardViolations = (data ?? []).map((v) => ({
      id: v.id, title: v.title, severity: v.severity, status: v.status,
      unitLabel: (v as unknown as { units: { label: string } | null }).units?.label ?? '',
      fineLabel: v.fine_cents > 0 ? `$${(v.fine_cents / 100).toLocaleString('en-US')}` : '',
    }));
  }

  private async hydrateUnits() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.units = []; return; }
    const { data } = await this.client.from('units')
      .select('id, label').eq('community_id', this.communityId).order('label');
    this.cache.units = (data ?? []).map((u) => ({ id: u.id, label: u.label }));
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
    if (!this.communityId) { this.cache.votes = { open: null, openAll: [], closed: [] }; this.mark('votes'); return; }
    const [{ data: openRows, error: openErr }, { data: closedRows, error: closedErr }] = await Promise.all([
      this.client.from('votes').select('*, vote_options(id, label, position, tally)')
        .eq('community_id', this.communityId).eq('status', 'open')
        .order('created_at', { ascending: false }),
      this.client.from('votes').select('*, vote_options(id, label, tally)')
        .eq('community_id', this.communityId).eq('status', 'closed')
        .order('created_at', { ascending: false }).limit(12),
    ]);
    const myBallots: Record<string, { choice: string; option_ids: string[] }> = {};
    const allIds = [...(openRows ?? []), ...(closedRows ?? [])].map((v) => v.id);
    if (this.profileId && allIds.length) {
      const { data: ballots } = await this.client.from('vote_ballots')
        .select('vote_id, choice, option_ids').eq('profile_id', this.profileId).in('vote_id', allIds);
      for (const b of ballots ?? []) myBallots[b.vote_id] = { choice: b.choice, option_ids: b.option_ids };
    }
    const openAll = (openRows ?? []).map((vote) => {
      const total = vote.yes_count + vote.no_count;
      const options = ((vote as unknown as { vote_options: { id: string; label: string; position?: number; tally: number }[] }).vote_options ?? [])
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((o) => ({ id: o.id, label: o.label, tally: o.tally }));
      const mine = myBallots[vote.id];
      return {
        id: vote.id,
        title: vote.title,
        subtitle: vote.subtitle,
        closesLabel: vote.closes_at
          ? `Open vote · closes ${new Date(vote.closes_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`
          : vote.closes_label,
        quorumCount: vote.quorum_count,
        quorumTotal: vote.quorum_total,
        quorumPct: vote.quorum_total ? Math.round((vote.quorum_count / vote.quorum_total) * 100) : 0,
        yesCount: vote.yes_count,
        noCount: vote.no_count,
        yesPct: total ? Math.round((vote.yes_count / total) * 100) : 0,
        myVote: (mine?.choice === 'yes' || mine?.choice === 'no') ? (mine.choice as VoteChoice) : null,
        receipt: vote.receipt,
        yesLabel: vote.yes_label,
        noLabel: vote.no_label,
        kind: (vote.kind === 'options' ? 'options' : 'yesno') as 'yesno' | 'options',
        multi: vote.multi,
        options,
        myOptionIds: mine?.option_ids ?? [],
      };
    });
    const closed: ClosedVote[] = (closedRows ?? []).map((vote) => {
      const options = ((vote as unknown as { vote_options: { id: string; label: string; tally: number }[] }).vote_options ?? []);
      const resultLabel = vote.kind === 'options'
        ? options.slice().sort((a, b) => b.tally - a.tally).slice(0, 2).map((o) => `${o.label}: ${o.tally}`).join(' · ')
        : `${vote.yes_label} ${vote.yes_count} · ${vote.no_label} ${vote.no_count}`;
      return {
        id: vote.id,
        title: vote.title,
        resultLabel,
        dateLabel: `Closed ${new Date(vote.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      };
    });
    this.mark('votes', openErr, closedErr);
    this.cache.votes = { open: openAll[0] ?? null, openAll, closed };
  }

  castVote = async (voteId: string, choice: VoteChoice) => {
    if (!this.profileId) return;
    const { error } = await this.client.from('vote_ballots')
      .insert({ vote_id: voteId, profile_id: this.profileId, choice });
    if (error && `${error.message}`.includes('duplicate')) {
      // Already voted — change the ballot instead (tally trigger moves counts).
      const { error: upd } = await this.client.from('vote_ballots')
        .update({ choice }).eq('vote_id', voteId).eq('profile_id', this.profileId);
      this.failed('change your ballot', upd);
    } else {
      this.failed('record your ballot', error);
    }
    await this.hydrateVotes(); this.notify();
  };

  castOptionVote = async (voteId: string, optionIds: string[]) => {
    if (!this.profileId || optionIds.length === 0) return;
    const { error } = await this.client.from('vote_ballots')
      .insert({ vote_id: voteId, profile_id: this.profileId, option_ids: optionIds });
    if (error && `${error.message}`.includes('duplicate')) {
      const { error: upd } = await this.client.from('vote_ballots')
        .update({ option_ids: optionIds }).eq('vote_id', voteId).eq('profile_id', this.profileId);
      this.failed('change your ballot', upd);
    } else {
      this.failed('record your ballot', error);
    }
    await this.hydrateVotes(); this.notify();
  };

  closeVote = async (voteId: string) => {
    if (this.inflight.has(voteId)) return;
    this.inflight.add(voteId);
    try {
      await this.closeVoteInner(voteId);
    } finally {
      this.inflight.delete(voteId);
    }
  };

  private closeVoteInner = async (voteId: string) => {
    const vote = this.cache.votes.openAll.find((v) => v.id === voteId);
    const { data, error } = await this.client.from('votes')
      .update({ status: 'closed' }).eq('id', voteId).select('id');
    if (!this.failed('close the ballot', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't close the ballot — you may not have permission.");
      return;
    }
    // Closing logs the outcome into the community's decisions record.
    if (vote && this.communityId) {
      const passed = vote.kind === 'yesno' ? vote.yesCount >= vote.noCount : true;
      const pill = vote.kind === 'yesno'
        ? `${passed ? 'Passed' : 'Declined'} ${vote.yesCount}–${vote.noCount}`
        : (vote.options.slice().sort((a, b) => b.tally - a.tally)[0]?.label ?? 'Closed');
      await this.client.from('decisions').insert({
        community_id: this.communityId,
        date_label: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        text: vote.title,
        pill_label: pill,
        passed,
        sort_order: -Math.floor(Date.now() / 1000),
      });
    }
    this.audit('Ballot closed', vote?.title ?? voteId.slice(0, 8));
    await this.hydrateVotes(); await this.hydrateDecisions(); this.notify();
  };

  openVote = async ({ question, yesLabel, noLabel, kind, options, multi, closesAt }: NewVote) => {
    if (!this.communityId) return;
    const { count } = await this.client.from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('community_id', this.communityId).eq('status', 'active');
    const isOptions = kind === 'options' && (options?.length ?? 0) >= 2;
    const { data: created, error } = await this.client.from('votes').insert({
      community_id: this.communityId,
      title: question.trim(),
      subtitle: 'Opened by the board · one ballot per household',
      closes_label: closesAt ? '' : 'Open vote · no deadline set',
      closes_at: closesAt ?? null,
      quorum_total: count ?? 0,
      yes_label: (yesLabel ?? '').trim() || 'Yes',
      no_label: (noLabel ?? '').trim() || 'No',
      kind: isOptions ? 'options' : 'yesno',
      multi: !!multi,
      receipt: `#R-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      status: 'open',
    }).select('id').single();
    this.failed('open the ballot', error, true);
    if (isOptions && created?.id) {
      const { error: optErr } = await this.client.from('vote_options').insert(
        (options ?? []).map((label, i) => ({ vote_id: created.id, label: label.trim(), position: i })),
      );
      this.failed('save the ballot options', optErr, true);
    }
    this.audit('Ballot opened', question.trim());
    await this.hydrateVotes(); this.notify();
  };

  // ── Dues (real, per-unit; empty until the board issues statements) ──────────
  getDues = () => this.cache.dues;

  private async hydrateDues() {
    const empty: DuesState = { current: null, cardTitle: '', cardSub: '', cardBtn: '', history: [] };
    if (!this.unitId) { this.cache.dues = empty; this.mark('dues'); return; }
    const { data: rows, error: duesErr } = await this.client.from('dues_statements')
      .select('*').eq('unit_id', this.unitId).order('sort_order');
    this.mark('dues', duesErr);
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
      .select('name, initial, color, phone, avatar_url, hide_directory').eq('id', this.profileId).maybeSingle();
    if (!profile) { this.cache.member = null; return; }
    const membership = this.cache.memberships.find((m) => m.communityId === this.communityId);
    this.cache.member = {
      name: profile.name,
      initial: profile.initial,
      color: profile.color,
      role: membership?.role ?? 'resident',
      communityName: membership?.communityName ?? '',
      unitLabel: membership?.unitLabel ?? '',
      phone: profile.phone,
      avatarUrl: profile.avatar_url,
      hideDirectory: profile.hide_directory,
    };
  }

  updateProfile = async (patch: { name?: string; phone?: string; color?: string; hideDirectory?: boolean }) => {
    if (!this.profileId) return;
    const row: Database['public']['Tables']['profiles']['Update'] = {};
    if (patch.name !== undefined && patch.name.trim()) {
      row.name = patch.name.trim();
      row.initial = patch.name.trim()[0].toUpperCase();
    }
    if (patch.phone !== undefined) row.phone = patch.phone.trim();
    if (patch.color !== undefined) row.color = patch.color;
    if (patch.hideDirectory !== undefined) row.hide_directory = patch.hideDirectory;
    const { data, error } = await this.client.from('profiles')
      .update(row).eq('id', this.profileId).select('id');
    if (!this.failed('save your profile', error, true) && (data ?? []).length === 0) {
      emitAppError("Couldn't save your profile — you may not have permission.");
    }
    await this.hydrateMember(); await this.hydrateDirectory(); await this.hydrateDms(); this.notify();
  };

  // ── Member & unit admin (board) ────────────────────────────────────────────
  getAdminMembers = () => this.cache.adminMembers;

  setMemberRole = async (membershipId: string, role: 'resident' | 'board') => {
    const { data, error } = await this.client.from('memberships')
      .update({ role }).eq('id', membershipId).select('id');
    if (!this.failed('change the role', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't change the role — you may not have permission.");
    }
    this.audit('Role changed', `${role} · ${membershipId.slice(0, 8)}`);
    await this.hydrateAdminMembers(); this.notify();
  };

  setMemberStatus = async (membershipId: string, status: 'active' | 'inactive') => {
    const { data, error } = await this.client.from('memberships')
      .update({ status }).eq('id', membershipId).select('id');
    if (!this.failed('update the member', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't update the member — you may not have permission.");
    }
    this.audit(status === 'inactive' ? 'Member deactivated' : 'Member reactivated', membershipId.slice(0, 8));
    await this.hydrateAdminMembers(); await this.hydrateDirectory(); await this.hydrateDms(); this.notify();
  };

  assignMemberUnit = async (membershipId: string, unitLabel: string) => {
    if (!this.communityId) return;
    const label = unitLabel.trim();
    let unitId: string | null = null;
    if (label) {
      const { data: existing } = await this.client.from('units')
        .select('id').eq('community_id', this.communityId).eq('label', label).maybeSingle();
      if (existing) {
        unitId = existing.id;
      } else {
        const { data: created, error } = await this.client.from('units')
          .insert({ community_id: this.communityId, label }).select('id').single();
        if (this.failed('create the unit', error)) return;
        unitId = created?.id ?? null;
      }
    }
    const { data, error } = await this.client.from('memberships')
      .update({ unit_id: unitId }).eq('id', membershipId).select('id');
    if (!this.failed('reassign the unit', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't reassign the unit — you may not have permission.");
    }
    this.audit('Unit reassigned', label || '(none)');
    await this.hydrateAdminMembers(); await this.hydrateUnits(); this.notify();
  };

  private async hydrateAdminMembers() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.adminMembers = []; return; }
    const { data } = await this.client.from('memberships')
      .select('id, profile_id, role, status, profiles(name), units(label)')
      .eq('community_id', this.communityId).order('created_at');
    this.cache.adminMembers = (data ?? []).map((m) => ({
      membershipId: m.id,
      profileId: m.profile_id,
      name: (m as unknown as { profiles: { name: string } | null }).profiles?.name ?? 'Member',
      unitLabel: (m as unknown as { units: { label: string } | null }).units?.label ?? '',
      role: m.role,
      status: m.status,
    }));
  }

  private async hydrateAudit() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.audit = []; return; }
    const { data } = await this.client.from('audit_log')
      .select('id, action, detail, created_at, profiles(name)')
      .eq('community_id', this.communityId)
      .order('created_at', { ascending: false }).limit(30);
    this.cache.audit = (data ?? []).map((a) => ({
      id: a.id,
      actorName: (a as unknown as { profiles: { name: string } | null }).profiles?.name ?? 'Board',
      action: a.action,
      detail: a.detail,
      time: relTime(a.created_at),
    }));
  }

  getAuditLog = () => this.cache.audit;

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
  listDocuments = async (): Promise<Doc[]> => this.cache.docs;
  listDocSections = async (): Promise<DocSection[]> => [];
  listCircles = async (): Promise<Circle[]> => [];
  listPortfolio = async (): Promise<PortfolioEntry[]> => [];
  listAging = async (): Promise<AgingBucket[]> => [];
  listNotifications = async (): Promise<Notif[]> => [];
  listMapPins = async (): Promise<Pin[]> => [];
  /** Live search covers what the member can already see: people, amenities,
   * documents, events, and their own requests. */
  getSearchIndex = async (): Promise<SearchItem[]> => [
    ...this.cache.directory.map((d) => ({ cat: 'People', icon: 'ph-fill ph-user', title: d.name, sub: d.unit, k: `${d.name} ${d.unit}` })),
    ...this.cache.amenities.map((a) => ({ cat: 'Amenities', icon: a.icon, title: a.name, sub: a.sub, k: a.name })),
    ...this.cache.docs.map((d) => ({ cat: 'Documents', icon: 'ph-fill ph-file-text', title: d.title, sub: d.sub, k: d.title })),
    ...this.cache.events.map((e) => ({ cat: 'Events', icon: 'ph-fill ph-calendar-dots', title: e.title, sub: e.whenLabel, k: e.title })),
    ...this.cache.myReports.map((r) => ({ cat: 'My requests', icon: 'ph-fill ph-wrench', title: r.title, sub: r.ref || r.status, k: r.title })),
  ];
  getChatSeed = async (): Promise<ChatSeed> => this.cache.chatIndex;

  // ── Documents (board-uploaded library in Storage) ──────────────────────────
  getDocs = () => this.cache.docs;

  uploadDocument = async ({ file, name, section }: { file: File; name: string; section: string }) => {
    if (!this.communityId) return;
    const paths = await this.uploadFiles([file], 'documents');
    if (!paths.length) throw new Error('upload failed');
    const kb = Math.max(1, Math.round(file.size / 1024));
    const { error } = await this.client.from('documents').insert({
      community_id: this.communityId,
      name: name.trim() || file.name,
      section: section.trim() || 'General',
      storage_path: paths[0],
      size_label: kb > 999 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`,
      updated_label: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    this.failed('save the document', error, true);
    this.audit('Document uploaded', name.trim() || file.name);
    await this.hydrateDocs(); this.notify();
  };

  deleteDocument = async (id: string) => {
    const { data, error } = await this.client.from('documents').delete().eq('id', id).select('id');
    if (!this.failed('remove the document', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't remove the document — you may not have permission.");
    }
    this.audit('Document removed', id.slice(0, 8));
    await this.hydrateDocs(); this.notify();
  };

  private async hydrateDocs() {
    if (!this.communityId) { this.cache.docs = []; this.mark('docs'); return; }
    const { data, error } = await this.client.from('documents')
      .select('*').eq('community_id', this.communityId).order('section').order('created_at', { ascending: false });
    this.mark('docs', error);
    const rows = data ?? [];
    const urls = await this.signUrls(rows.map((d) => d.storage_path));
    this.cache.docs = rows.map((d) => ({
      key: d.id, id: d.id, title: d.name,
      sub: [d.section, d.size_label, d.updated_label].filter(Boolean).join(' · '),
      icon: 'ph-fill ph-file-text',
      url: urls[d.storage_path],
      section: d.section,
    }));
  }

  // ── Meetings ───────────────────────────────────────────────────────────────
  getMeetings = () => this.cache.meetings;

  createMeeting = async ({ title, whenLabel, whereLabel, agenda }: { title: string; whenLabel: string; whereLabel: string; agenda: string[] }) => {
    if (!this.communityId) return;
    const { error } = await this.client.from('meetings').insert({
      community_id: this.communityId,
      title: title.trim(),
      when_label: whenLabel.trim(),
      where_label: whereLabel.trim(),
      agenda: agenda.map((a) => a.trim()).filter(Boolean),
    });
    this.failed('schedule the meeting', error, true);
    this.audit('Meeting scheduled', title.trim());
    await this.hydrateMeetings(); this.notify();
  };

  publishMinutes = async (meetingId: string, file: File) => {
    if (this.inflight.has(meetingId)) return;
    this.inflight.add(meetingId);
    try {
      await this.publishMinutesInner(meetingId, file);
    } finally {
      this.inflight.delete(meetingId);
    }
  };

  private publishMinutesInner = async (meetingId: string, file: File) => {
    const meeting = this.cache.meetings.find((m) => m.id === meetingId);
    const paths = await this.uploadFiles([file], 'documents');
    if (!paths.length) throw new Error('upload failed');
    const { data, error } = await this.client.from('meetings')
      .update({ minutes_path: paths[0], status: 'past' }).eq('id', meetingId).select('id');
    if (!this.failed('publish the minutes', error, true) && (data ?? []).length === 0) {
      emitAppError("Couldn't publish the minutes — you may not have permission.");
      return;
    }
    // Minutes also land in the community documents library.
    if (this.communityId) {
      const kb = Math.max(1, Math.round(file.size / 1024));
      await this.client.from('documents').insert({
        community_id: this.communityId,
        name: `Minutes — ${meeting?.title ?? 'Board meeting'}`,
        section: 'Minutes',
        storage_path: paths[0],
        size_label: kb > 999 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`,
        updated_label: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    }
    this.audit('Minutes published', meeting?.title ?? meetingId.slice(0, 8));
    await this.hydrateMeetings(); await this.hydrateDocs(); this.notify();
  };

  private async hydrateMeetings() {
    if (!this.communityId) { this.cache.meetings = []; return; }
    const { data } = await this.client.from('meetings')
      .select('*').eq('community_id', this.communityId)
      .order('created_at', { ascending: false }).limit(12);
    const rows = data ?? [];
    const urls = await this.signUrls(rows.map((m) => m.minutes_path ?? '').filter(Boolean));
    this.cache.meetings = rows.map((m) => ({
      id: m.id, title: m.title, whenLabel: m.when_label, whereLabel: m.where_label,
      agenda: (m.agenda as string[]) ?? [],
      minutesUrl: m.minutes_path ? urls[m.minutes_path] ?? null : null,
      status: m.status,
    }));
  }

  // ── Amenities (real, community-scoped; empty until the board adds them) ─────
  getAmenities = () => this.cache.amenities;

  private async hydrateAmenities() {
    if (!this.communityId) { this.cache.amenities = []; this.mark('amenities'); return; }
    const { data, error } = await this.client.from('amenities')
      .select('*').eq('community_id', this.communityId).eq('active', true).order('sort_order');
    this.mark('amenities', error);
    this.cache.amenities = (data ?? []).map((a) => ({
      id: a.id, name: a.name, sub: a.sub, icon: a.icon, rules: a.rules,
      avail: a.avail_label, occ: a.occ_label, occColor: 'rgb(var(--slatelight))', taken: [],
      openHour: a.open_hour, closeHour: a.close_hour, slotMinutes: a.slot_minutes,
      capacity: a.capacity, maxDaysAhead: a.max_days_ahead,
    }));
  }

  createAmenity = async ({ name, sub, rules, icon, openHour, closeHour, slotMinutes, capacity, maxDaysAhead }: { name: string; sub: string; rules: string; icon: string; openHour?: number; closeHour?: number; slotMinutes?: number; capacity?: number; maxDaysAhead?: number }) => {
    if (!this.communityId) return;
    const { error } = await this.client.from('amenities').insert({
      community_id: this.communityId,
      name: name.trim(),
      sub: sub.trim(),
      rules: rules.trim(),
      icon,
      sort_order: this.cache.amenities.length,
      open_hour: openHour ?? 8,
      close_hour: closeHour ?? 21,
      slot_minutes: slotMinutes ?? 60,
      capacity: capacity ?? 1,
      max_days_ahead: maxDaysAhead ?? 7,
    });
    this.failed('add the amenity', error, true);
    this.audit('Amenity added', name.trim());
    await this.hydrateAmenities(); this.notify();
  };

  updateAmenity = async (id: string, patch: Partial<{ name: string; sub: string; rules: string; openHour: number; closeHour: number; slotMinutes: number; capacity: number; maxDaysAhead: number }>) => {
    const row: Database['public']['Tables']['amenities']['Update'] = {};
    if (patch.name !== undefined) row.name = patch.name.trim();
    if (patch.sub !== undefined) row.sub = patch.sub.trim();
    if (patch.rules !== undefined) row.rules = patch.rules.trim();
    if (patch.openHour !== undefined) row.open_hour = patch.openHour;
    if (patch.closeHour !== undefined) row.close_hour = patch.closeHour;
    if (patch.slotMinutes !== undefined) row.slot_minutes = patch.slotMinutes;
    if (patch.capacity !== undefined) row.capacity = patch.capacity;
    if (patch.maxDaysAhead !== undefined) row.max_days_ahead = patch.maxDaysAhead;
    const { data, error } = await this.client.from('amenities').update(row).eq('id', id).select('id');
    if (!this.failed('update the amenity', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't update the amenity — you may not have permission.");
    }
    this.audit('Amenity updated', patch.name ?? id.slice(0, 8));
    await this.hydrateAmenities(); this.notify();
  };

  getBoardBookings = () => this.cache.boardBookings;

  private async hydrateBoardBookings() {
    if (!this.communityId || this.cache.member?.role !== 'board') { this.cache.boardBookings = []; return; }
    const { data } = await this.client.from('reservations')
      .select('id, amenity, day_label, slot_label, profiles(name)')
      .eq('community_id', this.communityId).eq('status', 'booked')
      .order('created_at', { ascending: false }).limit(30);
    this.cache.boardBookings = (data ?? []).map((r) => ({
      id: r.id, amenity: r.amenity, dayLabel: r.day_label, slotLabel: r.slot_label,
      memberName: (r as unknown as { profiles: { name: string } | null }).profiles?.name ?? 'Member',
    }));
  }

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

  createReservation = async (input: NewReservation) => {
    await this.once(`reserve:${input.amenity}:${input.day}:${input.slot}`, () => this.createReservationInner(input));
  };

  private createReservationInner = async ({ amenity, day, slot, hours }: NewReservation) => {
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

  /** Fellow community members (everyone active except yourself; members who
   * opted out of the directory are hidden). */
  private async hydrateDirectory() {
    if (!this.communityId || !this.profileId) { this.cache.directory = []; return; }
    const { data } = await this.client.from('memberships')
      .select('profile_id, profiles(name, initial, color, hide_directory), units(label)')
      .eq('community_id', this.communityId).eq('status', 'active');
    this.cache.directory = (data ?? [])
      .filter((m) => m.profile_id !== this.profileId)
      .flatMap((m) => {
        const p = (m as unknown as { profiles: { name: string; initial: string; color: string; hide_directory: boolean } | null }).profiles;
        const u = (m as unknown as { units: { label: string } | null }).units;
        return p && !p.hide_directory ? [{
          key: m.profile_id, name: p.name, initial: p.initial, color: p.color,
          unit: u?.label ?? '', tags: [], note: '',
        }] : [];
      });
  }

  /** Threads + messages, keyed by the other member's profile id; the chat
   * index lists every neighbor so a first message needs no setup. Unread
   * counts come from the server-side dm_reads marks, so they follow the
   * member across devices. */
  private async hydrateDms() {
    if (!this.profileId) { this.cache.chats = {}; this.cache.chatIndex = {}; this.cache.dmThreads = {}; return; }
    const me = this.profileId;
    const { data: threads } = await this.client.from('dm_threads')
      .select('id, a_profile_id, b_profile_id')
      .or(`a_profile_id.eq.${me},b_profile_id.eq.${me}`);
    const threadIds = (threads ?? []).map((t) => t.id);
    const [{ data: msgs }, { data: readRows }] = threadIds.length
      ? await Promise.all([
          this.client.from('dm_messages').select('*').in('thread_id', threadIds).order('created_at'),
          this.client.from('dm_reads').select('thread_id, last_read_at').eq('profile_id', me),
        ])
      : [{ data: [] }, { data: [] }];
    const readByThread: Record<string, number> = {};
    for (const r of readRows ?? []) readByThread[r.thread_id] = Date.parse(r.last_read_at);
    const photoPaths = (msgs ?? []).flatMap((x) => x.photos);
    const urls = await this.signUrls(photoPaths);
    const chats: MockChatMap = {};
    const threadByOther: Record<string, string> = {};
    const unreadByOther: Record<string, number> = {};
    for (const t of threads ?? []) {
      const other = t.a_profile_id === me ? t.b_profile_id : t.a_profile_id;
      threadByOther[other] = t.id;
      const rows = (msgs ?? []).filter((x) => x.thread_id === t.id);
      chats[other] = rows.map((x) => ({
        id: x.id, me: x.sender_profile_id === me, text: x.body, time: timeLabel(x.created_at),
        photos: x.photos.map((p) => urls[p]).filter(Boolean),
      }));
      const lastRead = readByThread[t.id] ?? 0;
      unreadByOther[other] = rows.filter((x) => x.sender_profile_id !== me && Date.parse(x.created_at) > lastRead).length;
    }
    const index: ChatSeed = {};
    for (const d of this.cache.directory) {
      const thread = chats[d.key];
      const last = thread?.[thread.length - 1];
      index[d.key] = {
        name: d.name, unit: d.unit, color: d.color, initial: d.initial,
        seed: last?.text || (last?.photos?.length ? '📷 Photo' : 'Say hello 👋'),
        time: last?.time ?? '', unread: unreadByOther[d.key] ?? 0,
      };
    }
    this.cache.chats = chats;
    this.cache.chatIndex = index;
    this.cache.dmThreads = threadByOther;
  }

  markChatRead = (chatKey: string) => {
    const threadId = this.cache.dmThreads[chatKey];
    if (threadId && this.profileId) {
      void this.client.from('dm_reads')
        .upsert({ thread_id: threadId, profile_id: this.profileId, last_read_at: new Date().toISOString() }, { onConflict: 'thread_id,profile_id' })
        .then(() => {});
    }
    const entry = this.cache.chatIndex[chatKey];
    if (entry && entry.unread > 0) {
      this.cache.chatIndex = { ...this.cache.chatIndex, [chatKey]: { ...entry, unread: 0 } };
      this.notify();
    }
  };

  sendChatMessage = async (chatKey: string, text: string, _reply?: boolean, photos?: File[]) => {
    void _reply; // scripted replies are demo-only
    if (!this.profileId || !this.communityId || (!text.trim() && !photos?.length)) return;
    let threadId = this.cache.dmThreads[chatKey];
    if (!threadId) {
      const { data, error } = await this.client.from('dm_threads')
        .insert({ community_id: this.communityId, a_profile_id: this.profileId, b_profile_id: chatKey })
        .select('id').single();
      if (this.failed('start the conversation', error)) return;
      threadId = data?.id ?? '';
      if (!threadId) return;
    }
    const paths = await this.uploadFiles(photos, 'dms');
    const { error } = await this.client.from('dm_messages')
      .insert({ thread_id: threadId, sender_profile_id: this.profileId, body: text.trim(), photos: paths });
    this.failed('send your message', error);
    await this.hydrateDms(); this.notify();
  };

  deleteChatMessage = async (_chatKey: string, messageId: string) => {
    const { data, error } = await this.client.from('dm_messages').delete().eq('id', messageId).select('id');
    if (!this.failed('delete the message', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't delete the message — only your own messages can be deleted.");
    }
    await this.hydrateDms(); this.notify();
  };

  // ── Groups (real, community-scoped) ─────────────────────────────────────────
  getGroups = () => this.cache.groups;

  private async hydrateGroups() {
    const { data: all, error } = await this.client.from('groups').select('*');
    const groups = (all ?? []).filter((g) => !g.archived);
    if (error || groups.length === 0) { this.cache.groups = {}; return; }
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
      .insert({ community_id: this.communityId, name, description, icon, color, is_group_chat: false, member_count: 1, created_by: this.profileId })
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
    await this.hydrateGroups(); this.notify();
  };

  createGroupPoll = async (groupKey: string, question: string, options: string[]) => {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) return;
    const { error } = await this.client.from('group_polls').insert({
      group_id: groupKey,
      question: question.trim(),
      options: clean,
      author: this.cache.member?.name ?? '',
    });
    this.failed('start the poll', error, true);
    await this.hydrateGroups(); this.notify();
  };

  createGroupEvent = async (groupKey: string, title: string, whenLabel: string, whereLabel: string) => {
    if (!title.trim()) return;
    const { error } = await this.client.from('group_events').insert({
      group_id: groupKey,
      title: title.trim(),
      when_label: whenLabel.trim(),
      where_label: whereLabel.trim(),
    });
    this.failed('create the event', error, true);
    await this.hydrateGroups(); this.notify();
  };

  archiveGroup = async (groupKey: string) => {
    const { data, error } = await this.client.from('groups')
      .update({ archived: true }).eq('id', groupKey).select('id');
    if (!this.failed('archive the group', error) && (data ?? []).length === 0) {
      emitAppError("Couldn't archive the group — only its creator or the board can.");
    }
    await this.hydrateGroups(); this.notify();
  };
}
