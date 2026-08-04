// Shared order/job pipeline — the single entity Customer booking, Driver
// route, and Partner queue all read/write against (see design bundle's
// shared `jobs` array, Looppr App.dc.html).
export const ORDER_STAGE = {
  PICKUP_QUEUE: 'pickup_queue',
  WASHING: 'washing',
  FOLDING_QC: 'folding_qc',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
};

export const ORDER_STAGE_ORDER = [
  ORDER_STAGE.PICKUP_QUEUE,
  ORDER_STAGE.WASHING,
  ORDER_STAGE.FOLDING_QC,
  ORDER_STAGE.OUT_FOR_DELIVERY,
  ORDER_STAGE.DELIVERED,
];

export const ORDER_STAGE_LABEL = {
  [ORDER_STAGE.PICKUP_QUEUE]: 'Pickup queue',
  [ORDER_STAGE.WASHING]: 'Washing',
  [ORDER_STAGE.FOLDING_QC]: 'Folding & QC',
  [ORDER_STAGE.OUT_FOR_DELIVERY]: 'Out for delivery',
  [ORDER_STAGE.DELIVERED]: 'Delivered',
};

// Maps a stage to the status-pill variant (see theme/tokens.js statusPill).
export const ORDER_STAGE_PILL = {
  [ORDER_STAGE.PICKUP_QUEUE]: 'muted',
  [ORDER_STAGE.WASHING]: 'active',
  [ORDER_STAGE.FOLDING_QC]: 'active',
  [ORDER_STAGE.OUT_FOR_DELIVERY]: 'warn',
  [ORDER_STAGE.DELIVERED]: 'done',
};
