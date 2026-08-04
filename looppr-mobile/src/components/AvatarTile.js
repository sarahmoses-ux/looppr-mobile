import { Text, View } from 'react-native';
import { colors } from '../theme/tokens';

const CYCLE = [
  { bg: colors.tint, fg: colors.brandDeep },
  { bg: colors.successBg, fg: colors.success },
  { bg: colors.warnBg, fg: colors.warnText },
  { bg: colors.dangerBg, fg: colors.danger },
];

function colorsForKey(key) {
  if (!key) return CYCLE[0];
  const code = String(key).charCodeAt(0) || 0;
  return CYCLE[code % CYCLE.length];
}

// Rounded-square colored tile with initials or an icon — used for vendor
// logos, role marks, account rows, and avatar circles throughout the app.
export default function AvatarTile({ label, size = 42, radius = 13, bg, fg, circle = false }) {
  const auto = colorsForKey(label);
  const background = bg ?? auto.bg;
  const color = fg ?? auto.fg;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: circle ? size / 2 : radius,
        backgroundColor: background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontSize: size * 0.34, fontWeight: '700' }} className="font-display-semibold">
        {label}
      </Text>
    </View>
  );
}
