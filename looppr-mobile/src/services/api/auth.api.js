import { apiClient } from './client';
import { env } from '../../config/env';
import { users, nextId } from './mock/db';
import { ROLES } from '../../constants/roles';

// Every export here has the exact shape the real Node/Express endpoints will
// have once they exist — screens/hooks call these, never the mock or axios
// directly, so turning off env.useMockApi is the only change needed later.
//
// Customer (residential) auth is the first role wired to the real
// looppr-backend (see env.useMockCustomerAuth) — it's a fully separate
// portal there (/api/auth/client/*, role: 'client'), distinct from the
// driver/partner/business portals which are still mocked. Its login is
// two-step (password check -> emailed OTP -> verify) unlike register, which
// issues a session immediately — see looppr-backend/controllers/authController.js.

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Maps the backend's flat { role: 'client' } user onto the shape the rest of
// the app expects (ownedRoles[], for the multi-role switcher) — the real
// backend doesn't support one account owning multiple roles yet, so this is
// always a single-element array for now.
function toMobileUser(backendUser) {
  return { ...backendUser, ownedRoles: [ROLES.RESIDENTIAL] };
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

async function mockForgotPassword() {
  await delay(300);
  // Mirrors the real endpoint's "always the same response" shape — it never
  // reveals whether the email is registered.
  return { success: true, message: 'If an account exists for that email, a reset code has been sent.' };
}

// Mock has no stored password/OTP to check against, so this just re-signs
// in the matching mock user (if any) the same way mockLogin does.
async function mockResetPassword({ email }) {
  await delay();
  const user = users[email];
  if (!user) {
    const err = new Error('Invalid or expired code.');
    err.code = 'INVALID_CODE';
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
  if (role !== ROLES.RESIDENTIAL) return mockLogin({ email, password, role });
  if (env.useMockCustomerAuth) return mockLogin({ email, password, role });

  // Real backend gates login behind an emailed OTP — this only returns a
  // challenge, not a session. Caller must follow up with verifyLoginOtp.
  const { data } = await apiClient.post('/auth/client/login', { email, password });
  return { requiresOtp: true, challengeToken: data.challengeToken, email: data.email };
}

export async function verifyLoginOtp({ challengeToken, code }) {
  const { data } = await apiClient.post('/auth/client/login/verify-otp', { challengeToken, code });
  return { user: toMobileUser(data.user), token: data.accessToken };
}

export async function resendLoginOtp({ challengeToken }) {
  const { data } = await apiClient.post('/auth/client/login/resend-otp', { challengeToken });
  return data;
}

export async function register({ email, password, role, name, phone }) {
  if (role !== ROLES.RESIDENTIAL) return mockRegister({ email, password, role, name });
  if (env.useMockCustomerAuth) return mockRegister({ email, password, role, name });

  const { data } = await apiClient.post('/auth/client/register', { name, email, phone, password });
  return { user: toMobileUser(data.user), token: data.accessToken };
}

export async function fetchMe() {
  const { data } = await apiClient.get('/auth/me');
  return toMobileUser(data.user);
}

// Note: unlike login/register/OTP, these two live at /auth/forgot-password
// and /auth/reset-password on the backend — not under the /auth/client/
// prefix — but are still scoped server-side to role: 'client'.
export async function forgotPassword({ email }) {
  if (env.useMockCustomerAuth) return mockForgotPassword();
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
}

export async function resetPassword({ email, code, newPassword }) {
  if (env.useMockCustomerAuth) return mockResetPassword({ email });
  const { data } = await apiClient.post('/auth/reset-password', { email, code, newPassword });
  return { user: toMobileUser(data.user), token: data.accessToken };
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

export async function logout({ role } = {}) {
  if (role !== ROLES.RESIDENTIAL || env.useMockCustomerAuth) {
    await delay(100);
    return { ok: true };
  }
  const { data } = await apiClient.post('/auth/logout');
  return data;
}
