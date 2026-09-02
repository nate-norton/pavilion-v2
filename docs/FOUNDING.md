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
| 2 · Populate | Board | Board Desk → paste the roster, share the links |
| 3 · Join | Resident | Open the link → Welcome → name + password → in |

Stage 0 happens once per community and never again.

> The screens below describe the `onboarding-ui` branch (merging to
> `staging`). If what you see differs, check `src/auth/` on `origin/staging`
> rather than a working copy — auth has changed there more than once.

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

Each `invite_url` is the whole handoff. Send it however the board member
already talks to you — text, email, a message. Nothing is emailed by Pavilion.

What happens when they open it:

1. **Welcome.** The link is read before sign-in (`peek_invite`), so the screen
   says "You're invited · Mountain Vista", shows their role and unit, and names
   the exact email the invitation is for. If that's not them, they're told to
   ask for a new link rather than guessing.
2. **Introduce yourself.** Name, a password (8+ characters, that's the only
   rule), optional phone. The email is locked from the invite. Tapping
   "Join Mountain Vista" calls the `accept_invite` edge function, which
   creates the account **already confirmed** with the typed name, claims the
   invite, and signs them in. No confirmation email, no second sign-in.
3. **Arrival.** "You're in, Jane." with honest counts of what the community
   holds so far. Board members are pointed at the Desk, where the setup card
   is waiting.

**Already have a Pavilion account** (a founder who piloted once, an owner in
two HOAs)? The Welcome screen has "I already have a Pavilion account", which
goes to sign-in with the email prefilled and the code kept. The gate claims it
after sign-in and the new community becomes the active one. An account can
belong to several communities; My Place shows a switcher when it does.

The link is per-invite, not per-community: each code admits exactly one
person, then flips to `accepted`. Codes expire after 14 days; the board can
renew a pending invite from Board Desk.

## When a founder signs in with no link

Someone who signs in (or uses "Email me a sign-in link") without an
invitation lands on "You're not in a community yet" with three real next
steps: switch email, paste an invite link, or **request a community**. Requests
land in `community_requests` (name, community, home count, note). Review them
with:

```sql
select requester_name, email, community_name, homes, note, created_at
from public.community_requests where status = 'pending' order by created_at;
```

…then run `found_community()` for the ones you accept and set `status` to
`founded`. The requester's invitation should go to the address on the request,
since that's the account they already have.
