import { View, useWindowDimensions } from 'react-native';
import { colors } from '../theme/tokens';

const MAX_CONTENT_WIDTH = 640;

// Caps content width on tablets so phone-optimized screens don't stretch
// into an unreadable single wide column — phones stay full-bleed.
export default function ResponsiveContainer({ children }) {
  const { width } = useWindowDimensions();
  const isWide = width > MAX_CONTENT_WIDTH;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: isWide ? MAX_CONTENT_WIDTH : '100%',
          alignSelf: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
