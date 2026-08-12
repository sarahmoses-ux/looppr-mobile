// Mirrors looppr-backend/controllers/partnerController.js's STAGE_MAP. The
// real backend has 4 granular stages; the design's Queue screen has 3
// columns, so 'accepted' and 'pickup_completed' both fold into "Washing" —
// a freshly-accepted order is already physically at the facility, there's
// no separate partner-facing meaning to "received" vs "washing" here.
export const PARTNER_STAGE = {
  ACCEPTED: 'accepted',
  PICKUP_COMPLETED: 'pickup_completed',
  LAUNDRY_IN_PROGRESS: 'laundry_in_progress',
  READY_FOR_DELIVERY: 'ready_for_delivery',
  DELIVERED: 'delivered',
};

export const QUEUE_COLUMNS = [
  { key: 'washing', title: 'Washing', stages: [PARTNER_STAGE.ACCEPTED, PARTNER_STAGE.PICKUP_COMPLETED], advanceable: true, nextAction: 'laundry_in_progress' },
  { key: 'folding', title: 'Folding & QC', stages: [PARTNER_STAGE.LAUNDRY_IN_PROGRESS], advanceable: true, nextAction: 'ready_for_delivery' },
  { key: 'ready', title: 'Ready for pickup', stages: [PARTNER_STAGE.READY_FOR_DELIVERY], advanceable: false, nextAction: null },
];
