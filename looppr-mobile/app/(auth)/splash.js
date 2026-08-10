import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import { colors } from '../../src/theme/tokens';

const AUTO_ADVANCE_MS = 2400;
const RING_SIZE = 116;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const BUBBLES = [
  { size: 10, left: '18%', delay: 0 },
  { size: 6, left: '30%', delay: 260 },
  { size: 14, left: '68%', delay: 120 },
  { size: 7, left: '78%', delay: 420 },
  { size: 9, left: '50%', delay: 560 },
];

function Bubble({ size, left, delay }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2600, easing: Easing.out(Easing.cubic) }), -1, false));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: t.value < 0.15 ? t.value / 0.15 : 1 - (t.value - 0.15) / 0.85,
    transform: [{ translateY: -t.value * 160 }],
  }));

  return (
    <Animated.View
      style={[
        { position: 'absolute', bottom: '38%', left, width: size, height: size, borderRadius: size / 2, backgroundColor: colors.brandLight },
        style,
      ]}
    />
  );
}

export default function Splash() {
  const glow = useSharedValue(0.5);
  const fill = useSharedValue(0);
  const pop = useSharedValue(0.82);
  const draw = useSharedValue(0);
  const spin = useSharedValue(0);
  const textUp = useSharedValue(0);

  useEffect(() => {
    pop.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1100 }), withTiming(0.5, { duration: 1100 })), -1, true);
    fill.value = withTiming(100, { duration: AUTO_ADVANCE_MS, easing: Easing.linear });

    draw.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
    spin.value = withDelay(750, withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1, false));
    textUp.value = withDelay(260, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));

    const timer = setTimeout(() => router.replace('/(auth)/onboarding'), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] }));
  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - draw.value),
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textUp.value,
    transform: [{ translateY: (1 - textUp.value) * 14 }],
  }));

  return (
    <AuthShell>
      <Pressable
        onPress={() => router.replace('/(auth)/onboarding')}
        className="flex-1 items-center justify-center"
      >
        {BUBBLES.map((b, i) => (
          <Bubble key={i} {...b} />
        ))}

        <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, popStyle]}>
          <Animated.View
            style={[
              { position: 'absolute', width: RING_SIZE + 40, height: RING_SIZE + 40, borderRadius: 999, backgroundColor: 'rgba(124,115,230,0.22)' },
              glowStyle,
            ]}
          />
          <Animated.View style={[{ position: 'absolute', width: RING_SIZE, height: RING_SIZE }, ringStyle]}>
            <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={colors.brandLight}
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                animatedProps={ringProps}
                fill="none"
                rotation={-90}
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
          </Animated.View>
          <Image source={require('../../assets/images/looppr-mark.png')} style={{ width: 80, height: 80 }} contentFit="contain" />
        </Animated.View>

        <Animated.View style={[{ alignItems: 'center' }, textStyle]}>
          <Text className="font-display text-[32px] text-ink mt-lg mb-[4px]">Looppr</Text>
          <Text className="font-body-bold text-[12.5px] tracking-[2px] uppercase text-brandLight">Laundry, handled.</Text>
        </Animated.View>

        <View className="absolute bottom-[56px] w-[120px] h-[3px] rounded-full bg-tint overflow-hidden">
          <Animated.View style={[{ height: '100%', borderRadius: 2, backgroundColor: colors.brandDeep }, fillStyle]} />
        </View>
        <Text className="absolute bottom-[30px] font-body text-[10px] text-faint">getlooppr.com · Edmond & OKC</Text>
      </Pressable>
    </AuthShell>
  );
}
