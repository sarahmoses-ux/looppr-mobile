import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'looppr_settings';

const initialState = { notificationsEnabled: true, hydrated: false };

function reducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.payload, hydrated: true };
    case 'toggleNotifications':
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    default:
      return state;
  }
}

const SettingsContext = createContext(null);

// Small Context+reducer store for cross-cutting *client-only* preferences
// (not server state — React Query owns that). Persisted locally so the
// Settings sheet reflects the same toggles across app restarts.
export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      dispatch({ type: 'hydrate', payload: raw ? JSON.parse(raw) : {} });
    })();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { notificationsEnabled } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ notificationsEnabled }));
  }, [state.notificationsEnabled, state.hydrated]);

  const value = useMemo(
    () => ({
      ...state,
      toggleNotifications: () => dispatch({ type: 'toggleNotifications' }),
    }),
    [state]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
