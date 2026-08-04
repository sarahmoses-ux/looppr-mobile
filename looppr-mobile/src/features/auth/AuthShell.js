import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/tokens';

// Auth screens run full-screen on a real device (unlike the mockup's
// desktop-preview "phone frame" card, which was just a browser-preview
// affordance) — this just reproduces the mockup's soft top-glow background.
export default function AuthShell({ children, edges = ['top', 'bottom'] }) {
  return (
    <LinearGradient
      colors={[colors.bgGradientInner, colors.bg]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 0.6 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={edges}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}
