import { apiClient } from './client';
import { env } from '../../config/env';
import { estimateOrderPrice } from '../../features/customer/bookingOptions';
import { PICKUP_STATUS } from '../../constants/pickupStatus';

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock store mirrors looppr-backend's PickupRequest shape scoped to a
// business, not the old vendor/services mock shape in mock/db.js.
let mockPickups = [];
let mockIdSeq = 1;

export async function fetchOverview() {
  if (env.useMockBusinessOps) {
    await delay(150);
    const active = mockPickups.filter((p) => ['request_received', 'pickup', 'laundry_in_progress'].includes(p.status));
    const completed = mockPickups.filter((p) => p.status === 'ready_delivered');
    const upcoming = active
      .filter((p) => new Date(p.preferredDate) >= new Date())
      .sort((a, b) => new Date(a.preferredDate) - new Date(b.preferredDate))[0];
    return {
      activeOrders: active.length,
      completedOrders: completed.length,
      upcomingPickup: upcoming ?? null,
      monthlySpending: mockPickups.filter((p) => p.paymentStatus === 'paid').reduce((sum, p) => sum + p.pricing.amount, 0),
      ordersThisMonth: mockPickups.length,
      avgProcessingHours: null,
    };
  }
  const { data } = await apiClient.get('/business/overview');
  return data.overview;
}

export async function fetchPickups() {
  if (env.useMockBusinessOps) {
    await delay();
    return [...mockPickups].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const { data } = await apiClient.get('/business/pickups');
  return data.pickups;
}

export async function createPickup({ address, preferredDate, window, deliveryWindow, loadSize, foldStyle, notes }) {
  if (env.useMockBusinessOps) {
    await delay(400);
    const priorOrderCount = mockPickups.filter((p) => p.status !== PICKUP_STATUS.CANCELLED).length;
    mockIdSeq += 1;
    const pickup = {
      _id: `bpk-${mockIdSeq}`,
      address,
      preferredDate,
      window,
      deliveryWindow,
      loadSize,
      foldStyle: foldStyle || 'standard',
      notes: notes || '',
      status: 'request_received',
      pricing: estimateOrderPrice(loadSize, priorOrderCount),
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
    };
    mockPickups = [pickup, ...mockPickups];
    return pickup;
  }
  const { data } = await apiClient.post('/business/pickups', { address, preferredDate, window, deliveryWindow, loadSize, foldStyle, notes });
  return data.pickup;
}
