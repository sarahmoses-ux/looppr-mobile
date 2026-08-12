import { apiClient } from './client';
import { env } from '../../config/env';
import { DRIVER_STAGE } from '../../constants/driverStage';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock store mirrors looppr-backend's shapeDelivery() shape exactly
// (address object, loadSize, driverStage, pricing.deliveryFee, etc.) — not
// the old vendor/services mock shape in mock/db.js.
let mockIncoming = [
  {
    _id: 'del-mock-1',
    customerName: 'R. Chen',
    address: { street: '512 Danforth Dr', apartment: '', city: 'Edmond', state: 'OK', zip: '73013' },
    deliveryAddress: null,
    loadSize: 'medium',
    actualWeightLbs: null,
    preferredDate: new Date().toISOString(),
    window: 'afternoon',
    deliveryWindow: 'afternoon',
    notes: '',
    paymentStatus: 'paid',
    status: 'request_received',
    driverStage: null,
    pricing: { amount: 31.8, currency: 'usd', subtotal: 26.81, deliveryFee: 4.99 },
    createdAt: new Date().toISOString(),
  },
];
let mockMine = [];

export async function fetchOverview() {
  if (env.useMockDriverOps) {
    await delay(150);
    return {
      newDeliveries: mockIncoming.length,
      activeDeliveries: mockMine.filter((d) => d.driverStage !== DRIVER_STAGE.DELIVERED).length,
      completedDeliveries: mockMine.filter((d) => d.driverStage === DRIVER_STAGE.DELIVERED).length,
      monthlyEarnings: mockMine.reduce((sum, d) => sum + (d.driverStage === DRIVER_STAGE.DELIVERED ? d.pricing.deliveryFee : 0), 0),
      averageRating: 4.8,
      availability: 'available',
    };
  }
  const { data } = await apiClient.get('/driver/overview');
  return data.overview;
}

export async function fetchEarnings() {
  if (env.useMockDriverOps) {
    await delay(150);
    const delivered = mockMine.filter((d) => d.driverStage === DRIVER_STAGE.DELIVERED);
    const total = delivered.reduce((sum, d) => sum + (d.pricing?.deliveryFee ?? 0), 0);
    return {
      totalEarnings: total,
      weeklyEarnings: total,
      monthlyEarnings: total,
      pendingPayments: 0,
      completedPayouts: total,
    };
  }
  const { data } = await apiClient.get('/driver/earnings');
  return data.earnings;
}

export async function fetchIncomingDeliveries() {
  if (env.useMockDriverOps) {
    await delay();
    return mockIncoming;
  }
  const { data } = await apiClient.get('/driver/deliveries/incoming');
  return data.deliveries;
}

export async function fetchMyDeliveries() {
  if (env.useMockDriverOps) {
    await delay();
    return [...mockMine].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const { data } = await apiClient.get('/driver/deliveries/mine');
  return data.deliveries;
}

export async function acceptDelivery({ deliveryId }) {
  if (env.useMockDriverOps) {
    await delay(300);
    const idx = mockIncoming.findIndex((d) => d._id === deliveryId);
    if (idx === -1) throw new Error('This delivery is no longer available.');
    const [delivery] = mockIncoming.splice(idx, 1);
    delivery.driverStage = DRIVER_STAGE.ASSIGNED;
    delivery.driverAcceptedAt = new Date().toISOString();
    mockMine = [delivery, ...mockMine];
    return delivery;
  }
  const { data } = await apiClient.post(`/driver/deliveries/${deliveryId}/accept`);
  return data.delivery;
}

export async function rejectDelivery({ deliveryId, reason }) {
  if (env.useMockDriverOps) {
    await delay(250);
    mockIncoming = mockIncoming.filter((d) => d._id !== deliveryId);
    mockMine = mockMine.filter((d) => d._id !== deliveryId);
    return { ok: true };
  }
  const { data } = await apiClient.post(`/driver/deliveries/${deliveryId}/reject`, { reason });
  return data;
}

export async function updateDeliveryStage({ deliveryId, action }) {
  if (env.useMockDriverOps) {
    await delay(250);
    const delivery = mockMine.find((d) => d._id === deliveryId);
    if (!delivery) throw new Error('Delivery not found for this driver.');
    delivery.driverStage = action;
    if (action === DRIVER_STAGE.PICKUP_COMPLETED) delivery.status = 'pickup';
    if (action === DRIVER_STAGE.DELIVERED) delivery.status = 'ready_delivered';
    return delivery;
  }
  const { data } = await apiClient.patch(`/driver/deliveries/${deliveryId}/stage`, { action });
  return data.delivery;
}

export async function confirmWeight({ deliveryId, actualWeightLbs }) {
  if (env.useMockDriverOps) {
    await delay(300);
    const delivery = mockMine.find((d) => d._id === deliveryId);
    if (!delivery) throw new Error('Delivery not found for this driver.');
    delivery.actualWeightLbs = actualWeightLbs;
    delivery.weightConfirmedAt = new Date().toISOString();
    return delivery;
  }
  const { data } = await apiClient.patch(`/driver/deliveries/${deliveryId}/weight`, { actualWeightLbs });
  return data.delivery;
}

export async function updateAvailability({ availability }) {
  if (env.useMockDriverOps) {
    await delay(200);
    return { availability };
  }
  const { data } = await apiClient.patch('/driver/availability', { availability });
  return data.driver;
}
