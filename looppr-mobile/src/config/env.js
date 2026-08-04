// Central place for environment/config values. Nothing in services/ or
// features/ should read process.env or Constants.expoConfig directly —
// route it through here so swapping to the real backend is a one-line change.
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.getlooppr.com/v1',
  // Flip to false once the Node/Express backend is live — every services/api/*
  // module is written against the same interface for both.
  useMockApi: (extra.useMockApi ?? process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') !== 'false',
  googleMapsApiKey: extra.googleMapsApiKey ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
};

export default env;
