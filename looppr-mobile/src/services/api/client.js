import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { env } from '../../config/env';

const TOKEN_KEY = 'looppr_access_token';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  // Skips localtunnel's browser interstitial page (which would otherwise
  // return HTML instead of JSON on the first request from a new visitor) —
  // harmless no-op against a real deployed backend.
  headers: { 'bypass-tunnel-reminder': 'true' },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

export async function setStoredToken(token) {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export async function getStoredToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export default apiClient;
