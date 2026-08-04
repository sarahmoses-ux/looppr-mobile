import { apiClient } from './client';
import { env } from '../../config/env';
import { users, nextId } from './mock/db';

// Every export here has the exact shape the real Node/Express endpoints will
// have once they exist — screens/hooks call these, never the mock or axios
// directly, so turning off env.useMockApi is the only change needed later.

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mockLogin({ email, password, role }) {
  await delay();
  const user = users[email];
  if (!user) {
    const err = new Error('No account found for that email. Try signing up instead.');
    err.code = 'NOT_FOUND';
    throw err;
  }
  if (!user.ownedRoles.includes(role)) {
    const err = new Error(`This account has no ${role} access yet.`);
    err.code = 'ROLE_NOT_OWNED';
    throw err;
  }
  return { user, token: `mock-token-${user.id}` };
}

async function mockRegister({ email, password, role, name }) {
  await delay();
  const existing = users[email];
  if (existing?.ownedRoles.includes(role)) {
    const err = new Error('An account with this role already exists. Try logging in instead.');
    err.code = 'ALREADY_EXISTS';
    throw err;
  }
  const user = existing ?? {
    id: nextId('u'),
    name: name || email.split('@')[0],
    email,
    ownedRoles: [],
  };
  user.ownedRoles = [...new Set([...user.ownedRoles, role])];
  users[email] = user;
  return { user, token: `mock-token-${user.id}` };
}

export async function login({ email, password, role }) {
  if (env.useMockApi) return mockLogin({ email, password, role });
  const { data } = await apiClient.post('/auth/login', { email, password, role });
  return data;
}

export async function register({ email, password, role, name }) {
  if (env.useMockApi) return mockRegister({ email, password, role, name });
  const { data } = await apiClient.post('/auth/register', { email, password, role, name });
  return data;
}

export async function fetchOwnedAccounts({ email }) {
  if (env.useMockApi) {
    await delay(150);
    const user = users[email];
    return user ? user.ownedRoles : [];
  }
  const { data } = await apiClient.get('/auth/accounts', { params: { email } });
  return data;
}

export async function logout() {
  if (env.useMockApi) {
    await delay(100);
    return { ok: true };
  }
  const { data } = await apiClient.post('/auth/logout');
  return data;
}
