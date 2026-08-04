import { apiClient } from './client';
import { env } from '../../config/env';
import { orders, vendors, nextId } from './mock/db';
import { ORDER_STAGE, ORDER_STAGE_ORDER } from '../../constants/orderStages';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function withVendor(order) {
  return { ...order, vendor: vendors.find((v) => v.id === order.vendorId) };
}

export async function fetchVendors() {
  if (env.useMockApi) {
    await delay(150);
    return vendors;
  }
  const { data } = await apiClient.get('/vendors');
  return data;
}

export async function fetchOrders({ customerEmail }) {
  if (env.useMockApi) {
    await delay();
    return orders.filter((o) => o.customerEmail === customerEmail).map(withVendor);
  }
  const { data } = await apiClient.get('/orders', { params: { customerEmail } });
  return data;
}

export async function fetchOrder({ orderId }) {
  if (env.useMockApi) {
    await delay(150);
    const order = orders.find((o) => o.id === orderId);
    return order ? withVendor(order) : null;
  }
  const { data } = await apiClient.get(`/orders/${orderId}`);
  return data;
}

export async function createOrder({ customerEmail, vendorId, services, address, window, total, driverEmail }) {
  if (env.useMockApi) {
    await delay(400);
    const order = {
      id: nextId('LP'),
      customerEmail,
      vendorId,
      stage: ORDER_STAGE.PICKUP_QUEUE,
      services,
      address,
      window,
      total,
      driverEmail: driverEmail ?? null,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    return withVendor(order);
  }
  const { data } = await apiClient.post('/orders', { customerEmail, vendorId, services, address, window, total });
  return data;
}

export async function advanceOrderStage({ orderId }) {
  if (env.useMockApi) {
    await delay(250);
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    const idx = ORDER_STAGE_ORDER.indexOf(order.stage);
    order.stage = ORDER_STAGE_ORDER[Math.min(idx + 1, ORDER_STAGE_ORDER.length - 1)];
    return withVendor(order);
  }
  const { data } = await apiClient.post(`/orders/${orderId}/advance`);
  return data;
}

export async function rateOrder({ orderId, stars }) {
  if (env.useMockApi) {
    await delay(200);
    const order = orders.find((o) => o.id === orderId);
    if (order) order.rating = stars;
    return order ? withVendor(order) : null;
  }
  const { data } = await apiClient.post(`/orders/${orderId}/rate`, { stars });
  return data;
}

// A driver only has stops for the two stages that need physical action —
// picking a bag up, or delivering a finished one. Washing/folding happen at
// the facility and don't show up on a driver's route.
const DRIVER_ACTIONABLE_STAGES = [ORDER_STAGE.PICKUP_QUEUE, ORDER_STAGE.OUT_FOR_DELIVERY];

export async function logOrderWeight({ orderId, lbs, ratePerLb }) {
  if (env.useMockApi) {
    await delay(300);
    const order = orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found.');
    const total = Number((lbs * ratePerLb).toFixed(2));
    order.services = [{ name: 'Wash & fold', qty: lbs, price: ratePerLb, unit: 'lb' }];
    order.total = total;
    return withVendor(order);
  }
  const { data } = await apiClient.post(`/orders/${orderId}/weigh-in`, { lbs, ratePerLb });
  return data;
}

export async function fetchDriverRoute({ driverEmail }) {
  if (env.useMockApi) {
    await delay();
    return orders
      .filter((o) => o.driverEmail === driverEmail && DRIVER_ACTIONABLE_STAGES.includes(o.stage))
      .map(withVendor);
  }
  const { data } = await apiClient.get('/driver/route', { params: { driverEmail } });
  return data;
}

const BASE_PAY_PER_STOP = 6;
const MILEAGE_FLAT = 9.94;
const TIPS_FLAT = 11;

export async function fetchDriverEarnings({ driverEmail }) {
  if (env.useMockApi) {
    await delay(200);
    const stopsCompleted = orders.filter((o) => o.driverEmail === driverEmail && o.stage === ORDER_STAGE.DELIVERED).length;
    const basePay = stopsCompleted * BASE_PAY_PER_STOP;
    const total = basePay + MILEAGE_FLAT + TIPS_FLAT;
    return {
      stopsCompleted,
      rows: [
        { label: 'Stops completed', value: String(stopsCompleted) },
        { label: 'Base pay', value: `$${basePay.toFixed(2)}` },
        { label: 'Mileage (14.2 mi)', value: `$${MILEAGE_FLAT.toFixed(2)}` },
        { label: 'Tips', value: `$${TIPS_FLAT.toFixed(2)}` },
      ],
      total,
    };
  }
  const { data } = await apiClient.get('/driver/earnings', { params: { driverEmail } });
  return data;
}

export async function fetchPartnerQueue({ vendorId }) {
  if (env.useMockApi) {
    await delay();
    return orders.filter((o) => o.vendorId === vendorId && o.stage !== ORDER_STAGE.DELIVERED).map(withVendor);
  }
  const { data } = await apiClient.get('/partner/queue', { params: { vendorId } });
  return data;
}
