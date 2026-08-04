/**
 * Looppr design tokens — single source of truth, extracted pixel-for-pixel
 * from the Claude Design mockup (getloopper-app-design/project/Looppr App.dc.html).
 * tailwind.config.js reads this file to build NativeWind utility classes;
 * anything needing raw values (SVG strokes, Reanimated interpolations,
 * react-native-maps styling) should import directly from here instead of
 * duplicating hex values.
 */

export const colors = {
  ink: '#3D3780',
  brand: '#7C73E6',
  brandHover: '#6A61DB',
  brandDeep: '#5A52C5',
  brandLight: '#8F87EB',
  muted: '#8885A0',
  faint: '#B4B2C9',
  bg: '#ECEAF6',
  bgGradientInner: '#DDD9F5',
  surface: '#F8F7FF',
  border: '#E8E6F4',
  borderInput: '#E0DCF5',
  tint: '#EEEDFE',
  divider: '#F1EFFA',
  success: '#0B7B5C',
  successBg: '#E1F5EE',
  successBright: '#7CE6B8',
  danger: '#B03340',
  dangerBg: '#FBE4E6',
  dangerBorder: '#F0BFC4',
  dangerText: '#8A2A2A',
  warnBg: '#FAEEDA',
  warnText: '#9A6A1B',
  gold: '#E8A23D',
  white: '#FFFFFF',
};

// Canonical status-pill map — every status badge in the app (order stage,
// job stage, invoice status, etc.) should resolve its colors through this,
// never inline hex values per-screen.
export const statusPill = {
  done: { bg: colors.successBg, fg: colors.success },
  active: { bg: colors.tint, fg: colors.brandDeep },
  warn: { bg: colors.warnBg, fg: colors.warnText },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  muted: { bg: colors.divider, fg: colors.muted },
};

export const fontFamily = {
  display: 'BricolageGrotesque_700Bold',
  displaySemibold: 'BricolageGrotesque_600SemiBold',
  displayMedium: 'BricolageGrotesque_500Medium',
  body: 'HankenGrotesk_400Regular',
  bodyMedium: 'HankenGrotesk_500Medium',
  bodySemibold: 'HankenGrotesk_600SemiBold',
  bodyBold: 'HankenGrotesk_700Bold',
};

export const radius = {
  xs: 8,
  sm: 10,
  stopCard: 11,
  md: 14,
  lg: 16,
  xl: 18,
  hero: 22,
  pill: 20,
  shell: 26,
  frame: 32,
  full: 9999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
};

export const shadow = {
  card: {
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  hero: {
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.28,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 20 },
    elevation: 10,
  },
  toast: {
    shadowColor: '#1E1B4B',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
};

export const theme = { colors, statusPill, fontFamily, radius, spacing, shadow };

export default theme;
