import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../services/api/auth.api';
import { setStoredAuth, clearStoredAuth } from '../services/api/client';

const SESSION_KEY = 'looppr_session';

const AuthContext = createContext(null);

// Single auth/account system shared by every role. A user's `ownedRoles`
// can include more than one role (e.g. residential + driver); `currentRole`
// is which dashboard is active right now and drives which Expo Router
// group (customer/business/partner/driver) the app mounts.
export function AuthProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | signedOut | signedIn
  const [user, setUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        setUser(session.user);
        setCurrentRole(session.currentRole);
        setStatus('signedIn');
      } else {
        setStatus('signedOut');
      }
    })();
  }, []);

  // client.js's own auth store ({accessToken, refreshToken, role}) is what
  // actually authenticates API requests and refreshes on 401 — this is kept
  // separate from it, purely for the UI (who's signed in, which dashboard).
  const persist = useCallback(async (nextUser, nextRole, accessToken, refreshToken) => {
    if (accessToken) {
      await setStoredAuth({ accessToken, refreshToken: refreshToken ?? null, role: nextRole });
    } else {
      await clearStoredAuth();
    }
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user: nextUser, currentRole: nextRole }));
  }, []);

  // Real customer (residential) login is two-step — this resolves the first
  // step and returns { requiresOtp: true, challengeToken, email } instead of
  // a session when a code has been emailed. The caller (login screen) must
  // then call verifyOtp to actually finish signing in. Every other role's
  // mock login still resolves a session directly, unaffected.
  const signIn = useCallback(async ({ email, password, role }) => {
    const result = await authApi.login({ email, password, role });
    if (result.requiresOtp) return result;

    const { user: signedInUser, token, refreshToken } = result;
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token, refreshToken);
    return signedInUser;
  }, [persist]);

  const verifyOtp = useCallback(async ({ challengeToken, code, role }) => {
    const { user: signedInUser, token, refreshToken } = await authApi.verifyLoginOtp({ challengeToken, code });
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token, refreshToken);
    return signedInUser;
  }, [persist]);

  const resendOtp = useCallback(({ challengeToken }) => authApi.resendLoginOtp({ challengeToken }), []);

  const requestPasswordReset = useCallback(({ email, role }) => authApi.forgotPassword({ email, role }), []);

  // The reset-password endpoint verifies the emailed code and signs the user
  // straight in (they've already proven email ownership), so this mirrors
  // verifyOtp above rather than just resolving a plain success message.
  const resetPassword = useCallback(async ({ email, code, newPassword, role }) => {
    const { user: signedInUser, token, refreshToken } = await authApi.resetPassword({ email, code, newPassword, role });
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token, refreshToken);
    return signedInUser;
  }, [persist]);

  const signUp = useCallback(async ({ email, password, role, name, phone }) => {
    const { user: newUser, token, refreshToken } = await authApi.register({ email, password, role, name, phone });
    setUser(newUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(newUser, role, token, refreshToken);
    return newUser;
  }, [persist]);

  const switchRole = useCallback(async (role) => {
    if (!user?.ownedRoles?.includes(role)) return;
    setCurrentRole(role);
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify({ user, currentRole: role }));
  }, [user]);

  const signOut = useCallback(async () => {
    await authApi.logout({ role: currentRole });
    await clearStoredAuth();
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
    setCurrentRole(null);
    setStatus('signedOut');
  }, [currentRole]);

  const value = useMemo(
    () => ({
      status, user, currentRole, signIn, signUp, signOut, switchRole,
      verifyOtp, resendOtp, requestPasswordReset, resetPassword,
    }),
    [status, user, currentRole, signIn, signUp, signOut, switchRole, verifyOtp, resendOtp, requestPasswordReset, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
