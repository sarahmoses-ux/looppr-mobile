import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import { colors } from '../../src/theme/tokens';

const AUTO_ADVANCE_MS = 1900;

export default function Splash() {
  const glow = useSharedValue(0.5);
  const fill = useSharedValue(0);
  const pop = useSharedValue(0.82);

  useEffect(() => {
    pop.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.back(1.2)) });
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1100 }), withTiming(0.5, { duration: 1100 })), -1, true);
    fill.value = withTiming(100, { duration: AUTO_ADVANCE_MS, easing: Easing.linear });

    const timer = setTimeout(() => router.replace('/(auth)/onboarding'), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <AuthShell>
      <Pressable
        onPress={() => router.replace('/(auth)/onboarding')}
        className="flex-1 items-center justify-center"
      >
        <Animated.View style={[{ alignItems: 'center' }, popStyle]}>
          <Animated.View
            style={[
              { position: 'absolute', top: -30, left: -30, right: -30, bottom: -30, borderRadius: 999, backgroundColor: 'rgba(124,115,230,0.22)' },
              glowStyle,
            ]}
          />
          <Image source={require('../../assets/images/looppr-mark.png')} style={{ width: 80, height: 80 }} contentFit="contain" />
        </Animated.View>
        <Text className="font-display text-[32px] text-ink mt-lg mb-[4px]">Looppr</Text>
        <Text className="font-body-bold text-[12.5px] tracking-[2px] uppercase text-brandLight">Laundry, handled.</Text>

        <View className="absolute bottom-[56px] w-[120px] h-[3px] rounded-full bg-tint overflow-hidden">
          <Animated.View style={[{ height: '100%', borderRadius: 2, backgroundColor: colors.brandDeep }, fillStyle]} />
        </View>
        <Text className="absolute bottom-[30px] font-body text-[10px] text-faint">getlooppr.com · Edmond & OKC</Text>
      </Pressable>
    </AuthShell>
  );
}
