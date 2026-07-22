-- Phase 2 — board chat topics. A message optionally belongs to a named topic
-- thread; null means the always-present "General" thread that's pinned at the
-- top of the board chat. No RLS changes — the existing is_board policies
-- already gate every row regardless of topic.

alter table public.board_messages add column topic text;
