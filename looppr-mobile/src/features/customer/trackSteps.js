import { PICKUP_STATUS, PICKUP_STATUS_ORDER } from '../../constants/pickupStatus';

// UI timeline has one row per real pickup status, plus a leading "Booked"
// row that's always done once a pickup exists (it's booked before it's
// picked up).
const STEP_DEFS = [
  { status: null, title: 'Booked', sub: 'Pickup window confirmed' },
  { status: PICKUP_STATUS.REQUEST_RECEIVED, title: 'Request received', sub: 'Assigning your driver' },
  { status: PICKUP_STATUS.PICKUP, title: 'Picked up', sub: 'At your door' },
  { status: PICKUP_STATUS.LAUNDRY_IN_PROGRESS, title: 'In progress', sub: 'Washed, dried, folded' },
  { status: PICKUP_STATUS.READY_DELIVERED, title: 'Delivered', sub: 'Back at your door' },
];

export function buildTrackSteps(order) {
  if (!order) return STEP_DEFS.map((def) => ({ ...def, done: false, current: false }));

  const stageIdx = PICKUP_STATUS_ORDER.indexOf(order.status);
  const isDelivered = order.status === PICKUP_STATUS.READY_DELIVERED;

  return STEP_DEFS.map((def, i) => {
    if (def.status === null) return { ...def, done: true, current: false };
    const defIdx = PICKUP_STATUS_ORDER.indexOf(def.status);
    const isLast = i === STEP_DEFS.length - 1;
    const done = isLast ? isDelivered : defIdx < stageIdx;
    const current = isLast ? false : defIdx === stageIdx;
    return { ...def, done, current };
  });
}
