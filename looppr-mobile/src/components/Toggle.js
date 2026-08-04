import { Pressable } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { colors } from '../theme/tokens';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 25;
const KNOB_SIZE = 19;
const KNOB_OFFSET = TRACK_WIDTH - KNOB_SIZE - 3;

export default function Toggle({ value, onValueChange }) {
  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(value ? colors.brand : '#D9D6EE', { duration: 150 }),
  }));
  const knobStyle = useAnimatedStyle(() => ({
    left: withTiming(value ? KNOB_OFFSET : 3, { duration: 150 }),
  }));

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View style={[{ width: TRACK_WIDTH, height: TRACK_HEIGHT, borderRadius: TRACK_HEIGHT / 2 }, trackStyle]}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 3,
              width: KNOB_SIZE,
              height: KNOB_SIZE,
              borderRadius: KNOB_SIZE / 2,
              backgroundColor: colors.white,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 3,
              shadowOffset: { width: 0, height: 1 },
              elevation: 2,
            },
            knobStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}
