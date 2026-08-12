import { apiClient } from './client';
import { env } from '../../config/env';
import { users, nextId } from './mock/db';
import { ROLES } from '../../constants/roles';

// Every export here has the exact shape the real Node/Express endpoints will
// have once they exist — screens/hooks call these, never the mock or axios
// directly, so flipping the relevant useMock*Auth flag off is the only
// change needed later.
//
// Each role is a fully separate portal on looppr-backend (own Mongo model,
// own session cookie scoped to its own path) — see
// looppr-backend/controllers/*AuthController.js. Residential's login is
// two-step (password check -> emailed OTP -> verify); business/driver/
// partner are password-only, but can come back "blocked" instead of
// signed-in (unverified email / application still pending / rejected) since
// those three are review-gated onboarding, not instant signup.
const AUTH_CONFIG = {
  [ROLES.RESIDENTIAL]: {
    mockFlag: 'useMockCustomerAuth',
    loginPath: '/auth/client/login',
    registerPath: '/auth/client/register',
    forgotPasswordPath: '/auth/forgot-password',
    resetPasswordPath: '/auth/reset-password',
    logoutPath: '/auth/logout',
    userKey: 'user',
    otpLogin: true,
  },
  [ROLES.BUSINESS]: {
    mockFlag: 'useMockBusinessAuth',
    loginPath: '/business-auth/login',
    registerPath: '/business-auth/register',
    forgotPasswordPath: '/business-auth/forgot-password',
    resetPasswordPath: '/business-auth/reset-password',
    logoutPath: '/business-auth/logout',
    userKey: 'business',
    otpLogin: false,
  },
  [ROLES.PARTNER]: {
    mockFlag: 'useMockPartnerAuth',
    loginPath: '/partner-auth/login',
    registerPath: '/partner-auth/register',
    forgotPasswordPath: '/partner-auth/forgot-password',
    resetPasswordPath: '/partner-auth/reset-password',
    logoutPath: '/partner-auth/logout',
    userKey: 'partner',
    otpLogin: false,
  },
  [ROLES.DRIVER]: {
    mockFlag: 'useMockDriverAuth',
    loginPath: '/driver-auth/login',
    registerPath: '/driver-auth/register',
    forgotPasswordPath: '/driver-auth/forgot-password',
    resetPasswordPath: '/driver-auth/reset-password',
    logoutPath: '/driver-auth/logout',
    userKey: 'driver',
    otpLogin: false,
  },
};

function isMockAuth(role) {
  const cfg = AUTH_CONFIG[role];
  return !cfg || env[cfg.mockFlag];
}

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Maps the backend's flat per-role user (role: 'client' | 'business' |
// 'partner' | 'driver') onto the shape the rest of the app expects
// (ownedRoles[], for the multi-role switcher) — the real backend doesn't
// support one account owning multiple roles yet, so this is always a
// single-element array for now.
function toMobileUser(role, backendUser) {
  return { ...backendUser, ownedRoles: [role] };
}

// business/driver/partner login only ever returns an accessToken for an
// active, verified account — anything else means the account exists but
// can't sign in yet, which the login screen surfaces via its server-error
// banner (there's no dedicated "check your email" / "application pending"
// screen since registration through the app is still mocked, see
// mockRegister below).
function loginBlockedError(data) {
  if (data.requiresVerification) {
    return new Error('Please verify your email before signing in — check your inbox for a verification code.');
  }
  if (data.pendingApproval) {
    return new Error('Your application is still under review. We’ll email you once it’s approved.');
  }
  if (data.applicationRejected) {
    return new Error('This application was not approved. Contact Looppr support for details.');
  }
  return new Error('Unable to sign in right now. Please try again.');
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
  if (isMockAuth(role)) return mockLogin({ email, password, role });
  const cfg = AUTH_CONFIG[role];

  if (cfg.otpLogin) {
    // Real backend gates login behind an emailed OTP — this only returns a
    // challenge, not a session. Caller must follow up with verifyLoginOtp.
    const { data } = await apiClient.post(cfg.loginPath, { email, password });
    return { requiresOtp: true, challengeToken: data.challengeToken, email: data.email };
  }

  const { data } = await apiClient.post(cfg.loginPath, { email, password });
  if (!data.accessToken) throw loginBlockedError(data);
  return { user: toMobileUser(role, data[cfg.userKey]), token: data.accessToken, refreshToken: data.refreshToken };
}

export async function verifyLoginOtp({ challengeToken, code }) {
  const { data } = await apiClient.post('/auth/client/login/verify-otp', { challengeToken, code });
  return { user: toMobileUser(ROLES.RESIDENTIAL, data.user), token: data.accessToken, refreshToken: data.refreshToken };
}

export async function resendLoginOtp({ challengeToken }) {
  const { data } = await apiClient.post('/auth/client/login/resend-otp', { challengeToken });
  return data;
}

export async function register({ email, password, role, name, phone }) {
  // Registration stays mocked for every role for now — business/driver/
  // partner registration on the real backend is a much larger application
  // form (vehicle/business details, document uploads, admin review), not a
  // like-for-like swap the way login/forgot-password are.
  if (role !== ROLES.RESIDENTIAL) return mockRegister({ email, password, role, name });
  if (env.useMockCustomerAuth) return mockRegister({ email, password, role, name });

  const { data } = await apiClient.post('/auth/client/register', { name, email, phone, password });
  return { user: toMobileUser(ROLES.RESIDENTIAL, data.user), token: data.accessToken, refreshToken: data.refreshToken };
}

export async function fetchMe({ email } = {}) {
  if (env.useMockCustomerAuth) {
    await delay(150);
    const user = users[email];
    if (!user) throw new Error('User not found.');
    return toMobileUser(ROLES.RESIDENTIAL, user);
  }
  const { data } = await apiClient.get('/auth/me');
  return toMobileUser(ROLES.RESIDENTIAL, data.user);
}

export async function updateMe({ email, name, phone, emailNotifications }) {
  if (env.useMockCustomerAuth) {
    await delay(250);
    const user = users[email];
    if (!user) throw new Error('User not found.');
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    return toMobileUser(ROLES.RESIDENTIAL, user);
  }
  const { data } = await apiClient.patch('/auth/me', { name, phone, emailNotifications });
  return toMobileUser(ROLES.RESIDENTIAL, data.user);
}

export async function forgotPassword({ email, role }) {
  if (isMockAuth(role)) return mockForgotPassword();
  const { data } = await apiClient.post(AUTH_CONFIG[role].forgotPasswordPath, { email });
  return data;
}

export async function resetPassword({ email, code, newPassword, role }) {
  if (isMockAuth(role)) return mockResetPassword({ email });
  const cfg = AUTH_CONFIG[role];
  const { data } = await apiClient.post(cfg.resetPasswordPath, { email, code, newPassword });
  return { user: toMobileUser(role, data[cfg.userKey]), token: data.accessToken, refreshToken: data.refreshToken };
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
  if (isMockAuth(role)) {
    await delay(100);
    return { ok: true };
  }
  const { data } = await apiClient.post(AUTH_CONFIG[role].logoutPath);
  return data;
}
