import { apiClient } from './client';
import { env } from '../../config/env';
import { orders, nextId } from './mock/db';
import { ORDER_STAGE } from '../../constants/orderStages';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PROPERTIES_SEED = [
  { id: 'prop-1', name: 'Hazel Ct Unit A', sub: 'Turnover-synced · 2×/week', status: 'Scheduled' },
  { id: 'prop-2', name: 'Hazel Ct Unit B', sub: 'Turnover-synced · 2×/week', status: 'Scheduled' },
  { id: 'prop-3', name: 'Downtown Loft', sub: 'On request', status: 'Auto' },
];

export async function fetchProperties() {
  if (env.useMockApi) {
    await delay();
    return PROPERTIES_SEED;
  }
  const { data } = await apiClient.get('/business/properties');
  return data;
}

// Pushes a new job into the same shared pipeline Customer booking and
// Driver/Partner read from — matches the design's "Request extra pickup"
// behavior of injecting straight into the jobs queue.
export async function requestExtraPickup({ businessEmail, propertyName }) {
  if (env.useMockApi) {
    await delay(350);
    const order = {
      id: nextId('LP'),
      customerEmail: businessEmail,
      customerName: propertyName,
      vendorId: 'v-1',
      stage: ORDER_STAGE.PICKUP_QUEUE,
      services: [{ name: 'Commercial linen service', qty: 1, price: 42 }],
      address: propertyName,
      window: 'Next available window',
      total: 42,
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    return order;
  }
  const { data } = await apiClient.post('/business/request-pickup', { propertyName });
  return data;
}

export async function fetchInvoices() {
  if (env.useMockApi) {
    await delay();
    return [
      { id: 'inv-1', label: 'July 2026', orders: 18, amount: 612.4, status: 'Open' },
      { id: 'inv-2', label: 'June 2026', orders: 22, amount: 748.9, status: 'Paid' },
      { id: 'inv-3', label: 'May 2026', orders: 19, amount: 645.1, status: 'Paid' },
    ];
  }
  const { data } = await apiClient.get('/business/invoices');
  return data;
}
