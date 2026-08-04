-- Phase 2 — Auth: record when a member finished onboarding.
--
-- handle_new_user() has to invent a name at signup, and its fallback is the
-- email local-part — so a member who never typed their name shows up to the
-- whole community as "nathan26norton". This column lets the app tell "never
-- asked" apart from "asked and answered", so it can collect a real name and
-- phone exactly once instead of guessing forever.
--
-- Null = never onboarded. Existing rows stay null and get the step on next
-- sign-in, which is the correct treatment: nobody has been asked yet.
alter table public.profiles
  add column if not exists onboarded_at timestamptz;

comment on column public.profiles.onboarded_at is
  'Set when the member completes onboarding (real name + phone). Null = never asked.';

-- No new policy needed: profiles_update_own (core schema) already scopes
-- updates to user_id = auth.uid(), which is exactly who writes this.
