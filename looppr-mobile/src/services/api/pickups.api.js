import { apiClient } from './client';
import { env } from '../../config/env';
import { PICKUP_STATUS } from '../../constants/pickupStatus';
import { estimateOrderPrice } from '../../features/customer/bookingOptions';

// Mock store mirrors looppr-backend's PickupRequest shape (address object,
// loadSize, foldStyle/detergent/waterTemperature, pricing, paymentStatus,
// status) — not the old vendor/services mock shape in mock/db.js, which the
// driver/partner tabs still use and this file doesn't touch.
let mockPickups = [];
let mockIdSeq = 1;

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchMyPickups() {
  if (env.useMockCustomerOrders) {
    await delay();
    return [...mockPickups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const { data } = await apiClient.get('/pickups/me');
  return data.pickups;
}

export async function fetchMyStats() {
  if (env.useMockCustomerOrders) {
    await delay(150);
    const totalOrders = mockPickups.length;
    const totalSpent = mockPickups
      .filter((p) => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + (p.pricing?.amount ?? 0), 0);
    return { totalOrders, totalSpent };
  }
  const { data } = await apiClient.get('/pickups/me/stats');
  return data.stats;
}

export async function createPickup(payload) {
  const {
    address, preferredDate, window, loadSize, foldStyle, detergent, waterTemperature,
    notes, deliveryWindow, deliveryAddress,
  } = payload;

  if (env.useMockCustomerOrders) {
    await delay(400);
    const priorOrderCount = mockPickups.filter((p) => p.status !== PICKUP_STATUS.CANCELLED).length;
    mockIdSeq += 1;
    const pickup = {
      _id: `pk-${mockIdSeq}`,
      address,
      preferredDate,
      window,
      loadSize,
      foldStyle: foldStyle || 'standard',
      detergent: detergent || 'freeAndClear',
      waterTemperature: waterTemperature || 'cold',
      notes: notes || '',
      deliveryWindow,
      deliveryAddress: deliveryAddress || undefined,
      status: PICKUP_STATUS.REQUEST_RECEIVED,
      pricing: estimateOrderPrice(loadSize, priorOrderCount),
      paymentStatus: 'pending',
      driverUserId: null,
      createdAt: new Date().toISOString(),
    };
    mockPickups = [pickup, ...mockPickups];
    return { pickup, clientSecret: null };
  }

  const { data } = await apiClient.post('/pickups', {
    address, preferredDate, window, loadSize, foldStyle, detergent, waterTemperature,
    notes, deliveryWindow, deliveryAddress,
  });
  return { pickup: data.pickup, clientSecret: data.clientSecret };
}

export async function createPaymentIntent({ pickupId }) {
  if (env.useMockCustomerOrders) {
    await delay(300);
    return { clientSecret: null };
  }
  const { data } = await apiClient.post(`/pickups/${pickupId}/pay/intent`);
  return { clientSecret: data.clientSecret };
}

export async function confirmPayment({ pickupId }) {
  if (env.useMockCustomerOrders) {
    await delay(300);
    const pickup = mockPickups.find((p) => p._id === pickupId);
    if (pickup) pickup.paymentStatus = 'paid';
    return { pickup };
  }
  const { data } = await apiClient.post(`/pickups/${pickupId}/pay/confirm`);
  return { pickup: data.pickup };
}
