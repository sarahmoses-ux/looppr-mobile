import { apiClient } from './client';
import { env } from '../../config/env';
import { notifications } from './mock/db';

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchNotifications() {
  if (env.useMockApi) {
    await delay();
    return notifications;
  }
  const { data } = await apiClient.get('/notifications');
  return data;
}

export async function registerPushToken({ token }) {
  if (env.useMockApi) {
    await delay(100);
    return { ok: true, token };
  }
  const { data } = await apiClient.post('/notifications/register-token', { token });
  return data;
}

export async function markAllRead() {
  if (env.useMockApi) {
    await delay(150);
    notifications.forEach((n) => { n.read = true; });
    return notifications;
  }
  const { data } = await apiClient.post('/notifications/mark-all-read');
  return data;
}
