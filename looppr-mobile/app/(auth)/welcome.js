import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AuthShell from '../../src/features/auth/AuthShell';
import { colors } from '../../src/theme/tokens';

// Top-level auth fork: Customer is primary (shown first, visually dominant
// gradient hero card) and Operational is secondary (smaller, outlined card
// below) — per spec.
export default function Welcome() {
  return (
    <AuthShell>
      <View className="flex-1 px-2xl pt-[48px] pb-2xl">
        <Animated.View entering={FadeInDown.delay(0).duration(360)} className="mb-[38px]">
          <Image source={require('../../assets/images/looppr-mark.png')} style={{ width: 46, height: 46, marginBottom: 18 }} contentFit="contain" />
          <Text className="font-display text-[28px] text-ink leading-[32px]">Welcome to{'\n'}Looppr</Text>
          <Text className="font-body text-[13.5px] text-muted mt-[6px]">One app for everyone in the loop.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(360)} className="mb-[14px]">
          <Pressable onPress={() => router.push('/(auth)/who?category=customer')}>
            <LinearGradient
              colors={[colors.brandLight, colors.brand]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 22, padding: 22, shadowColor: '#1E1B4B', shadowOpacity: 0.28, shadowRadius: 44, shadowOffset: { width: 0, height: 20 }, elevation: 10 }}
            >
              <View className="w-[46px] h-[46px] rounded-xl bg-white/15 items-center justify-center mb-lg">
                <Ionicons name="home-outline" size={21} color="#EEEDFE" />
              </View>
              <View className="flex-row items-center gap-sm">
                <View className="flex-1">
                  <Text className="font-display-semibold text-[19px] text-white mb-[4px]">Customer</Text>
                  <Text className="font-body text-[12.5px] text-[#F1EFFE] leading-[18px]">
                    Book laundry services for your home or business.
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#EEEDFE" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).duration(360)}>
          <Pressable
            onPress={() => router.push('/(auth)/who?category=operational')}
            className="bg-white border-[1.5px] border-border rounded-xl px-xl py-lg"
          >
            <View className="flex-row items-center gap-md">
              <View className="w-[42px] h-[42px] rounded-md bg-tint items-center justify-center">
                <Ionicons name="cube-outline" size={19} color={colors.brandDeep} />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="font-body-bold text-[15px] text-ink mb-[2px]">Operational</Text>
                <Text className="font-body text-[11.5px] text-muted leading-[16px]">
                  Manage deliveries, laundry operations, and business workflows.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color={colors.faint} />
            </View>
          </Pressable>
        </Animated.View>

        <Text className="font-body text-[11px] text-faint text-center mt-auto pt-2xl">
          One Looppr account · role-based access · getlooppr.com
        </Text>
      </View>
    </AuthShell>
  );
}
