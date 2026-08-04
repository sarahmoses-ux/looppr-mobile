import { apiClient } from './client';
import { env } from '../../config/env';
import { orders } from './mock/db';
import { ORDER_STAGE } from '../../constants/orderStages';

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const FACILITY_CAPACITY_PER_DAY = 40;

export async function fetchFacilityCapacity({ vendorId }) {
  if (env.useMockApi) {
    await delay(150);
    const bagsInFacility = orders.filter(
      (o) => o.vendorId === vendorId && [ORDER_STAGE.WASHING, ORDER_STAGE.FOLDING_QC].includes(o.stage)
    ).length;
    return { bagsInFacility, capacityPerDay: FACILITY_CAPACITY_PER_DAY };
  }
  const { data } = await apiClient.get('/partner/capacity', { params: { vendorId } });
  return data;
}

export async function fetchPartnerPayouts({ vendorId }) {
  if (env.useMockApi) {
    await delay();
    return [
      { id: 'p-1', label: 'This week', bags: 62, ratePerLb: 1.15, total: 480.6, status: 'Pending' },
      { id: 'p-2', label: 'Last week', bags: 71, ratePerLb: 1.15, total: 551.9, status: 'Paid' },
      { id: 'p-3', label: '2 weeks ago', bags: 58, ratePerLb: 1.15, total: 452.4, status: 'Paid' },
    ];
  }
  const { data } = await apiClient.get('/partner/payouts', { params: { vendorId } });
  return data;
}
