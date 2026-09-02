-- Honesty fix: the ballot receipt a voter sees was `votes.receipt`, generated
-- once when the board opened the ballot, so every household in the community
-- was shown the same number. A receipt that cannot distinguish one ballot
-- from another is not a receipt.
--
-- The receipt now lives on the voter's own `vote_ballots` row and is minted
-- by the database at insert (`#R-` + four hex characters, e.g. #R-7A3F), so
-- the client never picks it and two households never share one. Adding the
-- column with a volatile default evaluates it per existing row, so ballots
-- cast before this migration each get their own number too.
--
-- `votes.receipt` is left in place (nothing reads it after this change); a
-- later migration can drop it once the client that writes it is retired.

alter table public.vote_ballots
  add column receipt text not null
    default ('#R-' || upper(substr(encode(gen_random_bytes(3), 'hex'), 1, 4)));

-- The read policy from 20260722000021 already scopes ballots to their owner
-- (profile_id = private.current_profile_id()), so a voter can read back their
-- own receipt and nobody else's; no policy change is needed.

-- Second honesty fix on the same surface: the results archive labelled every
-- closed ballot "Closed <created_at>", the day it *opened*. Stamp the real
-- close time when status flips to closed, whether the board closes it early
-- or a deadline job does. Rows closed before this migration keep null and
-- the client labels them by their open date instead of guessing.

alter table public.votes
  add column closed_at timestamptz;

create or replace function private.stamp_vote_closed()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'closed' and (old.status is distinct from 'closed') then
    new.closed_at := coalesce(new.closed_at, now());
  end if;
  return new;
end;
$$;

create trigger votes_stamp_closed
  before update of status on public.votes
  for each row execute function private.stamp_vote_closed();
