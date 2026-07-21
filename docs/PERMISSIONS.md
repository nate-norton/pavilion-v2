# Pavilion Permissions Model

The single source of truth for **who can do what**. Every RLS policy and every
UI affordance (which buttons render) must trace back to a cell in this matrix.
When adding a feature, add its actions here first; when a "should X be able
to…?" question comes up, the answer gets recorded here, not decided ad hoc.

## Principles

1. **Courtesy-first, privacy-first.** Anything that could embarrass a
   neighbor (reports, violations, dues status) is visible only to the person
   it concerns and the board. This is a selling point — never widen it for
   convenience.
2. **Transparency for governance.** Money in aggregate, votes in aggregate,
   decisions, and documents are visible to every member. Individual ballots
   are secret from everyone, including the board.
3. **No hard deletes.** Users archive/close/cancel; rows keep their history.
   Destructive removal is a database-admin operation, not a product feature.
4. **Creator stewardship, board backstop.** Whoever creates a thing (group,
   post, event) manages it; the board can always step in (moderate, archive)
   but acts as a backstop, not a gatekeeper.
5. **RLS is the enforcement layer.** The UI hides what you can't do, but the
   database is what makes it impossible.

## Roles

| Role | Today | Meaning |
|------|-------|---------|
| **Resident** | ✅ `memberships.role = 'resident'` | A household member (owner or tenant — split later if needed) |
| **Board** | ✅ `memberships.role = 'board'` | Elected volunteer with governance powers. Board members are also residents — they get everything a resident gets. |
| **Committee** | 🔜 planned | A resident with one delegated slice (social, ARC) — see "Larger communities" |
| **Manager** | 🔜 planned | Hired property manager: operations without governance — see "Larger communities" |

## The matrix

**Key:** ✅ yes · 🏠 own only (own unit/household/authored) · ❌ no

### Reports & complaints
| Action | Resident | Board |
|---|---|---|
| File a report | ✅ | ✅ |
| See reports | 🏠 own | ✅ all |
| Triage (ticket / assign vendor / resolve) | ❌ | ✅ |
| See who reported | ❌ (only their own) | ✅ |
| Delete a report | ❌ (resolve only) | ❌ (resolve only) |

### Architectural requests (ARC)
| Action | Resident | Board |
|---|---|---|
| Submit for own unit | ✅ | ✅ |
| See requests | 🏠 own unit | ✅ all |
| Approve / decline / request info | ❌ | ✅ |
| Withdraw own pending request | ✅ | ✅ |

### Violations
| Action | Resident | Board |
|---|---|---|
| Issue a courtesy notice | ❌ | ✅ |
| See notices | 🏠 own unit | ✅ all |
| Mark own notice fixed (self-cure) | ✅ | ✅ |
| Close for good / escalate | ❌ | ✅ |

### Money (dues, assessments)
| Action | Resident | Board |
|---|---|---|
| See own statements & history | ✅ | ✅ |
| See who's behind (aging, per-unit) | ❌ | ✅ |
| See aggregate finances (budget, reserve, collected %) | ✅ | ✅ |
| Issue statements / assessments | ❌ | ✅ |
| Pay own dues | ✅ | ✅ |

### Votes
| Action | Resident | Board |
|---|---|---|
| Open / close a ballot | ❌ | ✅ |
| Cast a ballot (one per household) | ✅ | ✅ |
| See live tally + quorum | ✅ | ✅ |
| See an individual's ballot | ❌ | ❌ — secret ballot, no exceptions |
| Nudge non-voters | ❌ | ✅ (system sends; board never sees names) |

### Commons feed
| Action | Resident | Board |
|---|---|---|
| Post, comment, react | ✅ | ✅ |
| Edit / remove own post | ✅ | ✅ |
| Remove anyone's post (moderation) | ❌ | ✅ (leaves a "removed by board" stub) |
| Broadcast to every household | ❌ | ✅ |

### Groups & circles
| Action | Resident | Board |
|---|---|---|
| Create a group (creator auto-joins as its admin) | ✅ | ✅ |
| Join / leave / mute | ✅ | ✅ |
| Rename, pin, manage own group | 🏠 group admin | ✅ |
| Archive a group | 🏠 group admin | ✅ |
| Hard-delete a group | ❌ | ❌ (archive only) |

### Reservations
| Action | Resident | Board |
|---|---|---|
| Book / cancel own | ✅ | ✅ |
| See all bookings / cancel any | ❌ | ✅ |
| Configure amenities & rules | ❌ | ✅ |

### Events
| Action | Resident | Board |
|---|---|---|
| Create community events | ❌ (proposes via feed/groups) | ✅ |
| RSVP | ✅ | ✅ |

### Documents, decisions, meetings
| Action | Resident | Board |
|---|---|---|
| Read documents, decisions log, minutes | ✅ | ✅ |
| Upload / publish / log decisions | ❌ | ✅ |
| Run meeting mode, manage agenda | ❌ | ✅ |

### Membership & directory
| Action | Resident | Board |
|---|---|---|
| See directory (name + unit; contact only if that member opts in) | ✅ | ✅ |
| Invite / add / remove members, assign units | ❌ | ✅ |
| Grant / revoke board role | ❌ | ✅ |
| Edit own profile | ✅ | ✅ |

## Small vs. larger communities

The matrix above is the **small-community default** (self-managed, a handful
of board volunteers — e.g. Juniper Ridge). It deliberately keeps friction
low: any resident can create a group or post freely, and "board" is one
undifferentiated role.

Larger communities (150+ doors, professional management) need **delegation
and dampening**, not different values. Planned as per-community settings, all
defaulting off:

| Setting | Default | Larger-community option |
|---|---|---|
| Committee roles | off | Board grants a slice: *social committee* creates events; *ARC committee* decides ARC. Implemented as scoped grants, not new global roles. |
| Manager role | off | Operational powers (triage, vendors, reservations admin, collections view) **without** governance (no votes, no violations policy, no role grants). |
| Group creation | open | "Request → board approves" queue, if group sprawl becomes a problem. |
| Feed moderation | post-hoc | Optional pre-moderation queue for the broadcast-adjacent surfaces. |
| Board sub-roles | single role | President / treasurer / secretary split (e.g. only treasurer issues assessments; 2-of-3 signatures on spend — the demo already sketches this). |

The rule: **capabilities scale by adding scoped grants, never by widening
resident defaults.** A 40-door and a 400-door community share the same
resident experience; only the governance side gains structure.

## Enforcement map (matrix ↔ database)

| Domain | Table(s) | Status |
|---|---|---|
| Reports | `reports` | ✅ enforced (reporter/board read, board act) |
| ARC | `arc_requests` | ✅ enforced (unit/board) |
| Violations | `violations` | ✅ enforced incl. self-cure policy |
| Dues | `dues_statements` | ✅ enforced (unit/board) |
| Votes | `votes`, `vote_ballots` | ✅ enforced; ballots readable by voter only — **board tally comes from the trigger-maintained counts, so ballot secrecy holds** |
| Feed | `feed_posts` | ⚠️ partial: members post; **no author edit/remove or board moderation policies yet** |
| Groups | `groups` + satellites | ⚠️ audit needed: **creator auto-join bug**; archive semantics not implemented |
| Reservations | `reservations` | ✅ enforced (own/board) |
| Events | `events` | ✅ enforced (member read, board write) |
| Decisions | `decisions` | ✅ enforced (member read, board write) |
| Directory/membership | `memberships`, `profiles` | ⚠️ partial: reads enforced; **no invite/role-grant tooling yet**; contact opt-in not modeled |

⚠️ rows are the work queue for the papercut/permissions alignment pass.
