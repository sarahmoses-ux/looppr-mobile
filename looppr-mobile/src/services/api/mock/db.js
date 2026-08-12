// In-memory mock "database" for auth (mockLogin/mockRegister in auth.api.js)
// and notifications — every other domain's mock data now lives beside its
// real API module (pickups.api.js, driver.api.js, partner.api.js,
// business.api.js, addresses.api.js) since each mirrors a different real
// backend shape and none of them share this old vendor/services pipeline
// anymore.

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
  },
  'ops@hazelstairbnb.com': {
    id: 'u-4',
    name: 'Hazel St Airbnb',
    email: 'ops@hazelstairbnb.com',
    ownedRoles: ['business'],
  },
};

export const notifications = [
  { id: 'n-1', title: 'Pickup confirmed', body: 'Your driver is on the way — arriving 4–6 PM today.', time: '2h ago', read: false },
  { id: 'n-2', title: 'Washing started', body: 'LP-4821 is now being washed at Suds & Fold.', time: '1h ago', read: false },
  { id: 'n-3', title: 'Referral credit', body: 'You earned $20 credit — a friend used your code.', time: 'Yesterday', read: false },
];
