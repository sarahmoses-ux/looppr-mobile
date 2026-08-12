import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import StatusPill from '../../src/components/StatusPill';
import { Ionicons } from '@expo/vector-icons';
import { useMyPickups } from '../../src/hooks/usePickups';
import { buildTrackSteps } from '../../src/features/customer/trackSteps';
import { pickupStatusLabel, pickupStatusPillVariant } from '../../src/constants/pickupStatus';
import { WINDOW_OPTIONS } from '../../src/features/customer/bookingOptions';
import { initials } from '../../src/utils/format';
import { colors } from '../../src/theme/tokens';

const windowLabel = (key) => WINDOW_OPTIONS.find((w) => w.key === key)?.label ?? key;

function RouteViz() {
  const dot = useSharedValue(0);

  useEffect(() => {
    dot.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.linear }), -1, false);
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    left: `${dot.value * 84}%`,
  }));

  return (
    <View className="bg-white border border-border rounded-md p-lg mb-md">
      <View className="flex-row items-center">
        <View className="items-center" style={{ width: 60 }}>
          <View className="w-9 h-9 rounded-full bg-tint items-center justify-center mb-[4px]">
            <Text className="font-body-bold text-[11px] text-brandDeep">🏠</Text>
          </View>
          <Text className="font-body-bold text-[10.5px] text-muted">Home</Text>
        </View>
        <View className="flex-1 h-[2px] bg-divider mx-sm" style={{ position: 'relative' }}>
          <Animated.View style={[{ position: 'absolute', top: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand }, dotStyle]} />
        </View>
        <View className="items-center" style={{ width: 60 }}>
          <View className="w-9 h-9 rounded-full bg-tint items-center justify-center mb-[4px]">
            <Text className="font-body-bold text-[11px] text-brandDeep">🧺</Text>
          </View>
          <Text className="font-body-bold text-[10.5px] text-muted" numberOfLines={1}>Looppr</Text>
        </View>
      </View>
    </View>
  );
}

function SpinnerRing() {
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
  }, []);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  return (
    <Animated.View
      style={[
        { width: 12, height: 12, borderRadius: 6, borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)', borderTopColor: colors.white },
        spinStyle,
      ]}
    />
  );
}

export default function Track() {
  const { orderId } = useLocalSearchParams();
  const { data: pickups } = useMyPickups();
  const order = pickups?.find((p) => p._id === orderId);
  const steps = buildTrackSteps(order);
  const driver = order?.driverUserId;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg">
      <View className="flex-row items-center gap-md px-lg pt-lg pb-md">
        <BackButton onPress={() => router.back()} />
        <View className="flex-1 min-w-0">
          <Text className="font-display-semibold text-[16px] text-ink" numberOfLines={1}>
            {orderId?.slice?.(-6)?.toUpperCase()} · {order?.address?.street}
          </Text>
          <Text className="font-body text-[11.5px] text-muted">{windowLabel(order?.window)} pickup</Text>
        </View>
        {order ? <StatusPill label={pickupStatusLabel(order.status)} variant={pickupStatusPillVariant(order.status)} /> : null}
      </View>

      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeInDown.delay(0).duration(360)}>
          <RouteViz />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(360)} className="bg-white border border-border rounded-md p-lg mb-md">
          {steps.map((step, i) => (
            <View key={step.title} className="flex-row gap-md">
              <View className="items-center" style={{ width: 24 }}>
                <View
                  className="w-6 h-6 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: step.done ? colors.success : step.current ? colors.brand : colors.surface,
                    borderWidth: step.done || step.current ? 0 : 1.5,
                    borderColor: colors.borderInput,
                  }}
                >
                  {step.done ? <Text style={{ color: colors.white, fontSize: 11 }}>✓</Text> : null}
                  {step.current ? <SpinnerRing /> : null}
                </View>
                {i < steps.length - 1 ? (
                  <View style={{ width: 2, flex: 1, minHeight: 24, backgroundColor: step.done ? colors.success : colors.border }} />
                ) : null}
              </View>
              <View style={{ paddingBottom: 16 }}>
                <Text className={`font-body-bold text-[13px] ${step.done || step.current ? 'text-ink' : 'text-faint'}`}>{step.title}</Text>
                <Text className={`font-body text-[11px] ${step.done || step.current ? 'text-muted' : 'text-faint'}`}>{step.sub}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(140).duration(360)}
          className="bg-white border border-border rounded-md px-lg py-[13px] flex-row items-center gap-md"
        >
          <View
            className="w-[38px] h-[38px] rounded-full items-center justify-center"
            style={{ backgroundColor: colors.brandDeep }}
          >
            <Text className="font-display-semibold text-[13px] text-white">{driver ? initials(driver.name) : '?'}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">
              {driver ? `${driver.name} — your Looppr driver` : 'Driver not yet assigned'}
            </Text>
            <Text className="font-body text-[11.5px] text-muted">
              {driver ? (driver.vehicleName ?? driver.vehicleType ?? 'On the way') : "We'll assign one shortly"}
            </Text>
          </View>
          {driver ? (
            <View className="w-9 h-9 rounded-sm border border-borderInput items-center justify-center" style={{ backgroundColor: colors.surface }}>
              <Ionicons name="chatbubble-outline" size={15} color={colors.brandDeep} />
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
