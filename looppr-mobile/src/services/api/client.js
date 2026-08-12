import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '../../config/env';
import { ROLES } from '../../constants/roles';

const AUTH_KEY = 'looppr_auth';

// Every real backend auth domain issues a 15-minute access token and sets a
// browser-only refresh cookie — a React Native client has no cookie jar, so
// the refresh token has to be captured from the JSON response body instead
// (see looppr-backend's session.js/authController.js "Cookie for the web
// frontend; request body as a fallback for the mobile app" comments) and
// replayed here on 401.
const REFRESH_PATH = {
  [ROLES.RESIDENTIAL]: '/auth/refresh',
  [ROLES.BUSINESS]: '/business-auth/refresh',
  [ROLES.PARTNER]: '/partner-auth/refresh',
  [ROLES.DRIVER]: '/driver-auth/refresh',
};

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  // Skips localtunnel's browser interstitial page (which would otherwise
  // return HTML instead of JSON on the first request from a new visitor) —
  // harmless no-op against a real deployed backend.
  headers: { 'bypass-tunnel-reminder': 'true' },
});

apiClient.interceptors.request.use(async (config) => {
  const stored = await getStoredAuth();
  if (stored?.accessToken) {
    config.headers.Authorization = `Bearer ${stored.accessToken}`;
  }
  return config;
});

// Coalesces concurrent 401s into a single refresh call instead of firing one
// per in-flight request.
let refreshPromise = null;

async function performRefresh() {
  const stored = await getStoredAuth();
  const path = stored?.role ? REFRESH_PATH[stored.role] : null;
  if (!stored?.refreshToken || !path) return null;

  try {
    const { data } = await axios.post(`${env.apiBaseUrl}${path}`, { refreshToken: stored.refreshToken }, {
      headers: { 'bypass-tunnel-reminder': 'true' },
      timeout: 15000,
    });
    await setStoredAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, role: stored.role });
    return data.accessToken;
  } catch {
    // Refresh token itself is invalid/expired — nothing left to try.
    await clearStoredAuth();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isRefreshCall = Object.values(REFRESH_PATH).some((p) => original?.url?.includes(p));

    if (error.response?.status === 401 && original && !original._retried && !isRefreshCall) {
      original._retried = true;
      if (!refreshPromise) {
        refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
      }
      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        original.headers = { ...original.headers, Authorization: `Bearer ${newAccessToken}` };
        return apiClient(original);
      }
    }

    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

// { accessToken, refreshToken, role } stored together so a 401 mid-session
// always has everything it needs to refresh, regardless of which screen
// triggered it.
export async function setStoredAuth({ accessToken, refreshToken, role }) {
  await SecureStore.setItemAsync(AUTH_KEY, JSON.stringify({ accessToken, refreshToken, role }));
}

export async function getStoredAuth() {
  const raw = await SecureStore.getItemAsync(AUTH_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearStoredAuth() {
  await SecureStore.deleteItemAsync(AUTH_KEY);
}

export default apiClient;
