import { View } from 'react-native';
import { colors } from '../theme/tokens';

// Row of colored segments (order progress, onboarding step bar, book-flow
// wizard progress). `segments` is an array of variant keys ('done'|'active'|'upcoming').
const SEGMENT_COLOR = {
  done: colors.successBright,
  active: colors.brand,
  upcoming: 'rgba(255,255,255,0.18)',
  upcomingLight: colors.divider,
};

export function SegmentedProgressBar({ segments, gap = 5, height = 5 }) {
  return (
    <View style={{ flexDirection: 'row', gap }}>
      {segments.map((s, i) => (
        <View
          key={i}
          style={{ flex: 1, height, borderRadius: height / 2, backgroundColor: SEGMENT_COLOR[s] ?? SEGMENT_COLOR.upcomingLight }}
        />
      ))}
    </View>
  );
}

// Continuous fill bar (KPI/funnel style) — percent is 0-100.
export function FillProgressBar({ percent, height = 7 }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.divider, overflow: 'hidden' }}>
      <View
        style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: colors.brand,
        }}
      />
    </View>
  );
}
