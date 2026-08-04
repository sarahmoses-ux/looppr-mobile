import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import Button from '../../src/components/Button';
import { onboardingSlides } from '../../src/features/auth/onboardingSlides';
import { colors } from '../../src/theme/tokens';

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const isLast = index === onboardingSlides.length - 1;
  const slide = onboardingSlides[index];

  const goNext = () => {
    if (isLast) {
      router.replace('/(auth)/welcome');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const skip = () => router.replace('/(auth)/welcome');

  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-lg pb-2xl">
        <View className="flex-row items-center mb-sm">
          <Image source={require('../../assets/images/looppr-mark.png')} style={{ width: 24, height: 24 }} contentFit="contain" />
          <Pressable onPress={skip} className="ml-auto p-[6px]">
            <Text className="font-body-bold text-[12.5px] text-muted">Skip</Text>
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center">
          <Animated.View key={slide.key} entering={FadeIn.duration(300)} className="items-center">
            <View
              className="w-[250px] bg-brand rounded-hero p-xl"
              style={{ shadowColor: '#1E1B4B', shadowOpacity: 0.32, shadowRadius: 50, shadowOffset: { width: 0, height: 26 }, elevation: 10 }}
            >
              <Text className="font-body-bold text-[13px] text-white text-center">{slide.title}</Text>
            </View>
          </Animated.View>
        </View>

        <Text className="font-display-semibold text-[23px] text-ink text-center mb-sm">{slide.title}</Text>
        <Text className="font-body text-[13px] text-muted text-center leading-[19px] px-md mb-lg">{slide.body}</Text>

        <View className="flex-row justify-center gap-[6px] mb-lg">
          {onboardingSlides.map((s, i) => (
            <View
              key={s.key}
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
