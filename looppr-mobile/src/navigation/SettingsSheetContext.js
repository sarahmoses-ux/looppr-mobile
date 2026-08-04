import { createContext, useContext, useRef } from 'react';

// Lets any screen open the shared Settings bottom sheet (mounted once at
// the root layout) via `useSettingsSheet().open()` without prop-drilling a ref.
const SettingsSheetContext = createContext(null);

export function SettingsSheetProvider({ children, sheetRef }) {
  const value = useRef({
    open: () => sheetRef.current?.present(),
    close: () => sheetRef.current?.dismiss(),
  }).current;

  return <SettingsSheetContext.Provider value={value}>{children}</SettingsSheetContext.Provider>;
}

export function useSettingsSheet() {
  const ctx = useContext(SettingsSheetContext);
  if (!ctx) throw new Error('useSettingsSheet must be used within SettingsSheetProvider');
  return ctx;
}
