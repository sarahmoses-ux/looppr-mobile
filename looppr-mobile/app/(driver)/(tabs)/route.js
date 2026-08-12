import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import ScreenHeader from '../../../src/components/ScreenHeader';
import Card from '../../../src/components/Card';
import Button from '../../../src/components/Button';
import StatusPill from '../../../src/components/StatusPill';
import { FillProgressBar } from '../../../src/components/ProgressBar';
import DriverRouteMap from '../../../src/features/driver/DriverRouteMap';
import { DRIVER_STAGE, DRIVER_STAGE_ORDER, driverStopAction } from '../../../src/constants/driverStage';
import {
  useDriverOverview, useIncomingDeliveries, useMyDeliveries,
  useAcceptDelivery, useRejectDelivery, useUpdateDeliveryStage, useUpdateDriverAvailability,
} from '../../../src/hooks/useDriver';
import { useToast } from '../../../src/context/ToastContext';
import { useAuth } from '../../../src/context/AuthContext';
import { colors } from '../../../src/theme/tokens';

const STAGGER_MS = 70;
const addressLine = (a) => (a ? `${a.street}${a.apartment ? `, ${a.apartment}` : ''}, ${a.city}` : '');

export default function Route() {
  const { user } = useAuth();
  const { data: overview } = useDriverOverview();
  const { data: incoming } = useIncomingDeliveries();
  const { data: mine } = useMyDeliveries();
  const acceptDelivery = useAcceptDelivery();
  const rejectDelivery = useRejectDelivery();
  const updateStage = useUpdateDeliveryStage();
  const updateAvailability = useUpdateDriverAvailability();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const activeStops = (mine ?? []).filter((d) => d.driverStage !== DRIVER_STAGE.DELIVERED);
  const next = activeStops[0];
  const stageIdx = next ? DRIVER_STAGE_ORDER.indexOf(next.driverStage) : -1;
  const progress = stageIdx >= 0 ? Math.round((stageIdx / (DRIVER_STAGE_ORDER.length - 1)) * 100) : 0;
  const isOnShift = overview?.availability === 'available';

  const navigate = (order) => {
    const query = encodeURIComponent(addressLine(order.address));
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    toast.show(`Opening Google Maps — ${addressLine(order.address)}`);
  };

  const completeStop = (order) => {
    const action = driverStopAction(order.driverStage);
    updateStage.mutate(
      { deliveryId: order._id, action: action.nextAction },
      { onSuccess: () => toast.show(`${order._id.slice(-6).toUpperCase()} — ${action.completeLabel.toLowerCase()}`) }
    );
  };

  const accept = (delivery) => {
    setBusyId(delivery._id);
    acceptDelivery.mutate(
      { deliveryId: delivery._id },
      {
        onSuccess: () => toast.show(`Accepted ${delivery.customerName}'s delivery`),
        onError: (err) => toast.show(err.message, 'error'),
        onSettled: () => setBusyId(null),
      }
    );
  };

  const reject = (delivery) => {
    setBusyId(delivery._id);
    rejectDelivery.mutate(
      { deliveryId: delivery._id, reason: 'Not available' },
      { onSettled: () => setBusyId(null) }
    );
  };

  const toggleShift = () => {
    updateAvailability.mutate({ availability: isOnShift ? 'offline' : 'online' });
  };

  let step = 0;
  const rise = () => FadeInDown.delay((step++) * STAGGER_MS).duration(360);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-bg" edges={['top']}>
      <ScreenHeader
        title="Looppr Driver"
        subtitle={`${user?.name ?? 'Driver'} · OKC Metro`}
        statusPill={
          <Pressable onPress={toggleShift}>
            <StatusPill label={isOnShift ? 'On shift' : 'Off shift'} variant={isOnShift ? 'done' : 'muted'} />
          </Pressable>
        }
      />
      <ScrollView className="px-lg" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {incoming?.length ? (
          <Animated.View entering={rise()} className="mb-md">
            <Text className="font-body-bold text-[11px] tracking-wider uppercase text-muted mb-sm">
              New requests ({incoming.length})
            </Text>
            <View className="gap-sm">
              {incoming.map((d) => (
                <Card key={d._id}>
                  <Text className="font-body-bold text-[13px] text-ink mb-[2px]">{d.customerName}</Text>
                  <Text className="font-body text-[11.5px] text-muted mb-md">{addressLine(d.address)} · {d.window}</Text>
                  <View className="flex-row gap-sm">
                    <Button
                      title="Accept"
                      onPress={() => accept(d)}
                      loading={busyId === d._id && acceptDelivery.isPending}
                      disabled={busyId === d._id}
                      className="flex-1 py-[9px]"
                    />
                    <Button
                      title="Reject"
                      variant="secondary"
                      onPress={() => reject(d)}
                      loading={busyId === d._id && rejectDelivery.isPending}
                      disabled={busyId === d._id}
                      className="flex-1 py-[9px]"
                    />
                  </View>
                </Card>
              ))}
            </View>
          </Animated.View>
        ) : null}

        {activeStops.length ? (
          <Animated.View entering={rise()} className="mb-md">
            <DriverRouteMap stops={activeStops} />
          </Animated.View>
        ) : null}

        {next ? (
          <Animated.View entering={rise()}>
            <LinearGradient colors={[colors.brand, colors.brand]} style={{ borderRadius: 18, padding: 18, marginBottom: 14 }}>
              <Text className="font-body-bold text-[10.5px] tracking-wider uppercase text-tint mb-[4px]">Next stop</Text>
              <Text className="font-display-semibold text-[19px] text-white mb-[4px]">{next.customerName}</Text>
              <Text className="font-body text-[12.5px] text-[#F1EFFE] mb-lg">
                {driverStopAction(next.driverStage).verb} · {addressLine(next.address)}
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
                  title={driverStopAction(next.driverStage).completeLabel}
                  variant="secondary"
                  style={{ borderWidth: 0 }}
                  onPress={() => completeStop(next)}
                  loading={updateStage.isPending}
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
          {activeStops.map((order, i) => {
            const action = driverStopAction(order.driverStage);
            return (
              <Animated.View key={order._id} entering={rise()}>
                <View className="flex-row items-center gap-md bg-white border border-border rounded-md px-lg py-[13px]">
                  <View
                    className="w-7 h-7 rounded-full items-center justify-center"
                    style={{ backgroundColor: i === 0 ? colors.brand : colors.tint }}
                  >
                    <Text style={{ color: i === 0 ? colors.white : colors.brandDeep, fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="font-body-bold text-[13px] text-ink" numberOfLines={1}>{order.customerName}</Text>
                    <Text className="font-body text-[11px] text-muted" numberOfLines={1}>{action.verb} · {addressLine(order.address)}</Text>
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
