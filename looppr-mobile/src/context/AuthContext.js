import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as authApi from '../services/api/auth.api';
import { setStoredToken } from '../services/api/client';

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

  const persist = useCallback(async (nextUser, nextRole, token) => {
    await setStoredToken(token ?? null);
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

    const { user: signedInUser, token } = result;
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token);
    return signedInUser;
  }, [persist]);

  const verifyOtp = useCallback(async ({ challengeToken, code, role }) => {
    const { user: signedInUser, token } = await authApi.verifyLoginOtp({ challengeToken, code });
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token);
    return signedInUser;
  }, [persist]);

  const resendOtp = useCallback(({ challengeToken }) => authApi.resendLoginOtp({ challengeToken }), []);

  const requestPasswordReset = useCallback(({ email }) => authApi.forgotPassword({ email }), []);

  // The reset-password endpoint verifies the emailed code and signs the user
  // straight in (they've already proven email ownership), so this mirrors
  // verifyOtp above rather than just resolving a plain success message.
  const resetPassword = useCallback(async ({ email, code, newPassword, role }) => {
    const { user: signedInUser, token } = await authApi.resetPassword({ email, code, newPassword });
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token);
    return signedInUser;
  }, [persist]);

  const signUp = useCallback(async ({ email, password, role, name, phone }) => {
    const { user: newUser, token } = await authApi.register({ email, password, role, name, phone });
    setUser(newUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(newUser, role, token);
    return newUser;
  }, [persist]);

  const switchRole = useCallback(async (role) => {
    if (!user?.ownedRoles?.includes(role)) return;
    setCurrentRole(role);
    await persist(user, role);
  }, [user, persist]);

  const signOut = useCallback(async () => {
    await authApi.logout({ role: currentRole });
    await setStoredToken(null);
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
