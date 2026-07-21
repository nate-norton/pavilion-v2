-- Phase 2 — ballot tally trigger. vote_ballots rows are the source of truth;
-- this trigger keeps the votes table's denormalized tally/quorum columns in
-- sync on every ballot insert, so members (who can only read their own ballot
-- under RLS) still see a live community-wide tally on the votes row.
--
-- NOT YET APPLIED. Until it is, live tallies stay at their initial values
-- even as ballots land.

create or replace function private.bump_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.votes
  set yes_count    = yes_count + (case when new.choice = 'yes' then 1 else 0 end),
      no_count     = no_count  + (case when new.choice = 'no'  then 1 else 0 end),
      quorum_count = quorum_count + 1
  where id = new.vote_id;
  return new;
end;
$$;

revoke execute on function private.bump_vote_tally() from public, anon, authenticated;

create trigger vote_ballots_tally
  after insert on public.vote_ballots
  for each row execute function private.bump_vote_tally();
