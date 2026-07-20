import { MockRepository } from './MockRepository';
import { createRepository } from './index';
import { hasSnapshot } from './Repository';
import { AMENS, SLOTS } from '..';

it('createRepository returns a Mock backend in demo mode', () => {
  expect(createRepository()).toBeInstanceOf(MockRepository);
});

it('MockRepository serves seed data through the async contract', async () => {
  const repo = new MockRepository();
  await expect(repo.listAmenities()).resolves.toBe(AMENS);
  await expect(repo.getReservationSlots()).resolves.toBe(SLOTS);
});

it('MockRepository exposes a synchronous snapshot matching the async reads', async () => {
  const repo = new MockRepository();
  expect(hasSnapshot(repo)).toBe(true);
  const snap = repo.snapshot();
  expect(snap.amenities).toBe(await repo.listAmenities());
  expect(snap.reservationSlots).toBe(await repo.getReservationSlots());
  expect(snap.vendors).toBe(await repo.listVendors());
});
