import { apiClient } from './client';
import { env } from '../../config/env';

// In-memory mock store, mirrors User.savedAddresses shape from
// looppr-backend/models/User.js exactly (label/street/apartment/city/state/zip).
let mockAddresses = [
  { _id: 'addr-1', label: 'Home', street: '1408 Hazel Ct', apartment: '', city: 'Edmond', state: 'OK', zip: '73013' },
];
let mockIdSeq = 1;

function delay(ms = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function listAddresses() {
  if (env.useMockCustomerOrders) {
    await delay();
    return mockAddresses;
  }
  const { data } = await apiClient.get('/addresses');
  return data.addresses;
}

export async function addAddress({ label, street, apartment, city, state, zip }) {
  if (env.useMockCustomerOrders) {
    await delay();
    mockIdSeq += 1;
    mockAddresses = [...mockAddresses, { _id: `addr-${mockIdSeq}`, label: label || 'Address', street, apartment: apartment || '', city, state: state || 'OK', zip }];
    return mockAddresses;
  }
  const { data } = await apiClient.post('/addresses', { label, street, apartment, city, state, zip });
  return data.addresses;
}

export async function deleteAddress({ id }) {
  if (env.useMockCustomerOrders) {
    await delay();
    mockAddresses = mockAddresses.filter((a) => a._id !== id);
    return mockAddresses;
  }
  const { data } = await apiClient.delete(`/addresses/${id}`);
  return data.addresses;
}
