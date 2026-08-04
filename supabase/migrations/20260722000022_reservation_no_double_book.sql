-- Two taps on "Book" wrote two reservations for the same slot. The client now
-- guards it, but a client guard does not survive two devices, a retry, or a
-- reload mid-request — and the Reserve screen states "one active booking per
-- household" as a rule, so the database should be the one enforcing it.
--
-- Partial, so cancelled rows never block rebooking the same slot later.

create unique index if not exists reservations_no_double_book
  on public.reservations (community_id, amenity, day_label, slot_label)
  where status = 'booked';
