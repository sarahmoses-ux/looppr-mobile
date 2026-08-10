import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  LinearTransition,
  SlideInRight,
  SlideInLeft,
  SlideOutRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import Button from '../../src/components/Button';
import { onboardingSlides } from '../../src/features/auth/onboardingSlides';
import { PickupArt, TrackArt, RolesArt } from '../../src/features/auth/OnboardingArt';
import { colors } from '../../src/theme/tokens';

const ART = { pickup: PickupArt, track: TrackArt, roles: RolesArt };
const SWIPE_DISTANCE = 46;
const SWIPE_VELOCITY = 500;

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const isLast = index === onboardingSlides.length - 1;
  const slide = onboardingSlides[index];
  const Art = ART[slide.key];
  const { width } = useWindowDimensions();

  const dragX = useSharedValue(0);

  const goTo = (nextIndex, dir) => {
    if (nextIndex < 0 || nextIndex >= onboardingSlides.length) return;
    setDirection(dir);
    setIndex(nextIndex);
  };

  const goNext = () => {
    if (isLast) {
      router.replace('/(auth)/welcome');
    } else {
      goTo(index + 1, 1);
    }
  };

  const skip = () => router.replace('/(auth)/welcome');

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate((e) => {
      const atStart = index === 0 && e.translationX > 0;
      const atEnd = isLast && e.translationX < 0;
      dragX.value = atStart || atEnd ? e.translationX * 0.3 : e.translationX;
    })
    .onEnd((e) => {
      const past = e.translationX < -SWIPE_DISTANCE || e.velocityX < -SWIPE_VELOCITY;
      const back = e.translationX > SWIPE_DISTANCE || e.velocityX > SWIPE_VELOCITY;
      dragX.value = withSpring(0, { damping: 18, stiffness: 220 });
      if (past && !isLast) runOnJS(goTo)(index + 1, 1);
      else if (back && index > 0) runOnJS(goTo)(index - 1, -1);
    });

  const dragStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <View className="flex-row items-center mb-sm">
          <Image source={require('../../assets/images/looppr-mark.png')} style={{ width: 24, height: 24 }} contentFit="contain" />
          <Pressable onPress={skip} className="ml-auto p-[6px]">
            <Text className="font-body-bold text-[12.5px] text-muted">Skip</Text>
          </Pressable>
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center' }, dragStyle]}>
            <Animated.View
              key={slide.key}
              entering={(direction === 1 ? SlideInRight : SlideInLeft).duration(320)}
              exiting={(direction === 1 ? SlideOutLeft : SlideOutRight).duration(220)}
              style={{ alignItems: 'center', width }}
            >
              <Art />
              <Text className="font-display-semibold text-[23px] text-ink text-center mb-sm mt-md px-lg">{slide.title}</Text>
              <Text className="font-body text-[13px] text-muted text-center leading-[19px] px-xl">{slide.body}</Text>
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <View className="flex-row justify-center gap-[6px] mb-lg mt-lg">
          {onboardingSlides.map((s, i) => (
            <Animated.View
              key={s.key}
              layout={LinearTransition.duration(220)}
              style={{
                width: i === index ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === index ? colors.brand : colors.tint,
              }}
            />
          ))}
        </View>

        <Button title={isLast ? 'Get started' : 'Next'} onPress={goNext} />
      </View>
    </AuthShell>
  );
}
