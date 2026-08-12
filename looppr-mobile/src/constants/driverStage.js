// Mirrors looppr-backend/controllers/driverController.js's STAGE_MAP exactly
// — a claimed delivery only ever moves through these driverStage values.
export const DRIVER_STAGE = {
  ASSIGNED: 'assigned',
  PICKUP_COMPLETED: 'pickup_completed',
  AT_LAUNDROMAT: 'at_laundromat',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
};

export const DRIVER_STAGE_ORDER = [
  DRIVER_STAGE.ASSIGNED,
  DRIVER_STAGE.PICKUP_COMPLETED,
  DRIVER_STAGE.AT_LAUNDROMAT,
  DRIVER_STAGE.OUT_FOR_DELIVERY,
  DRIVER_STAGE.DELIVERED,
];

// The action a driver takes to advance FROM a given stage, and how the stop
// should read in the UI while sitting at that stage.
export function driverStopAction(driverStage) {
  switch (driverStage) {
    case DRIVER_STAGE.ASSIGNED:
      return { verb: 'Pickup', completeLabel: 'Mark picked up', variant: 'muted', nextAction: 'pickup_completed' };
    case DRIVER_STAGE.PICKUP_COMPLETED:
      return { verb: 'To laundromat', completeLabel: 'Mark dropped off', variant: 'active', nextAction: 'at_laundromat' };
    case DRIVER_STAGE.AT_LAUNDROMAT:
      return { verb: 'At laundromat', completeLabel: 'Start delivery', variant: 'active', nextAction: 'out_for_delivery' };
    case DRIVER_STAGE.OUT_FOR_DELIVERY:
      return { verb: 'Deliver', completeLabel: 'Mark delivered', variant: 'warn', nextAction: 'delivered' };
    default:
      return { verb: 'Pickup', completeLabel: 'Mark picked up', variant: 'muted', nextAction: 'pickup_completed' };
  }
}
