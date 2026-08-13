import { apiClient } from './client';
import { env } from '../../config/env';
import { PARTNER_STAGE } from '../../constants/partnerStage';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock store mirrors looppr-backend's shapeOrder() shape exactly (address
// object, loadSize, partnerStage, pricing.amount, etc.) — not the old
// vendor/services mock shape in mock/db.js.
let mockIncoming = [
  {
    _id: 'ord-mock-1',
    customerName: 'R. Chen',
    address: { street: '512 Danforth Dr', apartment: '', city: 'Edmond', state: 'OK', zip: '73013' },
    deliveryAddress: null,
    loadSize: 'medium',
    preferredDate: new Date().toISOString(),
    window: 'afternoon',
    deliveryWindow: 'afternoon',
    notes: '',
    paymentStatus: 'paid',
    status: 'request_received',
    partnerStage: null,
    pricing: { amount: 31.8, currency: 'usd', subtotal: 26.81, deliveryFee: 4.99 },
    createdAt: new Date().toISOString(),
  },
];
let mockMine = [];
let mockAvailability = 'online';

export async function fetchOverview() {
  if (env.useMockPartnerOps) {
    await delay(150);
    return {
      newOrders: mockIncoming.length,
      activeOrders: mockMine.filter((o) => o.partnerStage !== PARTNER_STAGE.DELIVERED).length,
      completedOrders: mockMine.filter((o) => o.partnerStage === PARTNER_STAGE.DELIVERED).length,
      monthlyRevenue: mockMine.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.pricing.amount : 0), 0),
      averageRating: 4.9,
      availability: mockAvailability,
    };
  }
  const { data } = await apiClient.get('/partner/overview');
  return data.overview;
}

export async function fetchEarnings() {
  if (env.useMockPartnerOps) {
    await delay(150);
    const paid = mockMine.filter((o) => o.paymentStatus === 'paid');
    const total = paid.reduce((sum, o) => sum + (o.pricing?.amount ?? 0), 0);
    return { totalRevenue: total, weeklyRevenue: total, monthlyRevenue: total, pendingPayments: 0, completedPayouts: total };
  }
  const { data } = await apiClient.get('/partner/earnings');
  return data.earnings;
}

export async function fetchIncomingOrders() {
  if (env.useMockPartnerOps) {
    await delay();
    return mockIncoming;
  }
  const { data } = await apiClient.get('/partner/orders/incoming');
  return data.orders;
}

export async function fetchMyOrders() {
  if (env.useMockPartnerOps) {
    await delay();
    return [...mockMine].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const { data } = await apiClient.get('/partner/orders/mine');
  return data.orders;
}

export async function acceptOrder({ orderId }) {
  if (env.useMockPartnerOps) {
    await delay(300);
    const idx = mockIncoming.findIndex((o) => o._id === orderId);
    if (idx === -1) throw new Error('This order is no longer available.');
    const [order] = mockIncoming.splice(idx, 1);
    order.partnerStage = PARTNER_STAGE.ACCEPTED;
    order.partnerAcceptedAt = new Date().toISOString();
    mockMine = [order, ...mockMine];
    return order;
  }
  const { data } = await apiClient.post(`/partner/orders/${orderId}/accept`);
  return data.order;
}

export async function rejectOrder({ orderId, reason }) {
  if (env.useMockPartnerOps) {
    await delay(250);
    mockIncoming = mockIncoming.filter((o) => o._id !== orderId);
    mockMine = mockMine.filter((o) => o._id !== orderId);
    return { ok: true };
  }
  const { data } = await apiClient.post(`/partner/orders/${orderId}/reject`, { reason });
  return data;
}

export async function updateOrderStage({ orderId, action }) {
  if (env.useMockPartnerOps) {
    await delay(250);
    const order = mockMine.find((o) => o._id === orderId);
    if (!order) throw new Error('Order not found for this partner.');
    order.partnerStage = action;
    if (action === PARTNER_STAGE.PICKUP_COMPLETED) order.status = 'pickup';
    if (action === PARTNER_STAGE.LAUNDRY_IN_PROGRESS) order.status = 'laundry_in_progress';
    if (action === PARTNER_STAGE.READY_FOR_DELIVERY || action === PARTNER_STAGE.DELIVERED) order.status = 'ready_delivered';
    return order;
  }
  const { data } = await apiClient.patch(`/partner/orders/${orderId}/stage`, { action });
  return data.order;
}

export async function updateAvailability({ availability }) {
  if (env.useMockPartnerOps) {
    await delay(200);
    mockAvailability = availability;
    return { availability: mockAvailability };
  }
  const { data } = await apiClient.patch('/partner/availability', { availability });
  return data.partner;
}
