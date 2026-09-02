# Founding a community (Stage 0)

Pavilion is invite-based end to end: the board invites a neighbor, the neighbor
signs in, `claim_invite()` turns the pending invite into a membership. That
chain covers everyone **except the first board**, because until a board exists
there is nobody with the rights to invite them. Founding is the one step that
comes from outside the tenant.

`public.found_community()` is that step. It is granted to `service_role` only
and is not reachable with an end-user JWT — run it from the Supabase SQL editor
or the MCP tools, never from the app.

## The four stages

| Stage | Who | How |
|---|---|---|
| 0 · Found | Pavilion | `found_community()` — this doc |
| 1 · Activate | Board | `BoardSetupCard` walks the first ten minutes |
| 2 · Populate | Board | Board Desk → invites, one per household |
| 3 · Join | Resident | Magic link → `claim_invite()` → lands in community |

Stage 0 happens once per community and never again.

## Running it

```sql
select * from public.found_community(
  p_slug         => 'alder-ridge',
  p_name         => 'Alder Ridge',
  p_board_emails => array['president@example.com', 'treasurer@example.com'],
  p_unit_labels  => array['#27 Alder Way', '#29 Alder Way'],   -- optional
  p_app_url      => 'https://app.pavilion.community'           -- optional
);
```

You get one row back per board email:

| status | meaning |
|---|---|
| `invited` | New pending board invite. Send them `invite_url`. |
| `already_invited` | They had one already; same link, expiry pushed out 14 days. |
| `already_member` | Already active in a community — **no invite created**. See below. |

`p_unit_labels` seeds the homes so stage 2's invites can attach residents to
real units. Board invites carry no unit (a board seat is not a household), so
you can skip it at founding and let the board's roster import create units
later.

Re-running the same slug is safe: it finds the existing community, adds only
missing units, and reuses each pending invite's existing code rather than
minting a second one.

## Handing off the invites

Two ways in, both already built:

- **Email match** — the board member signs in with the invited address and
  `claim_invite()` finds their row. Nothing to send but "go to app.pavilion.community".
- **Link** — `invite_url` (`/?invite=CODE`) is claimed by whatever address they
  sign in with. `AuthGate` stashes the code through the magic-link round trip.

The link is per-invite, not per-community: each code admits exactly one person,
then flips to `accepted`. Codes expire after 14 days; the board can renew a
pending invite from Board Desk.

## The one real gotcha

`claim_invite()` and `claim_invite_code()` both refuse anyone who already holds
an **active membership anywhere**. A founder who tested Pavilion with the same
address earlier cannot claim a new invite — the call returns `false` and they
land on the `NoCommunity` screen with no explanation.

`found_community()` reports this up front as `already_member` instead of
leaving a dead pending row. To fix, either invite a different address or clear
the old membership:

```sql
-- Find what's holding the address
select m.id, m.role, m.status, c.slug
from public.memberships m
join public.profiles p on p.id = m.profile_id
join auth.users u on u.id = p.user_id
join public.communities c on c.id = m.community_id
where lower(u.email) = 'someone@example.com';
```

Deleting that membership row lets the invite claim normally.
