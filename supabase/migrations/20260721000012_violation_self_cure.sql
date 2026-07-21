-- Phase 2 — violation self-cure. Courtesy-first: a member can mark their own
-- unit's notice as fixed (open → fixed); closing it for good (resolved)
-- remains a board action via the existing violations_write policy.
--
-- NOT YET APPLIED. Until it is, the live "Mark as fixed" action no-ops.

create policy violations_self_cure on public.violations
  for update using (private.owns_unit(unit_id))
  with check (private.owns_unit(unit_id) and status = 'fixed');
