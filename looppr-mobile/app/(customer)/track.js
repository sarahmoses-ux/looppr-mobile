import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing, FadeInDown } from 'react-native-reanimated';
import BackButton from '../../src/components/BackButton';
import StatusPill from '../../src/components/StatusPill';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../src/hooks/useOrders';
import { buildTrackSteps } from '../../src/features/customer/trackSteps';
import { ORDER_STAGE_LABEL, ORDER_STAGE_PILL } from '../../src/constants/orderStages';
import { colors } from '../../src/theme/tokens';

function RouteViz({ vendorShort }) {
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
          <Text className="font-body-bold text-[10.5px] text-muted" numberOfLines={1}>{vendorShort}</Text>
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
  const { data: order } = useOrder(orderId);
  const steps = buildTrackSteps(order);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg">
      <View className="flex-row items-center gap-md px-lg pt-lg pb-md">
        <BackButton onPress={() => router.back()} />
        <View className="flex-1 min-w-0">
          <Text className="font-display-semibold text-[16px] text-ink" numberOfLines={1}>{orderId} · {order?.vendor?.name}</Text>
          <Text className="font-body text-[11.5px] text-muted">ETA {order?.window}</Text>
        </View>
        {order ? <StatusPill label={ORDER_STAGE_LABEL[order.stage]} variant={ORDER_STAGE_PILL[order.stage]} /> : null}
      </View>

      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }}>
        <Animated.View entering={FadeInDown.delay(0).duration(360)}>
          <RouteViz vendorShort={order?.vendor?.name?.slice(0, 8) ?? 'Facility'} />
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
            <Text className="font-display-semibold text-[13px] text-white">JA</Text>
          </View>
          <View className="flex-1">
            <Text className="font-body-bold text-[13px] text-ink">Jeffrey — your Looppr driver</Text>
            <Text className="font-body text-[11.5px] text-muted">Founder-operated route · Edmond</Text>
          </View>
          <View className="w-9 h-9 rounded-sm border border-borderInput items-center justify-center" style={{ backgroundColor: colors.surface }}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.brandDeep} />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
