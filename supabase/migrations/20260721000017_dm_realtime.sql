-- Phase 2 — realtime DM delivery. Publishes dm_messages inserts over
-- Supabase Realtime; RLS still gates who receives which events, so only
-- thread participants see them. Without this the app still works —
-- messages just appear on the next hydrate instead of instantly.

alter publication supabase_realtime add table public.dm_messages;
