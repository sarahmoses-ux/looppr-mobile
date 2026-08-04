import { ORDER_STAGE } from '../../constants/orderStages';

export function stopAction(order) {
  return order.stage === ORDER_STAGE.PICKUP_QUEUE
    ? { verb: 'Pickup', completeLabel: 'Mark picked up', variant: 'muted' }
    : { verb: 'Deliver', completeLabel: 'Mark delivered', variant: 'warn' };
}
