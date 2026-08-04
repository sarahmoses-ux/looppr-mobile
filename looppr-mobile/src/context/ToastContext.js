import { createContext, useContext, useMemo } from 'react';
import Toast from 'react-native-toast-message';

const ToastContext = createContext(null);

// Thin wrapper around react-native-toast-message so screens depend on one
// small hook (`useToast().show(...)`) instead of importing the library
// directly everywhere — matches the mockup's single shared toast pattern.
export function ToastProvider({ children }) {
  const value = useMemo(
    () => ({
      show: (text, type = 'success') => Toast.show({ type, text1: text, position: 'bottom' }),
    }),
    []
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
