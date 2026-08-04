import { Text, View } from 'react-native';
import { statusPill } from '../theme/tokens';

// Every status badge in the app (order stage, invoice status, job stage)
// should render through this component so the color mapping stays in one
// place (theme/tokens.js statusPill) instead of being inlined per-screen.
export default function StatusPill({ label, variant = 'muted' }) {
  const { bg, fg } = statusPill[variant] ?? statusPill.muted;

  return (
    <View style={{ backgroundColor: bg, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 9, alignSelf: 'flex-start' }}>
      <Text
        style={{ color: fg, fontSize: 10, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }}
        className="font-body-bold"
      >
        {label}
      </Text>
    </View>
  );
}
