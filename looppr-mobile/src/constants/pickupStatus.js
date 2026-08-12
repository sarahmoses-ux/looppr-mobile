// Mirrors looppr-backend/constants/orderStatus.js exactly — a real pickup
// only ever has these statuses. Kept separate from constants/orderStages.js
// (which is the customer/driver/partner *mock* 5-stage pipeline still used
// by the driver and partner tabs) since the two are unrelated shapes.
export const PICKUP_STATUS = {
  REQUEST_RECEIVED: 'request_received',
  PICKUP: 'pickup',
  LAUNDRY_IN_PROGRESS: 'laundry_in_progress',
  READY_DELIVERED: 'ready_delivered',
  CANCELLED: 'cancelled',
};

export const PICKUP_STATUS_ORDER = [
  PICKUP_STATUS.REQUEST_RECEIVED,
  PICKUP_STATUS.PICKUP,
  PICKUP_STATUS.LAUNDRY_IN_PROGRESS,
  PICKUP_STATUS.READY_DELIVERED,
];

export const TERMINAL_STATUSES = [PICKUP_STATUS.READY_DELIVERED, PICKUP_STATUS.CANCELLED];

export const PICKUP_STATUS_LABEL = {
  [PICKUP_STATUS.REQUEST_RECEIVED]: 'Request received',
  [PICKUP_STATUS.PICKUP]: 'Picked up',
  [PICKUP_STATUS.LAUNDRY_IN_PROGRESS]: 'In progress',
  [PICKUP_STATUS.READY_DELIVERED]: 'Delivered',
  [PICKUP_STATUS.CANCELLED]: 'Cancelled',
};

// Maps a status to the status-pill variant (see theme/tokens.js statusPill).
export const PICKUP_STATUS_PILL = {
  [PICKUP_STATUS.REQUEST_RECEIVED]: 'muted',
  [PICKUP_STATUS.PICKUP]: 'active',
  [PICKUP_STATUS.LAUNDRY_IN_PROGRESS]: 'active',
  [PICKUP_STATUS.READY_DELIVERED]: 'done',
  [PICKUP_STATUS.CANCELLED]: 'warn',
};

// A handful of real orders predate the current 4-stage status enum (e.g.
// legacy value "requested") — fall back to something readable instead of
// rendering a blank pill for those.
export function pickupStatusLabel(status) {
  return PICKUP_STATUS_LABEL[status] ?? 'Processing';
}

export function pickupStatusPillVariant(status) {
  return PICKUP_STATUS_PILL[status] ?? 'muted';
}
