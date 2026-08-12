// Every key here matches looppr-backend's validations/pickupValidation.js
// and utils/pricing.js enums exactly — the real /pickups endpoint rejects
// anything else.
export const LOAD_SIZE_OPTIONS = [
  { key: 'small', label: 'Small', sub: '~10 lb · 1-2 hampers' },
  { key: 'medium', label: 'Medium', sub: '~20 lb · 3-4 hampers' },
  { key: 'large', label: 'Large', sub: '~35 lb · 5+ hampers' },
];

// $/lb and per-size lb estimate mirror looppr-backend/utils/pricing.js —
// used client-side only to show an estimate before the server computes the
// authoritative price at booking time.
export const PRICE_PER_LB = 1.59;
export const DELIVERY_FEE = 4.99;
export const FREE_DELIVERY_ORDER_LIMIT = 2;
export const LOAD_SIZE_LBS = { small: 10, medium: 20, large: 35 };

export function estimateOrderPrice(loadSize, priorOrderCount = 0) {
  const lbs = LOAD_SIZE_LBS[loadSize] ?? LOAD_SIZE_LBS.medium;
  const subtotal = Math.round(lbs * PRICE_PER_LB * 100) / 100;
  const freeDelivery = priorOrderCount < FREE_DELIVERY_ORDER_LIMIT;
  const deliveryFee = freeDelivery ? 0 : DELIVERY_FEE;
  const amount = Math.round((subtotal + deliveryFee) * 100) / 100;
  return { amount, subtotal, deliveryFee, currency: 'usd' };
}

export const WINDOW_OPTIONS = [
  { key: 'morning', label: 'Morning', sub: '8 AM - 12 PM' },
  { key: 'afternoon', label: 'Afternoon', sub: '12 - 4 PM' },
  { key: 'evening', label: 'Evening', sub: '4 - 8 PM' },
];

export const FOLD_OPTIONS = [
  { key: 'standard', label: 'Standard' },
  { key: 'konmari', label: 'KonMari' },
  { key: 'hangers', label: 'On hangers' },
];

export const DETERGENT_OPTIONS = [
  { key: 'freeAndClear', label: 'Free & clear' },
  { key: 'freshScent', label: 'Fresh scent' },
  { key: 'eco', label: 'Eco' },
];

export const TEMP_OPTIONS = [
  { key: 'cold', label: 'Cold' },
  { key: 'warm', label: 'Warm' },
  { key: 'hot', label: 'Hot' },
];
