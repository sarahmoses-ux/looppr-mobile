import { apiClient } from './client';
import { env } from '../../config/env';
import { users } from './mock/db';

function delay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchProfile({ email }) {
  if (env.useMockApi) {
    await delay();
    return users[email] ?? null;
  }
  const { data } = await apiClient.get('/users/me', { params: { email } });
  return data;
}

export async function updatePreferences({ email, preferences }) {
  if (env.useMockApi) {
    await delay();
    const user = users[email];
    if (user) user.preferences = { ...user.preferences, ...preferences };
    return user;
  }
  const { data } = await apiClient.patch('/users/me/preferences', preferences);
  return data;
}
