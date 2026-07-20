import { MockRepository } from './MockRepository';
import { createRepository, resetDemoData } from './index';
import { hasSnapshot } from './Repository';
import { AMENS, SLOTS } from '..';

beforeEach(() => resetDemoData());

it('createRepository returns a Mock backend in demo mode', () => {
  expect(createRepository()).toBeInstanceOf(MockRepository);
});

it('MockRepository serves seed data through the async contract', async () => {
  const repo = new MockRepository();
  await expect(repo.listAmenities()).resolves.toBe(AMENS);
  await expect(repo.getReservationSlots()).resolves.toBe(SLOTS);
});

it('createReservation builds the summary and cancelReservation clears it', async () => {
  const repo = new MockRepository();
  expect(repo.getReservation()).toEqual({ booked: false, summary: null });
  await repo.createReservation({ amenity: 'Pool Cabana', day: 'Thu', slot: '4–6 PM', hours: 2 });
  expect(repo.getReservation()).toEqual({ booked: true, summary: 'Pool Cabana · Thu, 4–6 PM · 2 hr' });
  await repo.cancelReservation();
  expect(repo.getReservation()).toEqual({ booked: false, summary: null });
});

it('reservation writes notify subscribers', async () => {
  const repo = new MockRepository();
  let hits = 0;
  const unsub = repo.subscribe(() => { hits += 1; });
  await repo.createReservation({ amenity: 'Clubhouse', day: 'Fri', slot: '6–8 PM', hours: 1 });
  expect(hits).toBe(1);
  unsub();
});

it('MockRepository exposes a synchronous snapshot matching the async reads', async () => {
  const repo = new MockRepository();
  expect(hasSnapshot(repo)).toBe(true);
  const snap = repo.snapshot();
  expect(snap.amenities).toBe(await repo.listAmenities());
  expect(snap.reservationSlots).toBe(await repo.getReservationSlots());
  expect(snap.vendors).toBe(await repo.listVendors());
});
