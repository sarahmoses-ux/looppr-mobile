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

  const signIn = useCallback(async ({ email, password, role }) => {
    const { user: signedInUser, token } = await authApi.login({ email, password, role });
    setUser(signedInUser);
    setCurrentRole(role);
    setStatus('signedIn');
    await persist(signedInUser, role, token);
    return signedInUser;
  }, [persist]);

  const signUp = useCallback(async ({ email, password, role, name }) => {
    const { user: newUser, token } = await authApi.register({ email, password, role, name });
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
    await authApi.logout();
    await setStoredToken(null);
    await SecureStore.deleteItemAsync(SESSION_KEY);
    setUser(null);
    setCurrentRole(null);
    setStatus('signedOut');
  }, []);

  const value = useMemo(
    () => ({ status, user, currentRole, signIn, signUp, signOut, switchRole }),
    [status, user, currentRole, signIn, signUp, signOut, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
