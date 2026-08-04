-- Copy-truth fix: the app promises a "secret ballot", but the read policy
-- let board members select every individual ballot row. Tallies and quorum
-- live on the votes row (kept by the trigger), so nobody needs row-level
-- reads of other people's ballots — not even the board.

drop policy vote_ballots_read on public.vote_ballots;
create policy vote_ballots_read on public.vote_ballots
  for select using (profile_id = private.current_profile_id());
