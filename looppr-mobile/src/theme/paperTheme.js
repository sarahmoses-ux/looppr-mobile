import { MD3LightTheme } from 'react-native-paper';
import { colors } from './tokens';

// react-native-paper is used sparingly (Portal/Menu-style primitives only —
// see build plan) so this just keeps its baseline theme from clashing with
// the bespoke Looppr palette rather than fully re-skinning Material Design.
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.brand,
    onPrimary: colors.white,
    background: colors.bg,
    surface: colors.surface,
    error: colors.danger,
  },
};

export default paperTheme;
