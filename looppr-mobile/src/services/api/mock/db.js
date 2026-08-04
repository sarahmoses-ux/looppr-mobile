import { ORDER_STAGE } from '../../../constants/orderStages';

// In-memory mock "database" — mirrors the shared job pipeline from the
// design (one order flows: customer books -> pickup queue -> washing ->
// folding/QC -> out for delivery -> delivered, read by Customer/Driver/Partner
// screens alike). Every services/api/*.api.js module reads/writes through
// here when env.useMockApi is true, via the same async function signatures
// the real axios-backed modules use — so flipping the flag later requires
// no call-site changes.

let idSeq = 100;
export function nextId(prefix) {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

export const vendors = [
  { id: 'v-1', name: 'Suds & Fold', initials: 'SF', meta: 'Edmond wash facility', rate: 1.75, unit: 'lb', badge: 'Popular' },
  { id: 'v-2', name: 'Crystal Clean Co.', initials: 'CC', meta: 'OKC Metro', rate: 1.6, unit: 'lb', badge: null },
  { id: 'v-3', name: 'Fresh Fold Laundry', initials: 'FF', meta: 'Edmond & OKC', rate: 1.85, unit: 'lb', badge: 'Eco-friendly' },
];

export const users = {
  'maya@hazelct.com': {
    id: 'u-1',
    name: 'Maya Thompson',
    email: 'maya@hazelct.com',
    phone: '(405) 555-0134',
    address: '1408 Hazel Ct, Edmond OK',
    memberSince: '2025',
    ownedRoles: ['residential'],
    referralCode: 'MAYA20',
    preferences: { fold: 'standard', detergent: 'free_clear', temp: 'cold', softener: false, recurring: true },
  },
  'jeffrey@getlooppr.com': {
    id: 'u-2',
    name: 'Jeffrey Azuatalam',
    email: 'jeffrey@getlooppr.com',
    phone: '(405) 555-0110',
    ownedRoles: ['driver'],
  },
  'partner@sudsandfold.com': {
    id: 'u-3',
    name: 'Suds & Fold Team',
    email: 'partner@sudsandfold.com',
    ownedRoles: ['partner'],
    vendorId: 'v-1',
  },
  'ops@hazelstairbnb.com': {
    id: 'u-4',
    name: 'Hazel St Airbnb',
    email: 'ops@hazelstairbnb.com',
    ownedRoles: ['business'],
  },
};

export const orders = [
  {
    id: 'LP-4821',
    customerEmail: 'maya@hazelct.com',
    customerName: 'Maya Thompson',
    vendorId: 'v-1',
    stage: ORDER_STAGE.WASHING,
    services: [{ name: 'Wash & fold', qty: 2, price: 38.25 }],
    address: '1408 Hazel Ct, Edmond OK',
    location: { latitude: 35.6528, longitude: -97.4781 },
    window: 'Today · 4–6 PM',
    total: 38.25,
    driverEmail: 'jeffrey@getlooppr.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LP-4822',
    customerEmail: 'r.chen@example.com',
    customerName: 'R. Chen',
    vendorId: 'v-1',
    stage: ORDER_STAGE.PICKUP_QUEUE,
    services: [{ name: 'Wash & fold', qty: 1, price: 19.13 }],
    address: '512 Danforth Dr, Edmond OK',
    location: { latitude: 35.6611, longitude: -97.4645 },
    window: 'Today · 4–6 PM',
    total: 19.13,
    driverEmail: 'jeffrey@getlooppr.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LP-4823',
    customerEmail: 'ops@hazelstairbnb.com',
    customerName: 'Glow Studio Salon',
    vendorId: 'v-1',
    stage: ORDER_STAGE.OUT_FOR_DELIVERY,
    services: [{ name: 'Wash & fold', qty: 4, price: 19.13 }],
    address: '210 E 2nd St, Edmond OK',
    location: { latitude: 35.6547, longitude: -97.4772 },
    window: 'Today · 2–4 PM',
    total: 76.52,
    driverEmail: 'jeffrey@getlooppr.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'LP-4790',
    customerEmail: 'maya@hazelct.com',
    customerName: 'Maya Thompson',
    vendorId: 'v-1',
    stage: ORDER_STAGE.DELIVERED,
    services: [{ name: 'Wash & fold', qty: 2, price: 38.25 }],
    address: '1408 Hazel Ct, Edmond OK',
    window: 'Last Tuesday · 4–6 PM',
    total: 38.25,
    rating: null,
    driverEmail: 'jeffrey@getlooppr.com',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const notifications = [
  { id: 'n-1', title: 'Pickup confirmed', body: 'Your driver is on the way — arriving 4–6 PM today.', time: '2h ago', read: false },
  { id: 'n-2', title: 'Washing started', body: 'LP-4821 is now being washed at Suds & Fold.', time: '1h ago', read: false },
  { id: 'n-3', title: 'Referral credit', body: 'You earned $20 credit — a friend used your code.', time: 'Yesterday', read: false },
];
