// Central place for environment/config values. Nothing in services/ or
// features/ should read process.env or Constants.expoConfig directly —
// route it through here so swapping to the real backend is a one-line change.
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

// app.json's extra.* values come through as real JSON booleans, while
// EXPO_PUBLIC_* env vars are always strings — `!== 'false'` alone only
// handles the string case, and silently mistreats the JSON boolean `false`
// as truthy (`false !== 'false'` is itself `true`). Handle both shapes.
function resolveMockFlag(extraValue, envValue) {
  const raw = extraValue ?? envValue ?? true;
  return typeof raw === 'boolean' ? raw : raw !== 'false';
}

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.getlooppr.com/v1',
  // Flip to false once the Node/Express backend is live — every services/api/*
  // module is written against the same interface for both.
  useMockApi: resolveMockFlag(extra.useMockApi, process.env.EXPO_PUBLIC_USE_MOCK_API),
  // Separate from useMockApi above: each of these auth domains can be flipped
  // to the real looppr-backend independently of the others and of useMockApi
  // (which still gates every non-auth domain — orders, business data, etc.)
  // until those get wired up the same way.
  useMockCustomerAuth: resolveMockFlag(extra.useMockCustomerAuth, process.env.EXPO_PUBLIC_USE_MOCK_CUSTOMER_AUTH),
  useMockBusinessAuth: resolveMockFlag(extra.useMockBusinessAuth, process.env.EXPO_PUBLIC_USE_MOCK_BUSINESS_AUTH),
  useMockPartnerAuth: resolveMockFlag(extra.useMockPartnerAuth, process.env.EXPO_PUBLIC_USE_MOCK_PARTNER_AUTH),
  useMockDriverAuth: resolveMockFlag(extra.useMockDriverAuth, process.env.EXPO_PUBLIC_USE_MOCK_DRIVER_AUTH),
  // Same independence as the auth flags above, scoped to the residential
  // pickups/addresses domain (pickups.api.js, addresses.api.js) — everything
  // else non-auth (vendors, business/driver/partner data) still stays on
  // useMockApi until those get wired up the same way.
  useMockCustomerOrders: resolveMockFlag(extra.useMockCustomerOrders, process.env.EXPO_PUBLIC_USE_MOCK_CUSTOMER_ORDERS),
  googleMapsApiKey: extra.googleMapsApiKey ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  stripePublishableKey: extra.stripePublishableKey ?? process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
};

export default env;
