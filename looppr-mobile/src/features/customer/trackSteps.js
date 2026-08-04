import { ORDER_STAGE, ORDER_STAGE_ORDER } from '../../constants/orderStages';

// UI timeline has one row per real order stage, plus a leading "Scheduled"
// row that's always done once an order exists (it's booked before it's
// picked up). "Delivery" is done once the order reaches ORDER_STAGE.DELIVERED.
const STEP_DEFS = [
  { stage: null, title: 'Scheduled', sub: 'Pickup window confirmed' },
  { stage: ORDER_STAGE.PICKUP_QUEUE, title: 'Pickup', sub: 'At your door' },
  { stage: ORDER_STAGE.WASHING, title: 'Washing', sub: 'Your detergent, your temp' },
  { stage: ORDER_STAGE.FOLDING_QC, title: 'Folding & QC', sub: 'Quality checked, folded' },
  { stage: ORDER_STAGE.OUT_FOR_DELIVERY, title: 'Delivery', sub: 'Photo confirmation' },
];

export function buildTrackSteps(order) {
  if (!order) return STEP_DEFS.map((def) => ({ ...def, done: false, current: false }));

  const stageIdx = ORDER_STAGE_ORDER.indexOf(order.stage);
  const isDelivered = order.stage === ORDER_STAGE.DELIVERED;

  return STEP_DEFS.map((def, i) => {
    if (def.stage === null) return { ...def, done: true, current: false };
    const defIdx = ORDER_STAGE_ORDER.indexOf(def.stage);
    const isLast = i === STEP_DEFS.length - 1;
    const done = isLast ? isDelivered : defIdx < stageIdx;
    const current = isLast ? order.stage === ORDER_STAGE.OUT_FOR_DELIVERY : defIdx === stageIdx;
    return { ...def, done, current };
  });
}
