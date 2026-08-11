import { Linking, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import DriverRouteMap from '../../../src/features/driver/DriverRouteMap';
import { stopAction } from '../../../src/features/driver/stopStatus';
import { useAdvanceOrderStage, useDriverRoute } from '../../../src/hooks/useOrders';
import { useToast } from '../../../src/context/ToastContext';
import { useAuth } from '../../../src/context/AuthContext';
import { colors } from '../../../src/theme/tokens';

const STAGGER_MS = 70;

export default function Route() {
  const { user } = useAuth();
  const { data: stops } = useDriverRoute();
  const advanceStage = useAdvanceOrderStage();
  const toast = useToast();

  const list = stops ?? [];
  const next = list[0];
  const progress = list.length ? Math.round(((4 - list.length) / 4) * 100) : 100;

  const navigate = (order) => {
    const query = encodeURIComponent(order.address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    toast.show(`Opening Google Maps — ${order.address}`);
  };

  const completeStop = (order) => {
    const action = stopAction(order);
    advanceStage.mutate(
      { orderId: order.id },
      { onSuccess: () => toast.show(`${order.id} — ${action.completeLabel.toLowerCase()}`) }
    );
  };

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Driver"
        subtitle={`${user?.name ?? 'Driver'} · Sunday route · OKC Metro`}
        statusPill={<StatusPill label="On shift" variant="done" />}
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {list.length ? (
          <Animated.View entering={rise()} className="mb-md">
            <DriverRouteMap stops={list} />
          </Animated.View>
        ) : null}

        {next ? (
          <Animated.View entering={rise()}>
            <LinearGradient colors={[colors.brand, colors.brand]} style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-tint mb-[4px]">Next stop</Text>
              <Text className="font-display-semibold text-[19px] text-white mb-[4px]">{next.customerName}</Text>
              <Text className="font-body text-[12.5px] text-[#F1EFFE] mb-lg">
                {stopAction(next).verb} · {next.address}
              </Text>
              <View className="mb-lg">
                <FillProgressBar percent={progress} trackColor="rgba(255,255,255,0.16)" fillColor={colors.successBright} />
              </View>
              <View className="flex-row gap-sm">
                <Button
                  title="Navigate ▸ Maps"
                  variant="secondary"
                  style={{ borderWidth: 0 }}
                  onPress={() => navigate(next)}
                  className="flex-1"
                />
                <Button
                  title={stopAction(next).completeLabel}
                  variant="secondary"
                  style={{ borderWidth: 0 }}
                  onPress={() => completeStop(next)}
                  className="flex-1"
                />
              </View>
            </LinearGradient>
          </Animated.View>
        ) : (
          <Animated.View entering={rise()}>
            <Card className="mb-md items-center py-2xl">
              <Text className="font-body-bold text-[13px] text-ink">All caught up</Text>
              <Text className="font-body text-[11.5px] text-muted mt-[2px]">No stops left on today's route.</Text>
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={rise()}>
          <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">Today's stops</Text>
        </Animated.View>
        <View className="gap-sm">
          {list.map((order, i) => {
            const action = stopAction(order);
            return (
              <Animated.View key={order.id} entering={rise()}>
                <View className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]">
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: i === 0 ? colors.brand : colors.tint }}
                  >
                    <Text style={{ color: i === 0 ? colors.white : colors.brandDeep, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-body-bold text-[13px] text-ink" numberOfLines={1}>{order.customerName}</Text>
                    <Text className="font-body text-[11px] text-muted" numberOfLines={1}>{action.verb} · {order.address}</Text>
                  </View>
                  <StatusPill label={action.verb} variant={action.variant} />
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
